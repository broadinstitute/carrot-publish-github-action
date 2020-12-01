const core = require('@actions/core');
const github = require('@actions/github');

/** 
 * Uses the prUrl to retrieve information about the PR.  Returns a promise containing the info.
 */
async function getPRInfo(prUrl) {
    // Parse owner, repo, and pull_number from prURL so we can get the PR info using octokit
    const {owner, repo, pullNumber} = parsePrUrl(prUrl);
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
 * Retrieves the permission level of the specified user for the specified owner and repo
 */
async function getUserPermissionLevel(owner, repo, username) {
    // Get octokit so we can access the github api
    octokit = getOctokit();
    // If it's undefined, return
    if(octokit === undefined) {
        console.log("Failed to initialize octokit for retrieving user permission level");
        return;
    }
    // Get and return user permission level
    const { data: permission } = await octokit.repos.getCollaboratorPermissionLevel({owner, repo, username});
    return permission;
}
/*
 * Parses owner, repo, and pull number from prUrl
 */
function parsePrUrl(prUrl) {
    const splitUrl = prUrl.split("/");
    const owner = splitUrl[4];
    const repo = splitUrl[5];
    const pullNumber = splitUrl[7];
    return {owner, repo, pullNumber};
}

/**
 * Initializes an octokit using the token supplied in the github-token input.  Returns the created
 * octokit if successful or undefined if the token is undefined.  Only initializes it once; returns
 * the first one if called again
 */
function getOctokit() {
    if(getOctokit.octokit == undefined) {
        const token = core.getInput("github-token");
        // If token isn't defined, return
        if(token === '') {
            console.log("No value set for github-token");
            return;
        }
        // Create octokit
        getOctokit.octokit = github.getOctokit(token);
    }
    return getOctokit.octokit;
}

module.exports = {
    getPRInfo,
    getUserPermissionLevel,
    getOctokit
}