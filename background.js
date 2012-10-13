/*global chrome:true */

console.log("hello, guys");

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.addPage) {
    addPage(msg, sendResponse);
  } else if (msg.getList) {
    // Get the whole list
    chrome.storage.sync.get(null, function (items) {
      sendResponse(items);
    });
  } else if (msg.checkDiffs) {
    console.log("checkDiffs not implemented");
    sendResponse('Not implemented');
  } else if (msg.removeDiff) {
    console.log("msg.removeDiff");
    chrome.storage.sync.remove(msg.url, function () {
      sendResponse("Item removed");
    });
  } else if (msg.showDiff) {
    console.log("showDiff: sendMessage to content script. tabid=" + msg.tabId);
    // To talk to content scripts
    var port = chrome.tabs.connect(msg.tabId, {name: "showdiff"});
    port.postMessage({showDiff:true});
    sendResponse('');
  }
  
  return true;
});


// To listen to content scripts
chrome.extension.onConnect.addListener(function(port) {
  if (port.name === "background") {
    port.onMessage.addListener(function(msg) {
      //console.log("received something");
      //console.log(msg);
      if (msg.tabGetDiff) {
        //console.log("tabGetDiff message comes in");
        // Get the diff
        var url = msg.url;
        var prev = getPrev(url);
        port.postMessage({bgReturnDiff: true, prev: prev});
      }

      return true;
    });
  }
});

function addPage(msg, sendResponse) {
  var url = msg.url;
  console.log("GET " + url);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === this.DONE) {
      var resultMsg = '';
      console.log("XHR: ", xhr);

      resultMsg = "Page saved " + (getPrev(url) ? "again..." : "!");

      store(url, xhr.responseText);
      diffStored(url);
      saveSynced(url, msg.title);
 
      sendResponse(resultMsg);
    }
  }
  xhr.send();
}

function saveSynced(url, title) {
  // Save this entry to storage.sync
  var lengthByte = 100;
  var hash = "ABCDEFG";
  var checkIntervalSecond = 600;
  var changed = false;
  var item = {};
  item[url] = {
    title: title,
    dateAdd: Date.now(),
    lengthByte: lengthByte,
    hash: hash,
    checkIntervalSecond: checkIntervalSecond,
    changed: changed
  };
  chrome.storage.sync.set(item);
}

function prevKey(url) { return url + "$$$PREV"; }

function getPrev(url) { return localStorage.getItem(prevKey(url)); }
function getCurr(url) { return localStorage.getItem(url); }

function store(url, responseText) {
  var prev = getCurr(url);
  localStorage.setItem(prevKey(url), prev);
  localStorage.setItem(url, responseText);
}

function diffStored(url) {
  var prev = getPrev(url);
  var cur = getCurr(url);
  if (prev == cur) {
    console.log("SAME SAME!");
    return false;
  }

  var prevDiv = document.createElement("div");
  prevDiv.innerHTML = getPrev(url);
  //document.body.appendChild(prevDiv);

  var currDiv = document.createElement("div");
  currDiv.innerHTML = getCurr(url);
  //document.body.appendChild(currDiv);
  
  diffDOMConsole(prevDiv, currDiv);
}

console.log("loaded...");
