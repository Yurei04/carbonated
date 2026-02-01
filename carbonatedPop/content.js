// Monitor page activity and data transfer
let pageSize = 0;

// Estimate page size from resources
window.addEventListener('load', () => {
  // Get performance data
  const resources = performance.getEntriesByType('resource');
  pageSize = resources.reduce((total, resource) => {
    return total + (resource.transferSize || 0);
  }, 0);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'pageLoaded',
    size: pageSize
  });
});