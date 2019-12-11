class APIBasedAnalysisScheme {
    constructor() {
        this.APIURL = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
        this.tokenAPIURL = "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod";
    }

    getToken() {
    }

    analyze(sentences) {
        // Access IBM Watson tone analyzer api and get tone analysis
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
    function replaceDivs(htmlStr) {
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
    function getResponseBody(response) {
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
    function getJsonPayload(responseBody) {
        return responseBody.json();
    }

    /**
     * Returns a Promise containing the string form of the body of an http response.
     *
     * @param  Promise responseBody A promise containing the body of an http response.
     * @return Promise A Promise that can be used to retrieve the body of a http
     *                 response as a string.
     */
    function getAuthenticationToken(responseBody) {
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
    function getStructuredSentences(aStr) {
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
     function getDominantTone(toneScores) {
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
}
