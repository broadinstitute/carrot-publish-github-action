/**
 * Parses comment into test name and keys
 * 
 * Parses the comment provided in commentBody and returns an object containing testName,
 * testInputKey, and evalInputKey if successful, or undefined if the comment is not in the correct
 * format for a CARROT comment.
 */
function parseComment(commentBody) {
    // Check if comment body matches the format for a carrot test command
    const re = /^#carrot\([^,]+,\s*[^,]*,\s*[^,]*\)$/;
    let workingCommentBody = commentBody.trim();
    // If it matches, extract the parameters
    if(re.test(workingCommentBody)) {
        // Extract params
        workingCommentBody = workingCommentBody.substring(8, workingCommentBody.length-1);
        const params = workingCommentBody.split(",");
        // Pull out the specific params
        const testName = params[0].trim();
        const testInputKey = params[1].trim();
        const evalInputKey = params[2].trim();
        // If both input keys are empty, return
        if(testInputKey.length < 1 && evalInputKey.length < 1) {
            console.log("Comment must have a value for one or both of the second and third params");
            return;
        }
        // If we made it this far, return the parsed params object
        return {
            testName,
            testInputKey,
            evalInputKey
        };
    }
    // If it doesn't match, return
    else {
        console.log("Comment doesn't match CARROT command regex");
        return;
    }
}

module.exports.parseComment = parseComment;