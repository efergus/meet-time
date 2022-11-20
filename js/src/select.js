'use strict';

const e = React.createElement;

class Selection extends React.Component {
    render() {
        let props = this.props;
        let style = {
            left: props.left,
            top: props.top,
            // width: props.width,
            height: props.height,
        }
        return (
            <div style={style} className="selection">
                <Box><div className="round pink">{props.children}</div></Box>
            </div>
        )
    }
}

class Day extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.state = { sid: 1 };
        this.stored = {
            height: 0,
        }
    }
    selections() {
        let selections = this.props.selections
        let elems = []
        let height = this.stored.height/this.props.rows;
        for (let i in selections) {
            let span = selections[i][1] - selections[i][0]
            elems.push(<Selection key={selections[i][0]} left={0} top={height * selections[i][0]} height={height * span}>Times</Selection>)
        }
        return elems;
    }
    componentDidMount () {
        this.stored = {
            height: this.ref.current.offsetHeight,
        }
    }
    render() {
        return (
            <div className="day" ref={this.ref}> {this.selections()} </div>
        )
    }
}

function minmax(a, b) {
    if (a < b) {
        return [a, b];
    }
    return [b, a];
}

function bounds(a, b) {
    return [Math.min(a[0], b[0]), Math.max(a[1], b[1])]
}

function selection_add(selections_list, selection) {
    if(!selections_list.length) {
        return [selection];
    }
    let n = selections_list.length;
    let selections = [];
    let i = 0;
    for(;i < n && selections_list[i][1] < selection[0];i++) {
        selections.push(selections_list[i]);
    }
    let span = selection;
    for(;i < n && selections_list[i][0] <= selection[1];i++) {
        span = bounds(selections_list[i], span);
    }
    selections.push(span);
    for(;i < n;i++) {
        selections.push(selections_list[i]);
    }
    return selections;
}

function range_overlaps(range, val) {
    return range[0] <= val && range[1] > val
}

function selection_remove(selections_list, val) {
    let selections = selections_list.filter((x) => !range_overlaps(x, val));
    return selections;
}

function is_selected(selections_list, pos) {
    return selections_list.some((x) => range_overlaps(x, pos))
}

function set_bit(byte_arr, bit_idx) {
    let idx = Math.floor(bit_idx/8);
    let offset = bit_idx % 8;
    let val = byte_arr[idx];
    byte_arr[idx] = val | (1 << 7-offset);
}

function get_bit(byte_arr, bit_idx) {
    let idx = Math.floor(bit_idx/8);
    let offset = bit_idx % 8;
    let val = byte_arr[idx];
    return ((val >> (7-offset)) & 1) > 0;
}

