/*global chrome:true */

String.prototype.times = function(n) { return n < 1 ? '':Array(n+1).join(this); };
function ArrayCopy(arr) { return Array.prototype.slice.call(arr); }

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

      resultMsg = "Page saved " + (getPrev(url) ? "<b>again...</b>" : "!");

      store(url, xhr.responseText);

      diffStored(url);

      var prevDiv = document.createElement("div");
      prevDiv.innerHTML = getPrev(url);
      //document.body.appendChild(prevDiv);

      var currDiv = document.createElement("div");
      currDiv.innerHTML = getCurr(url);
      //document.body.appendChild(currDiv);

      diffDOM(prevDiv, currDiv, function(event, level, prev, curr) {
		// TODO: make this annotate the DOM of the page to highlight changes
		switch (event) {
		case 'changed': {
		  console.log('---DIFF.changed:', prev, curr);
		  console.log('  DIFF.changed.prev:\n', prev.innerText)
		  console.log('  DIFF.changed.curr:\n', curr.innerText);
		  break;
		}
		case 'added'  : {
		  console.log('---DIFF.added:', curr);
		  console.log('  DIFF.added.curr:\n', curr.innerText);
		  break;
		}
		case 'removed': {
		  console.log('---DIFF.removed:', prev);
		  console.log('  DIFF.removed.prev:\n', prev.innerText);
		  break;
		}
		}
	      });
      
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
    return false;
  }
  return true;
}

function diffDOM(prev, curr, diffNotifier) {
  console.log("============================================================");
  console.log("diffDOM: ", prev, curr);
  console.log("DOM: ", document);
  return pTraverse(0, prev, curr, diffNotifier);
}

function notHtml(node) {
  return (!node)
    || (node instanceof Function)
    || (node instanceof Number)
    || (node instanceof String);
}  

function pTraverse(level, prev, curr, diffNotifier) {
  if (notHtml(prev) || notHtml(curr)) return;

  var prevC = ArrayCopy(prev.childNodes);
  if (!prevC) return;

  var currC = ArrayCopy(curr.childNodes);
  if (!currC) return;

  console.log("pTraverse: ", prevC, currC);

  // Find changed or added this one DOES recurse
  while (prevC.length || currC.length) {
    var nPrev = prevC.shift();
    var nCurr = currC.shift();
    if (nCurr && !(nCurr instanceof HTMLElement)) continue;

    // if no change don't go down rabbit hole
    if (nPrev && nCurr && nPrev.innerText == nCurr.innerText) continue;

    if (!nPrev || prevC.length < currC.length) {
      // assume something added

      diffNotifier('added', level, null, nCurr);
      // try to sync up by "ignoring" changed/added item
      nCurr = currC.shift();
      pTraverse(level+1, nPrev, nCurr, diffNotifier);

    } else if (!nCurr || prevC.length > currC.length) {
      // assume something removed

      if (nPrev) diffNotifier('removed', level, nPrev, nCurr);
      // try to sync up by "ignoring" changed/removed item
      nPrev = currC.shift();
      pTraverse(level+1, nPrev, nCurr, diffNotifier);

    } else {
      // same length, assume changed

      diffNotifier('changed', level, nPrev, nCurr);
      pTraverse(level+1, nPrev, nCurr, diffNotifier);
    }
  }

  // TODO: if any remaining stuff in prevC report as removed
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
