let emailAnalyzer = new EmailAnalyzer(new APIBasedAnalysisScheme());

/**
 * Use IBM Watson Tone Analyzer API to analyze text from email body, highlight
 * each sentence based on its tone, and then send this highlighted html string
 * to the content script so that the email body can be updated.
 *
 * @param object info An object containing both innerText and innerHTML of
 *                    email body text area.
 * @return None.
 */
async function analyzeEmailText(info) {
    console.log(info);
    await emailAnalyzer.analyze(info);
    console.log("analyzed text: " + EmailAnalyzer.analyzedText);

    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'EmailBodyUpdate', coloredText: EmailAnalyzer.analyzedText},
                null
            );
        }
    );
}

/**
 * Sends a "DOMInfo" message to the content script so that the email text
 * can be analyzed and highlighted according to the tone of each sentence.
 *
 * @return None.
 */
function getEmailTextAndAnalyze() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'analyzeTone'},
            analyzeEmailText
        );
    })
}

window.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function (tabs) {
        // Send message to background script when popup icon gets clicked
        chrome.tabs.query({
            active: true,
            currentWindow: true
        },
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'attachCleaningHandler'},
                null
            );
        });

        document.getElementById("getTone").onclick = getEmailTextAndAnalyze;
    });
});
