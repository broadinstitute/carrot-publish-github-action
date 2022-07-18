const processor = require("./comment-processor")
const core = require('@actions/core');
const github = require('@actions/github');
const githubClient = require('./github-client');
const pubsubClient = require('./pubsub-client');
const permissionsChecker = require('./permissions-checker');

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('./github-client');
jest.mock('./pubsub-client');
jest.mock('./permissions-checker');

test('process comment success', async () => {
    github.context = {
        payload: {
            issue: {
                pull_request: {
                    url: 'https://example.com/repos/test_account/test_repo/pull/3'
                },
                number: 3
            },
            comment: {
                body: "#carrot(Test test name, key_1, key2)",
                user: {
                    login: "example_user"
                }
            },
            repository: {
                full_name: "test_account/test_repo"
            }
        }
    };

    core.getInput.mockImplementation((name) => name);

    const prInfo = {
        head: {
            sha: "734713bc047d87bf7eac9674765ae793478c50d3"
        },
        base: {
            sha: "19284054047d87bf7eac9674765ae793478c50d3"
        }
    };
    githubClient.getPRInfo.mockImplementation(async () => prInfo);

    const expectedMessage = {
        "request_type": "run",
        "body": {
            "source": "github",
            "test_name": "Test test name",
            "test_input_key": "key_1",
            "eval_input_key": "key2",
            "software_name": "software-name",
            "commit": "734713bc047d87bf7eac9674765ae793478c50d3",
            "owner": "test_account",
            "repo": "test_repo",
            "issue_number": 3,
            "author": "example_user"
        }
    };
    pubsubClient.publishMessage.mockImplementation(async (message) => {
        expect(message).toBe(JSON.stringify(expectedMessage));
        return 123456
    });

    permissionsChecker.userHasPermission.mockImplementation(async () => true);

    console.log = jest.fn();

    await processor.processComment();

    expect(console.log).toHaveBeenCalledWith("Message sent with ID: 123456");
});

test('process comment success pr', async () => {
    github.context = {
        payload: {
            issue: {
                pull_request: {
                    url: 'https://example.com/repos/test_account/test_repo/pull/3'
                },
                number: 3
            },
            comment: {
                body: "#carrot_pr(Test test name, key_1, key2)",
                user: {
                    login: "example_user"
                }
            },
            repository: {
                full_name: "test_account/test_repo"
            }
        }
    };

    core.getInput.mockImplementation((name) => name);

    const prInfo = {
        head: {
            sha: "734713bc047d87bf7eac9674765ae793478c50d3"
        },
        base: {
            sha: "19284054047d87bf7eac9674765ae793478c50d3"
        }
    };
    githubClient.getPRInfo.mockImplementation(async () => prInfo);

    const expectedMessage = {
        "request_type": "pr",
        "body": {
            "source": "github",
            "test_name": "Test test name",
            "test_input_key": "key_1",
            "eval_input_key": "key2",
            "software_name": "software-name",
            "head_commit": "734713bc047d87bf7eac9674765ae793478c50d3",
            "base_commit": "19284054047d87bf7eac9674765ae793478c50d3",
            "owner": "test_account",
            "repo": "test_repo",
            "issue_number": 3,
            "author": "example_user"
        }
    };
    pubsubClient.publishMessage.mockImplementation(async (message) => {
        expect(message).toBe(JSON.stringify(expectedMessage));
        return 123456
    });

    permissionsChecker.userHasPermission.mockImplementation(async () => true);

    console.log = jest.fn();

    await processor.processComment();

    expect(console.log).toHaveBeenCalledWith("Message sent with ID: 123456");
});

test('process comment not a pr', async () => {
    github.context = {
        payload: {
            issue: {
                number: 3
            },
            comment: {
                body: "#carrot(name,key1,key2)",
                user: {
                    login: "example_user"
                }
            },
            repository: {
                full_name: "test_account/test_repo"
            }
        }
    };

    console.log = jest.fn();

    pubsubClient.publishMessage.mockImplementation(async () => {
        throw new Error("Published a message even though it shouldn't");
    });

    await processor.processComment();

    expect(console.log).toHaveBeenCalledWith("Not a PR comment");
});

test('process comment not a carrot comment', async () => {
    github.context = {
        payload: {
            issue: {
                pull_request: {
                    url: 'https://example.com/repos/test_account/test_repo/pull/3'
                },
                number: 3
            },
            comment: {
                body: "Hi, everybody!",
                user: {
                    login: "example_user"
                }
            },
            repository: {
                full_name: "test_account/test_repo"
            }
        }
    };

    console.log = jest.fn();

    pubsubClient.publishMessage.mockImplementation(async () => {
        throw new Error("Published a message even though it shouldn't");
    });


    await processor.processComment();

    expect(console.log).toHaveBeenCalledWith("Comment is not formatted as a CARROT command comment");
});