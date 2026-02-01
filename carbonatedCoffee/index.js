// Popup script for Privacy Curtain
document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('curtainToggle');
  const timeLimitSelect = document.getElementById('timeLimitSelect');
  const blockSiteInput = document.getElementById('blockSiteInput');
  const addBlockSiteBtn = document.getElementById('addBlockSite');
  const blockedSitesList = document.getElementById('blockedSitesList');
  const usageStats = document.getElementById('usageStats');
  const styleButtons = document.querySelectorAll('.style-btn');
  
  // Load current settings
  const stats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
  
  // Set toggle state
  toggle.checked = stats.enabled;
  updateStatus(stats.enabled);
  
  // Set time limit
  if (stats.timeLimit) {
    timeLimitSelect.value = stats.timeLimit.toString();
  }
  
  // Set active style
  updateActiveStyle(stats.style);
  
  // Display blocked sites
  displayBlockedSites(stats.blockedSites);
  
  // Display usage statistics
  displayUsageStats(stats.stats);
  
  // Toggle event
  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_CURTAIN',
      enabled: enabled
    });
    updateStatus(enabled);
  });
  
  // Style selection
  styleButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const style = btn.dataset.style;
      
      // Update UI
      styleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Send to background
      await chrome.runtime.sendMessage({
        type: 'UPDATE_STYLE',
        style: style
      });
    });
  });
  
  // Time limit change
  timeLimitSelect.addEventListener('change', async (e) => {
    const timeLimit = e.target.value ? parseInt(e.target.value) : null;
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { timeLimit: timeLimit }
    });
  });
  
  // Add blocked site
  addBlockSiteBtn.addEventListener('click', async () => {
    const site = blockSiteInput.value.trim();
    if (!site) return;
    
    const currentStats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    const blockedSites = currentStats.blockedSites || [];
    
    if (!blockedSites.includes(site)) {
      blockedSites.push(site);
      
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: { blockedSites: blockedSites }
      });
      
      displayBlockedSites(blockedSites);
      blockSiteInput.value = '';
    }
  });
  
  // Enter key to add site
  blockSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBlockSiteBtn.click();
    }
  });
});

function updateStatus(enabled) {
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');
  
  if (enabled) {
    statusIcon.textContent = '🎭';
    statusTitle.textContent = 'Curtain Active';
    statusSubtitle.textContent = 'Privacy overlay enabled';
  } else {
    statusIcon.textContent = '👁️';
    statusTitle.textContent = 'Curtain Disabled';
    statusSubtitle.textContent = 'No privacy protection';
  }
}

function updateActiveStyle(style) {
  const styleButtons = document.querySelectorAll('.style-btn');
  styleButtons.forEach(btn => {
    if (btn.dataset.style === style) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function displayBlockedSites(sites) {
  const blockedSitesList = document.getElementById('blockedSitesList');
  
  if (!sites || sites.length === 0) {
    blockedSitesList.innerHTML = '<p class="empty-state">No blocked sites yet</p>';
    return;
  }
  
  blockedSitesList.innerHTML = '';
  sites.forEach(site => {
    const item = document.createElement('div');
    item.className = 'blocked-item';
    item.innerHTML = `
      <span>${site}</span>
      <button class="remove-btn" data-site="${site}">×</button>
    `;
    
    const removeBtn = item.querySelector('.remove-btn');
    removeBtn.addEventListener('click', async () => {
      await removeSite(site);
    });
    
    blockedSitesList.appendChild(item);
  });
}

async function removeSite(site) {
  const stats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
  const blockedSites = stats.blockedSites.filter(s => s !== site);
  
  await chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { blockedSites: blockedSites }
  });
  
  displayBlockedSites(blockedSites);
}

function displayUsageStats(stats) {
  const usageStatsEl = document.getElementById('usageStats');
  const today = new Date().toDateString();
  const todayStats = stats[today];
  
  if (!todayStats || Object.keys(todayStats).length === 0) {
    usageStatsEl.innerHTML = '<p class="empty-state">No browsing activity yet today</p>';
    return;
  }
  
  // Sort by visit count
  const sortedSites = Object.entries(todayStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 sites
  
  usageStatsEl.innerHTML = '';
  sortedSites.forEach(([domain, count]) => {
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `
      <span class="stat-domain">${domain}</span>
      <span class="stat-count">${count} visit${count > 1 ? 's' : ''}</span>
    `;
    usageStatsEl.appendChild(item);
  });
}