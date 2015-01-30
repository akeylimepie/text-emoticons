chrome.commands.onCommand.addListener(function (command) {
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