function b64safe(b64, reverse = false) {
    return reverse ? b64.replace(/-/g, "+").replace(/_/g, "/") : b64.replace(/\+/g, "-").replace(/\//g, "_");
}

function encode_string(string) {
    return b64safe(btoa(string));
}

function encode_buffer(byte_array) {
    return encode_string(String.fromCharCode(...byte_array));
}

function decode_string(string) {
    return atob(b64safe(string, true));
}

function decode_buffer(buffer_string) {
    const characters = decode_string(buffer_string);
    const nums = new Array(characters.length).fill(null).map((_, i) => characters.charCodeAt(i));
    return new Uint8Array(nums);
}

function bitmask(selections_list, rows) {
    let cols = selections_list.length;
    let size = Math.ceil(rows*cols/8);
    let bits = new ArrayBuffer(size);
    let view = new Uint8Array(bits);
    for (let col = 0; col < cols; col++) {
        for (let span of selections_list[col]) {
            for (let row = span[0]; row < span[1]; row++) {
                set_bit(view, row + col*rows);
            }
        }
    }
    return view;
}

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.stored = {
            width: null,
            height: null,
            selectors: [],
        };
        this.state = {
            begin: null,
            anchor: null,
            active: null,
            selection: Array(props.cols).fill([]),
        };
    }

    register_selector(x) {
        this.stored.selectors.push(x);
    }

    select(grid_a, grid_b) {
        if(!grid_a || !grid_b){
            return this.state.selection;
        }
        let cols = minmax(grid_a[0], grid_b[0]);
        let rows = minmax(grid_a[1], grid_b[1]);
        rows[1] += 1;
        let selection = Array(this.props.cols).fill(null);
        for(let i in selection) {
            if (i >= cols[0] && i <= cols[1]){
                selection[i] = selection_add(this.state.selection[i], rows);
            }
            else{
                selection[i] = this.state.selection[i].slice();
            }
        }
        return selection;
    }

    deselect(grid_pos) {
        let selection_list = selection_remove(this.state.selection[grid_pos[0]], grid_pos[1]);
        let selection = this.state.selection.slice();
        selection[grid_pos[0]] = selection_list;
        return selection;
    }

    update_others() {
        let selection_mask = bitmask(this.select(this.state.anchor, this.state.active), this.props.rows);
        for(let f of this.stored.selectors){
            f(selection_mask);
        }
    }

    is_selected(grid_pos) {
        return is_selected(this.state.selection[grid_pos[0]], grid_pos[1]);
    }

    getGrid(loc) {
        return [Math.floor(loc[0]/this.stored.width*this.props.cols), Math.floor(loc[1]/this.stored.height*this.props.rows)]
    }

    handleMouse(e) {
        if (!this.stored.width) {
            return;
        }
        let rect = this.ref.current.getBoundingClientRect()
        let loc = [e.clientX - rect.left, e.clientY - rect.top]
        let press = this.getGrid(loc);
        let begin = this.state.begin;
        let active = this.state.active;
        let anchor = this.state.anchor;
        let selection = this.state.selection;
        // click and drag, delete clicking top of thing doesn't work
        if (e.buttons) {
            active = press.slice();
        }
        if (!this.state.anchor && e.buttons) {
            begin = press.slice();
            for (let span of this.state.selection[press[0]]) {
                for (let i = 0; i <= 1; i++) {
                    if (span[i]-i == press[1]) {
                        selection = this.deselect(press);
                        press[1] = span[1-i]-(1-i)*1;
                        break;
                    }
                }
            }
            anchor = press;
        }
        else if (begin && !e.buttons) {
            let is_clicked = begin.every((x, i) => x === press[i])
            if (is_clicked && this.is_selected(press)) {
                selection = this.deselect(press);
            }
            else {
                selection = this.select(anchor, press)
            }
            begin = null;
            anchor = null;
            active= null;
        }
        this.setState({begin, anchor, active, selection});
        this.update_others(selection);
    }

    componentDidMount() {
        this.stored = {
            ...this.stored,
            width: this.ref.current.offsetWidth,
            height: this.ref.current.offsetHeight,
        }
    }

    render() {
        let selection = this.select(this.state.anchor, this.state.active);
        let days = Array(this.props.cols).fill(null).map((_, i) => <Day key={i} rows={this.props.rows} selections={selection[i]}/>)
        let mouse_handle = (e) => this.handleMouse(e)
        return (
            <div ref={this.ref} className="schedule noselect" onMouseMove={mouse_handle} onMouseDown={mouse_handle} onMouseUp={mouse_handle}>
                {days}
            </div>
        );
    }
}

class Root extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.form = React.createRef();
    }

    register_selector(x) {
        if(this.ref.current){
            this.ref.current.register_selector(x);
        }
    }

    submit() {
        let mask = bitmask(this.ref.current.state.selection, 24);
        this.form.current.value = encode_buffer(mask);
    }

    render() {
        return (
            <div className="hz schedule-card">
                <div className="spacer"/>
                <div className="schedule-block">
                    <Schedule cols={5} rows={24} ref={this.ref} />
                    <form action={window.location.pathname+"/submit"} method="post" onSubmit={() => this.submit()}>
                        <input type="text" name="name" placeholder="Anonymous"/>
                        <input ref={this.form} type="hidden" name="submit" value=""/>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div className="spacer"/>
                <div className="spacer"/>
                <div className="schedule-block">
                    <Chunks cols={5} rows={24} register_selector={(x)=>this.register_selector(x)}/>
                </div>
                <div className="spacer"/>
            </div>
        );
    }
}

function rgba(r, g, b, a) {
    return "rgba(" + [r, g, b, a].join() + ")";
}

function Box(props) {
    let margin = props.pad || "0.2em";
    let style = {
        marginLeft: margin,
        marginRight: margin,
    }
    return <div className="shield"><div style={style} className="box" onMouseOver={props.onMouseOver}>{props.children}</div></div>
}

function Chunk(props) {
    const amt = props.amount;
    const max = props.max;
    const color = amt > 0 ? (amt === 1.0 ? rgba(255, 0, 255, 1) : rgba(0, 128, 255, (amt+0.3)/1.3)) : rgba(0, 0, 0, 0);
    const style = {
        top: props.top,
        height: props.height || props.bottom-props.top,
        backgroundColor: color,
    }
    return (
        <div style={style}>
            <Box onMouseOver={props.setActive}>{props.children}</Box>
        </div>
    )
}

