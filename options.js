// gets element from options.js
let page = document.getElementById('buttonDiv');

const buttonColors = ['#6de0b6', '#40a07d', '#1c684c', '#0b3d2a'];

function constructOptions(buttonColors) {
	for (let color of buttonColors) {
		let button = document.createElement('button');
		button.style.backgroundColor = color; // from buttonColors array
		button.addEventListener('click', function() {
			chrome.storage.sync.set({color: color}, function() {
				console.log('You picked ' + color);
			});
		});
		page.appendChild(button); // adds button to buttonDiv
	}
}

constructOptions(buttonColors);
