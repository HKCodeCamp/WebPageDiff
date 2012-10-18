/*global chrome,webkitNotifications:true */

function DOMReady() {
  // Get diff list
  chrome.storage.sync.get(null, function (list) {
    var markup = '';
    markup = '<div class="span10 offset1">';
    markup += '<table class="table table-condensed table-striped table-hover">';
    for (var item in list) {
      markup += '<tr>';
      markup += '<td>';
      if (list[item].changed) {
        markup += '<i class="icon-star"></i>';
      } else {
        markup += '<i class="icon-minus"></i>';
      }
      markup += ' <a class="clickListItem" href="' + item + '">' + list[item].title + '</a></td>';
      markup += '<td><a id="' + item + '"class="btn" href="#"><i class="icon-remove-sign"></i> Remove</a></td>';
      markup += '</tr>';
    }
    markup += '</table>';
    markup += '</div>';
    document.getElementById('listContent').innerHTML = markup;
    
    // Binding event to page link
    var links = document.getElementById('listContent').getElementsByClassName('clickListItem');
    for (var i=0,l=links.length; i<l; i++) {
      //console.log(links[i].href);
      links[i].addEventListener('click', function (evt) {
        evt.preventDefault();
        var url = this.href;
        chrome.tabs.create({url: url}, function (tab) {
          chrome.tabs.executeScript(tab.id, {
            code: 'console.log("executeScript");chrome.storage.local.get("' + url + '", function (prev) { diffDOMPage(prev["' + url + '"]); });',
            runAt: 'document_idle'
          });
        });
      });
    }
    
    // Binding event to Remove button
    for (item in list) {
      document.getElementById(item).addEventListener('click', function (evt) {
        evt.preventDefault();
        var id = this.id;
        chrome.storage.sync.remove(id, function () {
          chrome.storage.local.remove([id, id+"$$$PREV"], function () {
            // Redraw the current page
            DOMReady();
          });
        });
      });
    }
  });
}

// Binding events when DOM ready
document.addEventListener("DOMContentLoaded", DOMReady);
