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
  let apiKey = "t6dFCXw5GdOrTrCS8sM7iTaED0GCJmS93ksh-6VLJFyu";
  let toneApi = "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21?APIKEY=" + apiKey;
  alert(toneApi);

  var response = function(response) {
    alert("response status: " + response.status);
    if(response.status >= 200 && response.status < 300) {
      alert("valid response");
      alert(response);
      alert(response.json());
      return Promise.resolve(response);
    }
    else {
      alert(JSON.stringify(response));
      return Promise.reject(new Error(response.statusText));
    }
  };

  var json = function(response) {
    alert(respone);
    return response.json();
  };

  //fetch
  //(
  //  toneApi,
  //  {
  //    //credentials: "include",
  //    method: "POST",
  //    headers: new Headers({
  //      //"apikey": apiKey,
  //      "Content-Type": "application/json"
  //    }),
  //    body: JSON.stringify(textObj)
  //  }
  //)
  fetch("https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21", {
  body: '{"text": "What do you want you stupid idiot!  You suck!"}',
  headers: {
    Authorization: "Basic YXBpa2V5OnQ2ZEZDWHc1R2RPclRyQ1M4c003aVRhRUQwR0NKbVM5M2tzaC02VkxKRnl1",
    "Content-Type": "application/json"
  },
  method: "POST"
})
  .then(response)
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
