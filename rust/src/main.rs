// #![deny(warnings)]

use std::fs;

use std::path::Path;
use std::collections::HashMap;

use std::time::SystemTime;


use bit_vec::BitVec;
use rand::{thread_rng, RngCore};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use warp::{
    path::FullPath,
    reply::{Html, WithHeader, WithStatus},
    filters::BoxedFilter,
    Filter, Rejection, Reply,
};

#[derive(Debug, Deserialize, Serialize)]
struct Credentials {
    alias: String,
    pass: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Schedule {
    schid: i64,
    link: Vec<u8>,
}

#[derive(Debug, Deserialize, Serialize)]
struct LoginData {
    userid: i64,
    time: u64,
    token: Vec<u8>,
}

#[derive(Debug, Deserialize, Serialize)]
struct SubmitForm {
    name: String,
    submit: String,
}

#[derive(Debug)]
struct Selection {
    userid: Option<i64>,
    schid: i64,
    mask: Vec<u8>,
    name: Option<String>,
}

impl Selection {
    fn from_bytes(
        userid: Option<i64>,
        schid: i64,
        slice: &[u8],
        name: Option<String>,
    ) -> Selection {
        Selection {
            userid,
            schid,
            mask: slice.to_vec(),
            name,
        }
    }
}

fn get_data(root: &Path, path: &str) -> Result<Html<String>, Rejection> {
    let full_path = root.join(path);
    println!("Get {}", full_path.to_str().unwrap());
    match fs::read_to_string(full_path) {
        Ok(data) => Ok(warp::reply::html(data)),
        x => {
            println!("{:?}", x);
            Err(warp::reject::not_found())
        }
    }
}

fn rng(buf: &mut [u8]) {
    let mut rng = thread_rng();
    rng.fill_bytes(buf);
}

fn new_schedule<F: FnMut(&[u8]) -> Result<i64, T>, T>(mut insert_fn: F) -> Result<Schedule, T> {
    let mut buf = [0u8; 12];
    rng(&mut buf);
    let schid = insert_fn(&buf)?;
    Ok(Schedule {
        schid,
        link: buf.to_vec(),
    })
}

fn new_login<F: FnMut(u64, &[u8]) -> Result<i64, T>, T>(
    mut insert_login: F,
) -> Result<LoginData, T> {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("SystemTime before UNIX EPOCH!")
        .as_secs();
    let mut buf = [0u8; 12];
    rng(&mut buf);
    let userid = insert_login(now, &buf)?;
    Ok(LoginData {
        userid,
        time: now,
        token: buf.to_vec(),
    })
}

fn insert_login(time: u64, token: &[u8]) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut insert = db
        .prepare("INSERT OR REPLACE INTO logins (time, token) VALUES (?, ?)")
        .unwrap();
    match insert.insert(params![time, token]) {
        Ok(x) => Ok(x),
        x => {
            println!("{:?}", x);
            Err(warp::reject())
        }
    }
}

fn redirect<T: Reply>(location: &str, reply: T) -> WithStatus<WithHeader<T>> {
    warp::reply::with_status(
        warp::reply::with_header(reply, "Location", location),
        warp::http::StatusCode::SEE_OTHER,
    )
}

fn encode<T: AsRef<[u8]>>(val: T) -> String {
    base64::encode_config(val, base64::URL_SAFE)
}

fn decode(val: &str) -> Result<Vec<u8>, Rejection> {
    let buf = base64::decode_config(val, base64::URL_SAFE);
    match buf {
        Ok(buf) => Ok(buf),
        _ => Err(warp::reject()),
    }
}

fn decode_str(val: &str) -> Result<String, Rejection> {
    match String::from_utf8(decode(val)?) {
        Ok(buf) => Ok(buf),
        _ => Err(warp::reject()),
    }
}

fn get_schid(link: &[u8]) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut select = db
        .prepare("SELECT (schid) FROM schedules WHERE link = ?")
        .unwrap();
    match select.query_row([link], |row| row.get::<usize, i64>(0)) {
        Ok(x) => Ok(x),
        x => {
            println!("{:?}", x);
            Err(warp::reject())
        }
    }
}

fn insert_schid(link: &[u8]) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut insert = db
        .prepare("INSERT OR REPLACE INTO schedules (link) VALUES (?)")
        .unwrap();
    match insert.insert([link]) {
        Ok(x) => Ok(x),
        _ => Err(warp::reject()),
    }
}

fn get_userid(link: &[u8]) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut select = db
        .prepare("SELECT userid FROM logins WHERE token = ?")
        .unwrap();
    match select.query_row([link], |row| row.get::<usize, i64>(0)) {
        Ok(x) => Ok(x),
        _ => Err(warp::reject()),
    }
}

