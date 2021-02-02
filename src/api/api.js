/**
 * This internal API separates the front-end from the application logic which is implemented 
 * using a mixture of JavaScript and Rust on top of a WasmerJS/WASI subsystem.
 * 
 * @namespace GitPortalAPI
 */

import { WASI } from '@wasmer/wasi'
import { WasmFs } from '@wasmer/wasmfs'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { SomeJsType } from '../wasi-js/wasiJs.js'

import * as wasiJs from '../wasi-js/wasiJs.js'		// JavaScript subsystem
import * as wasmBindings from '../wasi-gitportal_bg_wasi.js'	// Bindings for Rust subsystem (using wasm-bindgen) 
const wasmFilePath = '/wasm/wasi-gitportal_bg.wasm' // Rust subsystem

export let wasm = wasmBindings;
export let fs;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Instantiate new WASI and WasmFs Instances
// IMPORTANT:
// Instantiating WasmFs is only needed when running in a browser.
// When running on the server, NodeJS's native FS module is assigned by default

const wasmFs = new WasmFs()

let wasi = new WASI({
	args: [wasmFilePath],	// Rust main() must be empty so params not needed here

	// Environment variables that are accesible to the WASI module
	env: {},

	// Bindings that are used by the WASI Instance (fs, path, etc...)
	bindings: {
		...browserBindings,
		fs: wasmFs.fs
	},
	preopens: {'/': '/', '.': '.'},	// Necessary for the Rust app can access wasmFs (example 2)
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function initialiseWasm() {
    await startWasiTask(wasmFilePath);
    ready = true;
}

let ready = false;

export async function    getStdout() {
    return ready ? wasmFs.getStdOut() : "Error: getStdout() called before initialiseWasm()";
}



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run our WASI module/instance
const startWasiTask = async (pathToWasmFile) => {
	// Fetch the Wasm File
	let response  = await fetch(pathToWasmFile)
	let wasmBytes = new Uint8Array(await response.arrayBuffer())

	// IMPORTANT:
	// Some WASI module interfaces use datatypes that cannot yet be transferred
	// between environments (for example, you can't yet send a JavaScript BigInt
	// to a WebAssembly i64).  Therefore, the interface to such modules has to
	// be transformed using `@wasmer/wasm-transformer`, which we will cover in
	// a later example

	// Instantiate the WebAssembly file
	let wasmModule = await WebAssembly.compile(wasmBytes);
	let imports = wasi.getImports(wasmModule);	// Imports to WASM from Rust/WASI

	// Imports for WASI:
	// - js-wasi/jsWasi.js JavaScript exports for Rust
	// - wasm-bindgen Rust exports for JavaScript 
	imports = {wasiJs,...{'./wasi-gitportal_bg.js': await import('../wasi-gitportal_bg_wasi')},...imports};

	let instance = await WebAssembly.instantiate(wasmModule, {
		...imports
	});

	const hq9Filename = "HQ9.txt";

	// H9Q code can be passed as a string or the contents of hq9Filename
	const hq9StringCode = "H";
	const hq9FileCode = "H+H+H";

	// Sync write is easy:
	// wasmFs.fs.writeFileSync(hq9Filename, hq9FileCode, 'utf8');

	// Async write needs to be completed before calling the Rust app:
	//
	// The wasmFs.fs API is asynchronous using callbacks, so wrap in a
	// promise or use the callback to invoke the Rust app. If not
	// the wasm app won't see the file you've created.
	await new Promise( (resolve, reject) => {
		wasmFs.fs.open(hq9Filename, 'w+', (err, fd) => {
			let buf = Buffer.from(hq9FileCode),
			pos = 0, offset = 0,
			len = buf.length;
			wasmFs.fs.write(fd, buf, offset, len, pos, (err,bytes,buff) => {
				let buf2 = Buffer.alloc(len);
				wasmFs.fs.read(fd,buf2,offset, len, pos, (err,bytes,buff2) => {
					console.log(buff2.toString());
					return resolve();
				});
			});
		});
	});

	wasmFs.fs.readdir('/', (e, files) => {
		if (e) console.log("error:", e);
		if (files !== undefined) {
			console.dir(files)
		}
	});

	wasi.start(instance)                      	// Start the WASI instance. Note: Rust main(){} must be empty
	wasm.setBindingsWasm(instance.exports);		// Provide Rust implementations to JS Rust bindings

	// -------------------------------------------------------------
	// Misc Tests: some output to console in JS, others to WASI stdout in Rust
	console.log("** Misc Tests **");
	wasm.rust_print_bg_n(256);					// JS Number -> Rust u32 -> Rust String -> stdout
	console.log(wasm.rust_say("from Rust rust_say()"));	// JS String -> Rust str, Rust str -> JS String
	wasm.rust_js_test();						// Rust calling back to JS (js_test())

	// instance.exports.rust_print_nm();		// Rust '#[no_mangle]'
	instance.exports.rust_print_bg();			// Rust '#[wasm_bindgen]'

	// -------------------------------------------------------------
	console.log("** Example from https://github.com/ibaryshnikov/rust-workshop-21-dec-2018 **");

	const result = wasm.add(1, 2);
	console.log('result is', result);		// should be 3
	const list = wasm.doubleList([1, 2, 3]);
	console.log('list is', list);			// should be [2, 4, 6]

	// Some things which are not working yet:
	// wasm.addElement("First"); 			// should add new element to body
	// wasm.addElement("Second");

	// wasm.imported_type_by_value(new SomeJsType());
	// wasm.imported_type_by_shared_ref(new SomeJsType());

	// let x = wasm.return_imported_type();
	// console.log(x instanceof SomeJsType); // true

	// wasm.take_option_imported_type(null);
	// wasm.take_option_imported_type(undefined);
	// wasm.take_option_imported_type(new SomeJsType());

	// let y = wasm.return_option_imported_type();
	// if (y == null) {
	// // ...
	// } else {
	// console.log(y instanceof SomeJsType); // true
	// }

	// -------------------------------------------------------------
	console.log("** Examples from \"Getting started with Rust functions in Node.js\" **");
	// Article: https://www.secondstate.io/articles/getting-started-with-rust-function/
	// Source:  https://github.com/second-state/wasm-learning/tree/master/nodejs/functions
	// More:    https://cloud.secondstate.io/server-side-webassembly/getting-started

	const encoder = new TextEncoder();
	console.hex = (d) => console.log((Object(d).buffer instanceof ArrayBuffer ? new Uint8Array(d.buffer) : typeof d === 'string' ? (new util.TextEncoder('utf-8')).encode(d) : new Uint8ClampedArray(d)).reduce((p, c, i, a) => p + (i % 16 === 0 ? i.toString(16).padStart(6, 0) + '  ' : ' ') + c.toString(16).padStart(2, 0) + (i === a.length - 1 || i % 16 === 15 ?  ' '.repeat((15 - i % 16) * 3) + Array.from(a).splice(i - i % 16, 16).reduce((r, v) => r + (v > 31 && v < 127 || v > 159 ? String.fromCharCode(v) : '.'), '  ') + '\n' : ''), ''));

	console.log( wasm.say("SSVM") );
	console.log( wasm.obfusticate("A quick brown fox jumps over the lazy dog") );
	console.log( wasm.lowest_common_denominator(123, 2) );
	console.hex( wasm.sha3_digest(encoder.encode("This is an important message")) );
	console.hex( wasm.keccak_digest(encoder.encode("This is an important message")) );

	var p1 = {x:1.5, y:3.8};
	var p2 = {x:2.5, y:5.8};
	var line = JSON.parse(wasm.create_line(JSON.stringify(p1), JSON.stringify(p2), "A thin red line"));
	console.log( line );

	// -------------------------------------------------------------
	console.log("** h9q_string() test **");
	// See result as 'stdout' in the page
	wasm.h9q_string(hq9StringCode);	// h9Q+ code passed as a string

	// -------------------------------------------------------------
	console.log("** h9q_file() test **");
	// See result as 'stdout' in the page
	wasm.h9q_file(hq9Filename);		// Reads the H9Q+ code from the file (written above) 

	await wasmFs.fs.readdir('/', (e, files) => {
		if (e) console.log("error:", e);
		if (files !== undefined) {
			console.dir(files)
		}
	});
}
