/**
 * JOYJET 2.0 Main Application
 * Entry point and navigation controller
 */

const App = {
  currentScreen: 'entry',
  mode: 'safe', // 'safe' or 'studio'
  
  init() {
    console.log('🚀 JOYJET 2.0 initialized');
    console.log('🔒 Safety-first architecture');
    
    // Check for stored mode preference
    const savedMode = localStorage.getItem('joyjet-mode');
    if (savedMode) {
      this.mode = savedMode;
    }
    
    // Initialize submodules
    Chat.init();
    Call.init();
    
    // Setup swipe gestures for mobile
    this.setupGestures();
  },

  // Navigation
  showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show target
    const target = document.getElementById(`screen-${screenName}`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenName;
      
      // Update nav if on conversations
      if (screenName === 'conversations') {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector('.nav-item:first-child').classList.add('active');
      }
    }
  },

  // Mode Selection
  enterSafeMode() {
    this.mode = 'safe';
    localStorage.setItem('joyjet-mode', 'safe');
    this.showScreen('conversations');
    Safety.showToast('Safe Mode activated - Maximum privacy', 'success');
  },

  enterStudioMode() {
    // Gate: Require verification for Studio
    const verified = localStorage.getItem('joyjet-verified');
    
    if (!verified) {
      Safety.showToast('Studio Mode requires identity verification', 'warning');
      // In production: Show verification flow
      setTimeout(() => {
        if (confirm('Verify identity to access AI Studio?\n\nThis requires:\n• Phone verification\n• Terms acceptance\n• ID verification for cloning features')) {
          localStorage.setItem('joyjet-verified', 'true');
          this.completeStudioEntry();
        }
      }, 500);
    } else {
      this.completeStudioEntry();
    }
  },

  completeStudioEntry() {
    this.mode = 'studio';
    localStorage.setItem('joyjet-mode', 'studio');
    this.showScreen('conversations');
    Safety.showToast('Studio Mode active - AI tools available', 'success');
    
    // Unlock studio nav
    document.querySelector('.nav-item-gated .nav-badge').textContent = '✓';
    document.querySelector('.nav-item-gated .nav-badge').style.color = '#00C853';
  },

  attemptStudioAccess() {
    if (this.mode === 'studio') {
      Safety.showToast('Studio tools available in chat/call menus', 'info');
    } else {
      this.enterStudioMode();
    }
  },

  // Room Management
  createSafeRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    Safety.showToast(`Safe room created: ${code}`, 'success');
    setTimeout(() => this.showScreen('conversations'), 1000);
  },

  joinRoom() {
    const input = document.getElementById('room-code');
    const code = input.value.trim();
    
    if (code.length < 3) {
      Safety.showToast('Please enter a valid room code', 'error');
      return;
    }
    
    Safety.showToast(`Joining room: ${code}...`, 'info');
    setTimeout(() => this.showScreen('conversations'), 800);
  },

  // Actions
  newConversation() {
    const contacts = ['Sarah Chen', 'Marcus Johnson', 'Engineering Team'];
    const choice = prompt(`Start conversation with:\n${contacts.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nEnter number:`);
    
    if (choice && choice > 0 && choice <= contacts.length) {
      Chat.openChat(choice === '1' ? 'sarah' : choice === '2' ? 'marcus' : 'fire-alarm');
    }
  },

  openSettings() {
    const settings = confirm(`Settings Menu\n\nCurrent Mode: ${this.mode.toUpperCase()}\nEncryption: E2EE Enabled\n\nOptions:\n• Toggle Dark Mode (always on)\n• Clear Safety Logs\n• Delete Account\n\nOpen settings?`);
    
    if (settings) {
      Safety.showToast('Settings would open here', 'info');
    }
  },

  viewContactInfo() {
    Safety.showToast('Contact info panel', 'info');
  },

  // Touch Gestures
  setupGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
  },

  handleSwipe() {
    const threshold = 100;
    const diff = touchEndX - touchStartX;
    
    // Swipe right to go back
    if (diff > threshold && this.currentScreen === 'chat') {
      this.showScreen('conversations');
    }
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => {
    console.log('SW registration failed:', err);
  });
}
