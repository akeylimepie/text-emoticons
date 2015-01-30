var is_popup = location.pathname.indexOf('popup.html') > -1;
var keysBinded = false;

var i18n_messages = {};

var i18n = function (key) {
  if (i18n_messages[key])
    return i18n_messages[key];

  return chrome.i18n.getMessage(key);
};

if (!is_popup) {
  chrome.extension.onMessage.addListener(function (request) {
    i18n_messages = request['i18n'];
  });

  chrome.extension.connect();
}

var EmoticonBox = function () {
  this.extension_id = i18n('@@extension_id');
  this.in_focus = $(':focus');

  this.bindActions = function () {
    var self = this;
    var _id = self.extension_id;

    $('#' + _id + ' > div:first > div').click(function () {

      var list = $('#' + _id + ' > div:last .' + _id + '-list:nth(' + $(this).index() + ')');

      $(this)
        .addClass(_id + '-actual')
        .siblings()
        .removeClass(_id + '-actual')
      ;

      list
        .addClass(_id + '-actual')
        .siblings()
        .removeClass(_id + '-actual')
      ;

      $('.' + _id + '-item:first', list)
        .addClass(_id + '-selected')
        .siblings()
        .removeClass(_id + '-selected')
      ;
    });

    $('#' + _id + ' > div:first > div:first').click();

    $('#' + _id + ' > div:last .' + _id + '-list .' + _id + '-item').mouseenter(function () {

      $(this)
        .addClass(_id + '-selected')
        .siblings()
        .removeClass(_id + '-selected')
      ;
    })
      .click(function () {

        if (is_popup) {
          var copyDiv = document.createElement('div');
          copyDiv.contentEditable = true;
          document.body.appendChild(copyDiv);
          copyDiv.innerHTML = $(this).text();
          copyDiv.unselectable = "off";
          copyDiv.focus();
          document.execCommand('SelectAll');
          document.execCommand("Copy", false, null);
          document.body.removeChild(copyDiv);

          $('#' + _id).append('<div class="' + _id + '-shadow"><div>' + chrome.i18n.getMessage('copied') + '</div></div>');
          setTimeout(function () {
            $('.' + _id + '-shadow').fadeOut('fast', function () {
              $(this).remove();
            });
          }, 500);

          return false;
        }

        self.insertSmile($(this).text());
        self.destroy();
        return false;
      });
  };

  this.insertSmile = function (value) {

    var $element = this.in_focus;

    if ($element.is('#tweet-box-mini-home-profile')) {

      $('>div:last', $element).append(value);

      return true;
    }

    if ($element.is('input')) {
      $element.val($element.val() + value);
    } else if ($element.is('textarea')) {
      $element.text($element.text() + value);
    } else {
      $element.append(value);
    }

    return true;
  };


  this.bindKeys = function () {
    if (keysBinded)
      return false;

    var self = this;
    var _id = self.extension_id;

    keysBinded = true;

    var keys = [13, 32, 9, 27, 37, 38, 39, 40];

    $(document).click(function (e) {
      if (e.target.id != _id && $(e.target).parents('#' + _id).length == 0) {
        self.destroy();
      }
    });

    $(document).keydown(function (e) {

      if ($('#' + _id).length) {

        var list = $('#' + _id + ' > div:last > div.' + _id + '-actual');
        var bar = $('#' + _id + ' > div:first');

        var length = $('> div', list).length - 1;
        var current = $('> div.' + _id + '-selected', list).index();
        var next;

        if (e.keyCode == 13 || e.keyCode == 32) {
          self.insertSmile($('> div.' + _id + '-selected', list).text());
          self.destroy();
        }

        if (e.keyCode == 9) {
          //tab
          if ($('.' + _id + '-actual', bar).next().length) {
            $('.' + _id + '-actual', bar).next().click();
          } else {
            $(':first', bar).click();
          }
        }

        if (e.keyCode == 27) {
          self.destroy();
        }

        if (e.keyCode == 38) {
          //up
          if (current - 4 >= 0) {
            next = current - 4;
          }
        }

        if (e.keyCode == 40) {
          //down
          if (current + 4 <= length) {
            next = current + 4;
          }
        }

        if (e.keyCode == 37) {
          //left
          if (current - 1 >= 0) {
            next = current - 1;
          }
        }

        if (e.keyCode == 39) {
          //right
          if (current + 1 <= length) {
            next = current + 1;
          }
        }

        if (next !== undefined) {

          $('.' + _id + '-item:nth(' + next + ')', list)
            .addClass(_id + '-selected')
            .siblings()
            .removeClass(_id + '-selected')
          ;

          var offset_top;
          var list_height = list.height();

          offset_top = Math.floor(next / 4) * 50;
          if (offset_top < list.scrollTop()) {
            list.scrollTop(offset_top);
          }

          offset_top = Math.ceil(next / 4) * 50 + 50;
          if (offset_top >= ( list_height + list.scrollTop())) {
            list.scrollTop(offset_top - list.height());
          }
        }

        if (keys.indexOf(e.keyCode) > -1) {
          e.preventDefault();
          return false;
        }
      }
    });
  };

  this.destroy = function () {
    if (!is_popup)
      $('#' + this.extension_id).remove();
  };


  (function () {

    this.destroy();

    if (!this.in_focus.length && !is_popup)
      return false;

    var bar = $('<div/>');
    var lists = $('<div/>');

    for (var x in enjoys) {
      bar.append('<div><span>' + i18n(x) + '</span></div>');

      var list = $('<div class="' + this.extension_id + '-list"/>');
      for (var i in enjoys[x]) {
        list.append('<div class="' + this.extension_id + '-item"><span>' + enjoys[x][i] + '</span></div>');
      }
      lists.append(list);
    }

    var box = $('<div id="' + this.extension_id + '"/>');
    box.append(bar);
    box.append(lists);

    if (is_popup) {

      box.css({
        position: 'static'
      });

    } else {

      var top = this.in_focus.offset().top + this.in_focus.outerHeight() + 5;

      if (top + 400 > document.documentElement.clientHeight) {
        top = this.in_focus.offset().top - 400 - 5;
      }

      var left = this.in_focus.offset().left;

      if (left + 405 > document.documentElement.clientWidth) {
        left = this.in_focus.offset().left + this.in_focus.outerWidth() - 405;
      }

      box.css({
        top: top,
        left: left
      });
    }

    $('body').append(box);

    this.bindActions();
    this.bindKeys();

  }).bind(this)();


};

if (is_popup) {
  $(function () {
    new EmoticonBox();
  });
}



