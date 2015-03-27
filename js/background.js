chrome.commands.onCommand.addListener(function (command) {
  checkInjection();

  chrome.tabs.executeScript({
    code: 'new EmoticonBox();'
  });
});

chrome.extension.onConnect.addListener(function (port) {
    if (port.sender.tab) {
      var tab = port.sender.tab;

      var i18nMessages = {};
      i18nMessages['i18n'] = {};
      i18nMessages['i18n']['@@extension_id'] = chrome.i18n.getMessage('@@extension_id');
      i18nMessages['i18n']['g1'] = chrome.i18n.getMessage('g1');
      i18nMessages['i18n']['g2'] = chrome.i18n.getMessage('g2');
      i18nMessages['i18n']['g3'] = chrome.i18n.getMessage('g3');

      chrome.tabs.sendMessage(tab.id, i18nMessages);
    }
  }
);


var checkInjection = function () {
  chrome.tabs.executeScript({
    file: '/js/check.js'
  }, function (p) {
    if (!p[0]) {
      var options = {
        type: "basic",
        title: 'Обновите страницу',
        iconUrl: '/images/icon128.png',
        message: 'Вы только что установили расширение и на этой странице оно ещё не работает.',
        contextMessage: 'Обновите страницу'
      };

      chrome.notifications.create('te', options, function (notification) {
        setTimeout(function () {
          chrome.notifications.clear(notification, function () {

          });
        }, 5000);
      })

    }
  });
};


chrome.notifications.onClicked.addListener(function (notification) {

  chrome.tabs.executeScript({
    code: 'location.reload()'
  });

});