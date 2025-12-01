document.addEventListener('DOMContentLoaded', () => {
    const videoTitleEl = document.getElementById('videoTitle');
    const timestampDisplayEl = document.getElementById('timestampDisplay');
    const topicInput = document.getElementById('topic');
    const playlistNameInput = document.getElementById('playlistName');
    const playlistUrlInput = document.getElementById('playlistUrl');
    const togglePlaylistUrlBtn = document.getElementById('togglePlaylistUrl');
    const noteInput = document.getElementById('note');
    const saveBtn = document.getElementById('saveBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const messageEl = document.getElementById('message');
    const statusBtns = document.querySelectorAll('.status-btn');

    let currentVideoData = null;
    let selectedStatus = 'Ongoing';


    togglePlaylistUrlBtn.addEventListener('click', () => {
        if (playlistUrlInput.style.display === 'none') {
            playlistUrlInput.style.display = 'block';
        } else {
            playlistUrlInput.style.display = 'none';
        }
    });

    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStatus = btn.dataset.status;
        });
    });

    document.querySelector('[data-status="Ongoing"]').classList.add('active');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.includes('youtube.com/watch')) {
            chrome.tabs.sendMessage(activeTab.id, { action: "getVideoDetails" }, (response) => {
                if (chrome.runtime.lastError) {
                    videoTitleEl.textContent = "Please refresh the YouTube page.";
                    return;
                }
                if (response) {
                    currentVideoData = response;
                    videoTitleEl.textContent = response.title;
                    timestampDisplayEl.textContent = formatTime(response.currentTime);

                    if (response.playlistTitle) {
                        playlistNameInput.value = response.playlistTitle;
                        playlistNameInput.disabled = false;
                    }
                } else {
                    videoTitleEl.textContent = "Could not get video details. Refresh page.";
                }
            });
        } else {
            videoTitleEl.textContent = "Not a YouTube Video";
            saveBtn.disabled = true;
        }
    });

    saveBtn.addEventListener('click', () => {
        if (!currentVideoData) return;

        const note = noteInput.value.trim();
        const topic = topicInput.value.trim();
        const playlistName = playlistNameInput.value.trim();
        const playlistUrl = playlistUrlInput.value.trim();

        let playlistId = currentVideoData.playlistId;

        if (!playlistId && playlistUrl) {
            try {
                const urlObj = new URL(playlistUrl);
                playlistId = urlObj.searchParams.get('list');
            } catch (e) {

            }
        }

        if (!playlistId && playlistName) {
            playlistId = 'manual-' + playlistName.replace(/\s+/g, '-').toLowerCase();
        }

        const newEntry = {
            id: currentVideoData.videoId,
            title: currentVideoData.title,
            url: currentVideoData.url,
            timestamp: currentVideoData.currentTime,
            duration: currentVideoData.duration,
            topic: topic,
            status: selectedStatus,
            lastWatched: Date.now(),
            notes: note ? [{ time: currentVideoData.currentTime, text: note }] : [],
            playlistId: playlistId,
            playlistTitle: playlistName,
            thumbnail: `https://i.ytimg.com/vi/${currentVideoData.videoId}/mqdefault.jpg`
        };

        saveToStorage(newEntry);
    });

    dashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'dashboard.html' });
    });

    function saveToStorage(entry) {
        chrome.storage.sync.get(['learningData'], (result) => {
            let data = result.learningData || [];

            const existingIndex = data.findIndex(item => item.id === entry.id);

            if (existingIndex > -1) {

                const existing = data[existingIndex];
                if (entry.notes.length > 0) {
                    existing.notes.push(entry.notes[0]);
                }
                existing.timestamp = entry.timestamp;
                existing.lastWatched = entry.lastWatched;
                existing.status = entry.status;
                if (entry.topic) existing.topic = entry.topic;
                if (entry.playlistTitle) {
                    existing.playlistTitle = entry.playlistTitle;
                    existing.playlistId = entry.playlistId;
                }
                if (entry.thumbnail) existing.thumbnail = entry.thumbnail;

                data[existingIndex] = existing;
            } else {
                data.push(entry);
            }

            chrome.storage.sync.set({ learningData: data }, () => {
                messageEl.textContent = "Progress Saved!";
                setTimeout(() => messageEl.textContent = "", 2000);
            });
        });
    }

    function formatTime(seconds) {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    }
});
