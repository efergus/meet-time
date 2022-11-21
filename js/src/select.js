'use strict';

function minmax(a, b) {
    if (a < b) {
        return [a, b];
    }
    return [b, a];
}

function intersperse(arr, sep) {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce((xs, x, i) => {
        return xs.concat([sep, x]);
    }, [arr[0]]);
}

function intersperse_fn(arr, sep_fn) {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce((xs, x, i) => {
        return xs.concat([sep_fn(i), x]);
    }, [arr[0]]);
}

function find_spans(arr, predicate) {
    let ans = [];
    const lim = arr.length;
    for(let at = 0; at < lim; at++) {
        while(at < lim && !predicate(arr[at])) at++;
        const start = at;
        while(at < lim && predicate(arr[at])) at++;
        if(at > start) ans.push(new Span(start, at));
    }
    return ans;
}

function rgba(r, g, b, a) {
    return "rgba(" + [r, g, b, a].join() + ")";
}

function relativeCoords ( event ) {
    var bounds = event.target.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;
    return {x: x, y: y};
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    eq(other) {
        return other.x == this.x && other.y == this.y;
    }
}

class Span {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

class SelectionCol {
    constructor(bits) {
        this.bits = bits.copy();
    }

    static with_size(rows) {
        return new SelectionCol(BitVec.with_size(rows));
    }

    length() {
        return this.bits.length;
    }

    iterBits() {
        return this.bits.iterBits();
    }

    is_selected(idx) {
        return this.bits.get(idx);
    }

    any_selected() {
        return this.bits.any();
    }

    set_selection(span, val=true) {
        for(let i = span.start; i < span.end; i++) {
            this.bits.set(i, val);
        }
    }

    remove_selection_from(idx) {
        this.bits.spread(idx, false);
    }

    spans(val=true) {
        return this.bits.spans(val);
    }

    copy() {
        return new SelectionCol(this.bits);
    }

    toString() {
        return this.bits.toString();
    }
}

class SelectionMatrix {
    constructor(columns) {
        this.columns = columns.map(x=>x.copy());
    }

    static with_size(rows, cols) {
        let columns = new Array(cols).fill(null).map(()=>SelectionCol.with_size(rows));
        return new SelectionMatrix(columns);
    }

    is_selected(pos) {
        return this.columns[pos.x].is_selected(pos.y);
    }

    remove_selection_from(pos) {
        return this.columns[pos.x].remove_selection_from(pos.y);
    }

    set_selection(row_span, col_span, val=true) {
        for(let i = col_span.start; i < col_span.end; i++) {
            this.columns[i].set_selection(row_span, val);
        }
    }

    any_selected() {
        for(let col of this.columns) {
            if(col.any_selected()) {
                return true;
            }
        }
        return false;
    }

    map(f) {
        return this.columns.map(f);
    }

    copy() {
        return new SelectionMatrix(this.columns);
    }

    toString() {
        const str = this.columns.map(x=>x.toString()).join(", ");
        return "["+str+"]";
    }

