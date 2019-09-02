chrome.runtime.onMessage.addListener(function (msg, sender) {
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        // Enable the page-action for the requesting tab
        chrome.pageAction.show(sender.tab.id);
    }
    else if ((msg.from === 'content') && (msg.subject === 'triggerReplacement')) {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'EmailBodyUpdate', coloredText: msg.original },
                    null
                );
            }
        );
    }
});

