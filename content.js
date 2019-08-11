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
    let domInfo = {
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
        console.log("Here: " + domInfo.formattedText);
        alert(domInfo.formattedText);
    }

    // Directly respond to the sender (popup),
    // through the specified callback */
    response(domInfo);
  }
  else if((msg.from === "popup") && (msg.subject === "EmailBodyUpdate")) {
      if (msgBody) {
          msgBody.innerHTML = msg.coloredText;
          console.log("Resulting html: " + msg.coloredText);

          let toneNotes = document.getElementsByClassName("toneNote");
          for (let i = 0; i < toneNotes.length; i++) {
              toneNotes[i].style.visibility = "hidden";
              toneNotes[i].style.width = "120px";
              toneNotes[i].style.backgroundColor = "black";
              toneNotes[i].style.color = "#fff";
              toneNotes[i].style.textAlign = "center";
              toneNotes[i].style.borderRadius = "6px";
              toneNotes[i].style.position = "absolute";
              toneNotes[i].style.zIndex = "1";
          }

          let analyzedTextBuckets = document.getElementsByClassName("analyzedText");
          for (let i = 0; i < analyzedTextBuckets.length; i++) {
              console.log("Im in here");
              analyzedTextBuckets[i].onmouseover = function(event) {
                  event.currentTarget.nextElementSibling.style.visibility = "visible";
              };
              analyzedTextBuckets[i].onmouseout = function(event) {
                  event.currentTarget.nextElementSibling.style.visibility = "hidden";
              };
          }

          let divReplacements = document.getElementsByClassName("rp");
          for (let i = 0; i < divReplacements; i++) {
              divReplacements[i].style.display = "block";
          }
          console.log("text updated successfully");
      }
  }
  else if((msg.from === "popup") && (msg.subject === "cleanText")) {
    msgBody = document.querySelector('div[aria-label="Message Body"]');
    let domInfo = {
        formattedText: msgBody.innerHTML,
        rawText: msgBody.innerText
    };
    response(domInfo);
  }
});
