QUnit.test("Replace Divs In Empty String", function(assert) {
    let analyzer = new EmailAnalyzer();
    let divlessHtmlStr = analyzer.replaceDivs("");

    assert.ok(divlessHtmlStr === "", "Passed!");
});

QUnit.test("Replace Divs In String w/o Divs", function(assert) {
    let analyzer = new EmailAnalyzer();
    let inputStr = "This is a test string";
    let divlessHtmlStr = analyzer.replaceDivs(inputStr);

    assert.ok(divlessHtmlStr === inputStr, "Passed!");
});

QUnit.test("Replace Divs In String w/ Line Breaks", function(assert) {
    let analyzer = new EmailAnalyzer();
    let inputStr = "<div>This is a test<br>string</div>";
    let divlessHtmlStr = analyzer.replaceDivs(inputStr);
    assert.ok(divlessHtmlStr === "<span><br>This is a test<br>string</span>", "Passed!");
});

QUnit.test("Replace Divs In String w/ Line Breaks and Exclamation Point", function(assert) {
    let analyzer = new EmailAnalyzer();
    let inputStr = "<div>This is a test<br>string!  This is a second sentence!</div>";
    let divlessHtmlStr = analyzer.replaceDivs(inputStr);
    console.log(divlessHtmlStr);

    assert.ok(divlessHtmlStr === "<span><br>This is a test<br>string!</span><span>  This is a second sentence!</span>", "Passed!");
});

QUnit.test("Replace Divs In String w/ Line Breaks and Question Mark", function(assert) {
    let analyzer = new EmailAnalyzer();
    let inputStr = "<div>This is a test<br>string?  This is a second sentence?</div>";
    let divlessHtmlStr = analyzer.replaceDivs(inputStr);
    console.log(divlessHtmlStr);

    assert.ok(divlessHtmlStr === "<span><br>This is a test<br>string?</span><span>  This is a second sentence?</span>", "Passed!");
});

QUnit.test("Replace Divs In String w/ Line Breaks and Period", function(assert) {
    let analyzer = new EmailAnalyzer();
    let inputStr = "<div>This is a test<br>string.  This is a second sentence.</div>";
    let divlessHtmlStr = analyzer.replaceDivs(inputStr);
    console.log("period:");
    console.log(divlessHtmlStr);

    assert.ok(divlessHtmlStr === "<span><br>This is a test<br>string.</span><span>  This is a second sentence.</span>", "Passed!");
});
