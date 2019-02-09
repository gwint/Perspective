console.log("content script ran.");

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if(msg.data !== undefined) {
        console.log("contentScript got message: ");
		console.log(msg.data);
    }
});
