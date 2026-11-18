// ============================================================
// controls.js - Keyboard and Touch Input Manager
// ============================================================
(function () {
  'use strict';

  class Controls {
    constructor() {
      this.keys = {};
      this.prevKeys = {};
      this.touchStates = {};
      this.touchPrevStates = {};

      // Key mappings
      this.keyMap = {
        'ArrowLeft': 'left',
        'KeyA': 'left',
        'a': 'left',
        'A': 'left',

        'ArrowRight': 'right',
        'KeyD': 'right',
        'd': 'right',
        'D': 'right',

        'ArrowUp': 'jump',
        'KeyW': 'jump',
        'w': 'jump',
        'W': 'jump',
        'Space': 'jump',
        ' ': 'jump',

        'KeyE': 'action',
        'e': 'action',
        'E': 'action',

        'KeyF': 'throw',
        'f': 'throw',
        'F': 'throw',

        'Escape': 'pause',
        'KeyP': 'pause',
        'p': 'pause',
        'P': 'pause'
      };

      this.initKeyboard();
      this.initTouch();
    }

    initKeyboard() {
      window.addEventListener('keydown', (e) => {
        const action = this.keyMap[e.code] || this.keyMap[e.key];
        if (action) {
          // Prevent default scrolling for space and arrow keys
          if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || e.key === ' ') {
            e.preventDefault();
          }
          this.keys[action] = true;
        }
      });

      window.addEventListener('keyup', (e) => {
        const action = this.keyMap[e.code] || this.keyMap[e.key];
        if (action) {
          this.keys[action] = false;
        }
      });

      // Clear on blur
      window.addEventListener('blur', () => {
        this.keys = {};
        this.prevKeys = {};
      });
    }

    initTouch() {
      // Connect existing touch buttons in HTML
      const setupButton = (id, action) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e) => {
          e.preventDefault();
          btn.classList.add('pressed');
          this.touchStates[action] = true;
          // Resume AudioContext if suspended
          if (window.Game && window.Game.audio && window.Game.audio.ctx && window.Game.audio.ctx.state === 'suspended') {
            window.Game.audio.ctx.resume();
          }
        };

        const end = (e) => {
          e.preventDefault();
          btn.classList.remove('pressed');
          this.touchStates[action] = false;
        };

        btn.addEventListener('touchstart', start, { passive: false });
        btn.addEventListener('touchend', end, { passive: false });
        btn.addEventListener('touchcancel', end, { passive: false });
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
      };

      // Wait for DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setupButton('btn-left', 'left');
          setupButton('btn-right', 'right');
          setupButton('btn-jump', 'jump');
          setupButton('btn-action', 'action');
          setupButton('btn-throw', 'throw');
        });
      } else {
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
        setupButton('btn-action', 'action');
        setupButton('btn-throw', 'throw');
      }
    }

    // Call at end of each frame
    update() {
      this.prevKeys = Object.assign({}, this.keys);
      this.touchPrevStates = Object.assign({}, this.touchStates);
    }

    // Is action held down right now?
    isDown(action) {
      return !!(this.keys[action] || this.touchStates[action]);
    }

    // Was action pressed this exact frame?
    justPressed(action) {
      const current = this.keys[action] || this.touchStates[action];
      const previous = this.prevKeys[action] || this.touchPrevStates[action];
      return !!(current && !previous);
    }

    // Was action released this exact frame?
    justReleased(action) {
      const current = this.keys[action] || this.touchStates[action];
      const previous = this.prevKeys[action] || this.touchPrevStates[action];
      return !!(!current && previous);
    }
  }

  // Register
  window.Game = window.Game || {};
  window.Game.controls = new Controls();
  window.Game.Controls = Controls;
})();