    toBits() {
        const bit_cols = this.columns.map(x=>x.bits);
        return BitVec.concat(...bit_cols);
    }
}

function Box({className, margins, children}) {
    let margin = margins || "0.0em";
    let style = {
        marginLeft: margin,
        marginRight: margin,
    }
    return <div className="shield"><div style={style} className="pink round">{children}</div></div>
}

function ShowDates({dates}) {
    const arr = dates.map((x, i)=><div key={i} className="flex">{"11/"+(i+1)}</div>);
    return <div className="hz flex">{arr}</div>
}

function ShowTimes({rows}) {
    const times = new Array(rows>>2).fill(null).map((x,i)=><div key={i} className="flex">{(i+8%12)+":00"}</div>);
    return <div className="vt">{times}</div>
}

function Touchable({callback, className, style, children}) {
    const c = (e)=>{callback(e.buttons)};
    return <div className={className||""} style={style} onMouseMove={c} onMouseDown={c} onMouseUp={c}>{children}</div>
}

function TouchpadCol({rows, callback}) {
    const pads = new Array(rows).fill(null).map((_, i)=><Touchable key={i} callback={(buttons)=>callback(i, buttons)} className="flex"/>)
    return <div className="shadow vt">{pads}</div>
}

function ShowSelection({top, bottom}) {
    const style = {
        top, bottom
    };
    return <div className="selection" style={style}><Box/></div>
}

function ShowSelectionCol({selectionCol, callback}) {
    const ref = React.useRef(null);
    const height = ref.current ? ref.current.offsetHeight : 1;
    const rows = selectionCol.length();

    const spans = selectionCol.spans();
    const selections = spans.map((x, i)=><ShowSelection key={i} top={x.start/rows*height} bottom={height-x.end/rows*height}/>);
    const touchpad = <TouchpadCol rows={rows} callback={callback}/>;
    const spread = 4;
    const lines = new Array(Math.floor(rows/spread)-1).fill(null).map((x, i)=><div key={i} className="hline absolute" style={{top:height/rows*spread*(i+1)}}/>);
    const linesElem = <div className="shadow">{lines}</div>;
    return <div ref={ref} className="day">{selections}{linesElem}{touchpad}</div>
}

function ShowSchedule({selectionMatrix, dimensions, cellCallback}) {
    const selectionCols = selectionMatrix.map((x, i)=><ShowSelectionCol key={i*2} selectionCol={x} callback={(row, buttons)=>cellCallback(new Point(i, row), buttons)}/>);
    const arr = intersperse_fn(selectionCols, (i)=><div key={i*2+1} className="vline"/>);
    const dates = new Array(dimensions.x).fill(null).map((x,i)=>x);
    return (
        <div className="schedule"><div/><div><ShowDates dates={dates}/></div><ShowTimes rows={dimensions.y}/><div className="hz">{arr}</div></div>
    )
}

function ShowViewSelection({top, bottom, amt, all, max, callback}) {
    const maxall = amt === all ? " viewall" : amt === max ? " viewmax" : "";
    const color = maxall ? undefined : rgba(0, amt/max*255, 0, amt/max*255);
    const style = {
        top, bottom,
        backgroundColor: color,
    };
    return <div className={"selection round"+maxall} style={style} onMouseEnter={callback}>{amt == all ? "Everyone!" : ""}</div>
}

function ShowViewCol({selections, all, max}) {
    const rows = selections.length;
    const amts = selections.map(x=>x.length).sort().reduce((acc, x)=>acc[acc.length-1] === x ? acc : acc.concat([x]), [0]);
    let selectionViews = [];
    for(let amt of amts) {
        if(!amt)continue;
        const spans = find_spans(selections, x=>x.length>=amt);
        for(let span of spans) {
            const p = "%"
            const top = span.start/rows*100;
            const bottom = 100-span.end/rows*100;
            selectionViews.push(<ShowViewSelection key={selectionViews.length} top={top+p} bottom={bottom+p} amt={amt} all={all} max={max}/>)
        }
    }
    return <div className="day">{selectionViews}</div>
}

function ShowView({selectionMatrix, all}) {
    if(!selectionMatrix) return null;
    const max = selectionMatrix.reduce((acc, x)=>Math.max(acc, x.reduce((acc, x)=>Math.max(acc, x.length), 0)), 0)
    const arr = selectionMatrix.map((x, i) => <ShowViewCol key={i} selections={x} all={all} max={max}/>);
    const dates = new Array(selectionMatrix.length).fill(null).map((x,i)=>x);

    return <div className="schedule"><div/><ShowDates dates={dates}/><ShowTimes rows={selectionMatrix[0].length}/><div className="hz">{arr}</div></div>
}

async function get_selections() {
    let response = await fetch(window.location.pathname+"/q");
    let data = await response.json();
    for (let key in data) {
        data[key][1] = new BitVec(decode_buffer(data[key][1]));
    }
    return data;
}

function get_selection_graph(selections) {
    let ans = {};
    for(let [name, sel] of selections) {
        for(let i = 0; i < sel.length; i++) {
            if(sel.get(i)) {
                if (ans[i] === undefined) ans[i] = [];
                ans[i].push(name);
            }
        }
    }
    return ans;
}

function get_selection_matrix(selection_graph, dimensions) {
    const cols = dimensions.x;
    const rows = dimensions.y;
    let ans = new Array(cols).fill(null).map(() => new Array(rows).fill(null));
    for(let c = 0; c < cols; c++){
        for(let r = 0; r < rows; r++){
            let idx = r + c*rows;
            if(selection_graph[idx]){
                ans[c][r] = selection_graph[idx];
            }
            else{
                ans[c][r] = [];
            }
        }
    } 
    return ans;   
}

function get_selection_amounts(selection_matrix) {
    return selection_matrix.map(x => x.map(x => x.length));
}

function add_user_selections(userSelections, otherSelections) {
    let ans = otherSelections.map(x=>x.map(x=>x.slice()));
    const cols = userSelections.columns;
    for(let col in cols) {
        let row = 0;
        for(let bit of cols[col].iterBits()) {
            if(bit) {
                ans[col][row].unshift("you");
            }
            row++;
        }
    }
    return ans;
}

function ScheduleRoot() {
    const [mat, setMat] = React.useState(null);
    const [escaped, setEscaped] = React.useState(false);
    const [start, setStart] = React.useState(null);
    const [end, setEnd] = React.useState(null);
    const [[responses, otherSelections], setOtherSelections] = React.useState([1, null]);

    let form = React.useRef(null);

    React.useEffect(()=>{
        setMat(SelectionMatrix.with_size(24, 5));
    }, []);
    React.useEffect(()=>{
        get_selections().then((selections)=>{
                const selection_graph = get_selection_graph(selections);
                const selection_matrix = get_selection_matrix(selection_graph, new Point(5, 24));
                setOtherSelections([selections, selection_matrix]);
            }
        );
    }, []);
    const getSpans = () => {
        let row_span = new Span(...minmax(start.y, end.y));
        row_span.end += 1;
        let col_span = new Span(...minmax(start.x, end.x));
        col_span.end += 1;
        return [row_span, col_span];
    }
    const cellCallback = (pos, buttons) => {
        if(buttons && !start) {
            setStart(pos);
        }
        if(buttons && start && !pos.eq(start)) {
            setEscaped(true);
        }
        if(!buttons && start) {
            let selection = mat.copy();
            if(start.eq(end) && selection.is_selected(end) && !escaped){
                selection.remove_selection_from(pos);
            }
            else {
                const [row_span, col_span] = getSpans();
                selection.set_selection(row_span, col_span, true);
            }
            setStart(null);
            setMat(selection);
            setEscaped(false);
        }
        setEnd(pos);
    }

    const submit = () => {
        let mask = mat.toBits();
        form.current.value = mask.encode();
    }

    let selection = mat;
    if(!selection){
        return;
    }
    selection = selection.copy();
    if(start && end) {
        const [row_span, col_span] = getSpans();
        selection.set_selection(row_span, col_span, true);
    }
    const user_selected = selection.any_selected() ? 1 : 0;
    const selection_matrix = otherSelections ? add_user_selections(selection, otherSelections) : null;
    const schedule = <ShowSchedule selectionMatrix={selection} dimensions={{x:5, y:24}} cellCallback={cellCallback}/>;
    const view = <ShowView selectionMatrix={selection_matrix} all={responses.length+user_selected}/>;
    return (
        <div>
            <div className="hz schedule-card">
                <div className="schedule-block">{schedule}</div>
                <div className="schedule-block">{view}</div>
            </div>
            <form action={window.location.pathname+"/submit"} method="post" onSubmit={submit}>
                <input type="text" name="name" placeholder="Anonymous"/>
                <input ref={form} type="hidden" name="submit" value=""/>
                <input type="submit" value="Submit"/>
            </form>
        </div>
    );
}

const domContainer = document.getElementById('root');
const root = ReactDOM.createRoot(domContainer);
root.render(React.createElement(ScheduleRoot));