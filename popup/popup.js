var tabData, fsID,
    dev = chrome.app.getDetails().update_url ? false : true,
    postUrl = dev ? 'http://dev4.wikitree.com/wiki/Special:MergeEdit' : 'https://httpbin.org/post';

// Initiate the scraping
chrome.runtime.getBackgroundPage(function(background){
  background.getTabData();
});

// Listen for the scraping response
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'tabData'){

    // Save the response
    tabData = request;

    // Hide the loading indicator
    document.body.classList.add('loaded');

    // Show FamilySearch components on FamilySearch pages
    fsID = getFSID(tabData.url);
    if(fsID){
      document.body.classList.add('familysearch');
    }
  }
});

//
// Setup button listeners
//

document.getElementById('fs-connections-btn').addEventListener('click', function(){
  var wtID = document.getElementById('fs-connections-wt-id').value;
  chrome.tabs.create({
    url: 'http://www.wikitree.com/index.php?title=Special:EditFamilySearch&action=viewUser&user_name=' + wtID + '&fs_id=' + fsID
  });
});

document.getElementById('update-existing-btn').addEventListener('click', function(){
  var wtID = document.getElementById('update-existing-wt-id').value;
  postData(postUrl, wtID, tabData.genscrape);
});

//
// Helper methods
//

function getFSID(url){
  var matches = url.match(/^https:\/\/familysearch.org\/tree\/.*person=([\w-]+)/);
  if(matches){
    return [1];
  }
}

/**
 * POST JSON data to the specified URL
 *
 * @param  {string} url
 * @param  {string} profileId
 * @param  {object} data
 */
function postData(url, profileId, data){
  var form = document.getElementById('form');
  form.action = url;
  document.getElementById('wtID').value = profileId;
  document.getElementById('postData').value = JSON.stringify(data);
  form.submit();
}
