var tabData, fsID;

// Get the current page data
chrome.runtime.getBackgroundPage(function(background){
  background.getActiveTabData(function(_tabData){
    tabData = _tabData;
    document.body.classList.add('loaded');
    fsID = getFSID(tabData.url);
    if(fsID){
      document.body.classList.add('familysearch');
    }
  });
});

document.getElementById('fs-connections-btn').addEventListener('click', function(){
  var wtID = document.getElementById('fs-connections-wt-id').value;
  chrome.tabs.create({
    url: 'http://www.wikitree.com/index.php?title=Special:EditFamilySearch&action=viewUser&user_name=' + wtID + '&fs_id=' + fsID
  });
});

function getFSID(url){
  return url.match(/^https:\/\/familysearch.org\/tree\/.*person=([\w-]+)/)[1];
}
