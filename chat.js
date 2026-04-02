/**
 * Chat Module
 * Handles messaging, voice recording, and UI interactions
 */

const Chat = {
  currentChat: null,
  messages: [],
  
  init() {
    this.setupEventListeners();
    console.log('💬 Chat module initialized');
  },

  setupEventListeners() {
    // Enter key to send
    const input = document.getElementById('message-input');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  openChat(contactId) {
    this.currentChat = contactId;
    
    // Update header
    const names = {
      'sarah': 'Sarah Chen',
      'marcus': 'Marcus Johnson',
      'fire-alarm': 'Fire Alarm 🚨'
    };
    
    document.getElementById('chat-name').textContent = names[contactId] || contactId;
    
    // Show screen
    App.showScreen('chat');
    
    // Scroll to bottom
    setTimeout(() => {
      const container = document.getElementById('chat-messages');
      container.scrollTop = container.scrollHeight;
    }, 100);
  },

  sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Add message to UI
    this.addMessage({
      text: text,
      sent: true,
      timestamp: new Date(),
      status: 'sent'
    });
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Simulate reply for demo
    if (this.currentChat === 'sarah') {
      setTimeout(() => {
        this.addMessage({
          text: "Sounds great! Looking forward to seeing the new design.",
          sent: false,
          timestamp: new Date(),
          sender: 'Sarah Chen'
        });
      }, 2000);
    }
  },

  addMessage(msg) {
    const container = document.getElementById('chat-messages');
    
    if (msg.sent) {
      // Sent message
      const html = `
        <div class="message-group sent">
          <div class="message-bubbles">
            <div class="message">
              <div class="message-content">${this.escapeHtml(msg.text)}</div>
              <div class="message-meta">
                <span class="timestamp">${this.formatTime(msg.timestamp)}</span>
                <span class="read-receipt">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    } else {
      // Received message
      const html = `
        <div class="message-group received">
          <div class="message-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2300D9FF'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='%230A0E27'%3ES%3C/text%3E%3C/svg%3E" alt="${msg.sender}">
          </div>
          <div class="message-bubbles">
            <div class="message">
              <div class="message-content">${this.escapeHtml(msg.text)}</div>
              <div class="message-meta">
                <span class="timestamp">${this.formatTime(msg.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    }
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  },

  toggleAttachments() {
    const menu = document.getElementById('attachment-menu');
    menu.classList.toggle('open');
  },

  attachFile() {
    Safety.showToast('File upload would open here', 'info');
    this.toggleAttachments();
  },

  attachPhoto() {
    Safety.showToast('Camera/Gallery would open here', 'info');
    this.toggleAttachments();
  },

  recordVoice() {
    this.toggleAttachments();
    
    // Simulate voice recording UI
    const container = document.getElementById('chat-messages');
    const id = 'voice-' + Date.now();
    
    const html = `
      <div class="message-group sent">
        <div class="message-bubbles">
          <div class="message">
            <div class="message-content voice-message" id="${id}">
              <button class="voice-play" onclick="Chat.toggleVoice(this)">
                <span class="play-icon">▶</span>
              </button>
              <div class="waveform">
                ${Array(20).fill('<div class="waveform-bar"></div>').join('')}
              </div>
              <span class="voice-duration">0:04</span>
            </div>
            <div class="message-meta">
              <span class="timestamp">${this.formatTime(new Date())}</span>
              <span class="read-receipt">✓</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
  },

  toggleVoice(btn) {
    const icon = btn.querySelector('.play-icon');
    const isPlaying = icon.textContent === '⏸';
    
    if (isPlaying) {
      icon.textContent = '▶';
      btn.parentElement.classList.remove('playing');
    } else {
      icon.textContent = '⏸';
      btn.parentElement.classList.add('playing');
      
      // Auto stop after 4s (demo)
      setTimeout(() => {
        icon.textContent = '▶';
        btn.parentElement.classList.remove('playing');
      }, 4000);
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};
