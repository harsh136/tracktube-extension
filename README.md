# TrackTube - YouTube Learning Tracker Extension

TrackTube is a Chrome Extension designed to help you manage and track your learning journey on YouTube. It allows you to bookmark videos, track your progress, take notes, and organize your learning content into a personalized dashboard.

## 🚀 Features

### 📹 Smart Video Tracking
- **Auto-Save**: Automatically tracks your progress as you watch videos.
- **Manual Tracking**: Add videos to your list directly from the extension popup.
- **Resume Playback**: Pick up exactly where you left off with one click.
- **Status Management**: Mark videos as "Ongoing" or "Completed".

### 📊 Learning Dashboard
- **Centralized Hub**: View all your tracked videos in a clean, dark-themed interface.
- **Progress Bars**: Visual indicators of how much of each video you've watched.
- **Filtering & Search**: Easily find videos by title, topic, or status.
- **Course/Playlist View**: Group videos by playlist to track course progress.

### 📝 Note Taking
- **Timestamped Notes**: Take notes while watching. Each note is linked to the specific timestamp in the video.
- **Review Notes**: Browse all your notes in the dashboard and jump back to the specific moment in the video.

### 💾 Data Management
- **Export/Import**: Backup your learning data to a JSON file and restore it on any device.
- **Storage Monitoring**: Visual indicator of your sync storage usage to prevent data loss.

## 🛠️ Installation & Setup

Since this is a custom extension, you need to install it in "Developer Mode".

1.  **Clone or Download**:
    - Clone this repository or download the source code to a folder on your computer.
    - Example path: `D:\project\tracktube-extension`

2.  **Open Chrome Extensions**:
    - Open Google Chrome.
    - Navigate to `chrome://extensions/` in the address bar.

3.  **Enable Developer Mode**:
    - Toggle the **"Developer mode"** switch in the top-right corner of the page.

4.  **Load Unpacked**:
    - Click the **"Load unpacked"** button that appears in the top-left.
    - Select the folder where you saved the project files (e.g., `D:\project\tracktube-extension`).

5.  **Pin the Extension**:
    - Click the puzzle piece icon in the Chrome toolbar.
    - Find "TrackTube" and click the pin icon to keep it visible.

## 📖 How to Use

### Tracking a Video
1.  Open any YouTube video.
2.  Click the **TrackTube icon** in your toolbar.
3.  The popup will auto-fill the video details.
4.  (Optional) Add a **Topic** or **Note**.
5.  Click **"Save Progress"**.

### Using the Dashboard
1.  Click the extension icon and select **"Open Dashboard"**.
2.  **Dashboard Tab**: View all your individual videos. Use the search bar or filters to organize them.
3.  **My Courses Tab**: View videos grouped by their YouTube Playlist.
4.  **All Notes Tab**: See a consolidated list of all your notes.
5.  **Settings Tab**: Backup your data or import a previous backup.

## 💻 Tech Stack
- **HTML5 & CSS3**: Custom dark theme with responsive grid layout.
- **JavaScript (ES6+)**: Core logic for popup, background scripts, and dashboard.
- **Chrome Extension API**:
    - `chrome.storage.sync`: For syncing data across devices.
    - `chrome.tabs`: For interacting with YouTube tabs.
    - `chrome.runtime`: For message passing between components.

## ⚠️ Important Note on Storage
This extension uses `chrome.storage.sync` which has a quota (typically 100KB).
- Use the **Settings** page to monitor your usage.
- Regularly **Export** your data as a backup, especially if you have many notes.
