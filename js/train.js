// ============================================================
// train.js - Train Interior Level & Moving Parallax World
// ============================================================
(function () {
  'use strict';

  class TrainWorld {
    constructor() {
      this.worldWidth = 6400; // 10 segments of 640px
      this.worldHeight = 360;
      this.groundY = 280;
      this.segmentWidth = 640;
      this.numSegments = 10;

      // Parallax landscape scrolling
      this.landscapeOffset = 0;
      this.trainSpeed = 80; // px/s scrolling speed for landscape through windows

      // Passengers / details in each segment
      this.passengers = [];
      this.initDecorations();
    }

    init() {
      this.landscapeOffset = 0;
      if (window.Game && window.Game.renderer) {
        window.Game.renderer.setWorldSize(this.worldWidth, this.worldHeight);
      }
    }

    initDecorations() {
      this.passengers = [];
      // Generate some sitting passengers across carriages
      for (let s = 0; s < this.numSegments - 1; s++) {
        const segX = s * this.segmentWidth;
        // 2-3 passengers per car
        if (s % 2 === 0) {
          this.passengers.push({ x: segX + 150, y: 220, shirtColor: '#2b5c8f', hat: false });
          this.passengers.push({ x: segX + 380, y: 220, shirtColor: '#e0c84f', hat: true });
        } else {
          this.passengers.push({ x: segX + 220, y: 220, shirtColor: '#4f8fe0', hat: false });
          this.passengers.push({ x: segX + 450, y: 220, shirtColor: '#3a7243', hat: true });
        }
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

      // Distant clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const cloudOffset = (this.landscapeOffset * 0.2) % 400;
      for (let cx = -cloudOffset; cx < G.WIDTH + 400; cx += 250) {
        ctx.beginPath();
        ctx.arc(cx, 75, 28, 0, Math.PI * 2);
        ctx.arc(cx + 25, 70, 35, 0, Math.PI * 2);
        ctx.arc(cx + 50, 75, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mountains (FONDO MONTAÑAS.png) parallax layer
      const mtnImg = imgs['fondo_montañas'];
      if (mtnImg && mtnImg.complete) {
        const mtnW = 640;
        const mtnH = 160;
        const mtnY = 50;
        const mtnScroll = (this.landscapeOffset * 0.6) % mtnW;
        for (let mx = -mtnScroll; mx < G.WIDTH + mtnW; mx += mtnW) {
          ctx.drawImage(mtnImg, mx, mtnY, mtnW, mtnH);
        }
      } else {
        // Fallback pixel art mountain ridges
        ctx.fillStyle = '#3a6678';
        ctx.beginPath();
        const mScroll = (this.landscapeOffset * 0.5) % 300;
        for (let x = -mScroll; x < G.WIDTH + 300; x += 150) {
          ctx.moveTo(x, 210);
          ctx.lineTo(x + 75, 90);
          ctx.lineTo(x + 150, 210);
        }
        ctx.fill();
      }

      // Fast-moving countryside trees and poles
      ctx.fillStyle = '#2d542e';
      const treeScroll = (this.landscapeOffset * 1.2) % 200;
      for (let tx = -treeScroll; tx < G.WIDTH + 200; tx += 120) {
        ctx.fillRect(tx, 160, 18, 50);
        ctx.beginPath();
        ctx.arc(tx + 9, 155, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 2. TRAIN INTERIOR ARCHITECTURE (per segment)
      // -------------------------------------------------------------
      const vagonImg = imgs['vagon_sin_fondo'];

      for (let s = startSeg; s <= endSeg; s++) {
        const segX = s * this.segmentWidth - cameraX;

        // Interior wall color (covers non-window areas)
        // Top roof area
        ctx.fillStyle = '#cfd3d8';
        ctx.fillRect(segX, 0, this.segmentWidth, 65);

        // Ceiling lights & luggage rack
        ctx.fillStyle = '#8f9398';
        ctx.fillRect(segX, 60, this.segmentWidth, 6);
        ctx.fillStyle = '#ffffcc';
        ctx.fillRect(segX + 100, 20, 80, 8);
        ctx.fillRect(segX + 320, 20, 80, 8);
        ctx.fillRect(segX + 500, 20, 80, 8);

        // Wall dividers between windows
        ctx.fillStyle = '#c0c5cc';
        ctx.fillRect(segX, 65, 30, 150);
        ctx.fillRect(segX + 170, 65, 40, 150);
        ctx.fillRect(segX + 350, 65, 40, 150);
        ctx.fillRect(segX + 530, 65, 40, 150);
        ctx.fillRect(segX + this.segmentWidth - 25, 65, 25, 150);

        // Window frames
        ctx.strokeStyle = '#5a626b';
        ctx.lineWidth = 4;
        ctx.strokeRect(segX + 30, 70, 140, 130);
        ctx.strokeRect(segX + 210, 70, 140, 130);
        ctx.strokeRect(segX + 390, 70, 140, 130);

        // Window glass tint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(segX + 30, 70, 140, 130);
        ctx.fillRect(segX + 210, 70, 140, 130);
        ctx.fillRect(segX + 390, 70, 140, 130);

        // Train seats (classic Italian FS train blue seats)
        this.renderSeats(ctx, segX + 45, 195);
        this.renderSeats(ctx, segX + 115, 195);
        this.renderSeats(ctx, segX + 225, 195);
        this.renderSeats(ctx, segX + 295, 195);
        this.renderSeats(ctx, segX + 405, 195);
        this.renderSeats(ctx, segX + 475, 195);

        // Wall bottom & floor
        ctx.fillStyle = '#6e747d';
        ctx.fillRect(segX, 215, this.segmentWidth, 65);

        // Floor texture (train linoleum)
        ctx.fillStyle = '#45484d';
        ctx.fillRect(segX, this.groundY, this.segmentWidth, this.worldHeight - this.groundY);
        ctx.fillStyle = '#36393d';
        ctx.fillRect(segX, this.groundY, this.segmentWidth, 4);

        // Floor yellow safety line
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(segX, this.groundY + 8, this.segmentWidth, 3);

        // Signage in carriage
        ctx.fillStyle = '#1a3263';
        ctx.fillRect(segX + 250, 42, 140, 16);
        ctx.fillStyle = '#ffdf00';
        ctx.font = 'bold 9px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CARROZZA ' + (s + 1) + ' • SPEZIA EXP', segX + 320, 53);

        // Inter-carriage doors
        ctx.fillStyle = '#78828c';
        ctx.fillRect(segX + this.segmentWidth - 12, 65, 24, 215);
        ctx.fillStyle = '#222';
        ctx.fillRect(segX + this.segmentWidth - 2, 70, 4, 210);

        // Draw Wagon PNG frame overlay if loaded
        if (vagonImg && vagonImg.complete) {
          ctx.drawImage(vagonImg, segX, 0, this.segmentWidth, this.worldHeight);
        }
      }

      // -------------------------------------------------------------
      // 3. PASSENGERS (Sitting in background seats)
      // -------------------------------------------------------------
      for (let i = 0; i < this.passengers.length; i++) {
        const p = this.passengers[i];
        const px = p.x - cameraX;
        if (px < -40 || px > G.WIDTH + 40) continue;

        // Passenger body
        ctx.fillStyle = p.shirtColor;
        ctx.fillRect(px, p.y + 12, 22, 25);
        // Head
        ctx.fillStyle = '#e8beac';
        ctx.fillRect(px + 4, p.y - 2, 14, 14);
        // Hair / Hat
        if (p.hat) {
          ctx.fillStyle = '#1a237e';
          ctx.fillRect(px + 2, p.y - 6, 18, 6);
        } else {
          ctx.fillStyle = '#4a2e18';
          ctx.fillRect(px + 3, p.y - 4, 16, 6);
        }
      }
    }

    renderSeats(ctx, x, y) {
      // Blue upholstered seat back
      ctx.fillStyle = '#1d4370';
      ctx.fillRect(x, y - 25, 32, 45);
      ctx.fillStyle = '#265791';
      ctx.fillRect(x + 2, y - 23, 28, 41);
      // Headrest (white antimacassar)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x + 4, y - 23, 24, 12);
      // Seat cushion
      ctx.fillStyle = '#173659';
      ctx.fillRect(x - 2, y + 20, 36, 15);
      // Metal leg
      ctx.fillStyle = '#888';
      ctx.fillRect(x + 12, y + 35, 6, 25);
    }
  }

  // Register
  window.Game = window.Game || {};
  window.Game.trainWorld = new TrainWorld();
  window.Game.TrainWorld = TrainWorld;
})();
