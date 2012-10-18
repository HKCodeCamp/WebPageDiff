/*global chrome:true */

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.msg === 'popupAddPage') {
    addPage(msg, sendResponse);
  } else if (msg.getList) {
    // Get the whole list
    chrome.storage.sync.get(null, function (items) {
      sendResponse(items);
    });
  } else if (msg.msg === 'popupCheckDiffs') {
    console.log("checkDiffs not implemented");
    sendResponse('Not implemented');
  } else if (msg.removeDiff) {
    console.log("msg.removeDiff");
    chrome.storage.sync.remove(msg.url, function () {
      sendResponse("Item removed");
    });
  } else if (msg.msg === 'popupShowDiff') {
    console.log("showDiff: sendMessage to content script. tabid=" + msg.tabId);
    // To talk to content scripts
    var contentScript = chrome.tabs.connect(msg.tabId, {name: "showdiff"});
    contentScript.postMessage({showDiff:true});
    sendResponse('');
  }
  
  return true;
});

// To listen to content scripts
chrome.extension.onConnect.addListener(function(port) {
  if (port.name === "background") {
    port.onMessage.addListener(function(msg) {
      if (msg.tabGetDiff) {
        port.postMessage({bgReturnDiff: true, prev: getCurr(msg.url)});
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
      //diffStored(url);
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

  var currDiv = document.createElement("div");
  currDiv.innerHTML = getCurr(url);
  
  diffDOMConsole(prevDiv, currDiv);
}
