import { js_test_n } from 'test';
import * as wasm from './wasi-gitportal_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error('expected a string argument');

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function logError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            let error = (function () {
                try {
                    return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
                } catch(_) {
                    return "<failed to stringify thrown value>";
                }
            }());
            console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
            throw e;
        }
    };
}
/**
*/
export function rust_js_test() {
    wasm.rust_js_test();
}

/**
*/
export function rust_print_bg() {
    wasm.rust_print_bg();
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error('expected a number argument');
}
/**
* @param {number} n
*/
export function rust_print_bg_n(n) {
    _assertNum(n);
    wasm.rust_print_bg_n(n);
}

/**
* @param {string} s
* @returns {string}
*/
export function rust_say(s) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.rust_say(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_export_2.value += 16;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {number} a
* @param {number} b
* @returns {number}
*/
export function add(a, b) {
    _assertNum(a);
    _assertNum(b);
    var ret = wasm.add(a, b);
    return ret;
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4);
    getUint32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayI32FromWasm0(ptr, len) {
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
* @param {Int32Array} list
* @returns {Int32Array}
*/
export function doubleList(list) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passArray32ToWasm0(list, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.doubleList(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayI32FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v1;
    } finally {
        wasm.__wbindgen_export_2.value += 16;
    }
}

/**
* @param {string} p1
* @param {string} p2
* @param {string} desc
* @returns {string}
*/
export function create_line(p1, p2, desc) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passStringToWasm0(p1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(p2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(desc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        wasm.create_line(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_export_2.value += 16;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {string} s
* @returns {string}
*/
export function say(s) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.say(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_export_2.value += 16;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {string} s
* @returns {string}
*/
export function obfusticate(s) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.obfusticate(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_export_2.value += 16;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {number} a
* @param {number} b
* @returns {number}
*/
export function lowest_common_denominator(a, b) {
    _assertNum(a);
    _assertNum(b);
    var ret = wasm.lowest_common_denominator(a, b);
    return ret;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* @param {Uint8Array} v
* @returns {Uint8Array}
*/
export function sha3_digest(v) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passArray8ToWasm0(v, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.sha3_digest(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally {
        wasm.__wbindgen_export_2.value += 16;
    }
}

/**
* @param {Uint8Array} s
* @returns {Uint8Array}
*/
export function keccak_digest(s) {
    try {
        const retptr = wasm.__wbindgen_export_2.value - 16;
        wasm.__wbindgen_export_2.value = retptr;
        var ptr0 = passArray8ToWasm0(s, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.keccak_digest(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally {
        wasm.__wbindgen_export_2.value += 16;
    }
}

/**
* @param {any} x
*/
export function imported_type_by_value(x) {
    wasm.imported_type_by_value(addHeapObject(x));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {any} x
*/
export function imported_type_by_shared_ref(x) {
    try {
        wasm.imported_type_by_shared_ref(addBorrowedObject(x));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @returns {any}
*/
export function return_imported_type() {
    var ret = wasm.return_imported_type();
    return takeObject(ret);
}

/**
* @param {any | undefined} x
*/
export function take_option_imported_type(x) {
    wasm.take_option_imported_type(isLikeNone(x) ? 0 : addHeapObject(x));
}

/**
* @returns {any | undefined}
*/
export function return_option_imported_type() {
    var ret = wasm.return_option_imported_type();
    return takeObject(ret);
}

/**
* @param {string} source_code
*/
export function h9q_string(source_code) {
    var ptr0 = passStringToWasm0(source_code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.h9q_string(ptr0, len0);
}

/**
* @param {string} src_file
*/
export function h9q_file(src_file) {
    var ptr0 = passStringToWasm0(src_file, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.h9q_file(ptr0, len0);
}

/**
*/
export const NumberEnum = Object.freeze({ Foo:0,"0":"Foo",Bar:1,"1":"Bar",Qux:2,"2":"Qux", });
/**
*/
export class Struct {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_struct_free(ptr);
    }
    /**
    * @returns {number}
    */
    get number() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.__wbg_get_struct_number(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set number(arg0) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        _assertNum(arg0);
        wasm.__wbg_set_struct_number(this.ptr, arg0);
    }
    /**
    * @returns {any}
    */
    get string() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        var ret = wasm.__wbg_get_struct_string(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} arg0
    */
    set string(arg0) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        wasm.__wbg_set_struct_string(this.ptr, addHeapObject(arg0));
    }
}

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_jstestn_3972d64759ecb6d5 = logError(function(arg0) {
    js_test_n(arg0 >>> 0);
});

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

