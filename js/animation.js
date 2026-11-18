// ============================================================
// animation.js - Spritesheet animation system (individual PNGs)
// ============================================================
(function () {
  'use strict';

  class AnimationController {
    /**
     * @param {Image[]} frames - Array of Image objects (individual PNG frames)
     * @param {number} frameTime - Seconds per frame
     * @param {boolean} loop - Whether to loop
     * @param {Function} [onComplete] - Called when a non-looping animation finishes
     */
    constructor(frames, frameTime, loop, onComplete) {
      this.frames = frames || [];
      this.frameTime = frameTime || 0.15;
      this.loop = (loop !== undefined) ? loop : true;
      this.onComplete = onComplete || null;

      this.currentFrame = 0;
      this.elapsed = 0;
      this.finished = false;
      this.paused = false;
    }

    reset() {
      this.currentFrame = 0;
      this.elapsed = 0;
      this.finished = false;
    }

    setFrames(frames, frameTime) {
      if (this.frames === frames) return; // Same animation, no reset
      this.frames = frames || [];
      if (frameTime !== undefined) this.frameTime = frameTime;
      this.reset();
    }

    update(dt) {
      if (this.paused || this.finished || this.frames.length <= 1) return;

      this.elapsed += dt;

      while (this.elapsed >= this.frameTime) {
        this.elapsed -= this.frameTime;
        this.currentFrame++;

        if (this.currentFrame >= this.frames.length) {
          if (this.loop) {
            this.currentFrame = 0;
          } else {
            this.currentFrame = this.frames.length - 1;
            this.finished = true;
            if (this.onComplete) {
              this.onComplete();
            }
            return;
          }
        }
      }
    }

    getCurrentFrame() {
      if (this.frames.length === 0) return null;
      return this.frames[this.currentFrame] || null;
    }

    getFrameIndex() {
      return this.currentFrame;
    }

    isFinished() {
      return this.finished;
    }

    setOnComplete(cb) {
      this.onComplete = cb;
    }
  }

  /**
   * AnimationSet manages multiple named animations for an entity.
   */
  class AnimationSet {
    constructor() {
      this.animations = {};
      this.current = null;
      this.currentName = '';
    }

    /**
     * Add a named animation.
     * @param {string} name
     * @param {Image[]} frames
     * @param {number} frameTime
     * @param {boolean} loop
     */
    add(name, frames, frameTime, loop) {
      this.animations[name] = { frames, frameTime: frameTime || 0.15, loop: (loop !== undefined) ? loop : true };
    }

    /**
     * Play a named animation. If already playing, does nothing.
     * @param {string} name
     * @param {Function} [onComplete]
     * @returns {AnimationController}
     */
    play(name, onComplete) {
      if (this.currentName === name && this.current && !this.current.finished) {
        return this.current;
      }
      const anim = this.animations[name];
      if (!anim) {
        console.warn('AnimationSet: unknown animation "' + name + '"');
        return this.current;
      }
      this.currentName = name;
      this.current = new AnimationController(anim.frames, anim.frameTime, anim.loop, onComplete);
      return this.current;
    }

    /**
     * Force replay even if same animation.
     */
    forcePlay(name, onComplete) {
      this.currentName = '';
      return this.play(name, onComplete);
    }

    update(dt) {
      if (this.current) {
        this.current.update(dt);
      }
    }

    getCurrentFrame() {
      return this.current ? this.current.getCurrentFrame() : null;
    }

    isFinished() {
      return this.current ? this.current.isFinished() : true;
    }
  }

  // Expose
  window.Game = window.Game || {};
  window.Game.AnimationController = AnimationController;
  window.Game.AnimationSet = AnimationSet;
})();
