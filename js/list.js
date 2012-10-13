/*global chrome:true */

$(function () {
  // Get all urls store in storage.sync
  // item { key: value}
  // { "http://twitter.github.com/bootstrap/index.html":
  //      {title:"Twitter Bootstrap", dateAdd:1350049430341, length:10, hash:"EEEEEEEE", checkInterval:10}
  //  }
  chrome.extension.sendMessage({getList: true}, function(list) {
    var markup = '<div class="well well-large"><ul>';
    for (var item in list) {
      markup += '<li>';
      markup += '<a href="' + list[item] + '">' + list[item].title + '</a>';
      markup += '</li>';
    }
    markup += '</ul></div>';
    $('#listContent').html(markup);
  });
});

