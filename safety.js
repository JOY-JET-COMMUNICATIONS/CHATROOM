/**
 * Safety & Ethics Module
 * Handles consent, AI gates, and emergency stops
 */

const Safety = {
  // State
  consentStore: new Map(),
  activeEffects: new Set(),
  
  // Initialize
  init() {
    // Load stored consents
    const stored = localStorage.getItem('joyjet-consents');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        this.consentStore.set(key, value);
      });
    }
    
    console.log('🔒 Safety module initialized');
  },

  // Check if consent is valid
  hasConsent(type, duration = 30) {
    const key = `${type}-consent`;
    const consent = this.consentStore.get(key);
    
    if (!consent) return false;
    
    // Check expiration (days)
    const age = (Date.now() - consent.timestamp) / (1000 * 60 * 60 * 24);
    if (age > duration) {
      this.consentStore.delete(key);
      this.saveConsents();
      return false;
    }
    
    return true;
  },

  // Request consent modal
  requestConsent(type, callback) {
    if (this.hasConsent(type)) {
      callback?.();
      return true;
    }
    
    const modal = document.getElementById('consent-modal');
    const text = document.getElementById('consent-text');
    
    // Customize text based on type
    const texts = {
      avatar: "You are activating AI Avatar effects. This will replace your face with a digital representation. Both parties will see a watermark indicating AI is active.",
      voice: "You are activating Voice Stylization. This modifies your voice in real-time. You certify this is your own voice and you have permission to modify it.",
      clone: "WARNING: Voice cloning requires explicit written consent from the voice owner. This feature is logged and audited. Misuse may result in permanent ban and legal action."
    };
    
    text.textContent = texts[type] || texts.avatar;
    modal.setAttribute('aria-hidden', 'false');
    modal.dataset.pendingType = type;
    modal.dataset.pendingCallback = callback?.toString(); // Store callback reference
    
    return false;
  },

  // Accept consent
  acceptConsent() {
    const modal = document.getElementById('consent-modal');
    const type = modal.dataset.pendingType;
    const remember = document.getElementById('consent-remember').checked;
    
    if (remember) {
      this.consentStore.set(`${type}-consent`, {
        timestamp: Date.now(),
        type: type
      });
      this.saveConsents();
    }
    
    modal.setAttribute('aria-hidden', 'true');
    
    // Execute pending action
    if (type === 'avatar') {
      Call.enableAIEffect('avatar');
    } else if (type === 'voice') {
      Call.enableAIEffect('voice');
    }
    
    this.showToast('AI effects activated with consent', 'success');
  },

  // Dismiss consent
  dismissConsent() {
    const modal = document.getElementById('consent-modal');
    modal.setAttribute('aria-hidden', 'true');
    this.showToast('AI features require consent to activate', 'warning');
  },

  // Save to localStorage
  saveConsents() {
    const obj = Object.fromEntries(this.consentStore);
    localStorage.setItem('joyjet-consents', JSON.stringify(obj));
  },

  // Emergency kill switch
  killAllEffects() {
    console.log('🛑 EMERGENCY: Killing all AI effects');
    
    // Stop all AI
    this.activeEffects.clear();
    
    // UI updates
    document.getElementById('ai-watermark').classList.add('hidden');
    document.querySelector('.emergency-btn').classList.remove('visible');
    
    // Reset video effects
    if (window.Call) {
      Call.setEffect('none');
      Call.disableAIEffects();
    }
    
    // Show overlay briefly
    const overlay = document.getElementById('emergency-exit');
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 1500);
    
    this.showToast('All AI effects disabled', 'success');
    
    // Log for safety audit
    this.logSafetyEvent('emergency_kill', {
      timestamp: new Date().toISOString(),
      user: 'current_user'
    });
  },

  // Track active effects
  registerEffect(type) {
    this.activeEffects.add(type);
    this.updateSafetyUI();
  },

  unregisterEffect(type) {
    this.activeEffects.delete(type);
    this.updateSafetyUI();
  },

  // Update UI based on active effects
  updateSafetyUI() {
    const hasEffects = this.activeEffects.size > 0;
    const watermark = document.getElementById('ai-watermark');
    const emergencyBtn = document.querySelector('.emergency-btn');
    
    if (hasEffects) {
      watermark.classList.remove('hidden');
      emergencyBtn.classList.add('visible');
      document.body.classList.add('ai-active');
    } else {
      watermark.classList.add('hidden');
      emergencyBtn.classList.remove('visible');
      document.body.classList.remove('ai-active');
    }
  },

  // Toast notifications
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕'
    };
    
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Safety logging (would connect to backend in production)
  logSafetyEvent(event, data) {
    const log = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.log('🔒 Safety Event:', log);
    
    // In production: fetch('/api/safety-log', {method: 'POST', body: JSON.stringify(log)})
    // Store locally for demo
    const logs = JSON.parse(localStorage.getItem('safety-logs') || '[]');
    logs.push(log);
    localStorage.setItem('safety-logs', JSON.stringify(logs.slice(-100))); // Keep last 100
  },

  // Verify integrity (mock)
  verifyIntegrity() {
    return {
      encrypted: true,
      aiActive: this.activeEffects.size > 0,
      timestamp: Date.now()
    };
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Safety.init());
// Add to Safety object:

// Fix: Check for motion preference before animations
respectsMotionPreference() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
},

// Fix: Proper focus management for modals
trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
  
  firstFocusable?.focus();
},

// Fix: Escape key to close modals
handleEscapeKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal[aria-hidden="false"]');
      if (modal) this.dismissConsent();
      
      const emergency = document.getElementById('emergency-exit');
      if (emergency?.classList.contains('active')) this.killAllEffects();
    }
  });
},

// Fix: Announce to screen readers
announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'visually-hidden';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
