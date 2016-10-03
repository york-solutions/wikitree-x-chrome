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
    if(isFSTreeUrl(tabData.url)){
      document.body.classList.add('familysearch');
    }
  }
});

//
// Setup button listeners
//

document.getElementById('fs-connections-btn').addEventListener('click', fsConnect);

document.getElementById('update-existing-btn').addEventListener('click', updateExisting);

//
// Input listeners so that forms are submitted on enter
//
document.getElementById('update-existing-wt-id').addEventListener('keypress', function(event){
  if(enterPressed(event)){
    updateExisting();
  }
});

document.getElementById('fs-connections-wt-id').addEventListener('keypress', function(event){
  if(enterPressed(event)){
    fsConnect();
  }
});

//
// Helper methods
//

function updateExisting(){
  var wtID = document.getElementById('update-existing-wt-id').value;
  postData(postUrl, wtID, tabData.genscrape);
}

function fsConnect(){
  var wtID = document.getElementById('fs-connections-wt-id').value;
  chrome.tabs.create({
    url: 'http://www.wikitree.com/index.php?title=Special:EditFamilySearch&action=viewUser&user_name=' + wtID + '&fs_id=' + fsID
  });
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

/**
 * POST JSON data to the specified URL
 *
 * @param  {string} url
 * @param  {string} profileId
 * @param  {object} data
 */
function postData(url, profileId, data){
  var $form = document.getElementById('form'),
      $wtId = document.getElementById('wtId'),
      $wtUsername = document.getElementById('wtUsername');

  $form.action = url;

  // Decide whether we have a user ID or a profile name
  if(parseInt(profileId, 10)){
    $wtId.value = profileId;
  } else {
    $wtUsername.value = profileId;
  }

  document.getElementById('postData').value = JSON.stringify(data);
  $form.submit();
}

/**
 * Check if an event was fired by pressing the enter key
 *
 * @param {Event} event
 * @return {Boolean}
 */
function enterPressed(event){
  var key = event.which || event.keyCode;
  return key === 13;
}
