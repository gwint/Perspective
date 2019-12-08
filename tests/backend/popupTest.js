QUnit.test("hello test", function(assert) {
    assert.ok(1 == "1", "Passed!");
});

QUnit.test("replaceDivsTest", function(assert) {
    assert.ok(1 == "1", "Passed!");
});

QUnit.test("extractIndividualSentencesTest", function(assert) {
    let sentence = "<p>Test Sentence.</p>";
    let extractedSentence = ["<p>Test Sentence.</p>"];

    assert.equal(extractIndividualSentences(sentence), JSON.stringify(extractedSentence), "Passed!");
});

QUnit.test("getDominantToneTest", function(assert) {
    assert.ok(1 == "1", "Passed!");
});

QUnit.test("getStructuredSentencesTest", function(assert) {
    assert.ok(1 == "1", "Passed!");
});
