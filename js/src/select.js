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

    is_selected(idx) {
        return this.bits.get(idx);
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
    return <div ref={ref} className="day">{selections}{touchpad}</div>
}

function ShowSchedule({selectionMatrix, dimensions, cellCallback}) {
    const selectionCols = selectionMatrix.map((x, i)=><ShowSelectionCol key={i*2} selectionCol={x} callback={(row, buttons)=>cellCallback(new Point(i, row), buttons)}/>);
    const arr = intersperse_fn(selectionCols, (i)=><div key={i*2+1} className="vline"/>);
    return (
        <div className="hz schedule noselect">{arr}</div>
    )
}

function ShowViewCol({selectionAmounts}) {
    
}

function ShowView({selectionMatrix, dimensions}) {

    // React.useEffect(() => {
    //     get_selections().then((x) => {
    //         setOtherSelections(x);
    //     })
    // }, []);

    // const selection_graph = get_selection_graph(otherSelections);
    // let selection_matrix = get_selection_matrix(selection_graph, dimensions);

    return <div className="schedule"></div>
}

async function get_selections() {
    let response = await fetch(window.location.pathname+"/q");
    let data = await response.json();
    for (let key in data) {
        data[key][1] = decode_buffer(data[key][1]);
    }
    return data;
}

function get_selection_graph(selections, names=null) {
    if(!names){
        names = Object.keys(selections).sort();
    }
    let ans = {};
    for(let [name, sel] of selections) {
        for(let i = 0; i < sel.length*8; i++) {
            if(get_bit(sel, i)) {
                if (ans[i] === undefined) ans[i] = [];
                ans[i].push(name);
            }
        }
    }
    return ans;
}

function get_selection_matrix(selection_graph, dimensions) {
    const cols = dimensions;
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

function ScheduleRoot() {
    const [mat, setMat] = React.useState(null);
    const [escaped, setEscaped] = React.useState(false);
    const [start, setStart] = React.useState(null);
    const [end, setEnd] = React.useState(null);
    // const [otherSelections, setOtherSelections] = React.useState([]);

    let form = React.useRef(null);

    React.useEffect(()=>{
        setMat(SelectionMatrix.with_size(24, 5));
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
    const schedule = <ShowSchedule selectionMatrix={selection} dimensions={{x:5, y:24}} cellCallback={cellCallback}/>;
    const view = <ShowView selectionMatrix={selection} dimensions={{x:5, y:24}}/>;
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