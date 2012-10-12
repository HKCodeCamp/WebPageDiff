/*global chrome:true */

String.prototype.times = function(n) { return n < 1 ? '':Array(n+1).join(this); }

console.log("hello, guys");

//var mimeType = "text/xml";
var mimeType = "text/html";

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
  var url = msg.url;
  if (msg.addPage) return addPage(url);
});

function addPage(url) {
  console.log("GET " + url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === this.DONE) {
      console.log("XHR: ", xhr);
      console.log(xhr.responseText);
      console.log("XML: ", xhr.responseXML);

      store(url, xhr.responseText);

      diffStored(url);

      // doesn't work
      //var parser = new DOMParser();
      //var prevXML = parser.parseFromString(getPrev(url), mimeType);

      var prevDiv = document.createElement("div");
      prevDiv.innerHTML = getPrev(url);
      document.body.appendChild(prevDiv);

      var currDiv = document.createElement("div");
      currDiv.innerHTML = getPrev(url);
      document.body.appendChild(currDiv);

      diffDOM(prevDiv, currDiv);
    }
  }
  xhr.overrideMimeType(mimeType); // doesn't work with html
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
  traverse(0, prev);
  //traverse(0, document);
  //pTraverse(0, docu);
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
  for (var i in c) {
    //if (!(i instanceof Number)) return; // not HTML element?
    var n = c[i];
    if (n instanceof HTMLElement) {
      console.log(' '.times(level*2), "i=", i, n, n.innerText);
    }
    traverse(level+1, n);
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