fn new_userid(alias: &str, _pass: &str) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut insert = db
        .prepare("INSERT INTO users (alias, pass) VALUES (? ?)")
        .unwrap();
    match insert.insert([alias]) {
        Ok(x) => Ok(x),
        _ => Err(warp::reject()),
    }
}

fn insert_selection(selection: Selection) -> Result<i64, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut insert = db
        .prepare("INSERT OR REPLACE INTO selections (userid, schid, mask, name) VALUES (?, ?, ?, ?)")
        .unwrap();
    let s = selection;
    match insert.insert(params![s.userid, s.schid, s.mask, s.name]) {
        Ok(x) => Ok(x),
        _ => Err(warp::reject()),
    }
}

fn get_selections(schid: i64) -> Result<Vec<(String, String)>, Rejection> {
    let db = Connection::open("data.db").expect("Failed to open database");
    let mut select = db
        .prepare("SELECT name, mask FROM selections WHERE schid = ?")
        .unwrap();
    let mut selections = Vec::<(String, String)>::new();
    let rows = select.query_map([schid], |row| Ok((row.get::<usize, String>(0)?, encode(row.get::<usize, Vec<u8>>(1)?))));
    let rows = match rows {
        Ok(x) => x,
        Err(x) => {
            println!("{:?}", x);
            return Err(warp::reject());
        }
    };
    for selection in rows {
        match selection {
            Ok(x) => selections.push(x),
            Err(x) => {
                println!("{:?}", x);
                return Err(warp::reject());
            }
        };        
    }
    Ok(selections)
}

fn empty_ok() -> Result<&'static str, Rejection> {
    Ok("")
}

// fn insert_schid()

#[tokio::main]
async fn main() {
    // pretty_env_logger::init();

    let root = Path::new("../www");
    let db = Connection::open("data.db").expect("Failed to open database");
    db.execute(
        "CREATE TABLE IF NOT EXISTS schedules (
        schid INTEGER NOT NULL PRIMARY KEY,
        link BLOB NOT NULL UNIQUE
    )",
        (),
    )
    .expect("Failed to create 'schedules' table");
    db.execute(
        "CREATE TABLE IF NOT EXISTS selections (
        userid INTEGER UNIQUE,
        schid INTEGER NOT NULL,
        mask BLOB NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY(schid) REFERENCES schedules(schid)
    )",
        (),
    )
    .expect("Failed to create 'selections' table");

    let landing = warp::path::end().and_then(|| async { get_data(root, "new_meet.html") });
    let regular_files = warp::fs::dir(root)
        .map(|file: warp::fs::File| {println!("AAA {:?}", file.path()); file});
    let find = warp::path!(String).and_then(move |link: String| async move {
        let buf = decode(&link)?;
        let schid = get_schid(&buf)?;
        let reply = get_data(root, "select.html")?;
        Ok(reply) as Result<_, Rejection>
    });
    let query_selections = warp::path!(String / "q")
        .and_then(|link: String| async move {
            println!("query {}", link);
            let link = decode(&link)?;
            let schid = get_schid(&link)?;
            println!("schid {}", schid);
            let selections = get_selections(schid)?;
            let reply = warp::reply::json(&selections);
            Ok(reply) as Result<_, Rejection>
        });
    let files = warp::get().and(landing.or(regular_files).or(find).or(query_selections));

    let create = warp::path("new").and_then(|| async {
        let sched = new_schedule(insert_schid)?;
        let link: String = format!("/{}", encode(sched.link));
        let message = format!("You should be redirected to {}", link);
        Ok(redirect(&link, message)) as Result<_, Rejection>
    });
    let submit = warp::path!(String / "submit")
        .and(warp::body::content_length_limit(1024 * 32))
        .and(warp::body::form())
        .and_then(|link: String, form: SubmitForm| async move {
            println!("submit {}", link);
            let buf = decode(&link)?;
            let schid = get_schid(&buf)?;
            let name = form.name.trim();
            println!("submit {}", form.submit);
            let buf = decode(&form.submit)?;
            println!("selected {:?}", buf);
            let selection = Selection::from_bytes(None, schid, &buf, Some(name.to_string()));
            insert_selection(selection);
            let link: String = format!("/{}", link);
            let message = format!("You should be redirected to {}", link);
            Ok(redirect(&link, message)) as Result<_, Rejection>
        });
    let catchall = warp::any().and(warp::path::full()).map(|path: FullPath| {
        println!("Failed: {}", path.as_str());
        warp::reply::with_status(
            warp::reply::html("We've encountered an error, sorry :(".to_string()),
            warp::http::StatusCode::NOT_FOUND,
        )
    });

    let forms = warp::post().and(create.or(submit).or(find));
    let root = files.or(forms).or(catchall);

    warp::serve(root).run(([127, 0, 0, 1], 8080)).await
}
