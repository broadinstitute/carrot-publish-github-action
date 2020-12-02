const client = require('./github-client');
const core = require('@actions/core');

/*
 * Returns boolean corresponding to whether the user specified by username has the necessary
 * to owner's repo to trigger a 
 */
async function userHasPermission(owner, repo, username) {
    // Hierarchy of permissions from most to least
    const permissionHierarchy = {
        'admin': 3,
        'write': 2,
        'read': 1,
        'none': 0
    };
    // Get the minimum permissions from the action inputs
    const minimumPermissions = core.getInput("minimum-permissions");
    // If minimumPermissions isn't a valid value, print a message and return false
    if(!permissionHierarchy.hasOwnProperty(minimumPermissions)) {
        console.log("Minimum permissions value " + minimumPermissions + " is not valid.  Allowed values are: admin, write, read, none");
        return false;
    }
    // Get the permissions of the user
    const permissions = (await client.getUserPermissionLevel(owner, repo, username))["permission"];
    // If user permissions are not recognized, return false because that shouldn't happen
    if(!permissionHierarchy.hasOwnProperty(permissions)) {
        console.log("Failed to retrieve user permissions or retrieve permission was not recognized. (Value: " + permissions + ")");
        return false;
    }
    // If user permissions are less than minimum, return false
    if(permissionHierarchy[permissions] < permissionHierarchy[minimumPermissions]) {
        console.log("Minimum permissions are " + minimumPermissions + " but user permissions are " + permissions);
        return false;
    }
    else {
        return true;
    }
}

module.exports.userHasPermission = userHasPermission;
