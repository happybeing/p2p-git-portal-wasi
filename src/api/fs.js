/** This wasmFS filesystem is shared by JavaScript and Rust WASI subsystems.
 * 
 * For development we use the wasmFS.fs filesystem, but this will be replaced by
 * a peer-to-peer filesystem in production. For example, the Safe Network sn_fs
 * filesystem.
 * 
 * @namespace GitPortalAPI.filesystem
 */

/**
 * Get directory contents
 *
 * @memberOf GitPortalAPI.filesystem
 * @export
 * @return {*} 
 */
export async function getDirectory(){
    console.log("TODO api/fs.js getDirectory()")
    return [];
}

export async function uploadFile(){
    console.log("TODO api/fs.js uploadFile()")
}