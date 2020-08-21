/**
 * Inject and run genscrape. When genscrape is done
 * it will fire a message of type 'tabData'
 *
 * @param {Integer} tabId
 */
function genscrapeData(tabId){
  chrome.tabs.executeScript(tabId, {
    file: 'includes/genscrape.min.js'
  }, function(){
    chrome.tabs.executeScript(tabId, {
      code: genscrapeInject.toString() + ';genscrapeInject();'
    });
  });
}

/**
 * The following method isn't used directly. Instead we extract the code as
 * text to inject via tabs.executeScript(). This allows us to get good formatting
 * and syntax highlighting. Otherwise we'd have to write code in string which
 * would be hard to maintain.
 */
function genscrapeInject(){
  genscrape()
    .on('data', function(data){
      console.log('data');
      sendMessage(data);
    })
    .on('noData', function(){
      console.log('noData');
      sendMessage({});
    })
    .on('noMatch', function(){
      console.log('noMatch');
      sendMessage({});
    })
    .on('error', function(e){
      console.error(e);
      sendMessage({});
    });

  function sendMessage(data){
    chrome.runtime.sendMessage({
      type: 'tabData',
      genscrape: data,
      url: document.location.href
    });
  }
}

// When the extension icon is clicked, open the messaging page to wait
// for data and then initate scraping on the active tab.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: chrome.runtime.getURL("messaging/messaging.html") });
  genscrapeData(tab.id);
});
