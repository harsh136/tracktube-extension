// background.js

chrome.alarms.create('checkInactivity', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkInactivity') {
        checkAndNotify();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autoSave') {
        handleAutoSave(request.data);
    }
});

function handleAutoSave(entry) {
    chrome.storage.sync.get(['learningData'], (result) => {
        let data = result.learningData || [];

        // Check if video already exists
        const existingIndex = data.findIndex(item => item.id === entry.videoId);

        if (existingIndex > -1) {
            // Update existing
            const existing = data[existingIndex];

            existing.timestamp = entry.currentTime;
            existing.lastWatched = Date.now();

            // Update status logic
            if (entry.status === 'Completed') {
                existing.status = 'Completed';
            } else if (existing.status !== 'Completed') {
                // Only set to Ongoing if it wasn't already Completed
                existing.status = 'Ongoing';
            }

            if (entry.chapterTitle) {
                existing.chapterTitle = entry.chapterTitle;
            }

            data[existingIndex] = existing;
        } else {
            // Add new
            // We need to construct a full entry object similar to popup.js
            // Some fields might be missing (like topic or notes), set defaults.

            // Determine Playlist ID logic (simplified from popup.js)
            let playlistId = entry.playlistId;
            // We don't have the user input for playlist URL/Name here, so rely on what we caught.

            const newEntry = {
                id: entry.videoId,
                title: entry.title,
                url: entry.url,
                timestamp: entry.currentTime,
                duration: entry.duration,
                topic: '', // Default empty
                status: entry.status || 'Ongoing',
                lastWatched: Date.now(),
                notes: [],
                playlistId: playlistId,
                playlistTitle: entry.playlistTitle,
                chapterTitle: entry.chapterTitle,
                thumbnail: `https://i.ytimg.com/vi/${entry.videoId}/mqdefault.jpg`
            };

            data.push(newEntry);
        }

        chrome.storage.sync.set({ learningData: data });
    });
}


function checkAndNotify() {
    chrome.storage.sync.get(['learningData'], (result) => {
        const data = result.learningData || [];
        if (data.length === 0) return;

        const ongoing = data.find(item => item.status === 'Ongoing');

        if (ongoing) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.svg',
                title: 'Resume Learning?',
                message: `You left off at ${formatTime(ongoing.timestamp)} in "${ongoing.title}". Click to continue!`,
                priority: 2
            });
        }
    });
}

function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}

chrome.notifications.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'dashboard.html' });
});
