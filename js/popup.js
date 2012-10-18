/*global chrome,webkitNotifications:true */

function setupEvent() {
  // Add current page for diff checking
  var el = document.getElementById("addPage");
  el.addEventListener('click', function(evt) {
    evt.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Create the message object
      var msg = {
        msg: 'popupAddPage',
        url: tabs[0].url,
        tabId: tabs[0].id
      };
      msg.title = tabs[0].title || "No Title";
      // Send the message and use response to show notification
      chrome.extension.sendMessage(msg, function(response) {
        if (response) {
          var notification = webkitNotifications.createNotification(
            'icon.png',  // icon url - can be relative
            'WebPageDiff',  // notification title
            response  // notification body text
          );
          notification.show();
        }
        window.close();
      });
    });
  });

  // Open the List Manager
  el = document.getElementById('manageList');
  el.addEventListener('click', function (evt) {
    evt.preventDefault();
    chrome.tabs.create({url:"list.html"});
  });

/* Not implement yet
  // Manually check diffs of saved page
  el = document.getElementById('checkDiffs');
  el.addEventListener('click', function (evt) {
    evt.preventDefault();
    // Create the message
    var msg = { msg: 'popupCheckDiffs' };
    chrome.extension.sendMessage(msg, function(response) {
      window.close();
    });
  });
*/

  // Show diff of the current page
  el = document.getElementById('showDiff');
  el.addEventListener('click', function (evt) {
    evt.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Shouldn't need to talk to background as diffs is stored at chrome.storage.local
      // where content script ("showdiff.js" in this case) can read them directly
      // so just message showdiff.js to do that
      /*
      var contentScript = chrome.tabs.connect(tabs[0].id, {name: "showdiff"});
      contentScript.postMessage({msg: 'popupShowDiff', url: tabs[0].url});
      */
      var url = tabs[0].url;
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'console.log("executeScript");chrome.storage.local.get("' + url + '", function (prev) { diffDOMPage(prev["' + url + '"]); });',
        runAt: 'document_idle'
      });
    });
    window.close();
  });
}

// Binding events when DOM ready
document.addEventListener("DOMContentLoaded", setupEvent);
