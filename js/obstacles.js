// obstacles.js - Obstacles the player must jump over
(function() {
    'use strict';

    class ObstacleManager {
        constructor() {
            this.obstacles = [];
        }

        init() {
            this.obstacles = [];
            this.spawnObstacles();
        }

        spawnObstacles() {
            // Ground Y reference for placement
            const groundY = 280;
            const obstacleH = 40;
            const baseY = groundY - obstacleH;

            // Spread 25 obstacles across 6400px world, increasing density toward end
            // Zone 1 (0-1600): sparse, 4 obstacles
            this.addObstacle('valija', 400, baseY);
            this.addObstacle('equipaje', 800, baseY);
            this.addObstacle('valija', 1200, baseY);
            this.addObstacle('equipaje', 1500, baseY);

            // Zone 2 (1600-3200): moderate, 6 obstacles
            this.addObstacle('bandera_spezia', 1800, baseY);
            this.addObstacle('valija', 2050, baseY);
            this.addObstacle('equipaje', 2300, baseY);
            this.addObstacle('valija', 2550, baseY);
            this.addObstacle('bandera_spezia', 2900, baseY);
            this.addObstacle('equipaje', 3100, baseY);

            // Zone 3 (3200-4800): denser, 8 obstacles
            this.addObstacle('valija', 3300, baseY);
            this.addObstacle('bandera_spezia', 3500, baseY);
            this.addObstacle('equipaje', 3650, baseY);
            this.addObstacle('valija', 3850, baseY);
            this.addObstacle('equipaje', 4050, baseY);
            this.addObstacle('bandera_spezia', 4200, baseY);
            this.addObstacle('valija', 4400, baseY);
            this.addObstacle('equipaje', 4600, baseY);

            // Zone 4 (4800-6400): densest, 9 obstacles
            this.addObstacle('bandera_spezia', 4900, baseY);
            this.addObstacle('valija', 5050, baseY);
            this.addObstacle('equipaje', 5200, baseY);
            this.addObstacle('bandera_spezia', 5350, baseY);
            this.addObstacle('valija', 5500, baseY);
            this.addObstacle('equipaje', 5650, baseY);
            this.addObstacle('valija', 5800, baseY);
            this.addObstacle('bandera_spezia', 5950, baseY);
            this.addObstacle('equipaje', 6100, baseY);
        }

        addObstacle(type, x, y) {
            let width = 40;
            let height = 40;

            // Slight size variation by type
            if (type === 'valija') {
                width = 38;
                height = 32;
                y += (40 - height); // align bottom to ground
            } else if (type === 'bandera_spezia') {
                width = 30;
                height = 50;
                y = 280 - height; // taller, align to ground
            } else if (type === 'equipaje') {
                width = 44;
                height = 36;
                y += (40 - height);
            }

            this.obstacles.push({
                type: type,
                x: x,
                y: y,
                width: width,
                height: height,
                hitCooldown: 0
            });
        }

        update(dt) {
            const player = Game.player;
            if (!player || player.state === 'defeat') return;

            const playerBounds = player.getBounds ? player.getBounds() : {
                x: player.x + 8, y: player.y + 5,
                width: player.width - 16, height: player.height - 5
            };

            for (let i = 0; i < this.obstacles.length; i++) {
                const obs = this.obstacles[i];

                // Update hit cooldown
                if (obs.hitCooldown > 0) {
                    obs.hitCooldown -= dt;
                }

                // AABB collision
                if (this.checkCollision(playerBounds, obs)) {
                    // Check if player is jumping over (feet above obstacle top)
                    const playerBottom = playerBounds.y + playerBounds.height;
                    const obTop = obs.y;

                    if (playerBottom <= obTop + 10) {
                        // Player is above, landing on or jumping over - no damage
                        continue;
                    }

                    // Side collision - deal damage
                    if (obs.hitCooldown <= 0) {
                        player.takeDamage(10);
                        obs.hitCooldown = 1.0; // 1 second cooldown

                        // Push player back
                        const pushDir = (player.x < obs.x) ? -1 : 1;
                        player.x += pushDir * 30;
                        player.vx = pushDir * 80;
                    }
                }
            }
        }

        checkCollision(a, b) {
            return a.x < b.x + b.width &&
                   a.x + a.width > b.x &&
                   a.y < b.y + b.height &&
                   a.y + a.height > b.y;
        }

        render(ctx) {
            const cameraX = (Game.renderer && Game.renderer.cameraX) ? Game.renderer.cameraX : 0;
            const imgs = Game.assets.images;

            for (let i = 0; i < this.obstacles.length; i++) {
                const obs = this.obstacles[i];
                const drawX = obs.x - cameraX;
                const drawY = obs.y;

                // Skip if off-screen (with margin)
                if (drawX < -60 || drawX > Game.WIDTH + 60) continue;

                if (obs.type === 'valija') {
                    const img = imgs['valija'];
                    if (img) {
                        ctx.drawImage(img, drawX, drawY, obs.width, obs.height);
                    } else {
                        this.drawPixelValija(ctx, drawX, drawY, obs.width, obs.height);
                    }
                } else if (obs.type === 'bandera_spezia') {
                    const img = imgs['bandera_spezia'];
                    if (img) {
                        ctx.drawImage(img, drawX, drawY, obs.width, obs.height);
                    } else {
                        this.drawPixelBandera(ctx, drawX, drawY, obs.width, obs.height);
                    }
                } else if (obs.type === 'equipaje') {
                    // Pixel art boxes (no sprite provided)
                    this.drawPixelEquipaje(ctx, drawX, drawY, obs.width, obs.height);
                }
            }
        }

        // --- Pixel art fallbacks ---

        drawPixelValija(ctx, x, y, w, h) {
            // Brown suitcase
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
            // Handle
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + w / 2 - 6, y - 4, 12, 6);
            // Latch
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(x + w / 2 - 3, y + h / 2 - 2, 6, 4);
        }

        drawPixelBandera(ctx, x, y, w, h) {
            // Pole
            ctx.fillStyle = '#888';
            ctx.fillRect(x + w / 2 - 2, y, 4, h);
            // Flag (Spezia colors: white)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, w / 2 + 4, h * 0.5);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w / 2 + 4, h * 0.5);
            // "S" letter
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('S', x + w / 4 + 2, y + h * 0.3 + 3);
            ctx.textAlign = 'left';
        }

        drawPixelEquipaje(ctx, x, y, w, h) {
            // Stack of pixel art boxes
            const boxH = h / 2;
            // Bottom box (darker)
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(x, y + boxH, w, boxH);
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(x + 2, y + boxH + 2, w - 4, boxH - 4);
            // Top box (lighter, slightly offset)
            ctx.fillStyle = '#795548';
            ctx.fillRect(x + 3, y, w - 6, boxH);
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(x + 5, y + 2, w - 10, boxH - 4);
            // Straps
            ctx.fillStyle = '#3E2723';
            ctx.fillRect(x + w * 0.3, y + boxH - 1, 2, boxH + 2);
            ctx.fillRect(x + w * 0.7, y + boxH - 1, 2, boxH + 2);
        }

        reset() {
            this.obstacles = [];
            this.spawnObstacles();
        }
    }

    // Register
    if (!window.Game) window.Game = {};
    const mgr = new ObstacleManager();
    window.Game.obstacleManager = mgr;
    window.Game.ObstacleManager = ObstacleManager;
})();
