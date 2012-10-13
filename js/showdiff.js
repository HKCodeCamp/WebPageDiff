/*global chrome:true*/

console.log("I am here in showdiff.js");

// To talk to background
var port = chrome.extension.connect({name: "background"});

// this is eventually called because post.postMessage above will send
// us a message below.
port.onMessage.addListener(function(msg) {
  if (msg.bgReturnDiff) {
    console.log("Got the diff background");

    // ** Call the display diff here
    diffDOMPage(msg.prev);

  } else if (msg.bgShowDiff) {
    console.log("Background want me to show diff");
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

String.prototype.times = function(n) { return n < 1 ? '':Array(n+1).join(this); };
function ArrayCopy(arr) { return Array.prototype.slice.call(arr); }

// hack not to get called twice during reload/load page... (happends only for jsk)
if (!document.domPageCalled) {
  diffDOMPage();
  document.domPageCalled = 'true';
}

function diffDOMPage(optPrev) {
  var html = document.body.innerHTML;

  var prevDiv = document.createElement("div");
  // if no prev, then we're called locally so use "localStorage"
  prevDiv.innerHTML = optPrev || localStorage.getItem(document.URL);

  var prev = prevDiv;
  var curr = document.body;

  diffDOM(prev, curr, function(event, level, prev, curr) {
	    // TODO: make this annotate the DOM of the page to highlight changes
	    switch (event) {
	    case 'changed': {
	      curr.style.backgroundColor = 'lightblue';
	      console.log('---DIFF.changed:', prev, curr, (prev.innerText == curr.innerText), equalishString(prev.innerText, curr.innerText));
	      console.log('  DIFF.changed.prev:\n', prev.innerText)
		console.log('  DIFF.changed.curr:\n', curr.innerText);
	      break;
	    }
	    case 'added'  : {
	      curr.style.backgroundColor = 'lightgreen';
	      console.log('---DIFF.added:', curr);
	      console.log('  DIFF.added.curr:\n', curr.innerText);
	      break;
	    }
	    case 'removed': {
	      // TODO: consider to insert removed element with lightred color...
	      //curr.style.backgroundColor = 'pink';
	      console.log('---DIFF.removed:', prev);
	      console.log('  DIFF.removed.prev:\n', prev.innerText);
	      break;
	    }
	    }
	  });

  localStorage.setItem(document.URL, html);
}


function diffDOMConsole(prev, curr) {
  diffDOM(prev, curr, function(event, level, prev, curr) {
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
}

// turns out the document.body.innerHTML and document.body are "different", extra spaces near tags...
function equalishString(a, b) {
  if (a === b) return 'identical';
  if (a == b) return 'equal';
  if (a === undefined || b === undefined) return false;
  if (a.trim() == b.trim()) return 'trimEqual';

  var sa = a.replace(/\s/g, '');
  var sb = b.replace(/\s/g, '');
  if (sa == sb) return 'nospaceEqual';
  if (a.length != b.length) return false; //'difflen(' + a.length + ', ' + b.length + ')';
  if (a > b) return false; //"bigger(a, b)";
  if (a < b) return false; //"less(a, b)";
  return false //'different?';
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

  console.log("pTraverse: ", prev.childNodes, curr.childNodes);

  // Find changed or added this one DOES recurse
  var nPrev = prevC.shift();
  var nCurr = currC.shift();
  while (prevC.length || currC.length) {
    console.log("pTraverse.Q: ", nPrev, nCurr, prevC, currC);
    if (nCurr && !(nCurr instanceof HTMLElement)) {
      // nasty mess
      //if (!nPrev || prevC.length < currC.length) {
      //nCurr = currC.shift();
      //} else if (!nCurr || prevC.length > currC.length) {
      //	nPrev = prevC.shift();
      //} else
      {
	nPrev = prevC.shift();
	nCurr = currC.shift();
      }
      continue;
    }

    // if no change don't go down rabbit hole
    if (nPrev && nCurr && equalishString(nPrev.innerText, nCurr.innerText)) {
      nPrev = prevC.shift();
      nCurr = currC.shift();
      continue;
    }

    if (!nPrev || prevC.length < currC.length) {
      // assume something added

      diffNotifier('added', level, null, nCurr);
      // try to sync up by "ignoring" changed/added item
      nCurr = currC.shift();
      continue; // sync up
    } else if (!nCurr || prevC.length > currC.length) {
      // assume something removed

      if (nPrev) diffNotifier('removed', level, nPrev, nCurr);
      // try to sync up by "ignoring" changed/removed item
      nPrev = prevC.shift();
      continue; // sync up
    } else {
      // same length, assume changed

      diffNotifier('changed', level, nPrev, nCurr);
      pTraverse(level+1, nPrev, nCurr, diffNotifier);

      nPrev = prevC.shift();
      nCurr = currC.shift();
    }
  }

  // TODO: if any remaining stuff in prevC report as removed
}

console.log("I am outta here!");

