/** This wasmFS filesystem is shared by JavaScript and Rust WASI subsystems.
 *
 * For development we use the wasmFS.fs filesystem, but this will be replaced by
 * a peer-to-peer filesystem in production. For example, the Safe Network sn_fs
 * filesystem.
 *
 * @namespace GitPortalAPI.filesystem
 */

import { fs } from './api'; // WasmFS fs.promises API, later sn_fs

/**
 * Get directory contents
 *
 * @memberOf GitPortalAPI.filesystem
 * @export
 * @return {*}
 */
export async function getDirectory(path){
    let files = await fs.readdir(path);
    let listing = [];
    for (let i = 0; i < files.length; i++) {
        const name = files[i];
        const stats = await fs.stat([path,name].join('/'));
        listing.push({
            name,
            isDir: stats.isDirectory(),
            isFile: stats.isFile(),
            stats,
        });
    }
    return listing;
}

export async function uploadFile(){
    console.log("TODO api/fs.js uploadFile()")
}