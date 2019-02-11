// Update the relevant fields with the new data
function setDOMInfo(info) {
  console.log(info.emailText);
  analyzedText = '<span style="background-color:yellow;">' +
                 info.emailText +
                 '</span>' + '<span id="nextPosPlacer">dummy text</span>';
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
