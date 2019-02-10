chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("request sent from popup to content script: " + request);
    if (request.greeting == "hello there good sir")
      sendResponse({farewell: "goodbye good sir"});
  }
);
