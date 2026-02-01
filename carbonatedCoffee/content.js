// Content script for Privacy Curtain
(function() {
  'use strict';

  let curtainOverlay = null;
  let messageOverlay = null;
  let timerDisplay = null;
  let isEnabled = true;
  let curtainStyle = 'brown-curtain';
  let sessionStartTime = Date.now();
  let timeLimit = null; // in minutes
  let timerInterval = null;

  // Initialize curtain
  function init() {
    chrome.storage.local.get([
      'curtainEnabled',
      'curtainStyle',
      'timeLimit',
      'blockedSites',
      'showWarning'
    ], (result) => {
      isEnabled = result.curtainEnabled !== false;
      curtainStyle = result.curtainStyle || 'brown-curtain';
      timeLimit = result.timeLimit || null;
      
      const currentDomain = window.location.hostname;
      const blockedSites = result.blockedSites || [];
      const isBlocked = blockedSites.some(site => currentDomain.includes(site));
      
      if (isEnabled || isBlocked) {
        createCurtain();
        
        if (isBlocked && result.showWarning !== false) {
          showWarningMessage();
        }
        
        if (timeLimit && timeLimit > 0) {
          startTimer();
        }
      }
    });
  }

  // Create curtain overlay
  function createCurtain() {
    if (curtainOverlay) return;
    
    curtainOverlay = document.createElement('div');
    curtainOverlay.className = `privacy-curtain-overlay ${curtainStyle} drawing`;
    curtainOverlay.id = 'privacy-curtain-overlay';
    
    // Prevent any clicks through the curtain when in full block mode
    chrome.storage.local.get(['blockMode'], (result) => {
      if (result.blockMode === 'full') {
        curtainOverlay.style.pointerEvents = 'all';
      }
    });
    
    document.documentElement.appendChild(curtainOverlay);
    
    // Track usage time
    trackUsageTime();
  }

  // Show warning message
  function showWarningMessage() {
    if (messageOverlay) return;
    
    messageOverlay = document.createElement('div');
    messageOverlay.className = 'privacy-curtain-message';
    messageOverlay.innerHTML = `
      <h2>⚠️ Usage Alert</h2>
      <p>You've set limits for this website to encourage mindful browsing.</p>
      <p><strong>Take a break or continue with awareness?</strong></p>
      <div>
        <button id="curtain-continue">Continue Anyway</button>
        <button id="curtain-close-tab" class="secondary">Close Tab</button>
      </div>
    `;
    
    document.documentElement.appendChild(messageOverlay);
    
    // Add event listeners
    const continueBtn = messageOverlay.querySelector('#curtain-continue');
    const closeBtn = messageOverlay.querySelector('#curtain-close-tab');
    
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        messageOverlay.remove();
        messageOverlay = null;
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.close();
      });
    }
  }

  // Start usage timer
  function startTimer() {
    if (timerDisplay) return;
    
    timerDisplay = document.createElement('div');
    timerDisplay.className = 'privacy-curtain-timer';
    document.documentElement.appendChild(timerDisplay);
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  // Update timer display
  function updateTimer() {
    if (!timerDisplay) return;
    
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Check if time limit exceeded
    if (timeLimit && minutes >= timeLimit) {
      showTimeLimitMessage();
    }
  }

  // Show time limit exceeded message
  function showTimeLimitMessage() {
    if (messageOverlay) return;
    
    clearInterval(timerInterval);
    
    messageOverlay = document.createElement('div');
    messageOverlay.className = 'privacy-curtain-message';
    messageOverlay.innerHTML = `
      <h2>⏰ Time's Up!</h2>
      <p>You've reached your ${timeLimit} minute limit for this session.</p>
      <p><strong>Consider taking a break for your wellbeing.</strong></p>
      <div>
        <button id="curtain-extend">Extend 5 Minutes</button>
        <button id="curtain-close-tab" class="secondary">Close Tab</button>
      </div>
    `;
    
    document.documentElement.appendChild(messageOverlay);
    
    const extendBtn = messageOverlay.querySelector('#curtain-extend');
    const closeBtn = messageOverlay.querySelector('#curtain-close-tab');
    
    if (extendBtn) {
      extendBtn.addEventListener('click', () => {
        timeLimit += 5;
        sessionStartTime = Date.now();
        messageOverlay.remove();
        messageOverlay = null;
        startTimer();
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.close();
      });
    }
  }

  // Track usage time
  function trackUsageTime() {
    const domain = window.location.hostname;
    
    chrome.storage.local.get(['usageStats'], (result) => {
      const stats = result.usageStats || {};
      const today = new Date().toDateString();
      
      if (!stats[today]) {
        stats[today] = {};
      }
      
      if (!stats[today][domain]) {
        stats[today][domain] = 0;
      }
      
      // Increment visit count
      stats[today][domain]++;
      
      chrome.storage.local.set({ usageStats: stats });
    });
  }

  // Remove curtain
  function removeCurtain() {
    if (curtainOverlay) {
      curtainOverlay.classList.add('disabled');
      setTimeout(() => {
        if (curtainOverlay && curtainOverlay.parentNode) {
          curtainOverlay.remove();
        }
        curtainOverlay = null;
      }, 500);
    }
    
    if (messageOverlay && messageOverlay.parentNode) {
      messageOverlay.remove();
      messageOverlay = null;
    }
    
    if (timerDisplay && timerDisplay.parentNode) {
      timerDisplay.remove();
      timerDisplay = null;
    }
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Update curtain style
  function updateCurtainStyle(newStyle) {
    if (curtainOverlay) {
      curtainOverlay.className = `privacy-curtain-overlay ${newStyle}`;
      curtainStyle = newStyle;
    }
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'TOGGLE_CURTAIN') {
      isEnabled = request.enabled;
      
      if (isEnabled) {
        createCurtain();
      } else {
        removeCurtain();
      }
      
      sendResponse({ success: true });
    } else if (request.type === 'UPDATE_STYLE') {
      updateCurtainStyle(request.style);
      sendResponse({ success: true });
    } else if (request.type === 'GET_STATUS') {
      sendResponse({ 
        enabled: isEnabled,
        style: curtainStyle,
        hasOverlay: !!curtainOverlay
      });
    }
    
    return true;
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();