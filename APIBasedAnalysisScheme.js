const API_URLS = {
    toneAPI: "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21",
    tokenAPI: "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod"
};

const TTL = 5;

let token = {
    token: undefined,
    timeoutTime: undefined
};

async function getToken(currentToken) {
    if(Date.now() < currentToken.timeoutTime) {
        return currentToken;
    }

    let tokenPromise =
    fetch(this.tokenAPIURL)
    .then(this.getResponseBody)
    .then(body => body.text())
    .then(function(accessToken) {
        return {
            token: accessToken.substring(1, accessToken.length-1),
            timeoutTime: new Date() + TTL
        };
    });

    return await tokenPromise.then();
}

async function getToneInfo(sentences) {
    let textObj = {text: sentences};
    token = await this.getToken(token);
    return fetch(this.APIURL, {
        "body": JSON.stringify(textObj),
        "headers": {
            "Authorization": "Bearer ".concat(token),
            "Content-Type": "application/json"
        },
        "method": "POST"
    })
    .then(this.getResponseBody)
    .then(body => body.json())
    .then(async function(jsonData) {
        console.log("tone: ");
        console.log(jsonData);
        APIBasedAnalysisScheme.toneInfo = jsonData;
    })
    .catch(async function(error) {
        console.log("Unable to analyze text", error);
        await this.getToken();

        return fetch(this.APIURL, {
            "body": JSON.stringify(textObj),
            "headers": {
                "Authorization": "Bearer ".concat(token),
                "Content-Type": "application/json"
            },
            "method": "POST"
        })
        .then(this.getResponseBody)
        .then(body => body.json())
        .then(function(jsonData) {
            console.log("tone: ");
            console.log(jsonData);
            APIBasedAnalysisScheme.toneInfo = jsonData;
        });
    });
}

getResponseBody(response) {
    if(response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    else {
        return Promise.reject(new Error(response.statusText));
    }
}

