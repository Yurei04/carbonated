// Background service worker for tracking page metrics
let currentTabData = {};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PAGE_METRICS') {
    const tabId = sender.tab.id;
    currentTabData[tabId] = {
      ...request.data,
      timestamp: Date.now(),
      url: sender.tab.url
    };
    
    // Update daily statistics
    updateDailyStats(request.data);
    
    sendResponse({ success: true });
  } else if (request.type === 'GET_TAB_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      sendResponse({ data: currentTabData[tabId] || null });
    });
    return true; // Will respond asynchronously
  } else if (request.type === 'GET_STATS') {
    chrome.storage.local.get(['dailyStats', 'weeklyStats'], (result) => {
      sendResponse({
        daily: result.dailyStats || { energySaved: 0, carbonSaved: 0 },
        weekly: result.weeklyStats || { energySaved: 0, carbonSaved: 0 }
      });
    });
    return true;
  }
});

// Update daily and weekly statistics
function updateDailyStats(metrics) {
  chrome.storage.local.get(['dailyStats', 'weeklyStats', 'lastReset'], (result) => {
    const now = Date.now();
    const lastReset = result.lastReset || now;
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
    
    let dailyStats = result.dailyStats || { energySaved: 0, carbonSaved: 0 };
    let weeklyStats = result.weeklyStats || { energySaved: 0, carbonSaved: 0 };
    
    // Reset daily stats if it's a new day
    if (daysSinceReset >= 1) {
      dailyStats = { energySaved: 0, carbonSaved: 0 };
    }
    
    // Reset weekly stats if it's been a week
    if (daysSinceReset >= 7) {
      weeklyStats = { energySaved: 0, carbonSaved: 0 };
      chrome.storage.local.set({ lastReset: now });
    }
    
    // Add current page's estimated savings
    const carbonSaved = metrics.co2 * 0.1; // 10% reduction estimate
    dailyStats.carbonSaved += carbonSaved;
    weeklyStats.carbonSaved += carbonSaved;
    
    chrome.storage.local.set({ dailyStats, weeklyStats });
  });
}

// Clean up old tab data
chrome.tabs.onRemoved.addListener((tabId) => {
  delete currentTabData[tabId];
});