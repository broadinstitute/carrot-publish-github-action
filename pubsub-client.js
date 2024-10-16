const core = require('@actions/core');
const fs = require('fs');
const PubSub = require('@google-cloud/pubsub');

/**
 *  Sends the message string to the pubsub topic.
 */
async function publishMessage(message) {
    // Setup the environment variable for the SA credentials so PubSub can send the message
    processSAKey();
    // Get the topic name from the inputs
    const topicName = core.getInput('topic-name');
    // Create the PubSub client to send the message
    const client = new PubSub();
    // Convert the message to the proper format to send
    const dataBuffer = Buffer.from(message);
    // Send the message
    const messageId = await client.topic(topicName).publish(dataBuffer);
    // Return the message id
    return messageId;
}

/**
 * The SA key for the CARROT publish service account needs to be written to a file to be accessed
 * correctly by gcloud pubsub, so we'll put it in a tmp directory and reference it with an
 * environment variable.
 */
function processSAKey() {
    // Get the SA Key from the inputs
    const saKey = core.getInput("sa-key");
    // Write it to a file
    fs.writeFileSync('/tmp/account.json', saKey);
    // Set the Google environment variable to the file location
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/account.json';
}

module.exports = {
    publishMessage
}