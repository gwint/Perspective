class APIBasedAnalysisScheme {
    constructor() {
        this.APIURL = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
        this.tokenAPIURL = "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod";
        this.timeoutTime = new Date();
        this.ttl = 5;
        APIBasedAnalysisScheme.token = "";
        APIBasedAnalysisScheme.analyzedText = "";
    }

    async getToken() {
        if(Date.now() < this.timeoutTime) {
            return APIBasedAnalysisScheme.token;
        }
        else {
            let tokenPromise =
            fetch(this.tokenAPIURL)
            .then(this.getResponseBody)
            .then(this.getAuthenticationToken)
            .then(function(accessToken) {
                let noQuotesToken = accessToken.substring(1, accessToken.length-1);
                APIBasedAnalysisScheme.token = noQuotesToken;
            });
            await tokenPromise;
            this.timeoutTime = Date.now() + this.ttl;

            return APIBasedAnalysisScheme.token;
        }
    }

    /**
     * Use IBM Watson Tone Analyzer API to analyze text from email body, highlight
     * each sentence based on its tone, and then send this highlighted html string
     * to the content script so that the email body can be updated.
     *
     * @param object info An object containing both innerText and innerHTML of
     *                    email body text area.
     * @return None.
     */
    async analyze(sentences) {
        // Access IBM Watson tone analyzer api and get tone analysis
        await this.getToken();
        fetch(this.APIURL, {
            "body": JSON.stringify(textObj),
            "headers": {
                "Authorization": "Bearer ".concat(APIBasedAnalysisScheme.token),
                "Content-Type": "application/json"
            },
            "method": "POST"
        })
        .then(getResponseBody)
        .then(getJsonPayload)
        .then(function(jsonData) {
            let textWithoutDivs = replaceDivs(structuredText);
            console.log("Text without divs: " + textWithoutDivs);
            let structuredSentences = getStructuredSentences(textWithoutDivs);
            console.log("Structured sentences: " + structuredSentences);
            let analyzedText = getColoredText(structuredSentences, jsonData).replace(/<span\><\/span\>/g, '');

            APIBasedAnalysisScheme.analyzedText = analyzedText;
        })
        .catch(async function(error) {
            console.log("Unable to analyze text", error);
            await this.getToken();

            fetch(this.APIURL, {
                "body": JSON.stringify(textObj),
                "headers": {
                    "Authorization": "Bearer ".concat(APIBasedAnalysisScheme.token),
                    "Content-Type": "application/json"
                },
                "method": "POST"
            })
            .then(getResponseBody)
            .then(getJsonPayload)
            .then(function(jsonData) {
                console.log("Structured text: " + structuredText);
                let textWithoutDivs = replaceDivs(structuredText);
                console.log("Text without divs: " + textWithoutDivs);
                let structuredSentences = textWithoutDivs.match(/([<\>=\/, \":;a-zA-Z&]+)([.?!](((<\/)([a-zA-Z]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
                console.log("Structured sentences: " + structuredSentences);
                let analyzedText = getColoredText(structuredSentences, jsonData).replace(/<span\><\/span\>/g, '');

                APIBasedAnalysisScheme.analyzedText = analyzedText;
            });
        });
    }

    /**
     * Returns a promise that contains the body of an http response.
     *
     * @param Promise response A promise controlling how an http response body
     *                         will be handled.
     * @return Promise A Promise that is either resolved or rejected depending on
     *                 the http response code.
     */
    getResponseBody(response) {
        if(response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
        }
        else {
            return Promise.reject(new Error(response.statusText));
        }
    }

    /**
     * Returns a Promise containing the JSON body of an http response.
     *
     * @param Promise responseBody A promise containing the body of an http response.
     * @return Promise A Promise that can be used to retrieve the JSON object
     *                 of a http response body.
     */
    getJsonPayload(responseBody) {
        return responseBody.json();
    }

    /**
     * Returns a Promise containing the string form of the body of an http response.
     *
     * @param  Promise responseBody A promise containing the body of an http response.
     * @return Promise A Promise that can be used to retrieve the body of a http
     *                 response as a string.
     */
    getAuthenticationToken(responseBody) {
        return responseBody.text();
    }
}
