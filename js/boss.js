// ============================================================
// boss.js - Final Boss Fight: El Líder de la Hinchada de Spezia
// ============================================================
(function () {
  'use strict';

  class BossManager {
    constructor() {
      this.reset();
    }

    reset() {
      this.active = false;
      this.introPlayed = false;
      this.introTimer = 0;

      // Boss stats (PJ SPEZIA GORDO)
      this.width = 75;
      this.height = 90;
      this.groundY = 325;
      this.x = 6150;
      this.y = this.groundY - this.height; // Exactly on the wagon floor
      this.health = 100;
      this.maxHealth = 100;

      // Movement & AI
      this.vx = 0;
      this.speed = 45;
      this.facingRight = false;
      this.attackTimer = 0;
      this.attackInterval = 2.2; // seconds between attacks

      // Animation
      this.animFrame = 0;
      this.animTimer = 0;
      this.animSpeed = 0.15;
      this.hurtTimer = 0;
      this.state = 'idle'; // idle, attack, hurt, defeat

      // Projectiles thrown by boss
      this.projectiles = [];
    }

    init() {}

    triggerFight() {
      if (this.active) return;
      this.active = true;
      this.introTimer = 2.0; // 2 seconds dramatic intro banner
      const G = window.Game;
      if (G.audio) {
        G.audio.playMusic('boss');
      }
    }

    update(dt) {
      const G = window.Game;
      const player = G.player;
      if (!player) return;

      // Check if player entered boss arena (x > 5700)
      if (!this.active && player.x > 5700) {
        this.triggerFight();
      }

      if (!this.active) return;

      // Boss intro freeze
      if (this.introTimer > 0) {
        this.introTimer -= dt;
        return;
      }

      // Hurt timer
      if (this.hurtTimer > 0) {
        this.hurtTimer -= dt;
      }

      // Defeat sequence
      if (this.state === 'defeat') {
        this.animTimer += dt;
        if (this.animTimer > 2.5) {
          // Switch to victory screen
          if (G.stateManager) {
            G.stateManager.switch('VICTORY');
          }
        }
        return;
      }

      // Boss AI: Move toward player within boss zone
      const distToPlayer = player.x - this.x;
      this.facingRight = distToPlayer > 0;

      // Keep boss within bounds of last carriage (5850 - 6320)
      if (Math.abs(distToPlayer) > 130) {
        this.vx = (distToPlayer > 0 ? 1 : -1) * this.speed;
        this.state = 'walk';
      } else {
        this.vx = 0;
        this.state = 'idle';
      }

      this.x += this.vx * dt;
      if (this.x < 5850) this.x = 5850;
      if (this.x > 6320) this.x = 6320;

      // Attack AI
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackInterval) {
        this.attackTimer = 0;
        this.throwProjectile(player);
      }

      // Update boss projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt; // gravity
        p.life -= dt;

        // Check collision with player
        const playerBounds = player.getBounds ? player.getBounds() : {
          x: player.x + 8, y: player.y + 5, width: player.width - 16, height: player.height - 5
        };

        if (this.checkCollision(p, playerBounds)) {
          player.takeDamage(15);
          this.projectiles.splice(i, 1);
          continue;
        }

        if (p.life <= 0 || p.y > this.groundY) {
          this.projectiles.splice(i, 1);
        }
      }

      // Check player stone projectiles hitting boss
      if (player.projectiles && player.projectiles.length > 0) {
        const bossBounds = {
          x: this.x + 10,
          y: this.y + 10,
          width: this.width - 20,
          height: this.height - 10
        };

        for (let i = player.projectiles.length - 1; i >= 0; i--) {
          const stone = player.projectiles[i];
          const stoneBounds = { x: stone.x - 8, y: stone.y - 8, width: 16, height: 16 };

          if (this.checkCollision(stoneBounds, bossBounds)) {
            // Hit!
            player.projectiles.splice(i, 1);
            this.takeDamage(15);
          }
        }
      }

      // Update animation frame
      this.animTimer += dt;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 7;
      }
    }

    throwProjectile(player) {
      const dir = (player.x < this.x) ? -1 : 1;
      this.projectiles.push({
        x: this.x + (dir > 0 ? this.width : 0),
        y: this.y + 25,
        vx: dir * 180,
        vy: -70,
        width: 18,
        height: 18,
        life: 2.5
      });

      const G = window.Game;
      if (G.audio) {
        G.audio.playSound('throw');
      }
    }

    takeDamage(amount) {
      if (this.state === 'defeat') return;

      this.health -= amount;
      this.hurtTimer = 0.3;

      const G = window.Game;
      if (G.audio) {
        G.audio.playSound('boss_hit');
      }

      // Score for hitting boss
      G.score = (G.score || 0) + 200;

      if (this.health <= 0) {
        this.health = 0;
        this.state = 'defeat';
        this.animTimer = 0;
        G.score = (G.score || 0) + 2000;
        if (G.audio) {
          G.audio.playSound('victory');
        }
      }
    }

    checkCollision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    render(ctx) {
      const G = window.Game;
      const cameraX = (G.renderer && G.renderer.cameraX) ? G.renderer.cameraX : 0;
      const imgs = G.assets.images;

      if (!this.active) return;

      // Draw Boss (PJ SPEZIA GORDO)
      const bx = this.x - cameraX;
      const by = this.y;

      if (bx > -100 && bx < G.WIDTH + 100) {
        ctx.save();

        // Hurt flash
        if (this.hurtTimer > 0) {
          ctx.filter = 'brightness(2) drop-shadow(0 0 10px red)';
        }

        const gordoKey = 'pj_spezia_gordo_' + (this.animFrame + 1);
        const gordoImg = imgs[gordoKey] || imgs['pj_spezia_gordo_1'];

        if (this.facingRight) {
          ctx.translate(bx + this.width, by);
          ctx.scale(-1, 1);
          if (gordoImg && gordoImg.complete) {
            ctx.drawImage(gordoImg, 0, 0, this.width, this.height);
          } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(0, 0, this.width, this.height);
          }
        } else {
          if (gordoImg && gordoImg.complete) {
            ctx.drawImage(gordoImg, bx, by, this.width, this.height);
          } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(bx, by, this.width, this.height);
          }
        }

        ctx.restore();

        // Boss Health Bar above head
        if (this.state !== 'defeat') {
          const barW = 80;
          const barH = 7;
          const barX = bx - 2;
          const barY = by - 14;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

          const hpRatio = this.health / this.maxHealth;
          ctx.fillStyle = hpRatio > 0.4 ? '#ff2222' : '#ff0000';
          ctx.fillRect(barX, barY, barW * hpRatio, barH);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CAPO SPEZIA', barX + barW / 2, barY - 3);
        }
      }

      // Draw Boss Projectiles
      for (let i = 0; i < this.projectiles.length; i++) {
        const p = this.projectiles[i];
        const px = p.x - cameraX;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Dramatic Intro Announcement Banner
      if (this.introTimer > 0) {
        ctx.fillStyle = 'rgba(150, 0, 0, 0.85)';
        ctx.fillRect(0, G.HEIGHT / 2 - 35, G.WIDTH, 70);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, G.HEIGHT / 2 - 35, G.WIDTH, 70);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('¡JEFE: EL LÍDER DE LA HINCHADA DE SPEZIA!', G.WIDTH / 2, G.HEIGHT / 2 - 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText('¡Lanza las piedras con la tecla [F] para derrotarlo!', G.WIDTH / 2, G.HEIGHT / 2 + 15);
      }
    }
  }

  // Register
  window.Game = window.Game || {};
  const boss = new BossManager();
  window.Game.boss = boss;
  window.Game.BossManager = BossManager;
})();
