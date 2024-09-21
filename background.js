chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.closeme) {
      chrome.tabs.remove(sender.tab.id);
    }
  });
  