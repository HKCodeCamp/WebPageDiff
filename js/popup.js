/*global chrome:true */

$(function ($) {
  $('#addPage').on('click', function (evt) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.extension.sendMessage({addPage: true, url: tabs[0].url}, function(response) {
        window.close();
      });
    });
  });
  $('#manageList').on('click', function (evt) {
    chrome.runtime.getBackgroundPage(function(bgPage) {
      bgPage.console.log("manageList click");
    });
    window.close();
  });
})(jQuery);
