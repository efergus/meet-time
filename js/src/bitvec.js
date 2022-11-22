
function bitmask(selection_spans, rows) {
    let cols = selection_spans.length;
    let size = Math.ceil(rows*cols/8);
    let bits = new ArrayBuffer(size);
    let view = new Uint8Array(bits);
    for (let col = 0; col < cols; col++) {
        for (let span of selection_spans[col]) {
            for (let row = span[0]; row < span[1]; row++) {
                set_bit(view, row + col*rows);
            }
        }
    }
    return view;
}

function b64safe(b64, reverse = false) {
    return reverse ? b64.replace(/-/g, "+").replace(/_/g, "/") : b64.replace(/\+/g, "-").replace(/\//g, "_");
}

function encode_string(string) {
    return b64safe(btoa(string));
}

function encode_buffer(array) {
    return encode_string(String.fromCharCode(...array));
}

function decode_string(string) {
    return atob(b64safe(string, true));
}

function decode_buffer(buffer_string) {
    const characters = decode_string(buffer_string);
    const nums = new Array(characters.length).fill(null).map((_, i) => characters.charCodeAt(i));
    return new Uint8Array(nums);
}

class BitVec {
    constructor(arr, length=null) {
        this.arr = arr;
        this.length = length || arr.length*8;
    }

    static with_size(size) {
        const length = Math.ceil(size/8);
        let arr = new Uint8Array(length).fill(0);
        return new BitVec(arr, size);
    }

    static from_bytes(arr) {
        return new BitVec(arr);
    }

    static get_bit_offset(bit_idx) {
        return 7-(bit_idx % 8);
    }

    static get_bit_shifted(bit_idx) {
        return 1 << BitVec.get_bit_offset(bit_idx);
    }

    static get_bit_index(bit_idx) {
        return Math.floor(bit_idx/8);
    }

    static index_and_bit(bit_idx) {
        return [BitVec.get_bit_index(bit_idx), BitVec.get_bit_shifted(bit_idx)];
    }

    static concat() {
        let size = new Array(arguments.length).fill(null).map((x, i)=>arguments[i].length).reduce((acc, x)=>acc+x, 0);
        let ans = BitVec.with_size(size);
        let idx = 0;
        for(let vec of arguments) {
            for(let i = 0; i < vec.length; i++) {
                ans.set(idx, vec.get(i));
                idx++;
            }
        }
        return ans;
    }

    set(bit_idx, val=true) {
        let [idx, bit] = BitVec.index_and_bit(bit_idx);
        let byte = this.arr[idx];
        this.arr[idx] = val ? byte | bit : byte & ~bit;
    }

    flip(bit_idx) {
        let [idx, bit] = BitVec.index_and_bit(bit_idx);
        let val = this.arr[idx];
        this.arr[idx] = val ^ bit;
    }

    get(bit_idx) {
        let [idx, bit] = BitVec.index_and_bit(bit_idx);
        return (this.arr[idx] & bit) > 0;
    }

    push(val=true) {
        const idx = BitVec.get_bit_index(this.length);
        if(idx >= this.arr.length){
            this.arr.push(0);
        }
        this.set(this.length, val);
        this.length += 1;
    }

    any() {
        for(let i = 0; i < this.arr.length; i++){
            if(this.arr[i]){
                return true;
            }
        }
        return false;
    }

    spread(bit_idx, val=true) {
        for(let i = bit_idx; i < this.length && this.get(i) !== val; i++) {
            this.set(i, val);
        }
        for(let i = bit_idx-1; i >= 0 && this.get(i) !== val; i--) {
            this.set(i, val);
        }
    }

    spans(val=true) {
        if(!this.any()) return [];
        let ans = [];
        const lim = this.length;
        for(let at = 0; at < lim; at++) {
            while(at < lim && this.get(at)!==val) at++;
            const start = at;
            while(at < lim && this.get(at)===val) at++;
            if(this.get(start)===val) ans.push(new Span(start, at));
        }
        return ans;
    }

    copy() {
        return new BitVec(this.arr.slice(), this.length);
    }

    toString() {
        let s = "";
        for(let i = 0; i < this.length; i++){
            s += this.get(i) ? "1" : "0";
        }
        return s;
    }

    *iterBits() {
        for(let i = 0; i < this.length; i++){
            yield this.get(i);
        }
    }

    bytes() {
        return this.arr;
    }

    encode() {
        return encode_buffer(this.bytes());
    }
}