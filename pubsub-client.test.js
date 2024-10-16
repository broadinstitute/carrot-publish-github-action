const client = require('./pubsub-client');
const core = require('@actions/core');
const fs = require('fs');
const {PubSub} = require('@google-cloud/pubsub');

jest.mock('@actions/core');
jest.mock('@google-cloud/pubsub', ()=> {
    return jest.fn();
});

test('publish message', async () => {
    let message = '{"test":"test"}';
    core.getInput.mockImplementation(() => "test-input");
    mockPubSub = {
        topic : (name) => {
            expect(name).toBe("test-input");
            return {
                publish : async (buffer) => {
                    expect(buffer instanceof Buffer).toBe(true);
                    return "12345";
                }
            };
        }
    };
    PubSub.mockImplementation(() => mockPubSub);
    let messageId = await client.publishMessage(message);
    const credentials = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
    expect(credentials).toBe("test-input");
});