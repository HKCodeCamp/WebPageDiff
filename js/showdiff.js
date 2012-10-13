/*global chrome:true*/

console.log("I am here in showdiff.js");

// To talk to background
var port = chrome.extension.connect({name: "background"});
port.onMessage.addListener(function(msg) {
  if (msg.bgReturnDiff) {
    console.log("Got the diff background");
    // ** Call the display diff here
    console.log(msg.prev);

  }
});

// To listen to background
chrome.extension.onConnect.addListener(function(thisPort) {
  if (thisPort.name === "showdiff") {
    console.log("Incoming connection:");
    thisPort.onMessage.addListener(function(msg) {
      if (msg.showDiff) {
        console.log("showDiff message comes in");
        // Ask background for diff of the given url
        port.postMessage({tabGetDiff: true, url: location.href});
      }

      return true;
    });
  }
});


