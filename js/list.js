/*global chrome:true */

var fakeStorage = (function () {
  var storage = {
    diffList: [ {url:"http://twitter.github.com/bootstrap/index.html", title:"Twitter Bootstrap", dateAdd:1350049430341},
                {url:"http://jquery.com/", title:"jQuery: The Write Less, Do More, JavaScript Library", dateAdd:1350049483242},
                {url:"http://developer.chrome.com/extensions/overview.html", title:"Overview - Google Chrome", dateAdd:1350049528440}
              ]
  };

  return {
    setItem: function (key, value) {
      storage[key] = value;
      return value;
    },

    getItem: function (key) {
      return storage[key];
    },

    removeItem: function (key) {
      delete storage[key];
    }
  };
})();

$(function () {
  var markup = '<div class="well well-large"><ul>';
  var list = fakeStorage.getItem("diffList");
  for (var i = 0, l=list.length; i<l; i++) {
    markup += '<li>';
    markup += '<a href="' + list[i].url + '">' + list[i].title + '</a>';
    markup += '</li>';
  }

  markup += '</ul></div>';
  $('#listContent').html(markup);

});
