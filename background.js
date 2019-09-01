/*function dummy(a) {
        a.addEventListener("click", function() {
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
}

*/

chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
  }
});

