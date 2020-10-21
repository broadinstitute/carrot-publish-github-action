const client = require('./github-client');
const core = require('@actions/core');
const github = require('@actions/github');

jest.mock('@actions/core');
jest.mock('@actions/github');

test('get pr info no octokit', async () => {
    core.getInput.mockImplementation(() => "");
    console.log = jest.fn();
    const prInfo = await client.getPRInfo('https://example.com/repos/test_account/test_repo/pull/3');
    expect(prInfo).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("No value set for github-token");
    expect(console.log).toHaveBeenCalledWith("Failed to initialize octokit for retrieving PR info");
});

test('get pr info', async () => {
    core.getInput.mockImplementation(() => "aaaaaaaaaaaaaaaaaa");
    const mocktokit = {
        pulls : {
            get : async (params) => {
                expect(params.owner).toBe("test_account");
                expect(params.repo).toBe("test_repo");
                expect(params.pull_number).toBe("3");
                return {
                    data: "test"
                }
            }
        }
    }
    github.getOctokit.mockImplementation(() => mocktokit);
    const prInfo = await client.getPRInfo('https://example.com/repos/test_account/test_repo/pull/3');
    expect(prInfo).toBe("test");
});