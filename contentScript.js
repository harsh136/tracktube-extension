// contentScript.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoDetails") {
    const details = extractVideoDetails();
    sendResponse(details);
  } else if (request.action === "seekToTimestamp") {
    seekToTimestamp(request.timestamp);
  }
});

// Auto-Save Logic
const video = document.querySelector('video');
let saveTimeout = null;

if (video) {
  video.addEventListener('pause', () => {
    if (!video.seeking && video.currentTime > 0 && !video.ended) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        handleAutoSave('Ongoing');
      }, 5000);
    }
  });

  video.addEventListener('play', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  });

  video.addEventListener('ended', () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    handleAutoSave('Completed');
  });
}

function handleAutoSave(status) {
  const details = extractVideoDetails();
  details.status = status;

  chrome.runtime.sendMessage({
    action: "autoSave",
    data: details
  });
}

function getChapterTitle() {
  const chapterElement = document.querySelector('.ytp-chapter-title-content');
  if (chapterElement) {
    return chapterElement.innerText;
  }
  return null;
}

function extractVideoDetails() {
  const video = document.querySelector('video');
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
  const title = titleElement ? titleElement.innerText : document.title.replace(' - YouTube', '');

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  const playlistId = urlParams.get('list');

  const playlistHeader = document.querySelector('ytd-playlist-panel-renderer #header-description h3') ||
    document.querySelector('ytd-playlist-panel-renderer .title') ||
    document.querySelector('.ytd-playlist-panel-renderer .header-title');

  const playlistTitle = playlistHeader ? playlistHeader.innerText.trim() : null;
  const chapterTitle = getChapterTitle();

  return {
    title: title,
    url: window.location.href,
    videoId: videoId,
    playlistId: playlistId,
    playlistTitle: playlistTitle,
    chapterTitle: chapterTitle,
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
