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
        .catch(function(error) {
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
     * Returns version of an html string where all opening div tags have been
     * replaced with a span tag immediately followed by a line break tag and
     * closing div tags have been replaced with closing span tag.
     *
     * @param string htmlStr An html string.
     * @return string htmlStr, but with all occurrences of opening div tags
     *                replaced with opening span tags immediately followed by
     *                line break tags and all closing div tags are replaced by
     *                closing span tags.
     */
    replaceDivs(htmlStr) {
        // Handle first line which lacks surrounding div tags
        let pieceToTransform = htmlStr;
        let nonTransformedPiece = "";
        let secondLineStart = htmlStr.indexOf("<div>");
        if(secondLineStart > 0) {
            for(let i = 0; i < secondLineStart; i++) {
                nonTransformedPiece = nonTransformedPiece.concat(htmlStr.charAt(i));
            }
            pieceToTransform = htmlStr.substring(secondLineStart);
        }

        // Handle other lines which are enclosed in div tags
        return nonTransformedPiece +
           pieceToTransform.replace(/<div\><br\><\/div\>/g, '<span><br></span>')
                           .replace(/(<div\>)/g, '<span><br>')
                           .replace(/(<\/div\>)/g, '</span>')
                           .replace(/(!)/g, '!</span><span>')
                           .replace(/(\?)/g, '?</span><span>')
                           .replace(/(\.)/g, '.</span><span>')
                           .replace(/<span\><\/span\>/g, '');
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

    /**
     * Split a string containing html markup into individual sentences where
     * sentences contain the html tags within which they are nested.  Self-closing
     * tags are tacked onto the sentences that immediately precede them.
     *
     * @param string aStr A html string.
     * @return array[String] An array of strings representing the sentences
     *                       contained in the input html string with containing
     *                       html tags, if any.  Self-closing html tags are
     *                       attached to the preceding sentence if there is one.
     */
    getStructuredSentences(aStr) {
        return aStr.match(/([<\>=\/, \"':;a-zA-Z&\-]+)([.?!](((<\/)([a-zA-Z]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
    }

    /**
     * Return index of tone with highest score from an array of tone scores.
     *
     * @param object[] toneScores An array of tone score objects containing
     *                            information about each tone including score,
     *                            id, and human-readable name.
     * @return integer An integer representing the index of the tone with the
     *                 highest score out of all tones contained in toneScores.
     */
     getDominantTone(toneScores) {
        if(toneScores.length == 0) {
            return "";
        }

        dominantToneIndex = 0;
        dominantToneScore = toneScores[0]['score'];

        for(let i = 1; i < toneScores.length; i++) {
            if(toneScores[i]['score'] > dominantToneScore) {
                dominantToneScore = toneScores[i]['score'];
                dominantToneIndex = i;
            }
        }

        return dominantToneIndex;
    }

    /**
     *   Returns color-coded version of text where the color is dependant on the
     *   tone of each sentence.
     *
     *   @param string[] setences
     *   @param object toneData An object containing the tone analysis of the text
     *                          of the email's body.
     *   @return string An html string representing the text of the body of the
     *                  email with highlighting applied on a per-sentence basis
     *                  based on the tone of each sentence.
     */
    getColoredText(sentences, toneData) {
        console.log(toneData);
        // Chrome Browser does not allow cursor to be placed outside of most
        // recently written to child node, so a 0-width character is used so
        // uncolored text can be written following the block of colored text
        // sent from the popup.

        if(!('sentences_tone' in toneData)) {
            let dominantToneIndex = getDominantTone(toneData['document_tone']['tones']);
            let dominantTone = toneData['document_tone']['tones'][dominantToneIndex]['tone_id'];
            let textColor = COLOR_CODE[dominantTone];
            let noteText = TONE_NOTES[dominantTone];
            let coloredSentence = `<span class="analyzedText" style="background-color:${textColor};">` +
                              sentences.join("") + '</span>' +
                              `<span class="toneNote">${noteText}</span>` + '\uFEFF';
            console.log("Single Case HTML string: " + coloredSentence);
            return coloredSentence;
        }

        colorCodedText = "";
        let i = 0;
        for (; i < sentences.length && i < toneData['sentences_tone'].length; i++) {
            console.log("Sentence: " + sentences[i]);
            let sentenceToneData = toneData['sentences_tone'][i];
            let sentenceText = sentences[i];

            let coloredSentence = sentenceText + '\uFEFF';
            if (sentenceToneData['tones'].length > 0) {
                let dominantToneIndex = getDominantTone(sentenceToneData['tones']);
                let dominantTone = sentenceToneData['tones'][dominantToneIndex]['tone_id'];
                let textColor = COLOR_CODE[dominantTone];
                let noteText = TONE_NOTES[dominantTone];
                coloredSentence = `<span class="analyzedText" style="background-color:${textColor};">` +
                              sentenceText + '</span>' +
                              `<span class="toneNote">${noteText}</span>` + '\uFEFF';
            }

            colorCodedText = colorCodedText.concat(coloredSentence);
        }
        console.log(colorCodedText);

        return colorCodedText;
    }
}
