<script>
import {onMount} from "svelte"

import { WASI } from '@wasmer/wasi'
import { WasmFs } from '@wasmer/wasmfs'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { SomeJsType } from './wasi-js/wasiJs.js'

import * as wasiJs from './wasi-js/wasiJs.js'		// JavaScript subsystem
import * as wasm from './wasi-gitportal_bg_wasi.js'	// Bindings for Rust subsystem (using wasm-bindgen) 
const wasmFilePath = '/wasm/wasi-gitportal_bg.wasm' // Rust subsystem

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Copied from proof-of-concept

// const { uploadFile, getRepositoryList, getHeadCommitsRange, newRepository, openRepository} = wasm;
// TODO implement the following stubs
function uploadFile(){}
function getRepositoryList(){}
function getHeadCommitsRange(){}
function newRepository(){}
function openRepository(){}

import RepoDashboardPanel from './RepoDashboardPanel.svelte'
import IssuesListingPanel from './IssuesListingPanel.svelte'
import CommitsListingPanel from './CommitsListingPanel.svelte'
import DirectoryListingPanel from './DirectoryListingPanel.svelte'

import UploadRepositoryPanel from './test/UploadRepositoryPanel.svelte'
import GoGitClonePanel from './test/GoGitClonePanel.svelte'

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Instantiate new WASI and WasmFs Instances
// IMPORTANT:
// Instantiating WasmFs is only needed when running in a browser.
// When running on the server, NodeJS's native FS module is assigned by default
const wasmFs = new WasmFs()
let output = "";

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
	imports = {wasiJs,...{'./wasi-gitportal_bg.js': await import('./wasi-gitportal_bg_wasi')},...imports};

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
	output = await wasmFs.getStdOut();
	console.log(output.split('\n'));
	output = output.split('\n');
	
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Copied from proof-of-concept

let uploadRoot = ''
let filesToUpload = []
let uploadStatus = ''
let currentUpload = ''
let errorMessage

$: manageUploads(filesToUpload)

let newRepoName =''
let activeRepository
let directoryPath = ''

let repositoryRoot = ''
$: repositoryRoot = (allRepositories && activeRepository !== undefined && allRepositories[activeRepository] !== undefined ?
    allRepositories[activeRepository].path.trim() : '')

$: updateDirectoryPath(activeRepository)
$: console.log("directoryPath:", directoryPath)	// Debug

async function updateDirectoryPath(activeRepository) {
	console.log("updateDirectoryPath()", activeRepository)
	let repo = allRepositories[activeRepository]
	if (repo === undefined) {
		directoryPath = ''
		return
	}

	directoryPath = repo.path
}

async function makeNewRepo() {
	newRepoName.trim()
	if (newRepoName.length === 0) {
		errorMessage = "Please enter a name for the new repository"
		return
	}
	else if (getRepositoryForDirectory(newRepoName) !== undefined) {
		errorMessage = "Repository already exists at: " + newRepoName
		return
	}

	await newRepository(newRepoName)
	await updateRepositoryUI(newRepoName)
}

// Development:
let allRepositories = [];

async function readFile(entry, successCallback, errorCallback) {
    let reader = new FileReader();

    reader.onload = async function() {
      successCallback(entry, reader.result);
    };

    reader.onerror = function() {
      errorCallback(entry, reader.error);
    }

    reader.readAsArrayBuffer(entry);
}

async function manageUploads(filesToUpload) {
	console.log("manageUploads()");
	if (filesToUpload === undefined || filesToUpload.length === 0) return

	// TODO: check if repository exists
	await uploadFiles(uploadRoot, filesToUpload)
}

async function uploadFiles(uploadRoot, filesToUpload) {
	console.log("uploadFiles() to", uploadRoot);
	const totalFiles = filesToUpload.length
	let filesUploaded = 0
	uploadStatus = "Uploading " + totalFiles + " files to " + uploadRoot + "/"

	let fileInfo;
	while (fileInfo = filesToUpload.pop()) {
		const fullPath = fileInfo.webkitRelativePath
		// console.log('uploading: ', fileInfo.webkitRelativePath);
		currentUpload = fileInfo.webkitRelativePath.substring(uploadRoot+1)
		// console.dir(fileInfo)
		await readFile(fileInfo, 
			async (fileInfo, result) => { 
				// console.log('passing to Golang: ', fullPath)
				// console.dir(result);
				await uploadFile(...[fullPath, new Uint8Array(result)])
				filesUploaded += 1
				uploadStatus = filesUploaded + " files uploaded to " + uploadRoot + "/"
				if (filesUploaded === totalFiles) {
					// TODO: open repository and select it
					await openRepository(uploadRoot, (error) => {
						if (error && error !== "") {
							let message = "Failed to open repository of uploaded directory: " + error;
							errorMessage = message;
							console.log(message);
						} else {
							console.log("Upload complete and repository opened:", uploadRoot);
							updateRepositoryUI(uploadRoot)
						}
					});
				}
			},
			(fileInfo, result) => { console.log('error loading file: ', fullPath)}
		);
	}

	currentUpload = ''
}

