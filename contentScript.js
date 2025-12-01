// contentScript.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoDetails") {
    const details = extractVideoDetails();
    sendResponse(details);
  } else if (request.action === "seekToTimestamp") {
    seekToTimestamp(request.timestamp);
  }
});

function extractVideoDetails() {
  const video = document.querySelector('video');
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
  const title = titleElement ? titleElement.innerText : document.title.replace(' - YouTube', '');

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  const playlistId = urlParams.get('list');

  // Get playlist title if available
  // Try multiple selectors for the playlist title in the side panel
  const playlistHeader = document.querySelector('ytd-playlist-panel-renderer #header-description h3') ||
    document.querySelector('ytd-playlist-panel-renderer .title') ||
    document.querySelector('.ytd-playlist-panel-renderer .header-title');

  const playlistTitle = playlistHeader ? playlistHeader.innerText.trim() : null;

  return {
    title: title,
    url: window.location.href,
    videoId: videoId,
    playlistId: playlistId,
    playlistTitle: playlistTitle,
    currentTime: video ? video.currentTime : 0,
    duration: video ? video.duration : 0
  };
}

function seekToTimestamp(seconds) {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = seconds;
    video.play();
  }
}
