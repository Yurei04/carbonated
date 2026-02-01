// index.js

async function updateStats() {
  const { totalCarbon = 0, sessions = [] } =
    await chrome.storage.local.get(['totalCarbon', 'sessions']);

  document.getElementById('totalCarbon').textContent =
    totalCarbon.toFixed(1);

  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  document.getElementById('timeSpent').textContent =
    Math.round(totalTime / 60);

  // Show current active site
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    document.getElementById('currentSite').textContent =
      new URL(tab.url).hostname;
  } else {
    document.getElementById('currentSite').textContent = 'No active tab';
  }

  // Show current session carbon (last session)
  const last = sessions[sessions.length - 1];
  document.getElementById('currentCarbon').textContent =
    last ? last.carbon.toFixed(2) : '0.00';
}

// Reset
document.getElementById('reset').addEventListener('click', async () => {
  await chrome.storage.local.set({ totalCarbon: 0, sessions: [] });
  updateStats();
});

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  setInterval(updateStats, 3000);
});
