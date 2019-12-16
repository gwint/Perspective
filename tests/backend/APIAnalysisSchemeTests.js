QUnit.test("Get First Token", async function(assert) {
    let apiScheme = new APIBasedAnalysisScheme();
    let retrievedToken = await apiScheme.getToken();

    assert.ok(APIBasedAnalysisScheme.token.length > 0, "Passed!");
});

QUnit.test("Get All Tokens After First (No Timeout)", async function(assert) {
    let apiScheme = new APIBasedAnalysisScheme();

    await apiScheme.getToken();
    let firstToken = APIBasedAnalysisScheme.token;
    await apiScheme.getToken();
    let secondToken = APIBasedAnalysisScheme.token;

    assert.ok(firstToken === secondToken, "Passed!");
});

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

QUnit.test("Get New Token After Timeout", async function(assert) {
    let apiScheme = new APIBasedAnalysisScheme();

    await apiScheme.getToken();
    let firstToken = APIBasedAnalysisScheme.token;

    await sleep(10000);

    await apiScheme.getToken();
    let secondToken = APIBasedAnalysisScheme.token;

    console.log("first: " + firstToken);
    console.log("second: " + secondToken);

    assert.ok(firstToken.length > 0 && secondToken.length > 0 && firstToken !== secondToken, "Passed!");
});


