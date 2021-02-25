<script>
import {onMount} from "svelte"
import {initialiseWasm, getStdout, uploadFile} from './api'
import { makeTestRepo, getRepositoryList, newRepository } from './api'

let stdout = "";

onMount(async () => {
	await initialiseWasm();
	stdout = await getStdout();
});


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Copied from proof-of-concept

import RepoDashboardPanel from './RepoDashboardPanel.svelte'
import IssuesListingPanel from './IssuesListingPanel.svelte'
import CommitsListingPanel from './CommitsListingPanel.svelte'
import DirectoryListingPanel from './DirectoryListingPanel.svelte'

import UploadRepositoryPanel from './test/UploadRepositoryPanel.svelte'
import GoGitClonePanel from './test/GoGitClonePanel.svelte'

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

async function GitTest() {
	await makeTestRepo();
	await updateRepositoryUI(newRepoName)
}

// Development:
let allRepositories = [];	// Array of {path, repo}

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
	console.log('updateRepositoryUI()');
	allRepositories = await getRepositoryList();
	setActiveRepository(newRepoPath)
}

function setActiveRepository(repoDirectory) {
	console.log('setActiveRepository()');
	for (let index = 0; index < allRepositories.length; index++) {
		let repo = allRepositories[index]
		if (repo.path === repoDirectory) {
			console.log('to ' + index);
			activeRepository = index
			return
		}
	}
	console.log('NOT SET ');
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

</script>

<main>
<h1>Git Portal Prototype</h1>

<p> The Git Portal Prototype is a peer-to-peer alternative to github that runs entirely in
the browser from static storage, so no server-side code and no third parties involved. Built
using Svelte and Rust/Web Assembly on WasmerJS (WASI/WASM) to run on peer-to-peer networks such as <a
href='https://safenetwork.tech'>Safe Network</a>. Read more on github at <a
href='https://github.com/happybeing/p2p-git-portal-wasi'>p2p-git-portal-wasi</a>.</p>

<button type="button" on:click={() => { GitTest(); }}>Make Test Repo</button>

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
	<CommitsListingPanel bind:repositoryRoot={repositoryRoot}></CommitsListingPanel>
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

<h3>stdout:</h3>
<p> {#each stdout ? stdout.split('\n') : [""] as line} {line}<br/> {/each} </p>
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