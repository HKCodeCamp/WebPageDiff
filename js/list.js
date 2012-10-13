/*global chrome,webkitNotifications:true */

$(function () {
  // Get all urls store in storage.sync
  // item { key: value}
  // { "http://twitter.github.com/bootstrap/index.html":
  //      {title:"Twitter Bootstrap", dateAdd:1350049430341, length:10, hash:"EEEEEEEE", checkInterval:10}
  //  }

  function removeListItem(url) {
    chrome.extension.sendMesssage({removeDiff:true, url: url}, function(response) {
      if (response) {
        var notification = webkitNotifications.createNotification(
          'icon.png',  // icon url - can be relative
          'WebPageDiff',  // notification title
          response  // notification body text
        );
        notification.show();
      }
      document.location.reload(true);
    });
  }

  chrome.extension.sendMessage({getList: true}, function(list) {
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
      markup += '<td><a class="btn removeListItem" href="' + item + '"><i class="icon-remove-sign"></i> Remove</a></td>';
      markup += '</tr>';
    }
    markup += '</table>';
    markup += '</div>';
    $('#listContent').html(markup);
  });

    $('body').on('click', function(evt) {
      //evt.preventDefault();
      //evt.stopPropagation();
      if ($(evt.currentTarget).hasClass('clickListItem')) {
        evt.preventDefault();
        evt.stopPropagation();
        console.log('a.clickListItem');
        //chrome.tabs.create({url: $(evt.document.location.reload(true)currentTarget).attr("href")});
      }
    });

    $('body').on('click', function(evt) {
      //evt.preventDefault();
      //evt.stopPropagation();
      console.log("removeListItem");
      if ($(evt.currentTarget).hasClass('removeListItem')) {
        evt.preventDefault();
        evt.stopPropagation();
        //removeListItem($(evt.currentTarget).attr("href"));
        var url = $(evt.currentTarget).attr("href");
        chrome.extension.sendMesssage({removeDiff:true, url: url}, function(response) {
          /*
          if (response) {
            var notification = webkitNotifications.createNotification(
              'icon.png',  // icon url - can be relative
              'WebPageDiff',  // notification title
              response  // notification body text
            );
            notification.show();
          }
          document.location.reload(true);
          */
        });
      }
    });
});

