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

        const existingIndex = data.findIndex(item => item.id === entry.videoId);

        if (existingIndex > -1) {
            const existing = data[existingIndex];

            existing.timestamp = entry.currentTime;
            existing.lastWatched = Date.now();

            if (entry.status === 'Completed') {
                existing.status = 'Completed';
            } else if (existing.status !== 'Completed') {
                existing.status = 'Ongoing';
            }

            if (entry.chapterTitle) {
                existing.chapterTitle = entry.chapterTitle;
            }

            data[existingIndex] = existing;
        } else {
            let playlistId = entry.playlistId;

            const newEntry = {
                id: entry.videoId,
                title: entry.title,
                url: entry.url,
                timestamp: entry.currentTime,
                duration: entry.duration,
                topic: '',
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
