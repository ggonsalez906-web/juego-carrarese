// ============================================================
// map.js - Italy Map Animation: Carrara (Toscana) to La Spezia (Liguria)
// ============================================================
(function () {
  'use strict';

  class MapSequence {
    constructor() {
      this.reset();
    }

    reset() {
      this.timer = 0;
      this.duration = 4.5; // seconds total animation
      this.progress = 0; // 0 to 1
      this.fadeAlpha = 1; // start fading in from intro black
      this.fadingOut = false;

      // Coordinates on canvas (640x360) corresponding to Carrara & La Spezia
      // Northern Tyrrhenian coast (Liguria / Toscana border):
      // Carrara (Toscana): slightly south-east of La Spezia
      this.carrara = { x: 250, y: 155, name: 'CARRARA (Toscana)' };
      this.laSpezia = { x: 215, y: 135, name: 'LA SPEZIA (Liguria)' };
    }

    enter() {
      this.reset();
      this.fadeAlpha = 1;
      this.fadingOut = false;
      if (window.Game && window.Game.audio) {
        window.Game.audio.playMusic('game');
      }
    }

    exit() {}

    update(dt) {
      this.timer += dt;

      // Fade in at beginning
      if (this.fadeAlpha > 0 && !this.fadingOut) {
        this.fadeAlpha -= dt * 2;
        if (this.fadeAlpha < 0) this.fadeAlpha = 0;
      }

      // Progress along railway path
      this.progress = Math.min(1, this.timer / (this.duration - 1.0));

      // After travel completes, start fading out to train interior
      if (this.timer >= this.duration - 0.8 && !this.fadingOut) {
        this.fadingOut = true;
      }

      if (this.fadingOut) {
        this.fadeAlpha += dt * 2;
        if (this.fadeAlpha >= 1) {
          this.fadeAlpha = 1;
          const G = window.Game;
          if (G.stateManager) {
            G.stateManager.switch('PLAYING');
          }
        }
      }
    }

    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // 1. Draw Map Background (MAPA.png)
      const mapImg = imgs['mapa'];
      if (mapImg && mapImg.complete) {
        ctx.drawImage(mapImg, 0, 0, G.WIDTH, G.HEIGHT);
      } else {
        // Fallback stylized map of Italy
        ctx.fillStyle = '#1e3d59';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        // Sea / Land
        ctx.fillStyle = '#f5f0e1';
        ctx.fillRect(150, 40, 320, 280);
      }

      // Dark overlay around region to focus on Toscana & Liguria
      ctx.fillStyle = 'rgba(0, 15, 30, 0.4)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      // Highlight circle over La Spezia / Carrara border
      const highlightX = (this.carrara.x + this.laSpezia.x) / 2;
      const highlightY = (this.carrara.y + this.laSpezia.y) / 2;
      const radGrad = ctx.createRadialGradient(highlightX, highlightY, 15, highlightX, highlightY, 110);
      radGrad.addColorStop(0, 'rgba(255, 235, 59, 0.28)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(highlightX, highlightY, 110, 0, Math.PI * 2);
      ctx.fill();

      // Title & Route Box
      ctx.fillStyle = 'rgba(10, 25, 47, 0.9)';
      ctx.fillRect(G.WIDTH / 2 - 170, 10, 340, 42);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(G.WIDTH / 2 - 170, 10, 340, 42);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TRATTA FERROVIARIA: IL DERBY APUANO', G.WIDTH / 2, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('Carrara (Toscana) ➔ La Spezia (Liguria)', G.WIDTH / 2, 42);

      // 2. Draw Railway Track Line (Dotted track with ties)
      ctx.save();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.carrara.x, this.carrara.y);
      ctx.quadraticCurveTo(this.carrara.x - 10, this.laSpezia.y + 15, this.laSpezia.x, this.laSpezia.y);
      ctx.stroke();

      // Yellow track center line
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.carrara.x, this.carrara.y);
      ctx.quadraticCurveTo(this.carrara.x - 10, this.laSpezia.y + 15, this.laSpezia.x, this.laSpezia.y);
      ctx.stroke();
      ctx.restore();

      // 3. Draw Station Markers
      // Carrara (Start)
      ctx.fillStyle = '#0055ff';
      ctx.beginPath();
      ctx.arc(this.carrara.x, this.carrara.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('● CARRARA', this.carrara.x + 10, this.carrara.y + 3);

      // La Spezia (Destination)
      ctx.fillStyle = '#ff2222';
      ctx.beginPath();
      ctx.arc(this.laSpezia.x, this.laSpezia.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('LA SPEZIA ●', this.laSpezia.x - 10, this.laSpezia.y + 3);

      // 4. Little Animated Train along path
      // Calculate position on quadratic curve
      const t = this.progress;
      const p0 = this.carrara;
      const p1 = { x: this.carrara.x - 10, y: this.laSpezia.y + 15 };
      const p2 = this.laSpezia;

      const trainX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const trainY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

      // Train icon (Pixel art mini train)
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(trainX - 8, trainY - 5, 16, 10);
      ctx.fillStyle = '#0044aa';
      ctx.fillRect(trainX - 7, trainY - 4, 14, 4);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(trainX - 8, trainY + 2, 4, 3); // wheels
      ctx.fillRect(trainX + 4, trainY + 2, 4, 3);

      // Smoke puff behind train
      if (Math.sin(this.timer * 15) > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(trainX + 10, trainY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom information label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(G.WIDTH / 2 - 150, G.HEIGHT - 38, 300, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      const pct = Math.floor(this.progress * 100);
      ctx.fillText('VIAGGIO VERSO LO STADIO ALBERTO PICCO... ' + pct + '%', G.WIDTH / 2, G.HEIGHT - 21);

      // Fade overlay
      if (this.fadeAlpha > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + this.fadeAlpha.toFixed(2) + ')';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }
    }
  }

  // Register
  window.Game = window.Game || {};
  const mapSeq = new MapSequence();
  window.Game.mapSequence = mapSeq;
  window.Game.MapSequence = MapSequence;

  if (window.Game.stateManager) {
    window.Game.stateManager.register('MAP', mapSeq);
    window.Game.stateManager.register('MAP_TRANSITION', mapSeq);
    window.Game.stateManager.register('MAP_ANIMATION', mapSeq);
  }
})();
