const core = require('@actions/core');
const processor = require("./comment-processor");

async function run() {
    try {
        await processor.processComment();
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
