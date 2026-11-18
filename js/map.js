// ============================================================
// map.js - Italy Map: Carrara (Toscana) to La Spezia (Liguria)
// ============================================================
(function () {
  'use strict';

  class MapSequence {
    constructor() {
      this.reset();
    }

    reset() {
      this.timer = 0;
      this.duration = 3.5; // Displays for 3.5 seconds without animations
    }

    enter() {
      this.reset();
      if (window.Game && window.Game.audio) {
        window.Game.audio.playMusic('game');
      }
    }

    exit() {}

    update(dt) {
      this.timer += dt;

      // When time elapses, transition directly to the train interior
      if (this.timer >= this.duration) {
        const G = window.Game;
        if (G.stateManager) {
          G.stateManager.switch('PLAYING');
        }
      }
    }

    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // 1. Imagen del Mapa (MAPA.png)
      const mapImg = imgs['mapa'];
      if (mapImg && mapImg.complete) {
        ctx.drawImage(mapImg, 0, 0, G.WIDTH, G.HEIGHT);
      } else {
        ctx.fillStyle = '#1e3d59';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }

      // 2. Solo el Texto informativo oficial (sin animaciones)
      ctx.fillStyle = 'rgba(10, 25, 47, 0.88)';
      ctx.fillRect(G.WIDTH / 2 - 170, 16, 340, 44);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(G.WIDTH / 2 - 170, 16, 340, 44);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TRATTA FERROVIARIA: IL DERBY APUANO', G.WIDTH / 2, 33);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('Carrara (Toscana) ➔ La Spezia (Liguria)', G.WIDTH / 2, 49);
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
