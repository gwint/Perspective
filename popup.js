// Update the relevant fields with the new data
function setDOMInfo(info) {
  console.log(info.emailText);
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
  async function (tabs) {
    while(1) {
      // ...and send a request for the DOM info...
      console.log("message sent from popup to content script");
      chrome.tabs.sendMessage(
          tabs[0].id,
          {from: 'popup', subject: 'DOMInfo'},
          // ...also specifying a callback to be called
          //    from the receiving end (content script)
          setDOMInfo);
      await sleep(5000);
    }
  });
});
