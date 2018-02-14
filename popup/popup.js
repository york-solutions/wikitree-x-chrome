var tabData, fsID,
    dev = chrome.app.getDetails().update_url ? false : true,
    domain = dev ? 'dev' : 'www',
    mergeEditUrl = 'https://' + domain + '.wikitree.com/wiki/Special:MergeEdit',
    editFamilyUrl = 'https://' + domain + '.wikitree.com/index.php?action=editfamily',
    newPersonUrl = 'https://' + domain + '.wikitree.com/wiki/Special:NewPerson';

// Initiate the scraping
chrome.runtime.getBackgroundPage(function(background){
  background.getTabData();
});

// Listen for the scraping response
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'tabData'){

    // Save the response
    tabData = request;
    setImportSummary(tabData.genscrape);
    findagraveCitationTemplate(tabData.genscrape);

    // Hide the loading indicator
    document.body.classList.add('loaded');

    // Show FamilySearch components on FamilySearch pages
    if(isFSTreeUrl(tabData.url)){
      fsID = tabData.url.split('/')[5];
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
document.getElementById('create-related').addEventListener('keypress', enterListener(createRelated));
document.getElementById('create-unrelated').addEventListener('keypress', enterListener(createUnrelated));
document.getElementById('fs-connections').addEventListener('keypress', enterListener(fsConnect));

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
  postData(editFamilyUrl + '&w=' + relation + '&title=' + wtID, '', tabData.genscrape);
}

/**
 * Create a new profile related to the given WikiTree profile
 */
function createUnrelated(){
  postData(newPersonUrl, '', tabData.genscrape);
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
 * Replace Find A Grave citations with the WikiTree template
 * 
 * @param {Object} gedx Genscrape data
 */
function findagraveCitationTemplate(gedx) {
  if(gedx.persons[0].identifiers.genscrape[0].indexOf('genscrape://findagrave/memorial') === 0) {
    var source = gedx.sourceDescriptions[0];
    var title = source.titles[0].value.replace(' - Find A Grave Memorial', '');
    var accessedDate = source.citations[0].value.match(/ accessed ([\w\s]+)\)/)[1];
    gedx.sourceDescriptions[0].citations[0].value = title + " on {{FindAGrave|" + gedx.persons[0].id + '}} retrieved ' + accessedDate;
  }
}
