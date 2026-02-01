// Content script for analyzing page sustainability
(function() {
  'use strict';

  function analyzePageSustainability() {
    const metrics = {
      pageSize: 0,
      requests: 0,
      transferSize: 0,
      loadTime: 0,
      images: 0,
      scripts: 0,
      stylesheets: 0
    };

    // Get performance data
    if (window.performance) {
      const perfData = window.performance.getEntriesByType('resource');
      
      perfData.forEach(resource => {
        metrics.requests++;
        metrics.transferSize += resource.transferSize || 0;
        
        if (resource.initiatorType === 'img') metrics.images++;
        if (resource.initiatorType === 'script') metrics.scripts++;
        if (resource.initiatorType === 'link' || resource.initiatorType === 'css') metrics.stylesheets++;
      });
      
      const navigation = window.performance.getEntriesByType('navigation')[0];
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        metrics.transferSize += navigation.transferSize || 0;
      }
    }

    // Calculate page size in KB
    metrics.pageSize = Math.round(metrics.transferSize / 1024);
    
    // Estimate CO2 emissions (0.5g CO2 per MB transferred)
    metrics.co2 = (metrics.transferSize / (1024 * 1024)) * 0.5;
    
    // Calculate sustainability score (A-F)
    metrics.score = calculateScore(metrics);
    metrics.grade = getGrade(metrics.score);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'PAGE_METRICS',
      data: metrics
    });
  }

  function calculateScore(metrics) {
    let score = 100;
    
    // Penalize large page sizes
    if (metrics.pageSize > 5000) score -= 30; // > 5MB
    else if (metrics.pageSize > 3000) score -= 20; // > 3MB
    else if (metrics.pageSize > 1000) score -= 10; // > 1MB
    
    // Penalize many requests
    if (metrics.requests > 100) score -= 25;
    else if (metrics.requests > 50) score -= 15;
    else if (metrics.requests > 30) score -= 5;
    
    // Penalize slow load times
    if (metrics.loadTime > 5000) score -= 20; // > 5s
    else if (metrics.loadTime > 3000) score -= 10; // > 3s
    
    // Penalize too many images
    if (metrics.images > 50) score -= 15;
    else if (metrics.images > 30) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    if (score >= 50) return 'E';
    return 'F';
  }

  // Run analysis after page loads
  if (document.readyState === 'complete') {
    setTimeout(analyzePageSustainability, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(analyzePageSustainability, 1000);
    });
  }
})();