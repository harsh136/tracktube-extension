// background.js

chrome.alarms.create('checkInactivity', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkInactivity') {
        checkAndNotify();
    }
});

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
