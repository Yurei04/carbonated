// Background service worker for Privacy Curtain
let usageStats = {};
let blockedSites = [];

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    curtainEnabled: true,
    curtainStyle: 'brown-curtain',
    timeLimit: null,
    blockedSites: [],
    showWarning: true,
    blockMode: 'overlay',
    usageStats: {}
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_STATS') {
    chrome.storage.local.get(['usageStats', 'curtainEnabled', 'curtainStyle', 'timeLimit', 'blockedSites'], (result) => {
      sendResponse({
        stats: result.usageStats || {},
        enabled: result.curtainEnabled !== false,
        style: result.curtainStyle || 'brown-curtain',
        timeLimit: result.timeLimit || null,
        blockedSites: result.blockedSites || []
      });
    });
    return true;
  } else if (request.type === 'TOGGLE_CURTAIN') {
    chrome.storage.local.set({ curtainEnabled: request.enabled });
    
    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.log('Error querying tabs');
        return;
      }
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_CURTAIN',
          enabled: request.enabled
        }, () => {
          if (chrome.runtime.lastError) {
            // Silent error handling
          }
        });
      });
    });
    
    sendResponse({ success: true });
    return true;
  } else if (request.type === 'UPDATE_STYLE') {
    chrome.storage.local.set({ curtainStyle: request.style });
    
    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.log('Error querying tabs');
        return;
      }
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_STYLE',
          style: request.style
        }, () => {
          if (chrome.runtime.lastError) {
            // Silent error handling
          }
        });
      });
    });
    
    sendResponse({ success: true });
    return true;
  } else if (request.type === 'UPDATE_SETTINGS') {
    chrome.storage.local.set(request.settings);
    sendResponse({ success: true });
    return true;
  }
});

// Track active time
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      return;
    }
    
    if (tab.url) {
      updateUsageStats(tab.url);
    }
  });
});

// Update usage statistics
function updateUsageStats(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const today = new Date().toDateString();
    
    chrome.storage.local.get(['usageStats'], (result) => {
      const stats = result.usageStats || {};
      
      if (!stats[today]) {
        stats[today] = {};
      }
      
      if (!stats[today][domain]) {
        stats[today][domain] = 0;
      }
      
      chrome.storage.local.set({ usageStats: stats });
    });
  } catch (err) {
    // Invalid URL, ignore
  }
}

// Clean old statistics (keep last 7 days)
function cleanOldStats() {
  chrome.storage.local.get(['usageStats'], (result) => {
    const stats = result.usageStats || {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const cleanedStats = {};
    Object.keys(stats).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date >= sevenDaysAgo) {
        cleanedStats[dateStr] = stats[dateStr];
      }
    });
    
    chrome.storage.local.set({ usageStats: cleanedStats });
  });
}

// Clean stats once per day
setInterval(cleanOldStats, 24 * 60 * 60 * 1000);