function dummy(domElement) {
        console.log("Actually recieved:");
        console.log(domElement);
/*
        domElement.addEventListener("click", function() {
            console.log("dummy is running");
            chrome.storage.sync.get(['originalHtml'], function(result) {
                console.log('Now Restoring: ' + result.originalHtml);
                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function(tabs) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {from: 'popup', subject: 'EmailBodyUpdate', coloredText: result.originalHtml },
                            null
                        );
                    }
                );
            });
        });
*/
        return true;
}


chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
  }
  else if ((msg.from === 'content') && (msg.subject === 'triggerReplacement')) {
    console.log("Trigger replacement message recieved at background script");
    
    chrome.tabs.query(
            { active: true, currentWindow: true },
            function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'EmailBodyUpdate',
                        coloredText: msg.original },
                    null
                );
            }
    );
  }
  else {
/*
    chrome.tabs.query({
      active: true,
      currentWindow: true
    },
    function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'background', subject: 'attachCleaner'},
        dummy
      );
    });
*/
  }
    return true;
});

