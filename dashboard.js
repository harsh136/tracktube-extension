document.addEventListener('DOMContentLoaded', () => {
    const videoList = document.getElementById('videoList');
    const totalVideosEl = document.getElementById('totalVideos');
    const completedVideosEl = document.getElementById('completedVideos');
    const ongoingVideosEl = document.getElementById('ongoingVideos');
    const searchInput = document.getElementById('search');
    const filterTopic = document.getElementById('filterTopic');
    const filterStatus = document.getElementById('filterStatus');

    // Navigation
    const navDashboard = document.getElementById('nav-dashboard');
    const navCourses = document.getElementById('nav-courses');
    const navNotes = document.getElementById('nav-notes');
    const navSettings = document.getElementById('nav-settings');
    const pageTitle = document.querySelector('header h1');
    const filtersSection = document.querySelector('.filters');
    const settingsSection = document.getElementById('settings-section');
    const contentSection = document.querySelector('.content-section');

    let allData = [];
    let currentView = 'dashboard'; // dashboard, courses, notes

    loadData();

    function loadData() {
        chrome.storage.sync.get(['learningData'], (result) => {
            allData = result.learningData || [];
            updateStats();
            populateTopics();
            renderCurrentView();
        });
    }

    // Navigation Event Listeners
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('dashboard');
    });

    navCourses.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('courses');
    });

    navNotes.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('notes');
    });

    navSettings.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('settings');
    });

    function switchView(view) {
        currentView = view;

        [navDashboard, navCourses, navNotes, navSettings].forEach(el => el.classList.remove('active'));
        if (view === 'dashboard') navDashboard.classList.add('active');
        if (view === 'courses') navCourses.classList.add('active');
        if (view === 'notes') navNotes.classList.add('active');
        if (view === 'settings') navSettings.classList.add('active');

        renderCurrentView();
    }

    function renderCurrentView() {
        videoList.innerHTML = '';

        contentSection.style.display = 'none';
        settingsSection.style.display = 'none';
        filtersSection.style.display = 'none';

        if (currentView === 'dashboard') {
            pageTitle.textContent = 'My Learning Dashboard';
            filtersSection.style.display = 'flex';
            contentSection.style.display = 'block';
            filterData();
        } else if (currentView === 'courses') {
            pageTitle.textContent = 'My Courses (Playlists)';
            contentSection.style.display = 'block';
            renderCourses();
        } else if (currentView === 'notes') {
            pageTitle.textContent = 'All Notes';
            contentSection.style.display = 'block';
            renderNotes();
        } else if (currentView === 'settings') {
            pageTitle.textContent = 'Settings';
            settingsSection.style.display = 'block';
            checkStorageUsage();
        }
    }

    function updateStats() {
        totalVideosEl.textContent = allData.length;
        completedVideosEl.textContent = allData.filter(i => i.status === 'Completed').length;
        ongoingVideosEl.textContent = allData.filter(i => i.status === 'Ongoing').length;
    }

    function populateTopics() {
        const topics = new Set(allData.map(item => item.topic).filter(t => t));
        filterTopic.innerHTML = '<option value="All">All Topics</option>';
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            filterTopic.appendChild(option);
        });
    }

    function renderVideos(data) {
        videoList.className = 'video-grid';
        videoList.innerHTML = '';

        if (data.length === 0) {
            videoList.innerHTML = '<p>No videos tracked yet.</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'video-card';

            const progressPercent = item.duration ? Math.min(100, Math.round((item.timestamp / item.duration) * 100)) : 0;
            const formattedTime = formatTime(item.timestamp);
            const resumeUrl = `${item.url}&t=${Math.floor(item.timestamp)}s`;
            const thumbnailUrl = item.thumbnail || 'icons/icon.svg';

            const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`;
            const circleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
            const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;

            card.innerHTML = `
        <div class="card-thumbnail">
            <img src="${thumbnailUrl}" alt="Thumbnail">
            <div class="card-duration">${formattedTime}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${item.title}">${item.title}</h3>
          <div class="card-meta">
            <span>${item.topic ? `<span class="tag">${item.topic}</span>` : ''}</span>
          </div>
          <div class="progress-wrapper">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%; background-color: ${item.status === 'Completed' ? '#27d7a1' : '#5e6ad2'}"></div>
            </div>
            <span class="progress-text">${progressPercent}%</span>
          </div>
          <div class="card-actions">
            <a href="${resumeUrl}" target="_blank" class="resume-btn">Resume</a>
            <div class="action-icons">
                <button class="icon-btn toggle-status-btn ${item.status === 'Completed' ? 'completed' : ''}" data-id="${item.id}" title="${item.status === 'Completed' ? 'Mark as Ongoing' : 'Mark as Completed'}">
                    ${item.status === 'Completed' ? checkIcon : circleIcon}
                </button>
                <button class="icon-btn delete-btn" data-id="${item.id}" title="Remove">${trashIcon}</button>
            </div>
          </div>
        </div>
      `;

            videoList.appendChild(card);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                deleteVideo(id);
            });
        });

        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                toggleVideoStatus(id);
            });
        });
    }

    function toggleVideoStatus(id) {
        const video = allData.find(item => item.id === id);
        if (video) {
            video.status = video.status === 'Completed' ? 'Ongoing' : 'Completed';
            chrome.storage.sync.set({ learningData: allData }, () => {
                loadData();
            });
        }
    }

    function renderCourses() {
        videoList.className = 'video-grid';
        const playlists = {};

        allData.forEach(item => {
            if (item.playlistId && item.playlistTitle) {
                if (!playlists[item.playlistId]) {
                    playlists[item.playlistId] = {
                        title: item.playlistTitle,
                        videos: [],
                        id: item.playlistId
                    };
                }
                playlists[item.playlistId].videos.push(item);
            }
        });

        const playlistKeys = Object.keys(playlists);
        if (playlistKeys.length === 0) {
            videoList.innerHTML = '<p>No playlists tracked yet. Watch a video from a playlist to see it here.</p>';
            return;
        }

        playlistKeys.forEach(key => {
            const playlist = playlists[key];
            const card = document.createElement('div');
            card.className = 'video-card';

            const totalVideos = playlist.videos.length;
            const completed = playlist.videos.filter(v => v.status === 'Completed').length;
            const progress = Math.round((completed / totalVideos) * 100);

            const thumbnail = playlist.videos[0].thumbnail || 'icons/icon.svg';

            card.innerHTML = `
                <div class="card-thumbnail">
                    <img src="${thumbnail}" alt="Playlist Thumbnail">
                    <div class="card-duration">${totalVideos} Videos</div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${playlist.title}</h3>
                    <div class="card-meta">
                        <span>${completed} / ${totalVideos} Completed</span>
                    </div>
                    <div class="progress-wrapper">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <div class="card-actions">
                        <a href="https://www.youtube.com/playlist?list=${playlist.id}" target="_blank" class="resume-btn">Open Playlist</a>
                    </div>
                </div>
            `;
            videoList.appendChild(card);
        });
    }

    function renderNotes() {
        videoList.className = 'notes-list';

        let hasNotes = false;

        allData.forEach(item => {
            if (item.notes && item.notes.length > 0) {
                hasNotes = true;
                item.notes.forEach(note => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'video-card';
                    noteCard.style.marginBottom = '10px';

                    const noteTime = formatTime(note.time);
                    const resumeUrl = `${item.url}&t=${Math.floor(note.time)}s`;

                    noteCard.innerHTML = `
                        <div class="card-body">
                            <div style="font-size: 12px; color: #999; margin-bottom: 5px;">
                                ${item.title} @ ${noteTime}
                            </div>
                            <p style="font-size: 14px; margin: 0 0 10px 0;">${note.text}</p>
                            <div class="card-actions">
                                <a href="${resumeUrl}" target="_blank" class="resume-btn" style="font-size: 11px; padding: 4px 8px;">Jump to Timestamp</a>
                            </div>
                        </div>
                    `;
                    videoList.appendChild(noteCard);
                });
            }
        });

        if (!hasNotes) {
            videoList.innerHTML = '<p>No notes taken yet.</p>';
        }
    }

    function attachDeleteListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                deleteVideo(id);
            });
        });
    }

    function deleteVideo(id) {
        if (confirm('Are you sure you want to remove this video from tracking?')) {
            const newData = allData.filter(item => item.id !== id);
            chrome.storage.sync.set({ learningData: newData }, () => {
                loadData();
            });
        }
    }

    function formatTime(seconds) {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    }

    // Filtering
    function filterData() {
        const query = searchInput.value.toLowerCase();
        const topic = filterTopic.value;
        const status = filterStatus.value;

        const filtered = allData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(query);
            const matchesTopic = topic === 'All' || item.topic === topic;
            const matchesStatus = status === 'All' || item.status === status;
            return matchesSearch && matchesTopic && matchesStatus;
        });

        renderVideos(filtered);
    }

    searchInput.addEventListener('input', filterData);
    filterTopic.addEventListener('change', filterData);
    filterStatus.addEventListener('change', filterData);

    // --- Data Management Logic ---

    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const storageFill = document.getElementById('storageFill');
    const storageText = document.getElementById('storageText');
    const storageWarning = document.getElementById('storageWarning');

    // 1. Export Data
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            chrome.storage.sync.get(['learningData'], (result) => {
                const data = result.learningData || [];
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));

                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                const date = new Date().toISOString().slice(0, 10);
                downloadAnchorNode.setAttribute("download", `tracktube-backup-${date}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            });
        });
    }

    // 2. Import Data
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const file = importFile.files[0];
            if (!file) {
                alert("Please select a JSON file first.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    if (!Array.isArray(importedData)) {
                        throw new Error("Invalid format: Data must be an array.");
                    }


                    chrome.storage.sync.get(['learningData'], (result) => {
                        const currentData = result.learningData || [];

                        const dataMap = new Map(currentData.map(item => [item.id, item]));

                        // Update or Add imported items
                        importedData.forEach(item => {
                            if (item.id && item.title) {
                                dataMap.set(item.id, item);
                            }
                        });

                        const mergedData = Array.from(dataMap.values());

                        // Save back to storage
                        chrome.storage.sync.set({ learningData: mergedData }, () => {
                            alert(`Successfully imported ${importedData.length} items!`);
                            allData = mergedData;
                            loadData();
                            checkStorageUsage();
                        });
                    });

                } catch (error) {
                    alert("Error importing file: " + error.message);
                }
            };
            reader.readAsText(file);
        });
    }

    // 3. Check Storage Usage
    function checkStorageUsage() {
        if (chrome.storage.sync.getBytesInUse) {
            chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
                const quota = chrome.storage.sync.QUOTA_BYTES || 102400;
                const percentage = Math.round((bytesInUse / quota) * 100);

                if (storageFill) {
                    storageFill.style.width = `${percentage}%`;
                    storageText.textContent = `${percentage}% (${bytesInUse} bytes / ${quota} bytes)`;

                    if (percentage > 80) {
                        storageFill.style.backgroundColor = 'var(--accent-danger)';
                        storageWarning.style.display = 'flex';
                    } else {
                        storageFill.style.backgroundColor = 'var(--accent-primary)';
                        storageWarning.style.display = 'none';
                    }
                }
            });
        }
    }
});
