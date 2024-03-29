/*global chrome:true*/

console.log("I am here in showdiff.js");

String.prototype.times = function(n) { return n < 1 ? '':Array(n+1).join(this); };
function ArrayCopy(arr) { return Array.prototype.slice.call(arr); }

// Enable this line to have it check diff everytime a webpage is loaded!
//diffDOMPage();

function diffDOMPage(optPrev) {
  if (optPrev) {
    optPrev = optPrev.toString();
    // TODO: clean this up, below we can only get document.body.innerHTML, not document.innerHTML
    optPrev = optPrev.replace(/[\s\S]*<body>/mi, '<body>').replace(/<\/body>[\s\S]*/mi, '</body>');
    console.log("DIFF: " + optPrev);
  }

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
	      if (!curr || !curr.style) return;
	      curr.style.backgroundColor = 'lightblue';
	      //curr.style.backgroundColor = 'rgb(3,62,248)'== dark; 7,235,248
	      var r = 7; var g = 255-level*48; g = Math.abs(g);
	      curr.style.backgroundColor = 'rgb(' + r + ',' + g + ',248)';
	      console.log('---DIFF.changed:', prev, curr, (prev.innerText == curr.innerText), equalishString(prev.innerText, curr.innerText));
	      console.log('  DIFF.changed.prev:\n', prev.innerText)
		console.log('  DIFF.changed.curr:\n', curr.innerText);
	      break;
	    }
	    case 'added'  : {
	      if (!curr || !curr.style) return;
	      curr.style.backgroundColor = 'lightgreen';
	      //curr.style.backgroundColor = 0x000000 + (256*256-level*16*256);
	      console.log('---DIFF.added:', curr);
	      console.log('  DIFF.added.curr:\n', curr.innerText);
	      break;
	    }
	    case 'removed': {
	      if (!curr || !prev || !prev.style) return;
	      // TODO: consider to insert removed element with lightred color...
	      prev.style.backgroundColor = 'pink';
	      curr.insertAdjacentElement && curr.insertAdjacentElement('afterend', prev);
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

  //console.log("pTraverse: ", prev.childNodes, curr.childNodes);

  // Find changed or added this one DOES recurse
  var nPrev = prevC.shift();
  var nCurr = currC.shift();
  while (prevC.length || currC.length) {

    console.log("pTraverse.Q: ", prevC.length, currC.length,
		equalishString(nPrev && nPrev.innerText, nCurr && nCurr.innerText),
		nPrev, nCurr);

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

