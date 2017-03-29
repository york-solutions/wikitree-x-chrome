// Get tab id from url
var tabId = getParameterByName('page');

// Get data
var background = chrome.extension.getBackgroundPage(),
    data = background.getTabData(tabId);

// Post
if(data){
  post(data);
}

// Show error message if there is no data
// TODO: automatically record/report error
else { }

/**
 * Send user to rs.io by filling a form and POSTing
 */
function post(data){
  var $form = document.getElementById('form');

  // Add proper domain to form action
  $form.action = background.postUrl;

  // Add person data
  document.getElementById('postData').value = JSON.stringify(data.genscrape);

  // FS ID, when available
  if(data.fsID){
    document.getElementById('fsID').value = data.fsID;
  }

  $form.submit();
}

// http://stackoverflow.com/a/5158301/879121
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
