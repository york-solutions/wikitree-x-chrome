var tabData, fsID,
    dev = chrome.app.getDetails().update_url ? false : true,
    mergeEditUrl = dev ? 'http://dev4.wikitree.com/wiki/Special:MergeEdit' : 'https://httpbin.org/post',
    editFamilyUrl = dev ? 'http://dev4.wikitree.com/index.php?action=editfamily' : 'https://httpbin.org/post';

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

document.getElementById('update-existing-btn').addEventListener('click', updateExisting);
document.getElementById('create-related-btn').addEventListener('click', createRelated);
document.getElementById('create-unrelated-btn').addEventListener('click', createUnrelated);
document.getElementById('fs-connections-btn').addEventListener('click', fsConnect);

//
// Input listeners so that forms are submitted on enter
//
//
document.getElementById('update-existing').addEventListener('keypress', enterListener(updateExisting));
document.getElementById('create-related').addEventListener('keypress', enterListner(createRelated));
document.getElementById('create-unrelated').addEventListener('keypress', enterListner(createUnrelated));
document.getElementById('fs-connections').addEventListener('keypress', enterListner(fsConnect));

/**
 * Update an existing person by POSTing gedcomx data to the MergeEdit page
 */
function updateExisting(){
  var wtID = document.getElementById('update-existing-wt-id').value;
  postData(mergeEditUrl, wtID, tabData.genscrape);
}

/**
 * Open the EditFamilySearch page for the given WikiTree profile
 */
function fsConnect(){
  var wtID = document.getElementById('fs-connections-wt-id').value;
  chrome.tabs.create({
    url: 'http://www.wikitree.com/index.php?title=Special:EditFamilySearch&action=viewUser&user_name=' + wtID + '&fs_id=' + fsID
  });
}

/**
 * Create a new profile related to the given WikiTree profile
 */
function createRelated(){
  var wtID = document.getElementById('create-related-wt-id').value,
      relation = document.getElementById('create-related-relation').value;
  postData(editFamilyUrl + '&title=N&w=' + relation + '&title=' + wtID, '', tabData.genscrape);
}

/**
 * Create a new profile related to the given WikiTree profile
 */
function createUnrelated(){
  postData(editFamilyUrl + '&w=new', '', tabData.genscrape);
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
  if(profileId){
    if(parseInt(profileId, 10)){
      $wtId.value = profileId;
    } else {
      $wtUsername.value = profileId;
    }
  }

  document.getElementById('postData').value = JSON.stringify(data);
  $form.submit();
}

/**
 * Setup an event listener that calls the given function when
 * an enter keypress event is detected
 *
 * @param {Function} func
 * @return {Function} listener
 */
function enterListener(func){
  return function(event){
    if(enterPressed(event)){
      func();
    }
  };
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
