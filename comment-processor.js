const core = require('@actions/core');
const github = require('@actions/github');
const parser = require('./comment-parser');
const githubClient = require('./github-client');
const pubsubClient = require('./pubsub-client');

/**
 * Parses the comment that triggered this action and sends a message to google pubsub with the
 * info to start a test, if the comment is a carrot test comment.
 * 
 * Checks if the comment that triggered this action is a PR comment that matches the format of a
 * carrot test comment (#carrot({test_name}, {test_input_key}, {eval_input_key})).  If it does,
 * parses the comment and the PR context to send a message to the configured google pubsub topic
 * to start a carrot test.
 */
async function processComment() {
    // Get pull request info
    const pr = github.context.payload["issue"]["pull_request"];
    // If pr doesn't have a value, this isn't a pull request comment, so we'll return
    if(pr === undefined) {
        console.log("Not a PR comment")
        return;
    }
    // Get comment body
    const commentBody = github.context.payload["comment"]["body"];
    // Parse the comment body to get the parameters
    const params = parser.parseComment(commentBody);
    // If params doesn't have a value, the comment is not formatted as a CARROT comment, so return
    if(params === undefined) {
        console.log("Comment is not formatted as a CARROT command comment");
        return;
    }
    // Get the other info we need about the PR via the GitHub API
    const prInfo = await githubClient.getPRInfo(pr["url"]);
    // Extract the commit hash
    const commitHash = prInfo["head"]["sha"];
    // While we're here, get the last bit of metadata we need
    const ownerAndRepo = github.context.payload["repository"]["full_name"].split("/");
    const issueNumber = github.context.payload["issue"]["number"];
    const author = github.context.payload["comment"]["user"]["login"];
    // Build the message
    const message = {
        "source": "github",
        "test_name": params["testName"],
        "test_input_key": params["testInputKey"],
        "eval_input_key": params["evalInputKey"],
        "software_name": core.getInput('software-name'),
        "commit": commitHash,
        "owner": ownerAndRepo[0],
        "repo": ownerAndRepo[1],
        "issue_number": issueNumber,
        "author": author
    };
    // Send the message
    const messageId = await pubsubClient.publishMessage(JSON.stringify(message)).catch(core.setFailed);

    console.log("Message sent with ID: " + messageId);
}

module.exports = {
    processComment
}