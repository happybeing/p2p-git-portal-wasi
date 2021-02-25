<script>
// Show commits for the active repository

import { getHeadCommitsRange } from './api'

export let repositoryRoot;

$: updateCommitsListing(repositoryRoot);

let commits = [];

async function updateCommitsListing(repoPath) {
    console.log("updateCommitsListing() repoPath: ", repoPath);
    commits = [];
    let commitsRange;
    if (repoPath) {
        try {
            commitsRange = await getHeadCommitsRange(repoPath, 0, 10);
            commits = [...commitsRange];
            // console.dir(commitsRange);
        } catch(e) {
            console.log("Error: " + e);
            return;
        }
    }

    // console.log("commits now: ");
    // console.dir(commits);
}

</script>

<style>
/* .highlight {
    font-weight: bold;
} */

</style>
<div>
    <h3>Commit History</h3>
    {#if commits && commits.length > 0}
        {#each commits as commit, index}
            {#if commit}
                <span>#{commit.hash.substr(0,7)} {commit.message}</span><br/>
            {/if}
        {/each}
    {:else}
        No commits.
    {/if}
</div>