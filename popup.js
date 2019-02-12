// Update the relevant fields with the new data
function setDOMInfo(info) {
  console.log(info.emailText);
  text = info.emailText;

  let removeSpanTags = function(aStr) {
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
  };

  cleanedEmailText = removeSpanTags(text.replace(/[\uFEFF]/g, ""));

  // Make API call and deal with response
  let textObj = { text: cleanedEmailText };
  let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-27-09-21";
  let apiKey = "t6dFCXw5GdOrTrCS8sM7iTaED0GCJmS93ksh-6VLJFyu";

  var response = function(response) {
    console.log("Inside response function");
    if(response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }
    else {
      return Promise.reject(new Error(response.statusText));
    }
  };

  var json = function(response) {
    return response.json();
  };

  fetch(
    toneApi,
    {
      method: "POST",
      credentials: "include",
      headers: new Headers({
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Access-Control-Allow-Origin": toneApi
      }),
      body: JSON.stringify(cleanedEmailText)
    }
  )
  .then(status)
  .then(json)
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
    {
      active: true,
      currentWindow: true
    },
    function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'EmailBodyUpdate', coloredText: analyzedText},
        // ...also specifying a callback to be called
        //    from the receiving end (content script)
        null
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
