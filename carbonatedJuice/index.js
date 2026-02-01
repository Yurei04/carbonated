// Popup script for displaying sustainability metrics
document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');
  const error = document.getElementById('error');
  
  try {
    // Get current tab data
    const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_DATA' });
    const data = response.data;
    
    if (!data) {
      showError();
      return;
    }
    
    // Get statistics
    const statsResponse = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    
    // Hide loading, show content
    loading.style.display = 'none';
    content.style.display = 'block';
    
    // Update score display
    updateScoreDisplay(data);
    
    // Update metrics
    updateMetrics(data);
    
    // Update statistics
    updateStatistics(statsResponse);
    
  } catch (err) {
    console.error('Error loading data:', err);
    showError();
  }
});

function updateScoreDisplay(data) {
  const gradeIcon = document.getElementById('gradeIcon');
  const gradeLetter = document.getElementById('gradeLetter');
  const scoreValue = document.getElementById('scoreValue');
  const scoreLabel = document.getElementById('scoreLabel');
  
  // Set grade letter
  gradeLetter.textContent = data.grade;
  gradeLetter.className = `grade-letter grade-${data.grade.toLowerCase()}`;
  
  // Set icon based on grade
  const icons = {
    'A': '🌱',
    'B': '🍃',
    'C': '⚠️',
    'D': '⚡',
    'E': '🔥',
    'F': '🔥'
  };
  gradeIcon.textContent = icons[data.grade] || '🌍';
  
  // Set score value
  scoreValue.textContent = Math.round(data.score);
  scoreValue.className = `score-value grade-${data.grade.toLowerCase()}`;
  
  // Set label
  const labels = {
    'A': 'Excellent',
    'B': 'Good',
    'C': 'Fair',
    'D': 'Poor',
    'E': 'Very Poor',
    'F': 'Critical'
  };
  scoreLabel.textContent = labels[data.grade] || 'Unknown';
}

function updateMetrics(data) {
  // Page size
  const pageSizeEl = document.getElementById('pageSize');
  if (data.pageSize < 1024) {
    pageSizeEl.textContent = `${data.pageSize} KB`;
  } else {
    pageSizeEl.textContent = `${(data.pageSize / 1024).toFixed(2)} MB`;
  }
  
  // Requests
  document.getElementById('requests').textContent = data.requests;
  
  // Load time
  const loadTimeEl = document.getElementById('loadTime');
  if (data.loadTime < 1000) {
    loadTimeEl.textContent = `${Math.round(data.loadTime)} ms`;
  } else {
    loadTimeEl.textContent = `${(data.loadTime / 1000).toFixed(2)} s`;
  }
  
  // CO2
  const co2El = document.getElementById('co2');
  if (data.co2 < 1) {
    co2El.textContent = `${(data.co2 * 1000).toFixed(1)} mg`;
  } else {
    co2El.textContent = `${data.co2.toFixed(2)} g`;
  }
}

function updateStatistics(stats) {
  const dailyCarbon = document.getElementById('dailyCarbon');
  const weeklyCarbon = document.getElementById('weeklyCarbon');
  
  // Format carbon values
  const formatCarbon = (value) => {
    if (value < 1) {
      return `${(value * 1000).toFixed(0)} mg CO₂ saved`;
    } else if (value < 1000) {
      return `${value.toFixed(1)} g CO₂ saved`;
    } else {
      return `${(value / 1000).toFixed(2)} kg CO₂ saved`;
    }
  };
  
  dailyCarbon.textContent = formatCarbon(stats.daily.carbonSaved);
  weeklyCarbon.textContent = formatCarbon(stats.weekly.carbonSaved);
}

function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
}