async function updateRepositoryUI(newRepoPath) {
	allRepositories = await getRepositoryList();
	setActiveRepository(newRepoPath)
}

function setActiveRepository(repoDirectory) {
	for (let index = 0; index < allRepositories.length; index++) {
		let repo = allRepositories[index]
		if (repo.path === repoDirectory) {
			activeRepository = index
			return
		}
	}
}

function getRepositoryForDirectory(directoryName) {
	for (let index = 0; index < allRepositories.length; index++) {
		if (allRepositories[index].path === directoryName) return allRepositories[index].repo
	}
	return undefined
}

async function testRangeCommits() {
	console.log('testRangeCommits()')
	let result = await getHeadCommitsRange("saeedareffard1377666/testproject2.git", 0, 100);
	console.dir(result);
}

async function testReturnTypes() {
	console.log("testReturnTypes()")
	let ret = await testTypes();
	console.dir(ret);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
</script>

<main>
<h1>Git Portal Prototype</h1>

<p> The Git Portal Prototype is a peer-to-peer alternative to github that runs entirely in
the browser from static storage, so no server-side code and no third parties involved. Built
using Svelte and Rust/Web Assembly on WasmerJS (WASI/WASM) to run on peer-to-peer networks such as <a
href='https://safenetwork.tech'>Safe Network</a>. Read more on github at <a
href='https://github.com/happybeing/p2p-git-portal-wasi'>p2p-git-portal-wasi</a>.</p>

<div class='top-grid'>
	<RepoDashboardPanel bind:activeRepository={activeRepository} bind:allRepositories={allRepositories}></RepoDashboardPanel>
	<IssuesListingPanel bind:repositoryRoot={repositoryRoot}></IssuesListingPanel>
</div>

<div class='top-grid'>
	<div>
		<h3>New</h3>
		<p>
			<input bind:value={newRepoName} placeholder="directory name">
			<button type="button" on:click={() => { makeNewRepo(newRepoName); }}>New</button>
		</p>
		<UploadRepositoryPanel bind:uploadRoot={uploadRoot} bind:filesToUpload={filesToUpload}></UploadRepositoryPanel>
		{#if uploadStatus !== ''}
			{uploadStatus}<br/>
			{currentUpload}
		{/if}
	</div>
	<CommitsListingPanel bind:activeRepository={activeRepository} bind:allRepositories={allRepositories}></CommitsListingPanel>
</div>

{#if errorMessage}
<div>
	<p style="color: #f00">{errorMessage}</p>
	<button type="button" on:click={() => { errorMessage = undefined; }}>Dismiss</button>
</div>
{/if}
<div class='top-grid'>
	<!-- <FileUploadPanel bind:filesToUpload={filesToUpload} bind:errorMessage={errorMessage} >
		<p>Files to upload: {filesToUpload.length}<br/>
			{#if uploadingFile}
				Uploading: {uploadingFile}
			{/if}
			<br/>
		</p>		
	</FileUploadPanel> -->
	<GoGitClonePanel updateRepositoryUI={updateRepositoryUI} bind:errorMessage={errorMessage} ></GoGitClonePanel>
		<DirectoryListingPanel storeName="Worktree" bind:repositoryRoot={repositoryRoot}></DirectoryListingPanel>
	</div>
<!-- <GoWasmExample bind:errorMessage={errorMessage} ></GoWasmExample> -->

<h3>stdout:</h3>
<p> {#each output as line} {line}<br/> {/each} </p>
</main>

<style>
	main {
		text-align: left;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;

		font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
		font-size: 14px;
		line-height: 1.5;
		color: #24292e;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.top-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		/* grid-template-rows: 5fr 20fr 5fr; */
		grid-gap: 10px;
		/* height: 720px; */
	}
</style>