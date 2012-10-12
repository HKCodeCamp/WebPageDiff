/*global chrome:true */
console.log("hello, guys");

//chrome.browserAction.onClicked.addListener(function(tab) {
chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.addPage) {
    //var tab = msg.tab;
    //console.log(tab);
    console.log("GET "+msg.url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', msg.url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === this.DONE) {
        console.log(xhr.responseText);
      }
    };
    xhr.send();
  }
});
