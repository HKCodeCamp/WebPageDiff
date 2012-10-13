/*global chrome:true*/

console.log("I am here in showdiff.js");
/*
chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.showDiff) {
    // Display diff of the current page
    console.log("Show me the diff");
  
  }

  return true;
});
*/
var port = chrome.extension.connect({name: "showDiff"});
//port.postMessage({joke: "Knock knock"});
port.onMessage.addListener(function(msg) {
  if (msg.bgReturnDiff) {
    console.log("Got the diff");
  }
});

//console.log("Try to post message tabGetDiff");
port.postMessage({tabGetDiff: true, url: location.href});

