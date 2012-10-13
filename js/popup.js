/*global chrome,webkitNotifications:true */

$(function ($) {
  $('#addPage').on('click', function (evt) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Create the message object
      var msg = {
        addPage: true,
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
  $('#manageList').on('click', function (evt) {
    chrome.tabs.create({url:"list.html"});
    /*
    chrome.runtime.getBackgroundPage(function(bgPage) {
      bgPage.console.log("manageList click");
    });
    window.close();
    */
  });
  $('#checkDiffs').on('click', function (evt) {
    chrome.tabs.create({url:"list.html"});

    var msg = { checkDiffs: true };
    alert("click on checkDiffs");
    chrome.extension.sendMessage(msg, function(response) {
      window.close();
    });
    alert("sent msg");
  });
  $('#showDiff').on('click', function (evt) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Create the message object
      var msg = {
        showDiff: true,
        url: tabs[0].url,
        tabId: tabs[0].id
      };
      chrome.extension.sendMessage(msg, function(response) {
        window.close();
      });
    });
  });
})(jQuery);
