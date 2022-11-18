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
                <div><div>{props.children}</div></div>
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

function set_bit(data_view, bit_idx) {
    let idx = Math.floor(bit_idx/8);
    let offset = bit_idx % 8;
    let val = data_view.getUint8(idx);
    val = val | (1 << 7-offset);
    data_view.setUint8(idx, val);
}

function encode_string(string) {
    return btoa(string).replace(/\+/g, "-").replace(/\//g, "_");
}

function encode_buffer(array_buffer) {
    return encode_string(String.fromCharCode(...(new Uint8Array(array_buffer))));
}

function bitmask(selections_list, rows) {
    let cols = selections_list.length;
    let size = Math.ceil(rows*cols/8);
    let bits = new ArrayBuffer(size);
    let view = new DataView(bits);
    for (let col = 0; col < cols; col++) {
        for (let span of selections_list[col]) {
            for (let row = span[0]; row < span[1]; row++) {
                set_bit(view, row + col*rows);
            }
        }
    }
    console.log(new Uint8Array(bits));
    return bits;
}

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.stored = {
            width: null,
            height: null,
        };
        this.state = {
            begin: null,
            anchor: null,
            active: null,
            selection: Array(props.cols).fill([]),
        };
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
        this.setState({begin, anchor, active, selection})
    }

    componentDidMount () {
        this.stored = {
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

    submit() {
        let selections = this.ref.current.state.selection;
        this.form.current.value = encode_buffer(bitmask(selections, 24));
    }

    render() {
        return (
            <div>
                <Schedule cols={5} rows={24} ref={this.ref}/>
                <form action={window.location.pathname+"/submit"} method="post" onSubmit={() => this.submit()}>
                    <input type="text" name="name" placeholder="Anonymous"/>
                    <input ref={this.form} type="hidden" name="submit" value=""/>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        );
    }
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Root));