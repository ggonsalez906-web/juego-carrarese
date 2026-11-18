// collectibles.js - Collectible items (clothing, stones, copa) - Solo flotan sin partículas
(function() {
    'use strict';

    class CollectibleManager {
        constructor() {
            this.collectibles = [];
        }

        init() {
            this.collectibles = [];
            this.spawnCollectibles();
        }

        spawnCollectibles() {
            // Ropa y copa flotando a la altura del pecho del personaje
            this.addCollectible('camiseta', 1000, 240);
            this.addCollectible('bufanda', 2800, 235);
            this.addCollectible('gorra', 4500, 230);
            this.addCollectible('copa', 5500, 220);

            // Piedras distribuidas flotando suavemente (18 total)
            const stonePositions = [
                300, 500, 750, 1200, 1500, 1800,
                2100, 2400, 2600, 3000, 3300,
                3600, 3900, 4200, 4800, 5000,
                5800, 6100
            ];
            for (let i = 0; i < stonePositions.length; i++) {
                const yOff = (i % 3 === 0) ? 230 : (i % 3 === 1) ? 245 : 260;
                this.addCollectible('piedra', stonePositions[i], yOff);
            }
        }

        addCollectible(type, x, y) {
            this.collectibles.push({
                type: type,
                x: x,
                y: y,
                baseY: y,
                width: 34,
                height: 34,
                collected: false,
                animTimer: Math.random() * Math.PI * 2,
                bobOffset: 0
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

                // Animación de flotación suave (sine wave)
                c.animTimer += dt * 3;
                c.bobOffset = Math.sin(c.animTimer) * 5;
                c.y = c.baseY + c.bobOffset;

                // Colisión con el jugador
                if (this.checkCollision(playerBounds, c)) {
                    this.collect(c);
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

            // Sonido de recolección
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

                if (drawX < -50 || drawX > Game.WIDTH + 50) continue;

                // Obtener sprite oficial
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

                if (img && img.complete) {
                    // Dibujar únicamente el sprite flotando, sin partículas
                    ctx.drawImage(img, drawX, drawY, c.width, c.height);
                }
            }
        }

        reset() {
            this.collectibles = [];
            this.spawnCollectibles();
        }
    }

    // Register
    if (!window.Game) window.Game = {};
    const mgr = new CollectibleManager();
    window.Game.collectibleManager = mgr;
    window.Game.CollectibleManager = CollectibleManager;
})();
