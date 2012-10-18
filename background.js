/*global chrome:true */

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.msg === 'popupAddPage') {
    addPage(msg, sendResponse);

  } else if (msg.msg === 'popupCheckDiffs') {
    console.log("checkDiffs not implemented");
    sendResponse('Not implemented');
  }
  
  return true;
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

      /*
      resultMsg = "Page saved " + (getPrev(url) ? "again..." : "!");

      store(url, xhr.responseText);
      //diffStored(url);
      saveSynced(url, msg.title);
 
      sendResponse(resultMsg);
      */

      // Check that this page has been added
      chromeGetPrev(url, function (item) {
        resultMsg = "Page saved " + (item ? "again..." : "!");
        // Save url's content to chrome.storage.local
        chromeStore(url, xhr.responseText, function () {
          // Add url pageList at chrome.storage.sync
          saveSynced(url, msg.title, function () {
            // Finally, response the 'addPage' message
            sendResponse(resultMsg);
          });
        });
      });
    }
  };
  xhr.send();
}

function saveSynced(url, title, callback) {
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
  chrome.storage.sync.set(item, function () {
    callback();
  });
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

function chromeGetPrev(url, callback) {
  chrome.storage.local.get(prevKey(url), function (value) {
    callback(value);
  });
}

function chromeGetCurr(url, callback) {
  chrome.storage.local.get(url, function (value) {
    callback(value);
  });
}

function chromeStore(url, responseText, callback) {
  chromeGetCurr(url, function (curr) {
    var item = {};
    item[prevKey(url)] = curr[url] || '';
    console.log(curr);
    chrome.storage.local.set(item, function () {
      var i = {};
      i[url] = responseText;
      chrome.storage.local.set(i, function () {
        callback();
      });
    });
  });
}
