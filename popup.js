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
 */
function extractIndividualSentences(emailBodyHtml) {
    console.log(emailBodyHtml);
    return emailBodyHtml.match(/([a-zA-Z]+)([.?!])/g);
}

/**
 */
function getResponse(response) {
    if(response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    else {
        return Promise.reject(new Error(response.statusText));
    }
}

/**
 */
function getJson(response) {
    return response.json();
}

/**
 */
function getToken(response) {
    return response.text();
}

/*
    Returns color-coded version of text where the color is dependant on the
    tone of each sentence.

    @param {string} text
    @parm {object} toneData

    @return string
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
 */
function replaceDivs(htmlStr) {
    return htmlStr.replace(/<div\><br\><\/div\>/g, '<span><br></span>')
                  .replace(/(<div\>)/g, '<span><br>')
                  .replace(/(<\/div\>)/g, '</span>');
                  //.replace(/<span\><br\><\/span\>/g, '<span><br><br></span>');
}

/**
 */
function removeHighlighting(info) {
    console.log(info);
    // Line breaks go from <p></p> to <div><br></div>
    let htmlStr = info.formattedText;
//    let htmlStrWithOriginalLineBreaks = htmlStr.replace(/(<p\><\/p\>)/g, '<div><br></div>');
    let htmlStrWithOriginalLineBreaks = htmlStr.replace(/(<span\><br\><\/span\>)/g, '<div><br></div>');
    console.log("With original line breaks: " + htmlStrWithOriginalLineBreaks);
    // Remove tone notes
    let htmlStrWithoutToneNotes = htmlStrWithOriginalLineBreaks.replace(
/((<span class=\"toneNote\"([a-zA-Z\" ;=\-\(\),:0-9])*\>)([a-zA-Z\' !\"\(\)]+)(<\/span\>))/g, "");
    console.log("Without tone notes: " + htmlStrWithoutToneNotes);
    // spans go back to being divs
    let htmlStrWithoutSpans = htmlStrWithoutToneNotes.replace(/(<span\><br\>)/g, '<div>')
                                                     .replace(/(<\/span\>)/g, '</div>');
    console.log("With div tags instead of spans: " + htmlStrWithoutSpans);
    let htmlStrWithoutWrapperOpening = htmlStrWithoutSpans.replace(/((<span class=\"analyzedText\")([ a-zA-Z0-9;,\":\-=]+)(\>))/g, "");
    console.log("Without opening of span wrappers: " + htmlStrWithoutWrapperOpening);
    // Remove classes and styles
    let tokens = htmlStrWithoutWrapperOpening.match(/(((<)|(<\/))([a-zA-Z]+)(\>))|([a-zA-Z0-9&;,:\-=!?.\" ]+)/g);
    console.log("Tokens: " + tokens);
    let stack = [];
    let validTokens = [];
    let isTag = function(possibleTag) {
        console.log("Possible Tag: " + possibleTag);

        return possibleTag.length > 1 &&
               info.rawText.indexOf(possibleTag) === -1 &&
               possibleTag[0] === '<' &&
               possibleTag[possibleTag.length-1] == '>';
    };
    let getTagText = function(tag) {
        let start = 1;
        if(tag[1] === '/') {
            start = 2;
        }
        return tag.substring(start, tag.length-2);
    };
    tokens.forEach(function(token) {
        if(token === '<br>') {
            validTokens.push(token);
        }
        else if(isTag(token)) {
            console.log("Tag Found: " + token);
            if(token[1] === '/') {
                console.log("Closing Tag Found: " + token);
                // Check for corresponding opening tag on top of stack
                // If opening tag is there, then closing tag goes to valid
                //      token list
                if(stack.length > 0) {
                    let mostNestedOpener = stack.pop();
                    console.log(`Comparing ${getTagText(token)} and ${getTagText(mostNestedOpener)}`);
                    if(getTagText(token) === getTagText(mostNestedOpener)) {
                        validTokens.push(token);
                    }
                }
                else {
                    console.log("Tag Unmatched and Ignored");
                }
            }
            else {
                validTokens.push(token);
                stack.push(token);
            }
        }
        else {
            validTokens.push(token);
        }
    });

    console.log("Valid Tokens: " + validTokens);
    let cleanedHTMLString = validTokens.join("");

    chrome.tabs.query(
        { active: true, currentWindow: true },
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'EmailBodyUpdate', coloredText: validTokens.join("")},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                null
            );
        }
    );
}

/**
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


// Update the relevant fields with the new data
function setDOMInfo(info) {
    console.log(info.emailText);

    let text = info.emailText;
    let structuredText = info.formattedText.replace(/([\uFEFF])|(<)(\/)*(span)([ a-zA-Z;\-:=\"]*)(\>)/g, "");
    let cleanedEmailText = text.replace(/[\uFEFF]/g, "").replace(/\n/g, " ");
    console.log("Email Text Passed to Analyzer: " + cleanedEmailText);

    let tokenApi = "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod";

    fetch(tokenApi)
    .then(getResponse)
    .then(getToken)
    .then(function(accessToken) {
        let noQuotesToken = accessToken.substring(1, accessToken.length-1);
        let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
        let textObj = { text: cleanedEmailText };

        fetch(toneApi, {
            "body": JSON.stringify(textObj),
            "headers": {
                "Authorization": "Bearer ".concat(noQuotesToken),
                "Content-Type": "application/json"
            },
            "method": "POST"
        })
        .then(getResponse)
        .then(getJson)
        .then(function(jsonData) {
            console.log("Structured text: " + structuredText);
            let textWithoutDivs = replaceDivs(structuredText);
            console.log("Text without divs: " + textWithoutDivs);
            let structuredSentences = textWithoutDivs.match(/([<\>=\/, \":;a-zA-Z&]+)([.?!](((<\/)([a-zA-Z]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
            console.log("Structured sentences: " + structuredSentences);
            let analyzedText = getColoredText(structuredSentences, jsonData);

            chrome.tabs.query(
                { active: true, currentWindow: true },
                function(tabs) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {from: 'popup', subject: 'EmailBodyUpdate', coloredText: analyzedText},
                        // ...also specifying a callback to be called
                        //    from the receiving end (content script)
                        null
                    );
                }
            );
        })
        .catch(function(error) {
            console.log("Unable to analyze text", error);
        });
    })
    .catch(function(error) {
        console.log("Unable to get token", error);
    });
}

function getEmailTextAndClean() {
  console.log("message sent from popup to content script");
  chrome.tabs.query({
      active: true,
      currentWindow: true
    },
    function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { from: 'popup', subject: 'cleanText' },
        // ...also specifying a callback to be called
        //    from the receiving end (content script)
        removeHighlighting
      );
    }
  )
}

function getEmailTextAndAnalyze() {
  console.log("message sent from popup to content script");
  chrome.tabs.query({
      active: true,
      currentWindow: true
    },
    function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called
        //    from the receiving end (content script)
        setDOMInfo
      );
    }
  )
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function (tabs) {
        document.getElementById("getTone").onclick = getEmailTextAndAnalyze;
        document.getElementById("stripHighlighting").onclick = getEmailTextAndClean;
    });
});
