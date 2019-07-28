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
    alert("here");
    colorCodedText = "";
    toneData['sentences_tone'].forEach(
        function(sentenceToneData) {
            dominantToneIndex = getDominantTone(sentenceToneData['tones']);
            sentenceText = sentenceToneData['text'];
            dominantTone = sentenceToneData['tones'][dominantToneIndex]['tone_id'];
            console.log(dominantTone);
            textColor = COLOR_CODE[dominantTone];
            coloredSentence = `<span style="background-color:${textColor};">` +
                            sentenceText + '</span>' + '\uFEFF';
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
    let accessToken = "eyJraWQiOiIyMDE5MDUxMyIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLWExMTdhZjZjLTlhNjUtNDNkZi1hMmExLTc4MmM5MTYzY2NmOSIsImlkIjoiaWFtLVNlcnZpY2VJZC1hMTE3YWY2Yy05YTY1LTQzZGYtYTJhMS03ODJjOTE2M2NjZjkiLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC1hMTE3YWY2Yy05YTY1LTQzZGYtYTJhMS03ODJjOTE2M2NjZjkiLCJzdWIiOiJTZXJ2aWNlSWQtYTExN2FmNmMtOWE2NS00M2RmLWEyYTEtNzgyYzkxNjNjY2Y5Iiwic3ViX3R5cGUiOiJTZXJ2aWNlSWQiLCJ1bmlxdWVfaW5zdGFuY2VfY3JucyI6WyJjcm46djE6Ymx1ZW1peDpwdWJsaWM6dG9uZS1hbmFseXplcjp1cy1zb3V0aDphLzkxOTE4ZDQ4NTczNTQ1NmNiY2FlZDE0OWZiZjA0YmM0OmYyMTFjZDE1LTcwN2ItNGIxNS1iZmQ0LWI0NGYzNjY5ZDJkYTo6Il0sImFjY291bnQiOnsidmFsaWQiOnRydWUsImJzcyI6IjkxOTE4ZDQ4NTczNTQ1NmNiY2FlZDE0OWZiZjA0YmM0In0sImlhdCI6MTU2NDI5NDI3OCwiZXhwIjoxNTY0Mjk3ODc4LCJpc3MiOiJodHRwczovL2lhbS5jbG91ZC5pYm0uY29tL2lkZW50aXR5IiwiZ3JhbnRfdHlwZSI6InVybjppYm06cGFyYW1zOm9hdXRoOmdyYW50LXR5cGU6YXBpa2V5Iiwic2NvcGUiOiJpYm0gb3BlbmlkIiwiY2xpZW50X2lkIjoiZGVmYXVsdCIsImFjciI6MSwiYW1yIjpbInB3ZCJdfQ.StHSzwcWqSxI6WU-qDywW6nitRZqihFYaQV-YluOyOleuWZ3udSrQBC2-au78GNGTZsH6qveLc7L44zd4Ni-fWgIF9sTu4Ab1EYkdmRgfNhbBruFf4uz5PJdRgoHvWWTFpE1RtSzIcPtMwMRQypZU266UyRuZkTMCcrx35mwd_dhUORPwmV7lPIdcw6OLxPvl5VUk4cLtk5Z8zT5G81hGrmQJZ4SNZmntKT-ZS1NlyJm6bmxQy9l9e_dIosBv80K_xm-ScadAJQBH2yZg9r1KKfJcLphG7w5tk1t-aE1k5nlm38xYHuJGLTbj8sFmscGzJbepy90gQpywQYlTVq1gw";
    let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
    //alert(toneApi);

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
