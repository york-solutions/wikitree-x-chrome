/**
 * Get the URL and genscrape data of the active tab.
 *
 * @param  {Function} callback function(object)
 */
function getActiveTabData(callback){
  getActiveTab(function(tab){
    callback({
      url: tab.url
    });
  });
}

/**
 * Get the URL and genscrape data of the active tab.
 *
 * @param  {Function} callback function(object)
 */
function getTabData(callback){
  getActiveTab(function(tab){
    genscrapeData(tab.id);
  });
}

/**
 * Get the active tab.
 *
 * @param  {Function} callback function(tab)
 */
function getActiveTab(callback){
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs){
    callback(tabs[0]);
  });
}

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
