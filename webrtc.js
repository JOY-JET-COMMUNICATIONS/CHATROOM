/**
 * WebRTC / Call Module
 * Handles video calls with safety controls
 */

const Call = {
  localStream: null,
  remoteStream: null,
  currentEffect: 'none',
  aiEnabled: false,
  
  init() {
    console.log('📹 WebRTC module initialized');
  },

  async startVideoCall() {
    App.showScreen('call');
    
    try {
      // Get local media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      const localVideo = document.getElementById('local-video');
      localVideo.srcObject = this.localStream;
      
      // Hide placeholder
      document.getElementById('remote-placeholder').style.display = 'none';
      
      // Simulate remote connection (demo)
      setTimeout(() => {
        Safety.showToast('Connected to Sarah Chen', 'success');
      }, 1500);
      
    } catch (err) {
      console.error('Camera access denied:', err);
      Safety.showToast('Camera access required for video calls', 'error');
    }
  },

  startVoiceCall() {
    Safety.showToast('Voice call started (audio only)', 'info');
    // Similar to video but without video tracks
  },

  endCall() {
    // Stop streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Reset UI
    document.getElementById('local-video').srcObject = null;
    document.getElementById('remote-placeholder').style.display = 'flex';
    
    // Kill any AI effects
    Safety.killAllEffects();
    
    App.showScreen('conversations');
  },

  toggleMic() {
    if (!this.localStream) return;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const btn = document.getElementById('btn-mic');
      btn.classList.toggle('muted', !audioTrack.enabled);
      Safety.showToast(audioTrack.enabled ? 'Microphone on' : 'Microphone muted', 'info');
    }
  },

  toggleCamera() {
    if (!this.localStream) return;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const btn = document.getElementById('btn-camera');
      btn.classList.toggle('off', !videoTrack.enabled);
      
      // Hide local video preview if off
      document.getElementById('video-local').style.opacity = videoTrack.enabled ? '1' : '0.5';
    }
  },

  flipCamera() {
    Safety.showToast('Camera flipped', 'info');
    // In real implementation: switch camera facingMode
  },

  toggleEffectsPanel() {
    const panel = document.getElementById('effects-panel');
    panel.classList.toggle('open');
    
    const btn = document.querySelector('.btn-effects');
    btn.classList.toggle('active', panel.classList.contains('open'));
  },

  setEffect(effect) {
    // Basic filters (safe)
    this.currentEffect = effect;
    
    // Update UI
    document.querySelectorAll('.effect-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.toLowerCase().includes(effect) || 
          (effect === 'none' && btn.textContent.includes('None'))) {
        btn.classList.add('active');
      }
    });
    
    // Apply visual filter to local video
    const video = document.getElementById('local-video');
    const filters = {
      'none': 'none',
      'brightness': 'brightness(1.2) contrast(1.1)',
      'warm': 'sepia(0.3) saturate(1.2)'
    };
    
    video.style.filter = filters[effect] || 'none';
    
    if (effect !== 'none') {
      Safety.showToast(`Filter applied: ${effect}`, 'info');
    }
  },

  enableAIEffect(type) {
    // This requires consent already checked
    if (type === 'avatar') {
      Safety.registerEffect('avatar');
      Safety.showToast('Avatar mode active - Watermark visible', 'warning');
      
      // Apply blur/pixelation to simulate avatar (demo)
      const video = document.getElementById('local-video');
      video.style.filter = 'blur(8px) contrast(1.2)';
    } else if (type === 'voice') {
      Safety.registerEffect('voice');
      Safety.showToast('Voice stylization active', 'warning');
    }
    
    this.aiEnabled = true;
  },

  disableAIEffects() {
    this.aiEnabled = false;
    const video = document.getElementById('local-video');
    video.style.filter = 'none';
    this.setEffect(this.currentEffect); // Restore basic filter if any
  }
};
