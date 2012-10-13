/*global chrome:true */

String.prototype.times = function(n) { return n < 1 ? '':Array(n+1).join(this); }

console.log("hello, guys");

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  var url = msg.url;
  if (msg.addPage) addPage(url, sendResponse);
  return true;
});

function addPage(url, sendResponse) {
  console.log("GET " + url);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === this.DONE) {
      var resultMsg = '';
      console.log("XHR: ", xhr);
      console.log(xhr.responseText);
      console.log("XML: ", xhr.responseXML);

      resultMsg = "Page saved " + (getPrev(url) ? "<b>again...</b>" : "!");

      store(url, xhr.responseText);

      diffStored(url);

      var prevDiv = document.createElement("div");
      prevDiv.innerHTML = getPrev(url);
      document.body.appendChild(prevDiv);

      var currDiv = document.createElement("div");
      currDiv.innerHTML = getCurr(url);
      document.body.appendChild(currDiv);

      diffDOM(prevDiv, currDiv);
      
      sendResponse(resultMsg);
    }
  }
  xhr.send();
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
    return;
  }
}

function diffDOM(prev, curr) {
  console.log("diffDOM: ", prev, curr);
  console.log("DOM: ", document);
  //traverse(0, prev);
  //traverse(0, document);
  pTraverse(0, prev, curr);
}

function pTraverse(level, prev, curr) {
  if (!prev || !curr) return;
  if (prev instanceof Function) return;
  if (prev instanceof Number) return;
  if (prev instanceof String) return;

  if (curr instanceof Function) return;
  if (curr instanceof Number) return;
  if (curr instanceof String) return;

  var prevC = prev.childNodes;
  if (!prevC) return;

  var currC = curr.childNodes;
  if (!currC) return;

  // TODO: compare number of nodes, find inserted?
  for (var i in currC) {
    var nPrev = prevC[i];
    var nCurr = currC[i];
    if (nCurr instanceof HTMLElement) {
      console.log('  '.times(level), "x=", i, nCurr, nCurr.innerText);
      if (!nPrev) {
	console.log('  '.times(level), "x=", i, "ADDED!\n");
      } else if (nPrev.innerText == nCurr.innerText) {
	console.log('  '.times(level), "x=", i, "not changed text\n");
      } else {
	console.log('  '.times(level), "x=", i, "CHANGED!\n");
	pTraverse(level+1, nPrev, nCurr);
      }
    }
  }
  for (var i in prevC) {
    var nPrev = prevC[i];
    var nCurr = currC[i];
    if (nPrev instanceof HTMLElement) {
      console.log('  '.times(level), "y=", i, nPrev, nPrev.innerText);
      if (!nCurr) {
	console.log('  '.times(level), "y=", i, "REMOVED!\n");
      }
    }
  }
}

function traverse(level, node) {
  if (!node) return;
  if (node instanceof Function) return;
  if (node instanceof Number) return;
  if (node instanceof String) return;

  var c = node.childNodes;
  if (!c) return;

  for (var i in c) {
    //if (!(i instanceof Number)) return; // not HTML element?
    var n = c[i];
    if (n instanceof HTMLElement) {
      console.log(' '.times(level*2), "i=", i, n, n.innerText);
    }
    traverse(level+1, n);
  }
}

console.log("loaded...");
