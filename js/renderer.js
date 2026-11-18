// ============================================================
// renderer.js - Canvas 2D rendering utilities & camera system
// ============================================================
(function () {
  'use strict';

  class Renderer {
    constructor() {
      // Camera
      this.cameraX = 0;
      this.cameraY = 0;
      this.cameraTargetX = 0;
      this.cameraTargetY = 0;
      this.cameraSmoothing = 0.1;

      // World bounds
      this.worldWidth = 2560;   // default, overridden per level
      this.worldHeight = 360;

      // Parallax layers: array of {image, speedX, speedY, y, scale}
      this.parallaxLayers = [];

      // Shake
      this.shakeIntensity = 0;
      this.shakeDuration = 0;
      this.shakeTimer = 0;

      // Fade
      this.fadeAlpha = 0;
      this.fadeTarget = 0;
      this.fadeSpeed = 2;
    }

    setWorldSize(w, h) {
      this.worldWidth = w;
      this.worldHeight = h;
    }

    addParallaxLayer(image, speedX, speedY, y, scale) {
      this.parallaxLayers.push({ image, speedX: speedX || 0.3, speedY: speedY || 0, y: y || 0, scale: scale || 1 });
    }

    clearParallaxLayers() {
      this.parallaxLayers = [];
    }

    // Follow target entity
    followTarget(target, dt) {
      if (!target) return;
      const G = window.Game;
      this.cameraTargetX = target.x + (target.width || 0) / 2 - G.WIDTH / 2;
      this.cameraTargetY = target.y + (target.height || 0) / 2 - G.HEIGHT / 2;

      // Clamp to world
      this.cameraTargetX = Math.max(0, Math.min(this.cameraTargetX, this.worldWidth - G.WIDTH));
      this.cameraTargetY = Math.max(0, Math.min(this.cameraTargetY, this.worldHeight - G.HEIGHT));

      // Smooth interpolation
      this.cameraX += (this.cameraTargetX - this.cameraX) * this.cameraSmoothing;
      this.cameraY += (this.cameraTargetY - this.cameraY) * this.cameraSmoothing;
    }

    setCameraPosition(x, y) {
      this.cameraX = x;
      this.cameraY = y;
      this.cameraTargetX = x;
      this.cameraTargetY = y;
    }

    // Screen shake
    shake(intensity, duration) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeTimer = 0;
    }

    // Fade in/out
    fadeIn(speed) {
      this.fadeAlpha = 1;
      this.fadeTarget = 0;
      this.fadeSpeed = speed || 2;
    }

    fadeOut(speed) {
      this.fadeAlpha = 0;
      this.fadeTarget = 1;
      this.fadeSpeed = speed || 2;
    }

    updateEffects(dt) {
      // Shake
      if (this.shakeTimer < this.shakeDuration) {
        this.shakeTimer += dt;
      } else {
        this.shakeIntensity = 0;
      }

      // Fade
      if (this.fadeAlpha < this.fadeTarget) {
        this.fadeAlpha = Math.min(this.fadeAlpha + this.fadeSpeed * dt, this.fadeTarget);
      } else if (this.fadeAlpha > this.fadeTarget) {
        this.fadeAlpha = Math.max(this.fadeAlpha - this.fadeSpeed * dt, this.fadeTarget);
      }
    }

    // Begin rendering frame with camera transform
    beginFrame(ctx) {
      const G = window.Game;
      ctx.save();

      // Apply shake
      let offsetX = 0, offsetY = 0;
      if (this.shakeIntensity > 0 && this.shakeTimer < this.shakeDuration) {
        offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
        offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      }

      ctx.translate(-Math.round(this.cameraX) + offsetX, -Math.round(this.cameraY) + offsetY);
    }

    endFrame(ctx) {
      ctx.restore();

      // Draw fade overlay
      if (this.fadeAlpha > 0.01) {
        const G = window.Game;
        ctx.fillStyle = 'rgba(0, 0, 0, ' + this.fadeAlpha.toFixed(3) + ')';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }
    }

    // Draw parallax backgrounds (call BEFORE beginFrame camera translate)
    drawParallax(ctx) {
      const G = window.Game;
      for (let i = 0; i < this.parallaxLayers.length; i++) {
        const layer = this.parallaxLayers[i];
        if (!layer.image || !layer.image.complete) continue;

        const parallaxX = this.cameraX * layer.speedX;
        const parallaxY = this.cameraY * (layer.speedY || 0);
        const imgW = layer.image.width * layer.scale;
        const imgH = layer.image.height * layer.scale;

        // Tile horizontally
        const startX = -(parallaxX % imgW);
        for (let x = startX; x < G.WIDTH; x += imgW) {
          ctx.drawImage(layer.image, x, layer.y - parallaxY, imgW, imgH);
        }
        // Fill left gap
        if (startX > 0) {
          ctx.drawImage(layer.image, startX - imgW, layer.y - parallaxY, imgW, imgH);
        }
      }
    }

    // --- Utility Drawing Functions ---

    // Draw a sprite with optional horizontal flip
    drawSprite(ctx, img, x, y, w, h, flip) {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      w = w || img.width;
      h = h || img.height;

      if (flip) {
        ctx.save();
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    // Draw a health / energy bar
    drawBar(ctx, x, y, w, h, pct, color, bgColor) {
      pct = Math.max(0, Math.min(1, pct));
      bgColor = bgColor || '#333';

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);

      // Fill
      ctx.fillStyle = color || '#0f0';
      ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);

      // Border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }

    // Draw text with shadow
    drawText(ctx, text, x, y, font, color, align, shadowColor) {
      ctx.font = font || '16px "Courier New", monospace';
      ctx.textAlign = align || 'left';
      ctx.textBaseline = 'top';

      if (shadowColor) {
        ctx.fillStyle = shadowColor;
        ctx.fillText(text, x + 1, y + 1);
      }

      ctx.fillStyle = color || '#fff';
      ctx.fillText(text, x, y);
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(sx, sy) {
      return {
        x: sx + this.cameraX,
        y: sy + this.cameraY
      };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(wx, wy) {
      return {
        x: wx - this.cameraX,
        y: wy - this.cameraY
      };
    }

    // Check if a world-space rect is visible on screen
    isVisible(x, y, w, h) {
      const G = window.Game;
      return (
        x + w > this.cameraX &&
        x < this.cameraX + G.WIDTH &&
        y + h > this.cameraY &&
        y < this.cameraY + G.HEIGHT
      );
    }
  }

  // Expose
  window.Game = window.Game || {};
  window.Game.renderer = new Renderer();
  window.Game.Renderer = Renderer;
})();