function ChunkCol(props) {
    let full = props.full;
    let amts = props.amounts;
    let rows = amts.length;
    const ref = React.useRef(null);
    const [height, setHeightState] = React.useState(1);
    React.useEffect(() => {setHeightState(ref.current.offsetHeight)})
    let chunks = new Array(amts.length).fill(null).map((_, i) => <Chunk key={i} top={height/rows*i} height={height/rows} amount={amts[i]/full} setActive={()=>props.setActive(i)}></Chunk>);
    return (
        <div ref={ref} className="day">
            {chunks}
        </div>
    );
}

function get_selection_graph(selections, names=null) {
    if(!names){
        names = Object.keys(selections).sort();
    }
    let ans = {};
    for(let name of names) {
        let sel = selections[name];
        for(let i = 0; i < sel.length*8; i++) {
            if(get_bit(sel, i)) {
                if (ans[i] === undefined) ans[i] = [];
                ans[i].push(name);
            }
        }
    }
    return ans;
}

function get_selection_matrix(selection_dict, rows, cols) {
    let ans = new Array(cols).fill(null).map(_ => new Array(rows).fill(null));
    for(let c = 0; c < cols; c++){
        for(let r = 0; r < rows; r++){
            let idx = r + c*rows;
            if(selection_dict[idx]){
                ans[c][r] = selection_dict[idx];
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

function matching_mask(list_a, list_b, eq=(a, b)=>a===b) {
    let mask = new Array(list_a.length).fill(false);
    let mask_idx = 0;
    let subset_idx = 0;
    while(mask_idx < list_a.length && subset_idx < list_b.length){
        if(eq(list_a[mask_idx], list_b[subset_idx])){
            mask[mask_idx] = true;
            mask_idx++;
            subset_idx++;
        }
        else{
            mask_idx++;
        }
    }
    return mask;
}

function get_active_name_mask(active, all_names, selection_matrix) {
    if(!active){
        return new Array(all_names.length).fill(true);
    }
    const selected = selection_matrix[active.col][active.row];
    return matching_mask(all_names, selected);
}

function intersperse(arr, sep) {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce(function(xs, x, i) {
        return xs.concat([sep, x]);
    }, [arr[0]]);
}

function ShowName(props) {
    const active_class = props.active ? "active" : "inactive";
    return <span className={active_class}>{props.name}</span>
}

function ShowActiveNames(props) {
    // console.log(props.mask, props.names);
    const names = props.names.map((x, i)=>(<ShowName key={i} name={x} active={props.mask[i]}/>))
    const name_list = intersperse(names, ", ");
    const count = props.mask.reduce((acc, x)=>acc + (x ? 1 : 0), 0)
    const summary = props.show_count ? <span>{count}/{props.mask.length}</span> : ""
    return <div>{summary} {name_list}</div>;
}

function Chunks(props) {
    const [user_selection, setUserSelection] = React.useState([]);
    const [other_selections, setOtherSelections] = React.useState({});
    const [active, setActive] = React.useState(null);

    React.useEffect(() => {
        get_selections().then((x) => {
            setOtherSelections(x);
        })
    }, []);

    React.useEffect(() => {
        props.register_selector(setUserSelection);
    });

    const rows = props.rows;
    const cols = props.cols;

    const any_user_selections = user_selection.reduce((a, x)=>a|x, 0);
    const selections = any_user_selections ? {You: user_selection, ...other_selections} : other_selections;
    const all_names = Object.keys(selections).sort();
    const selection_graph = get_selection_graph(selections, all_names);
    const selection_matrix = get_selection_matrix(selection_graph, rows, cols)
    const amounts = get_selection_amounts(selection_matrix);
    const name_mask = get_active_name_mask(active, all_names, selection_matrix);
    const full = all_names.length || 1;
    const chunk_cols = Array(props.cols).fill(null).map((_, i) => <ChunkCol key={i} amounts={amounts[i]} full={full} setActive={(r)=>setActive({col: i, row: r})}/>);
    return <div><div className="schedule" onMouseLeave={()=>setActive(null)}>{chunk_cols}</div><ShowActiveNames names={all_names} mask={name_mask} show_count={active!==null}/></div>
}

async function get_selections() {
    let response = await fetch(window.location.pathname+"/q");
    let data = await response.json();
    for (let key in data) {
        data[key] = decode_buffer(data[key]);
    }
    return data;
}

const domContainer = document.getElementById('root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Root));