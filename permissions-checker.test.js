const client = require('./github-client');
const core = require('@actions/core');
const permissionsChecker = require('./permissions-checker');

jest.mock('@actions/core');
jest.mock('./github-client');

test('userHasPermission false',async () => {
    console.log = jest.fn();
    client.getUserPermissionLevel.mockImplementation(() => {
        return {"permission":"read"};
    });
    core.getInput.mockImplementation(() => "write");
    const hasPermission = await permissionsChecker.userHasPermission('test_owner', 'test_repo', 'test_user');
    expect(hasPermission).toBe(false);
    expect(console.log).toHaveBeenCalledWith("Minimum permissions are write but user permissions are read");
});

test('userHasPermission true matching',async () => {
    client.getUserPermissionLevel.mockImplementation(() => {
        return {"permission":"write"};
    });
    core.getInput.mockImplementation(() => "write");
    const hasPermission = await permissionsChecker.userHasPermission('test_owner', 'test_repo', 'test_user');
    expect(hasPermission).toBe(true);
});

test('userHasPermission invalid minimum',async () => {
    console.log = jest.fn();
    client.getUserPermissionLevel.mockImplementation(() => {
        return {"permission":"read"};
    });
    core.getInput.mockImplementation(() => "something");
    const hasPermission = await permissionsChecker.userHasPermission('test_owner', 'test_repo', 'test_user');
    expect(hasPermission).toBe(false);
    expect(console.log).toHaveBeenCalledWith("Minimum permissions value something is not valid.  Allowed values are: admin, write, read, none");
});
