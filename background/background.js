var data = {};

console.log('background');

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
