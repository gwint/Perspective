COLOR_CODE = {
    "anger": "red",
    "sadness": "blue",
    "fear": "grey",
    "joy": "yellow",
    "analytical": "yellow",
    "confident": "yellow",
    "tentative": "yellow",
    "": "purple"
};

function removeSpanTags(aStr) {
    if(aStr == null) {
        return null;
    }
    if(aStr.length == 0) {
        return "";
    }
    strNoSpanTags = "";
    let i = 0;
    while(i < aStr.length) {
        if(aStr[i] === "<") {
            while(aStr[i] !== ">")
                i++;
        }
        else {
            strNoSpanTags = strNoSpanTags + aStr[i];
        }
        i++;
    }
    return strNoSpanTags;
}

function getResponse(response) {
    //alert("response status: " + response.status);
    //alert(JSON.stringify(response.text));
    if(response.status >= 200 && response.status < 300) {
        //alert("valid response");
        //alert(response);
        return Promise.resolve(response);
    }
    else {
        //alert("Invalid response: " + JSON.stringify(response));
        return Promise.reject(new Error(response.statusText));
    }
}

function getJson(response) {
    return response.json();
}

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
function getColoredText(text, toneData) {
    console.log(toneData);
    if(!('sentences_tone' in toneData)) {
        dominantToneIndex = getDominantTone(toneData['document_tone']['tones']);
        dominantTone = toneData['document_tone']['tones'][dominantToneIndex]['tone_id'];
        textColor = COLOR_CODE[dominantTone];
        coloredText = `<span style="background-color:${textColor};">` +
                      text + '</span>' + '\uFEFF';
        return coloredText;
    }

    console.log(toneData);
    colorCodedText = "";
    toneData['sentences_tone'].forEach(
        function(sentenceToneData) {
            dominantToneIndex = getDominantTone(sentenceToneData['tones']);
            sentenceText = sentenceToneData['text'];
            dominantTone = sentenceToneData['tones'][dominantToneIndex]['tone_id'];
            console.log(dominantTone);
            textColor = COLOR_CODE[dominantTone];
            coloredSentence = `<span style="background-color:${textColor};">` +
                              sentenceText + '</span>' +
                              '\xa0' + '\xa0' + '\uFEFF';
            colorCodedText = colorCodedText.concat(coloredSentence);
        }
    );

    return colorCodedText;
}

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
    text = info.emailText;

    cleanedEmailText = removeSpanTags(text.replace(/[\uFEFF]/g, ""));

    // Make API call and deal with response
    let textObj = { text: cleanedEmailText };
    let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
    //alert(toneApi);

    let tokenApi = "https://ef108mo7w9.execute-api.us-east-1.amazonaws.com/Prod";

    fetch(tokenApi)
    .then(getResponse)
    .then(getToken)
    .then(function(accessToken) {
        let noQuotesToken = accessToken.substring(1, accessToken.length-1);

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
            console.log("Request succeeded with JSON response", jsonData);
            analyzedText = getColoredText(cleanedEmailText, jsonData);

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

/*
    fetch(toneApi, {
        "body": JSON.stringify(textObj),
        "headers": {
            "Authorization": "Bearer ".concat(accessToken),
            "Content-Type": "application/json"
        },
        "method": "POST"
    })
    .then(getResponse)
    .then(getJson)
    .then(function(jsonData) {
        console.log("Request succeeded with JSON response", jsonData);
        analyzedText = getColoredText(cleanedEmailText, jsonData);
        alert(analyzedText);

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
        console.log("Request failed", error);
    });
*/

    // Chrome Browser does not allow cursor to be placed outside of most
    // recently written to child node, so a 0-width character is used so
    // uncolored text can be written following the block of colored text
    // sent from the popup.

    analyzedText = '<span style="background-color:yellow;">' +
                   cleanedEmailText +
                   '</span>' +
                   '\uFEFF';

    //console.log(analyzedText);

    //chrome.tabs.query(
    //    { active: true, currentWindow: true },
    //    function(tabs) {
    //        chrome.tabs.sendMessage(
    //            tabs[0].id,
    //            {from: 'popup', subject: 'EmailBodyUpdate', coloredText: analyzedText},
    //            // ...also specifying a callback to be called
    //            //    from the receiving end (content script)
    //            null
    //        );
    //    }
    //);

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
        //while(1) {
        // ...and send a request for the DOM info...
        //  console.log("message sent from popup to content script");
        //  chrome.tabs.sendMessage(
        //      tabs[0].id,
        //      {from: 'popup', subject: 'DOMInfo'},
            // ...also specifying a callback to be called
            //    from the receiving end (content script)
        //      setDOMInfo);
        //  await sleep(7000);
        //}
    });
});
