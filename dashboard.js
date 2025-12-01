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
    const pageTitle = document.querySelector('header h1');
    const filtersSection = document.querySelector('.filters');

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

    function switchView(view) {
        currentView = view;

        // Update Nav UI
        [navDashboard, navCourses, navNotes].forEach(el => el.classList.remove('active'));
        if (view === 'dashboard') navDashboard.classList.add('active');
        if (view === 'courses') navCourses.classList.add('active');
        if (view === 'notes') navNotes.classList.add('active');

        renderCurrentView();
    }

    function renderCurrentView() {
        videoList.innerHTML = ''; // Clear current content

        if (currentView === 'dashboard') {
            pageTitle.textContent = 'My Learning Dashboard';
            filtersSection.style.display = 'flex';
            filterData(); // This calls renderVideos
        } else if (currentView === 'courses') {
            pageTitle.textContent = 'My Courses (Playlists)';
            filtersSection.style.display = 'none';
            renderCourses();
        } else if (currentView === 'notes') {
            pageTitle.textContent = 'All Notes';
            filtersSection.style.display = 'none';
            renderNotes();
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
        videoList.className = 'video-grid'; // Ensure grid layout
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

            // Heroicons Solid Check Circle for Completed -> Lucide Check Circle (Soft)
            const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`;
            // Simple Circle Outline for Ongoing -> Lucide Circle (Soft)
            const circleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
            // Cleaner Trash Icon -> Lucide Trash 2 (Soft)
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
            // If completed, maybe set progress to 100%? 
            // For now, just toggle status tag.
            chrome.storage.sync.set({ learningData: allData }, () => {
                loadData();
            });
        }
    }

    function renderCourses() {
        videoList.className = 'video-grid';
        const playlists = {};

        // Group by playlist
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

            // Calculate total progress for playlist (simple average)
            const totalVideos = playlist.videos.length;
            const completed = playlist.videos.filter(v => v.status === 'Completed').length;
            const progress = Math.round((completed / totalVideos) * 100);

            // Use the thumbnail of the first video as the playlist thumbnail
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
        videoList.className = 'notes-list'; // Use a different layout class if needed
        // For now we'll just stack them, but let's make sure CSS handles it.
        // We might need to add .notes-list to CSS or just use grid.
        // Let's stick to grid for simplicity or simple block list.

        let hasNotes = false;

        allData.forEach(item => {
            if (item.notes && item.notes.length > 0) {
                hasNotes = true;
                item.notes.forEach(note => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'video-card'; // Reuse card style
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
});
