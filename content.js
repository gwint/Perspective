// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction'
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  console.log("message recieved at content script");
  console.log(msg);
  msgBody = document.querySelector('div[aria-label="Message Body"]');
  if((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`)
    var domInfo = {
        total: document.querySelectorAll('*').length,
        inputs: document.querySelectorAll('input').length,
        buttons: document.querySelectorAll('button').length,
        emailText: "test text",
        formattedText: ""
    };

    // Need to strip out span tags so that they don't interfere with
    // what gets sent to tone analyzer
    if(msgBody) {
        domInfo.emailText = msgBody.innerText;
        domInfo.formattedText = msgBody.innerHTML;
        //alert(domInfo.emailText);
    }

    // Directly respond to the sender (popup),
    // through the specified callback */
    response(domInfo);
  }
  else if((msg.from === "popup") && (msg.subject === "EmailBodyUpdate")) {
    if(msgBody) {
      msgBody.innerHTML = msg.coloredText;
      console.log("text updated successfully");
    }
  }
});
