// ============================================================
// train.js - Train Interior Level & Moving Parallax World
// ============================================================
(function () {
  'use strict';

  class TrainWorld {
    constructor() {
      this.worldWidth = 6400; // 10 segments of 640px
      this.worldHeight = 360;
      this.groundY = 325; // Floor level of the train wagon
      this.segmentWidth = 640;
      this.numSegments = 10;

      // Parallax landscape scrolling
      this.landscapeOffset = 0;
      this.trainSpeed = 90; // px/s scrolling speed for landscape through windows
    }

    init() {
      this.landscapeOffset = 0;
      this.groundY = 325;
      if (window.Game && window.Game.renderer) {
        window.Game.renderer.setWorldSize(this.worldWidth, this.worldHeight);
      }
    }

    update(dt) {
      // Landscape scrolls continuously to give sensation of high speed train
      this.landscapeOffset += this.trainSpeed * dt;

      // Camera smoothly tracks player
      const G = window.Game;
      if (G.player && G.renderer) {
        G.renderer.followTarget(G.player, dt);
      }
    }

    render(ctx) {
      const G = window.Game;
      const cameraX = (G.renderer && G.renderer.cameraX) ? G.renderer.cameraX : 0;
      const imgs = G.assets.images;

      // Visible range in world coordinates
      const startSeg = Math.max(0, Math.floor((cameraX - 100) / this.segmentWidth));
      const endSeg = Math.min(this.numSegments - 1, Math.floor((cameraX + G.WIDTH + 100) / this.segmentWidth));

      // -------------------------------------------------------------
      // 1. BACKDROP & PARALLAX MOUNTAINS (visible through windows)
      // -------------------------------------------------------------
      // Sky through windows
      ctx.fillStyle = '#6bb0d9';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      // Mountains (FONDO MONTAÑAS.png) parallax layer
      const mtnImg = imgs['fondo_montañas'];
      if (mtnImg && mtnImg.complete) {
        const mtnW = 640;
        const mtnH = 175;
        const mtnY = 40;
        const mtnScroll = (this.landscapeOffset * 0.55) % mtnW;
        for (let mx = -mtnScroll; mx < G.WIDTH + mtnW; mx += mtnW) {
          ctx.drawImage(mtnImg, mx, mtnY, mtnW, mtnH);
        }
      }

      // -------------------------------------------------------------
      // 2. AUTHENTIC TRAIN INTERIOR (VAGON SIN FONDO.png)
      // -------------------------------------------------------------
      const vagonImg = imgs['vagon_sin_fondo'];

      for (let s = startSeg; s <= endSeg; s++) {
        const segX = s * this.segmentWidth - cameraX;

        if (vagonImg && vagonImg.complete) {
          // Crop source to remove transparent top/bottom letterboxing (y: 176 to 909)
          // so the wagon fills the screen from top to floor
          ctx.drawImage(vagonImg, 0, 176, 1536, 733, segX, 0, this.segmentWidth, this.worldHeight);
        } else {
          // Minimal fallback
          ctx.fillStyle = '#223344';
          ctx.fillRect(segX, 0, this.segmentWidth, 60);
          ctx.fillRect(segX, this.groundY, this.segmentWidth, this.worldHeight - this.groundY);
        }
      }
    }
  }

  // Register
  window.Game = window.Game || {};
  window.Game.trainWorld = new TrainWorld();
  window.Game.TrainWorld = TrainWorld;
})();
