console.log("hello, guys");

chrome.browserAction.onClicked.addListener(function(tab) {
	console.log(tab);
	console.log("GET "+tab.url);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', tab.url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === this.DONE) {
			console.log(xhr.responseText);
		}
	}
	xhr.send();
});