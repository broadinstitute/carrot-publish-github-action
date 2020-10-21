const core = require('@actions/core');
const github = require('@actions/github');

/** 
 * Uses the prUrl to retrieve information about the PR.  Returns a promise containing the info.
 */
async function getPRInfo(prUrl) {
    // Parse owner, repo, and pull_number from prURL so we can get the PR info using octokit
    const splitUrl = prUrl.split("/");
    const owner = splitUrl[4];
    const repo = splitUrl[5];
    const pullNumber = splitUrl[7];
    // Create octokit so we can make request
    octokit = getOctokit();
    // If it's undefined, return
    if(octokit === undefined) {
        console.log("Failed to initialize octokit for retrieving PR info");
        return;
    }
    // Get the PR info
    const { data: pullRequest } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
    });

    return pullRequest
}

/**
 * Initializes an octokit using the token supplied in the github-token input.  Returns the created
 * octokit if successful or undefined if the token is undefined.
 */
function getOctokit() {
    const token = core.getInput("github-token");
    // If token isn't defined, return
    if(token === '') {
        console.log("No value set for github-token");
        return;
    }
    // Create octokit
    return github.getOctokit(token);
}

module.exports = {
    getPRInfo,
    getOctokit
}