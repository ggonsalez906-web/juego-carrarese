// ============================================================
// audio.js - Web Audio API procedural sound & chiptune music system
// ============================================================
(function () {
  'use strict';

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.sfxVolume = 0.7;
      this.musicVolume = 0.5;
      this.muted = false;
      this.currentTrack = null;
      this.musicInterval = null;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.initialized = true;
        }
      } catch (e) {
        console.warn('Web Audio not supported:', e);
      }
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setSFXVolume(val) {
      this.sfxVolume = Math.max(0, Math.min(1, val));
    }

    setMusicVolume(val) {
      this.musicVolume = Math.max(0, Math.min(1, val));
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    // --- Procedural Sound Effects ---
    playSound(name) {
      if (this.muted) return;
      this.resume();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const vol = this.sfxVolume;

      switch (name) {
        case 'jump': {
          // Ascending pitch glide
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
          gain.gain.setValueAtTime(0.2 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
          break;
        }

        case 'land': {
          // Low thud
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
          gain.gain.setValueAtTime(0.3 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        case 'pickup': {
          // Bright coin chime (two high tones)
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, t); // D5
          gain1.gain.setValueAtTime(0.25 * vol, t);
          gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc1.connect(gain1);
          gain1.connect(this.ctx.destination);
          osc1.start(t);
          osc1.stop(t + 0.1);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, t + 0.08); // A5
          gain2.gain.setValueAtTime(0.25 * vol, t + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(t + 0.08);
          osc2.stop(t + 0.25);
          break;
        }

        case 'equip': {
          // Fanfare triple arpeggio
          const notes = [440, 554.37, 659.25, 880];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.07);
            gain.gain.setValueAtTime(0.3 * vol, t + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + idx * 0.07);
            osc.stop(t + idx * 0.07 + 0.2);
          });
          break;
        }

        case 'throw': {
          // Swoosh noise
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
          gain.gain.setValueAtTime(0.25 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
          break;
        }

        case 'hit': {
          // Impact noise + low buzz
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.linearRampToValueAtTime(50, t + 0.2);
          gain.gain.setValueAtTime(0.35 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.2);
          break;
        }

        case 'boss_hit': {
          // Heavy smash
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);
          gain.gain.setValueAtTime(0.4 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        }

        case 'train_horn': {
          // Italian train dual horn
          [349.23, 440].forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2 * vol, t);
            gain.gain.setValueAtTime(0.2 * vol, t + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.1);
          });
          break;
        }

        case 'victory': {
          // Victory triumphant melody
          const fanfare = [
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.4 },
            { f: 587.33, d: 0.2 },
            { f: 659.25, d: 0.2 },
            { f: 783.99, d: 0.6 }
          ];
          let curTime = t;
          fanfare.forEach((n) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, curTime);
            gain.gain.setValueAtTime(0.3 * vol, curTime);
            gain.gain.exponentialRampToValueAtTime(0.01, curTime + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(curTime);
            osc.stop(curTime + n.d);
            curTime += n.d + 0.04;
          });
          break;
        }

        case 'button': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, t);
          gain.gain.setValueAtTime(0.15 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }
      }
    }

    // --- Procedural Chiptune Music Generator ---
    playMusic(trackName) {
      if (this.currentTrack === trackName) return;
      this.stopMusic();
      this.currentTrack = trackName;
      this.resume();
      if (!this.ctx || this.muted) return;

      let tempo = 140;
      let notes = [];

      if (trackName === 'menu') {
        // Cheerful Italian march style in G major
        tempo = 120;
        notes = [
          392, 392, 440, 493.88, 523.25, 493.88, 440, 392,
          329.63, 392, 440, 493.88, 440, 392, 329.63, 293.66,
          392, 392, 440, 493.88, 523.25, 587.33, 523.25, 493.88,
          440, 392, 369.99, 392, 440, 392, 392, 0
        ];
      } else if (trackName === 'game') {
        // Driving arcade rail journey rhythm
        tempo = 150;
        notes = [
          261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 196,
          220, 261.63, 329.63, 440, 329.63, 261.63, 220, 196,
          246.94, 293.66, 369.99, 493.88, 369.99, 293.66, 246.94, 196,
          261.63, 329.63, 392, 523.25, 587.33, 523.25, 392, 0
        ];
      } else if (trackName === 'boss') {
        // Fast, intense, dramatic boss theme
        tempo = 165;
        notes = [
          220, 220, 246.94, 261.63, 220, 293.66, 261.63, 246.94,
          220, 220, 329.63, 311.13, 293.66, 261.63, 246.94, 207.65,
          220, 261.63, 329.63, 440, 415.3, 392, 369.99, 329.63,
          293.66, 261.63, 246.94, 220, 207.65, 220, 246.94, 220
        ];
      } else if (trackName === 'stadium') {
        // Stadium football chant rhythm
        tempo = 110;
        notes = [
          392, 392, 392, 440, 493.88, 0, 493.88, 440,
          392, 0, 392, 392, 440, 493.88, 440, 0,
          392, 392, 392, 440, 493.88, 0, 523.25, 493.88,
          440, 392, 440, 0, 392, 0, 0, 0
        ];
      }

      const noteDuration = 60 / tempo / 2;
      let step = 0;

      this.musicInterval = setInterval(() => {
        if (this.muted || !this.ctx) return;
        const freq = notes[step % notes.length];
        step++;

        if (freq > 0) {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t);

          const vol = this.musicVolume * 0.12;
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.85);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + noteDuration * 0.9);

          // Add simple bass note every 2 steps
          if (step % 2 === 0) {
            const bass = this.ctx.createOscillator();
            const bgain = this.ctx.createGain();
            bass.type = 'triangle';
            bass.frequency.setValueAtTime(freq / 2, t);
            bgain.gain.setValueAtTime(vol * 1.5, t);
            bgain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 1.5);
            bass.connect(bgain);
            bgain.connect(this.ctx.destination);
            bass.start(t);
            bass.stop(t + noteDuration * 1.5);
          }
        }
      }, noteDuration * 1000);
    }

    stopMusic() {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.currentTrack = null;
    }
  }

  // Register
  window.Game = window.Game || {};
  window.Game.audio = new AudioManager();
  window.Game.AudioManager = AudioManager;
})();
