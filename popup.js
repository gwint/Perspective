COLOR_CODE = {
    "anger": "red",
    "joy": "yellow",
    "confident": "blue",
    "tentative": "grey",
    "sad": "brown",
    "analytical": "YellowGreen"
};

TONE_NOTES = {
    "anger": "You sound a bit angry here",
    "joy": "Someone's happy",
    "confident": "Yesssssss!, point, blank, periodt!",
    "tentative": "Speak up a bit",
    "sad": "Sounding a bit down there",
    "analytical": "Way to think it through!"
};

/**
 * Breaks string representing email body text into sentences where each
 * sentence contains any markup providing structure to that part of the email.
 *
 * @param string emailBodyHtml A string containing the html representing the
 *                             body of an email.
 * @return string[] An array of string representing the sentences comprising
 *                  the body of an email (the html providing the email's
 *                  structure is included with the appropiate sentence)
 */
function extractIndividualSentences(emailBodyHtml) {
    console.log(emailBodyHtml);
    return emailBodyHtml.match(/([a-zA-Z]+)([.?!])/g);
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
function getColoredText(sentences, toneData) {
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

/**
 * Split a string containing html markup into individual sentences where
 * sentences contain the html tags within which they are nested.  Self-closing
 * tags are tacked onto the sentences that immediately precede them.
 *
 * @param string aStr A html string.
 * @return array[String] An array of strings representing the sentences
 *                       contained in the input html string with containing
                         html tags, if any.  Self-closing html tags are
 *                       attached to the preceding sentence if there is one.
 */
function getStructuredSentences(aStr) {
    return aStr.match(/([<\>=\/, \"':;a-zA-Z&\-]+)([.?!](((<\/)([a-zA-Z]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
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
function analyzeEmailText(info) {
    console.log(info.textWithoutMarkup);

    let text = info.textWithoutMarkup;
    console.log("Original Email Text (No Markup): " + text);
    let structuredText = info.textWithMarkup.replace(/([\uFEFF])|(<)(\/)*(span)([ a-zA-Z;\-:=\"]*)(\>)/g, "");
    console.log("Original Email Text (With Markup): " + structuredText);
    let cleanedEmailText = text.replace(/[\uFEFF]/g, "").replace(/\n/g, " ");
    console.log("Email Text Passed to Analyzer: " + cleanedEmailText);

    let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
    let textObj = { text: cleanedEmailText };

    chrome.storage.sync.get(['savedToken'], function(tokenObject) {
        console.log("Token Used: " + tokenObject.savedToken);
        chrome.storage.sync.set({"originalHtml": info.textWithMarkup}, function(result) {
            console.log("Now saving: " + info.textWithMarkup);
            fetch(toneApi, {
                "body": JSON.stringify(textObj),
                "headers": {
                    "Authorization": "Bearer ".concat(tokenObject.savedToken),
                    "Content-Type": "application/json"
                },
                "method": "POST"
            })
            .then(getResponseBody)
            .then(getJsonPayload)
            .then(function(jsonData) {
                console.log("Tone Analysis Data: " + jsonData);
                console.log("Structured text: " + structuredText);
                let textWithoutDivs = replaceDivs(structuredText);
                console.log("Text without divs: " + textWithoutDivs);
                let structuredSentences = getStructuredSentences(textWithoutDivs);
                console.log("Structured sentences: " + structuredSentences);
                let analyzedText = getColoredText(structuredSentences, jsonData).replace(/<span\><\/span\>/g, '');

                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function(tabs) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {from: 'popup', subject: 'EmailBodyUpdate', coloredText: analyzedText},
                            null
                        );
                    }
                );
            })
            .catch(function(error) {
                console.log("Unable to analyze text", error);
                // Get a new token, save it, and call tone analyzer api again
                let tokenApi = "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod";

                fetch(tokenApi)
                .then(getResponseBody)
                .then(getAuthenticationToken)
                .then(function(accessToken) {
                    let noQuotesToken = accessToken.substring(1, accessToken.length-1);

                    // Save token
                    chrome.storage.sync.set({"savedToken": noQuotesToken}, function(backupTokenObject) {
                        fetch(toneApi, {
                            "body": JSON.stringify(textObj),
                            "headers": {
                                "Authorization": "Bearer ".concat(noQuotesToken),
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

                            chrome.tabs.query(
                                { active: true, currentWindow: true },
                                function(tabs) {
                                    chrome.tabs.sendMessage(
                                        tabs[0].id,
                                        {from: 'popup', subject: 'EmailBodyUpdate', coloredText: analyzedText},
                                        null
                                    );
                                }
                            );
                        });
                    })
                })
                .catch(function(error) {
                    console.log("Unable to get token", error);
                });
            });
        });
    });
}

/**
 * Sends a "DOMInfo" message to the content script so that the email text
 * can be analyzed and highlighted according to the tone of each sentence.
 *
 * @return None.
 */
function getEmailTextAndAnalyze() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'analyzeTone'},
            analyzeEmailText
        );
    })
}

window.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function (tabs) {
        // Send message to background script when popup icon gets clicked
        chrome.tabs.query({
            active: true,
            currentWindow: true
        },
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'attachCleaningHandler'},
                null
            );
        });

        document.getElementById("getTone").onclick = getEmailTextAndAnalyze;
    });
});
