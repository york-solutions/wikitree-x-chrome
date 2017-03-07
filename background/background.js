// Configuration
var dev = chrome.app.getDetails().update_url ? false : true,
    domain = dev ? 'dev4' : 'www',
    postUrl = 'https://' + domain + '.wikitree.com/wiki/Special:MergeEdit'

// Store tab data sent to the background by the injected genscrape script.
// This data is retrieved by the post page.
var tabData = {};

// Initiate scraping when a user clicks the extension icon.
chrome.browserAction.onClicked.addListener(function pageActionCallback(tab){
  genscrapeData(tab.id);
});

// Listen for data events from the injected scrapers
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'tabData'){

    // Save the response
    tabData = request;
    setImportSummary(tabData.genscrape);

    // Show FamilySearch components on FamilySearch pages
    if(isFSTreeUrl(tabData.url)){
      tabData.fsID = tabData.url.split('/')[5];
    }

    postData(sender.tab.id, tabData);
  }
});

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

/**
 * Save page data and prepare to POST it to WikiTree
 * 
 * @param {Integer} tabId
 * @param {Object} data 
 */
function postData(tabId, data){
  tabData[tabId] = data;
  chrome.tabs.create({
    url: chrome.extension.getURL('/pages/post.html?page=' + tabId)
  });
}

/**
 * Retrieve data scraped from a page. This deletes the data from storage
 * to prevent memory leaks.
 * 
 * @param {Integer} tabId
 */
function getTabData(tabId){
  var data = tabData[tabId];
  delete tabData[tabId];
  return data;
}

/**
 * Set the import summary for genscrape data
 */
function setImportSummary(gedx){
  if(gedx && gedx.description && Array.isArray(gedx.sourceDescriptions)){
    var description = gedx.sourceDescriptions.find(function(sd){
      return sd.id === gedx.description.substring(1);
    });
    if(description && description.repository && Array.isArray(gedx.agents)){
      var agent = gedx.agents.find(function(a){
        return a.id === description.repository.resource.substring(1);
      });
      if(agent){
        var person = gedx.persons.find(function(p){ return p.principal; }) || gedx.persons[0];
        gedx.summary = 'Imported data from ' + agent.names[0].value + ' ' + person.id + '.';
      }
    }
  }
}

/**
 * Check if a URL is of a person in the FamilySearch tree.
 *
 * @param {String} url
 * @return {Boolean}
 */
function isFSTreeUrl(url){
  return url.indexOf('https://familysearch.org/tree/person/') === 0;
}