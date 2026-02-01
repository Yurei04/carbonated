// background.js

let activeTabId = null;
let currentUrl = null;
let startTime = null;

const CARBON_PER_SECOND = 0.02;

// Start tracking immediately on Chrome start
chrome.runtime.onStartup.addListener(initTracking);
chrome.runtime.onInstalled.addListener(initTracking);

// Track active tab changes
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await saveCurrentSession();
  const tab = await chrome.tabs.get(tabId);
  if (tab?.url) startTracking(tabId, tab.url);
});

// Track URL changes (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    saveCurrentSession();
    startTracking(tabId, changeInfo.url);
  }
});

// Stop tracking when Chrome loses focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    saveCurrentSession();
    activeTabId = null;
  }
});

// ------------------ FUNCTIONS ------------------

async function initTracking() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id && tab.url) startTracking(tab.id, tab.url);
}

function startTracking(tabId, url) {
  activeTabId = tabId;
  currentUrl = url;
  startTime = Date.now();
}

async function saveCurrentSession() {
  if (!currentUrl || !startTime) return;

  const duration = (Date.now() - startTime) / 1000;
  const carbon = duration * CARBON_PER_SECOND;

  const { totalCarbon = 0, sessions = [] } =
    await chrome.storage.local.get(['totalCarbon', 'sessions']);

  sessions.push({
    url: currentUrl,
    duration,
    carbon,
    timestamp: Date.now(),
  });

  if (sessions.length > 100) sessions.shift();

  await chrome.storage.local.set({
    totalCarbon: totalCarbon + carbon,
    sessions,
  });

  startTime = null;
  currentUrl = null;
}
