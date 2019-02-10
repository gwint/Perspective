/*
	background.js - event handler
	- fires some action when web events occurs
*/

let color_blue = "#4bade5";

// Event that occurs at runtime (?)
chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: color_blue}, function() {
		console.log("The color is blau.");
	});

	// adds declared rules to the background script
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions : [new chrome.declarativeContent.PageStateMatcher({
				pageUrl : {hostEquals: 'mail.google.com'},
			})],
				actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

console.log("What's up?!?!?!? My first Chrome extension!!");
