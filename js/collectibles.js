// collectibles.js - Collectible items (clothing, stones, copa)
(function() {
    'use strict';

    class CollectibleManager {
        constructor() {
            this.collectibles = [];
            this.sparkles = [];
        }

        init() {
            this.collectibles = [];
            this.sparkles = [];
            this.spawnCollectibles();
        }

        spawnCollectibles() {
            // Clothing items at specific progression points (floating above wagon floor)
            this.addCollectible('camiseta', 1000, 265);
            this.addCollectible('bufanda', 2800, 260);
            this.addCollectible('gorra', 4500, 255);

            // Copa near the end
            this.addCollectible('copa', 5500, 245);

            // Stones spread throughout (18 total)
            const stonePositions = [
                300, 500, 750, 1200, 1500, 1800,
                2100, 2400, 2600, 3000, 3300,
                3600, 3900, 4200, 4800, 5000,
                5800, 6100
            ];
            for (let i = 0; i < stonePositions.length; i++) {
                // Vary height near wagon floor
                const yOff = (i % 3 === 0) ? 255 : (i % 3 === 1) ? 270 : 285;
                this.addCollectible('piedra', stonePositions[i], yOff);
            }
        }

        addCollectible(type, x, y) {
            this.collectibles.push({
                type: type,
                x: x,
                y: y,
                baseY: y,
                width: 30,
                height: 30,
                collected: false,
                animTimer: Math.random() * Math.PI * 2, // random phase for bob
                bobOffset: 0,
                sparkleTimer: Math.random() * 2
            });
        }

        update(dt) {
            const player = Game.player;
            if (!player) return;

            const playerBounds = player.getBounds ? player.getBounds() : {
                x: player.x + 8, y: player.y + 5,
                width: player.width - 16, height: player.height - 5
            };

            for (let i = 0; i < this.collectibles.length; i++) {
                const c = this.collectibles[i];
                if (c.collected) continue;

                // Bob animation (sine wave)
                c.animTimer += dt * 3;
                c.bobOffset = Math.sin(c.animTimer) * 4;
                c.y = c.baseY + c.bobOffset;

                // Sparkle timer
                c.sparkleTimer += dt;

                // Collision check with player (AABB)
                if (this.checkCollision(playerBounds, c)) {
                    this.collect(c);
                }
            }

            // Update sparkle particles
            for (let i = this.sparkles.length - 1; i >= 0; i--) {
                const s = this.sparkles[i];
                s.life -= dt;
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                s.vy -= 30 * dt;
                if (s.life <= 0) {
                    this.sparkles.splice(i, 1);
                }
            }
        }

        checkCollision(a, b) {
            return a.x < b.x + b.width &&
                   a.x + a.width > b.x &&
                   a.y < b.y + b.height &&
                   a.y + a.height > b.y;
        }

        collect(c) {
            c.collected = true;

            // Spawn sparkle particles
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.sparkles.push({
                    x: c.x + c.width / 2,
                    y: c.y + c.height / 2,
                    vx: Math.cos(angle) * 60,
                    vy: Math.sin(angle) * 60 - 20,
                    life: 0.5,
                    color: c.type === 'copa' ? '#FFD700' : '#FFFFFF'
                });
            }

            // Play pickup sound
            if (Game.audio && Game.audio.playSound) {
                Game.audio.playSound('pickup');
            }

            switch (c.type) {
                case 'camiseta':
                    Game.equipment.camiseta = true;
                    Game.score = (Game.score || 0) + 500;
                    if (Game.equipment_manager && Game.equipment_manager.onEquip) {
                        Game.equipment_manager.onEquip('camiseta');
                    }
                    break;
                case 'bufanda':
                    Game.equipment.bufanda = true;
                    Game.score = (Game.score || 0) + 500;
                    if (Game.equipment_manager && Game.equipment_manager.onEquip) {
                        Game.equipment_manager.onEquip('bufanda');
                    }
                    break;
                case 'gorra':
                    Game.equipment.gorra = true;
                    Game.score = (Game.score || 0) + 500;
                    if (Game.equipment_manager && Game.equipment_manager.onEquip) {
                        Game.equipment_manager.onEquip('gorra');
                    }
                    break;
                case 'piedra':
                    Game.stones = (Game.stones || 0) + 1;
                    Game.score = (Game.score || 0) + 100;
                    break;
                case 'copa':
                    Game.score = (Game.score || 0) + 1000;
                    break;
            }
        }

        render(ctx) {
            const cameraX = (Game.renderer && Game.renderer.cameraX) ? Game.renderer.cameraX : 0;
            const imgs = Game.assets.images;

            for (let i = 0; i < this.collectibles.length; i++) {
                const c = this.collectibles[i];
                if (c.collected) continue;

                const drawX = c.x - cameraX;
                const drawY = c.y;

                // Skip if off-screen
                if (drawX < -50 || drawX > Game.WIDTH + 50) continue;

                // Glow effect
                ctx.save();
                const glowAlpha = 0.2 + 0.1 * Math.sin(c.animTimer * 2);
                let glowColor;
                switch (c.type) {
                    case 'camiseta': glowColor = '0, 100, 255'; break;
                    case 'bufanda': glowColor = '0, 100, 255'; break;
                    case 'gorra': glowColor = '0, 100, 255'; break;
                    case 'copa': glowColor = '255, 215, 0'; break;
                    default: glowColor = '200, 200, 200'; break;
                }
                ctx.shadowColor = 'rgba(' + glowColor + ', ' + glowAlpha + ')';
                ctx.shadowBlur = 12;

                // Get sprite image
                let img = null;
                switch (c.type) {
                    case 'camiseta': img = imgs['camiseta']; break;
                    case 'bufanda': img = imgs['bufanda']; break;
                    case 'gorra': img = imgs['gorra']; break;
                    case 'piedra':
                        img = (i % 2 === 0) ? imgs['piedra_1'] : imgs['piedra_2'];
                        break;
                    case 'copa': img = imgs['copa']; break;
                }

                if (img) {
                    ctx.drawImage(img, drawX, drawY, c.width, c.height);
                } else {
                    // Fallback colored rectangle
                    ctx.fillStyle = c.type === 'copa' ? '#FFD700' :
                                    c.type === 'piedra' ? '#888' : '#4488FF';
                    ctx.fillRect(drawX, drawY, c.width, c.height);
                }

                ctx.restore();

                // Sparkle dots
                if (c.sparkleTimer > 0.5) {
                    const sparklePhase = c.animTimer * 4;
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.5 + 0.5 * Math.sin(sparklePhase)) + ')';
                    const sx = drawX + c.width / 2 + Math.cos(sparklePhase) * 12;
                    const sy = drawY + Math.sin(sparklePhase * 1.3) * 8;
                    ctx.fillRect(sx - 1, sy - 1, 3, 3);
                }
            }

            // Render sparkle particles
            for (let i = 0; i < this.sparkles.length; i++) {
                const s = this.sparkles[i];
                const sx = s.x - cameraX;
                const alpha = s.life / 0.5;
                ctx.fillStyle = s.color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(sx - 1, s.y - 1, 3, 3);
            }
            ctx.globalAlpha = 1;
        }

        reset() {
            this.collectibles = [];
            this.sparkles = [];
            this.spawnCollectibles();
        }
    }

    // Register
    if (!window.Game) window.Game = {};
    const mgr = new CollectibleManager();
    window.Game.collectibleManager = mgr;
    window.Game.CollectibleManager = CollectibleManager;
})();
