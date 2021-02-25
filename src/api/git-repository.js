import { Mode, mix } from '@es-git/core';
import MemoryRepo from '@es-git/memory-repo';
import objectMixin from '@es-git/object-mixin';
import saveAsMixin from '@es-git/save-as-mixin';
import loadAsMixin from '@es-git/load-as-mixin';
import walkers from '@es-git/walkers-mixin';

/** Git repository API
 *
 * This API maintains a list of known repositories and their
 * status, providing access to the front-end for selecting
 * a repository, browsing contents and for initialising,
 * cloning and so on.
 *
 * TODO: These features are located here while git functionality...
 * is supplied by es-git, but long term, these features should
 * be migrated to the Rust/WASI subsystem.
 */

/**
 * es-git repository
 *
 * TODO: create a mixin for wasmFS to replace built-in memfs
 *
 * @class Repo
 * @extends {mix(MemoryRepo)
 *     .with(objectMixin)
 *     .with(saveAsMixin)
 *     .with(loadAsMixin)}
 */
class Repo extends mix(MemoryRepo)
    .with(objectMixin)
    .with(saveAsMixin)
    .with(loadAsMixin)
    .with(walkers) {
    constructor (path) {
        super();

        this.path = path;           // Full path to repository worktree or to gitDir if bare
        this.gitDir = undefined;    // Full path to git files
        this.worktree = undefined;  // Full path to worktree files
        this.initialised = false;   // true if filesystem has been populated
        console.log('new repo: ' + path);
    }
}

export async function repoInit() {

}

export async function repoClone() {

}


var repositories = new Map();   // Key: repository.path

/**
 * get list of active git repositories
 *
 * @example
 * var allRepositories = getRepositoryList(); // [{path, repo}...]
 *
 * @memberof GitPortalAPI.git
 *
 * @returns [] of {path: string, repo: Repo}
 */
export async function getRepositoryList(){
    // console.log('getRepositoryList()');
    let repos = [];
    repositories.forEach(r => {
        repos.push({path: r.path, repo: r});
    });
    return repos;
}

function _registerRepository(r) {
    if (repositories.has(r.path)) throw new Error('Repository exists at path: ' + path);
    repositories.set(r.path, r);
}

function _unregisterRepository(r) {
    if (!repositories.has(r.path)) {
        console.log('WARNING: unknown repository with path: ' + r.path);
    } else {
        delete repositories(r.path);
    }
}

/**
 * Make a new repository using the name as the workspace root
 *
 * @export
 * @param {*} name
 */
export async function newRepository(name){
    console.log('newRepository() name: ' + name);
    const repo = new Repo(name);

    // TODO remove test code which adds a couple commits...

    // Save a text file in the repo with the contents `hello`
    const hash1 = await repo.saveText('hello');

    // Save a folder with one file, the one we created above
    const tree1 = await repo.saveTree({
        'file.txt': {
        mode: Mode.file,
        hash: hash1
        }
    });

    // Commit the file and folder to the repo
    const commitHash1 = await repo.saveCommit({
        author: {
        name: 'Tim Caswell',
        email: 'tim@creationix.com',
        date: new Date()
        },
        committer: {
        name: 'Marius Gundersen',
        email: 'me@mariusgundersen.net',
        date: new Date()
        },
        message: 'initial commit',
        tree: tree1,
        parents: []
    });

    // Save a text file in the repo with the contents `hello`
    const hash2 = await repo.saveText('hello again');

    // Save a folder with one file, the one we created above
    const tree2 = await repo.saveTree({
        'file.txt': {
        mode: Mode.file,
        hash: hash2
        }
    });

    const commitHash2 = await repo.saveCommit({
        author: {
        name: 'Tim Caswell',
        email: 'tim@creationix.com',
        date: new Date()
        },
        committer: {
        name: 'Marius Gundersen',
        email: 'me@mariusgundersen.net',
        date: new Date()
        },
        message: 'another',
        tree: tree2,
        parents: [commitHash1]
    });

    // Set default branch to last commit (test only)
    await repo.setRef('refs/heads/main', commitHash2);

    _registerRepository(repo);
}
/**
 * Get a range of commits on the current branch
 *
 * @export
 * @param {String} path  to repository
 * @param {Integer} first first commit (>= 0)
 * @param {Integer} last  last commit to return
 * @return {[]{hash, message}}  array of commits
 */
export async function getHeadCommitsRange(path, first, last){
    console.log('getHeadCommitsRange()');

    if ( last < first ) {
		throw new Error("Invalid range, 'last' must be at least 'first'");
	} else if ( first < 0 ) {
		throw new Error("Invalid range, 'first' must not be less than 0");
	}

    console.log('arg path: ', path)
	// path = 'saeedareffard1377666/testproject2.git'

    let repo = repositories.get(path);
    if (repo == undefined) throw new Error('No repository exists at path: ' + path);

    const refs = new Map(await repo.listRefs().then(refs =>
        Promise.all(refs.map(async ref => [await repo.getRef(ref), ref]))
    ));

    console.log('REFS:');
    console.dir(refs);
    const commits = [];
    const nodes = new Map();
    const edges = [];
    let y = 0;
    const hashes = [await repo.getRef('refs/heads/main')];
    for await(const {hash, commit} of repo.walkCommits(...hashes)){
        console.log('commit: ' + hash);
        console.dir(commit);
        commits.push({'hash': hash, 'message': commit.message})
    }
    return commits;
  }


export const testRepoPath = 'testRepo';

export async function makeTestRepo() {
    console.log('makeTestRepo()');
    const repo = new Repo(testRepoPath);

    // Save a text file in the repo with the contents `hello`
    const hash = await repo.saveText('hello');

    // Save a folder with one file, the one we created above
    const tree = await repo.saveTree({
        'file.txt': {
        mode: Mode.file,
        hash
        }
    });

    // Commit the file and folder to the repo
    const commitHash = await repo.saveCommit({
        author: {
        name: 'Tim Caswell',
        email: 'tim@creationix.com',
        date: new Date()
        },
        committer: {
        name: 'Marius Gundersen',
        email: 'me@mariusgundersen.net',
        date: new Date()
        },
        message: 'initial commit',
        tree,
        parents: []
    });

    // Point the master branch to the commit
    await repo.setRef('refs/heads/main', commitHash);

    // Get the hash that the master branch points to
    const refHash = await repo.getRef('refs/heads/main');
    if(!refHash) throw new Error('branch does not exist');

    // Get the commit (the hash of the tree and the message) using the hash
    const {tree: treeHash, message} = await repo.loadCommit(refHash);
    console.log(message); // `initial commit`

    // Get the hash to the `file.txt' file in the tree
    const {'file.txt': {hash: fileHash}} = await repo.loadTree(treeHash);

    // Get the content of the file as a string
    const content = await repo.loadText(fileHash);
    console.log(content) // `hello`

    _registerRepository(repo);
}

export async function cloneRepo(path, url, options) {
    console.log('TODO cloneRepo()');

    const r = new Repo(path);
    // TODO
}
