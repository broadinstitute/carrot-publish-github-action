const parser = require('./comment-parser');

test('parse comment with both keys', () => {
    const parsed = parser.parseComment('#carrot(Github actions test, in_test_image, in_eval_image)');
    expect(parsed).toStrictEqual({
        runType: "run",
        testName: "Github actions test",
        testInputKey: "in_test_image",
        evalInputKey: "in_eval_image"
    });
});

test('parse comment for pr run', () => {
    const parsed = parser.parseComment('#carrot_pr(Github actions test, in_test_image, in_eval_image)');
    expect(parsed).toStrictEqual({
        runType: "pr",
        testName: "Github actions test",
        testInputKey: "in_test_image",
        evalInputKey: "in_eval_image"
    });
});

test('parse comment with test key', () => {
    const parsed = parser.parseComment('#carrot(test_name, test_key,)');
    expect(parsed).toStrictEqual({
        runType: "run",
        testName: "test_name",
        testInputKey: "test_key",
        evalInputKey: ""
    });
});

test('parse comment with eval key', () => {
    const parsed = parser.parseComment('#carrot(test_name, , eval_key)');
    expect(parsed).toStrictEqual({
        runType: "run",
        testName: "test_name",
        testInputKey: "",
        evalInputKey: "eval_key"
    });
});

test('parse comment with no keys', () => {
    console.log = jest.fn();
    const parsed = parser.parseComment('#carrot(test_name, ,)');
    expect(parsed).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("Comment must have a value for one or both of the second and third params");
});

test('parse comment without #', () => {
    console.log = jest.fn();
    const parsed = parser.parseComment('carrot(test_name, test_key, eval_key)');
    expect(parsed).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("Comment doesn't match CARROT command regex");
});

test('parse comment completely does not match', () => {
    console.log = jest.fn();
    const parsed = parser.parseComment('I\'m running into this issue in my code as well.');
    expect(parsed).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("Comment doesn't match CARROT command regex");
});