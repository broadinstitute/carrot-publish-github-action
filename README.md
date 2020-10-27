# CARROT publish comment action

This action is meant to be used to publish a message to a Google Cloud PubSub topic to be picked 
up by a [CARROT](https://github.com/broadinstitute/carrot) server and processed to run a test.

## Running

Triggering the publish is done by posting a comment on a pull request in the form 
`#carrot({test_name}, {test_input_key}, {eval_input_key})` where {test_name} is the unique name of 
the test, {test_input_key} is the input in the test wdl to which the generated docker image should be 
supplied (can be left blank if {eval_input_key} is filled in), and {eval_input_key} is the input 
in the eval wdl to which the generated docker image should be supplied (can be left blank 
{test_input_key} is filled in).

A message is generated and sent to the PubSub topic to be forwarded to CARROT.  CARROT will start a
run of the specified test, beginning with generating a Docker image for the specific repo and 
commit relevant to the pull request comment that generated the message, provided the repo exists
as a software entity within the CARROT database.

## Usage

See [action.yml](action.yml)

Example workflow:
```
name: start-carrot-test-from-pr-comment
on: 
    issue_comment:
        types: [created]
jobs:
    publish-test:
        runs-on: ubuntu-18.04
        steps:
            - name: Parse comment
              uses: broadinstitute/carrot-publish-github-action@v0.3.0-beta
              with:
                software-name: carrot
                github-token: ${{ secrets.GITHUB_TOKEN }}
                topic-name: ${{ secrets.CARROT_TOPIC_NAME }}
                sa-key: ${{ secrets.CARROT_SA_KEY }}
```

The value for `software-name` should match the name used in the software record in CARROT that you created to represent your repository.

`CARROT_TOPIC_NAME` should be defined as a secret in your repository as the name of the Google Cloud PubSub topic that run messages will be published to.

`CARROT_SA_KEY` should be defined as a secret in your repository as a service account key json for the Google Service Account that has access to publish to the topic specified by `CARROT_TOPIC_NAME`.

`GITHUB_TOKEN` will be generated automatically for communicating with the GitHub API, and does not need to be manually set.

## Packaging

Runs from the `dist/index.js` entrypoint.  The action must be packaged before a release so it can be used.
```
npm run prepare
git add dist
```