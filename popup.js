// gets button from popup.html
let getTone = document.getElementById('getTone');

// gets color value from storage
chrome.storage.sync.get('color', function(data) {
	getTone.style.backgroundColor = data.color;
	getTone.setAttribute('value', data.color);
});

getTone.onclick = function(element) {
	checkboxes = document.getElementsByClassName('toneCheckbox');
	checked = [];
	for(let i=0; i<checkboxes.length; i++) {
		c = checkboxes[i];
		if(c.checked) {
			checked.push(c.name);
		}
	}
	// sends a message to contentScript.js
	chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            data: checked 
        });
    });

	console.log("Does this run?!");
	console.log(checked);
};
