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
    // Debounce: Wait 5 seconds of inactivity (paused state) before saving
    if (!video.seeking && video.currentTime > 0 && !video.ended) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        handleAutoSave('Ongoing');
      }, 5000);
    }
  });

  video.addEventListener('play', () => {
    // If user resumes watching within 5 seconds, cancel the pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  });

  video.addEventListener('ended', () => {
    // Save immediately on end
    if (saveTimeout) clearTimeout(saveTimeout);
    handleAutoSave('Completed');
  });
}

function handleAutoSave(status) {
  const details = extractVideoDetails();
  // Override status for the auto-save event
  details.status = status;

  chrome.runtime.sendMessage({
    action: "autoSave",
    data: details
  });
}

function getChapterTitle() {
  // Try to find the active chapter in the description or chapter list
  // This is tricky as YouTube changes classes. 
  // Method 1: Look for the active chapter in the macro markers (timeline) - hard to get text.
  // Method 2: Look for the active chapter in the description chapters list if open? No.
  // Method 3: Look for the chapter title element that appears above the progress bar on hover?
  // Method 4: The most reliable for "current chapter" text is often in the structured data or the chapter view.

  // Let's try to find the chapter element in the player UI
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

  // Get playlist title if available
  // Try multiple selectors for the playlist title in the side panel
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
