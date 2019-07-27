COLOR_CODE = {
    "anger": "red",
    "sadness": "blue",
    "fear": "grey",
    "joy": "yellow",
    "analytical": "",
    "confident": "",
    "tentative": ""
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
    alert("response status: " + response.status);
    if(response.status >= 200 && response.status < 300) {
        alert("valid response");
        alert(response);
        return Promise.resolve(response);
    }
    else {
        alert("Invalid response: " + JSON.stringify(response));
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
function colorCodeText(text, toneData) {
    
}

function getDominantTone(toneScores) {
    if(toneScores.length == 0) {
        return null;
    }

    dominantTone = toneScores[0]['tone_name'];
    dominantToneScore = toneScores[0]['score'];

    for(let i = 1; i < toneScores.length; i++) {
        if(toneScores[i]['score'] > dominantToneScore) {
            dominantToneScore = toneScores[i]['score'];
            dominantTone = toneScores[i]['tone_name'];
        }
    }

    return dominantTone;
}


// Update the relevant fields with the new data
function setDOMInfo(info) {
    console.log(info.emailText);
    text = info.emailText;

    cleanedEmailText = removeSpanTags(text.replace(/[\uFEFF]/g, ""));

    // Make API call and deal with response
    let textObj = { text: cleanedEmailText };
    let accessToken = "eyJraWQiOiIyMDE5MDUxMyIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLWExMTdhZjZjLTlhNjUtNDNkZi1hMmExLTc4MmM5MTYzY2NmOSIsImlkIjoiaWFtLVNlcnZpY2VJZC1hMTE3YWY2Yy05YTY1LTQzZGYtYTJhMS03ODJjOTE2M2NjZjkiLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC1hMTE3YWY2Yy05YTY1LTQzZGYtYTJhMS03ODJjOTE2M2NjZjkiLCJzdWIiOiJTZXJ2aWNlSWQtYTExN2FmNmMtOWE2NS00M2RmLWEyYTEtNzgyYzkxNjNjY2Y5Iiwic3ViX3R5cGUiOiJTZXJ2aWNlSWQiLCJ1bmlxdWVfaW5zdGFuY2VfY3JucyI6WyJjcm46djE6Ymx1ZW1peDpwdWJsaWM6dG9uZS1hbmFseXplcjp1cy1zb3V0aDphLzkxOTE4ZDQ4NTczNTQ1NmNiY2FlZDE0OWZiZjA0YmM0OmYyMTFjZDE1LTcwN2ItNGIxNS1iZmQ0LWI0NGYzNjY5ZDJkYTo6Il0sImFjY291bnQiOnsidmFsaWQiOnRydWUsImJzcyI6IjkxOTE4ZDQ4NTczNTQ1NmNiY2FlZDE0OWZiZjA0YmM0In0sImlhdCI6MTU2NDI0NjgwOCwiZXhwIjoxNTY0MjUwNDA4LCJpc3MiOiJodHRwczovL2lhbS5jbG91ZC5pYm0uY29tL2lkZW50aXR5IiwiZ3JhbnRfdHlwZSI6InVybjppYm06cGFyYW1zOm9hdXRoOmdyYW50LXR5cGU6YXBpa2V5Iiwic2NvcGUiOiJpYm0gb3BlbmlkIiwiY2xpZW50X2lkIjoiZGVmYXVsdCIsImFjciI6MSwiYW1yIjpbInB3ZCJdfQ.AmHrtAPf_J0RiFnNPwAxN1IYHL2Yo6SmktvR4G6mIzT_svqwMn9QHEjaUekid3UvXMIeWk9dJI3l2G7RdH8ltBuMUwy63dSKKuJrWet8ENZ9w3XL2tP7LcGmNeJPKSJocuO3Is4dtzHMKWVi8pn_M8HCcHAlKoiyqY8ALdDOVAnpXEYpXILZP0lengXQJDa4Uiq4rWyN-s9E0DApFOU4pYsA01-wUotCnEKn0Kh5vj7idIf56Oi9VAFnk8dYVRjsmt9QJu9KB4pr3gKITbNcGza67XkBMM-9tZbKunlHzJe10ODAzL9vtssvfqFxIpREDOr8A5HLjA5iBbp0g-YC8Q";
    let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21";
    alert(toneApi);

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
    .then(function(data) {
        console.log("Request succeeded with JSON response", data);
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
    console.log(analyzedText);

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
