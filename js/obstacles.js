// obstacles.js - Obstacles the player must jump over (Valijas y Banderas Spezia)
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
            // Ground Y reference (floor of train wagon)
            const groundY = 325;

            // Spread authentic obstacles (valijas y banderas de Spezia) across 6400px world
            // Zone 1 (0-1600):
            this.addObstacle('valija', 450, groundY);
            this.addObstacle('valija', 1100, groundY);
            this.addObstacle('valija', 1500, groundY);

            // Zone 2 (1600-3200):
            this.addObstacle('bandera_spezia', 1850, groundY);
            this.addObstacle('valija', 2250, groundY);
            this.addObstacle('valija', 2650, groundY);
            this.addObstacle('bandera_spezia', 3050, groundY);

            // Zone 3 (3200-4800):
            this.addObstacle('valija', 3400, groundY);
            this.addObstacle('bandera_spezia', 3750, groundY);
            this.addObstacle('valija', 4150, groundY);
            this.addObstacle('bandera_spezia', 4400, groundY);
            this.addObstacle('valija', 4750, groundY);

            // Zone 4 (4800-6400):
            this.addObstacle('bandera_spezia', 5050, groundY);
            this.addObstacle('valija', 5300, groundY);
            this.addObstacle('bandera_spezia', 5600, groundY);
            this.addObstacle('valija', 5850, groundY);
        }

        addObstacle(type, x, groundY) {
            let width = 36;
            let height = 30;

            if (type === 'valija') {
                width = 38;
                height = 32;
            } else if (type === 'bandera_spezia') {
                width = 44;
                height = 30;
            }

            const y = groundY - height; // Sit squarely on the train floor

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

                if (obs.hitCooldown > 0) {
                    obs.hitCooldown -= dt;
                }

                if (this.checkCollision(playerBounds, obs)) {
                    // Check if player jumped over (feet above obstacle top)
                    const playerBottom = playerBounds.y + playerBounds.height;
                    const obTop = obs.y;

                    if (playerBottom <= obTop + 10) {
                        continue;
                    }

                    // Side collision
                    if (obs.hitCooldown <= 0) {
                        player.takeDamage(10);
                        obs.hitCooldown = 1.0;

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

                if (drawX < -60 || drawX > Game.WIDTH + 60) continue;

                if (obs.type === 'valija') {
                    const img = imgs['valija'];
                    if (img && img.complete) {
                        ctx.drawImage(img, drawX, drawY, obs.width, obs.height);
                    }
                } else if (obs.type === 'bandera_spezia') {
                    const img = imgs['bandera_spezia'];
                    if (img && img.complete) {
                        ctx.drawImage(img, drawX, drawY, obs.width, obs.height);
                    }
                }
            }
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
