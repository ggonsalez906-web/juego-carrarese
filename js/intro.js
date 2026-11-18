// ============================================================
// intro.js - Train Arrival Sequence at Carrara Station
// ============================================================
(function () {
  'use strict';

  class IntroSequence {
    constructor() {
      this.reset();
    }

    reset() {
      this.substate = 'INTRO_START';
      // State timer
      this.timer = 0;

      // Train motion variables
      this.trainWidth = 540;
      this.trainHeight = 150;
      this.trainY = 178;

      // Start offscreen to the right
      this.trainX = 640 + 40;
      this.targetX = 45; // Exact stop position at station platform
      this.initialSpeed = 240; // px/s
      this.speed = this.initialSpeed;

      // Door animation state
      this.doorState = 'closed'; // closed, semi, open
      this.doorTimer = 0;

      // Transition fade
      this.fadeAlpha = 0;
    }

    enter() {
      this.reset();
      this.substate = 'TRAIN_ENTERING';
      if (window.Game && window.Game.audio) {
        window.Game.audio.stopMusic();
        window.Game.audio.playSound('train_horn');
      }
    }

    exit() {}

    update(dt) {
      this.timer += dt;

      switch (this.substate) {
        case 'TRAIN_ENTERING': {
          // Move from right towards deceleration zone
          this.trainX -= this.speed * dt;

          // When within 220px of target, start decelerating
          if (this.trainX - this.targetX < 240) {
            this.substate = 'TRAIN_DECELERATING';
          }
          break;
        }

        case 'TRAIN_DECELERATING': {
          // Smooth deceleration easing towards targetX
          const distance = this.trainX - this.targetX;
          this.speed = Math.max(15, distance * 1.8);
          this.trainX -= this.speed * dt;

          if (this.trainX <= this.targetX + 1) {
            this.trainX = this.targetX;
            this.substate = 'TRAIN_STOPPED';
            this.timer = 0;
            if (window.Game && window.Game.audio) {
              window.Game.audio.playSound('land');
            }
          }
          break;
        }

        case 'TRAIN_STOPPED': {
          // Train is at rest, open the doors sequentially
          this.doorTimer += dt;
          if (this.doorTimer > 0.8 && this.doorState === 'closed') {
            this.doorState = 'semi';
          } else if (this.doorTimer > 1.4 && this.doorState === 'semi') {
            this.doorState = 'open';
          } else if (this.doorTimer > 2.5) {
            this.substate = 'MAP_TRANSITION';
            this.timer = 0;
          }
          break;
        }

        case 'MAP_TRANSITION': {
          // Fade to black then switch state to MAP
          this.fadeAlpha += dt * 1.8;
          if (this.fadeAlpha >= 1) {
            this.fadeAlpha = 1;
            const G = window.Game;
            if (G.stateManager) {
              G.stateManager.switch('MAP');
            }
          }
          break;
        }
      }
    }

    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // 1. Draw Station Background (ESTACION CARRARESE)
      const stationImg = imgs['estacion_carrarese'] || imgs['ejemplo_estacion_de_tren_1'];
      if (stationImg && stationImg.complete) {
        ctx.drawImage(stationImg, 0, 0, G.WIDTH, G.HEIGHT);
      } else {
        // Fallback station art
        ctx.fillStyle = '#4a6572';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
        ctx.fillStyle = '#f9aa33';
        ctx.fillRect(0, 240, G.WIDTH, 120);
      }

      // Station banner / text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(G.WIDTH / 2 - 140, 12, 280, 26);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.strokeRect(G.WIDTH / 2 - 140, 12, 280, 26);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STAZIONE DI CARRARA', G.WIDTH / 2, 29);

      // 2. Draw Train Sprite based on door state
      let trainImg = imgs['tren_puerta_cerrada_'] || imgs['tren_puerta_cerrada'];

      if (this.doorState === 'semi' && (imgs['tren_puerta_semiabierta'] || trainImg)) {
        trainImg = imgs['tren_puerta_semiabierta'] || trainImg;
      } else if (this.doorState === 'open' && (imgs['tren_puerta_abierta'] || trainImg)) {
        trainImg = imgs['tren_puerta_abierta'] || trainImg;
      }

      if (trainImg && trainImg.complete) {
        ctx.drawImage(trainImg, this.trainX, this.trainY, this.trainWidth, this.trainHeight);
      } else {
        // Fallback train silhouette
        ctx.fillStyle = '#1a3a60';
        ctx.fillRect(this.trainX, this.trainY, this.trainWidth, this.trainHeight);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.trainX, this.trainY + 40, this.trainWidth, 10);
      }

      // Rails in foreground
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 328, G.WIDTH, 5);
      ctx.fillRect(0, 338, G.WIDTH, 5);
      for (let rx = 0; rx < G.WIDTH; rx += 20) {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(rx, 325, 6, 20);
      }

      // Status indicator during arrival
      if (this.substate !== 'MAP_TRANSITION') {
        ctx.fillStyle = 'rgba(0, 20, 60, 0.7)';
        ctx.fillRect(G.WIDTH / 2 - 120, G.HEIGHT - 32, 240, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'center';
        let msg = 'IL TRENO PER LA SPEZIA STA ARRIVANDO...';
        if (this.substate === 'TRAIN_STOPPED') {
          msg = 'IN CARROZZA! TUTTI A BORDO!';
        }
        ctx.fillText(msg, G.WIDTH / 2, G.HEIGHT - 18);
      }

      // Fade transition overlay
      if (this.fadeAlpha > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + this.fadeAlpha.toFixed(2) + ')';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }
    }
  }

  // Register in Game
  window.Game = window.Game || {};
  const intro = new IntroSequence();
  window.Game.introSequence = intro;
  window.Game.IntroSequence = IntroSequence;

  // Register with stateManager if available
  if (window.Game.stateManager) {
    window.Game.stateManager.register('INTRO', intro);
    window.Game.stateManager.register('TRAIN_ENTERING', intro);
    window.Game.stateManager.register('TRAIN_DECELERATING', intro);
    window.Game.stateManager.register('TRAIN_STOPPED', intro);
  }
})();
