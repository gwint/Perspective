/*
 * Inform the background page that
 * this tab should have a page-action
 */
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction'
});

/*
 * Send a message to the background script to signal that we want the
 * background to trigger an update to the email's body that would remove
 * any applied highlighting.
 *
 * @return None.
 */
function getOriginalHTML() {
    chrome.storage.sync.get(['originalHtml'], function(result) {
        msgBody = document.querySelector('div[aria-label="Message Body"]');
        html = msgBody.innerHTML;
        if(html.includes("<span>")) {
            chrome.runtime.sendMessage({from: 'content', subject: 'triggerReplacement', original: result.originalHtml});
        }
    });
}

/*
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    console.log(msg);
    msgBody = document.querySelector('div[aria-label="Message Body"]');

    if(msgBody === null) {
        throw new Error("Unable to locate DOM element used for email body");
    }

    let domInfo = {
        textWithoutMarkup: msgBody.innerText,
        textWithMarkup: msgBody.innerHTML
    };

    if((msg.from === 'popup') &&
       (msg.subject === 'analyzeTone' || msg.subject === 'cleanText')) {
        response(domInfo);
    }
    else if((msg.from === "popup") && (msg.subject === "EmailBodyUpdate")) {
        msgBody.innerHTML = msg.coloredText;

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
    }
    else if((msg.from === "popup") && (msg.subject === "attachCleaningHandler")) {
        msgBody.addEventListener("click", getOriginalHTML);
    }
});
