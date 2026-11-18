// player.js - Player character with animations and equipment system
(function() {
    'use strict';

    class Player {
        constructor() {
            this.x = 100;
            this.y = 235; // groundY(325) - height(90)
            this.vx = 0;
            this.vy = 0;
            this.width = 50;
            this.height = 90;
            this.grounded = true;
            this.facingRight = true;
            this.state = 'idle'; // idle|walking|jumping|throwing|hurt|defeat
            this.health = 100;
            this.speed = 150;
            this.jumpForce = -350;
            this.gravity = 800;

            // Animation
            this.currentAnim = 'idle';
            this.animTimer = 0;
            this.animFrame = 0;
            this.animSpeed = 0.15; // seconds per frame

            // Hurt / invincibility
            this.hurtTimer = 0;
            this.invincible = false;
            this.flashTimer = 0;
            this.visible = true;

            // Throwing
            this.throwTimer = 0;
            this.throwDuration = 0.5;

            // Projectiles
            this.projectiles = [];

            // Ground Y reference
            this.groundY = 325;

            // Animation sets - will be populated after assets load
            this.animations = {};
        }

        init() {
            const imgs = Game.assets.images;
            this.animations = {
                idle: [
                    imgs['pj_blanco_parado_1'],
                    imgs['pj_blanco_parado_2'],
                    imgs['pj_blanco_parado_3'],
                    imgs['pj_blanco_parado_4']
                ],
                walk_base: [
                    imgs['pj_blanco_parado_1'],
                    imgs['pj_blanco_parado_2'],
                    imgs['pj_blanco_parado_3'],
                    imgs['pj_blanco_parado_4']
                ],
                walk_camiseta: [
                    imgs['pj_camiseta_caminando_1'],
                    imgs['pj_camiseta_caminando_2'],
                    imgs['pj_camiseta_caminando_3'],
                    imgs['pj_camiseta_caminando_4'],
                    imgs['pj_camiseta_caminando_5']
                ],
                walk_bufanda: [
                    imgs['pj_caminando_bufanda_1'],
                    imgs['pj_caminando_bufanda_2'],
                    imgs['pj_caminando_bufanda_3'],
                    imgs['pj_caminando_bufanda_4'],
                    imgs['pj_caminando_bufanda_5']
                ],
                jump: [
                    imgs['pj_blanco_salto_1'],
                    imgs['pj_blanco_salto_2'],
                    imgs['pj_blanco_salto_3'],
                    imgs['pj_blanco_salto_4'],
                    imgs['pj_blanco_salto_5']
                ],
                throw_base: [
                    imgs['pj_blanco_piedra_1'],
                    imgs['pj_blanco_piedra_2'],
                    imgs['pj_blanco_piedra_3'],
                    imgs['pj_blanco_piedra_4']
                ],
                throw_full: [
                    imgs['pj_ropa_completo_piedra_1'],
                    imgs['pj_ropa_completo_piedra_2'],
                    imgs['pj_ropa_completo_piedra_3'],
                    imgs['pj_ropa_completo_piedra_4']
                ],
                defeat: [
                    imgs['pj_derrota_1'],
                    imgs['pj_derrota_2'],
                    imgs['pj_derrota_3']
                ]
            };
        }

        /**
         * Returns the correct walk/idle animation set based on equipment state.
         */
        getWalkAnim() {
            const eq = Game.equipment;
            if (eq.camiseta && eq.bufanda && eq.gorra) {
                // Full outfit - use throw_full frames as idle/walk (they show full costume)
                return this.animations.throw_full;
            }
            if (eq.camiseta) {
                return this.animations.walk_camiseta;
            }
            if (eq.bufanda) {
                return this.animations.walk_bufanda;
            }
            return this.animations.walk_base;
        }

        getIdleAnim() {
            const eq = Game.equipment;
            if (eq.camiseta && eq.bufanda && eq.gorra) {
                return this.animations.throw_full;
            }
            // For partial equipment, use same logic as walk for idle
            if (eq.camiseta) {
                return this.animations.walk_camiseta;
            }
            if (eq.bufanda) {
                return this.animations.walk_bufanda;
            }
            return this.animations.idle;
        }

        getThrowAnim() {
            const eq = Game.equipment;
            if (eq.camiseta && eq.bufanda && eq.gorra) {
                return this.animations.throw_full;
            }
            return this.animations.throw_base;
        }

        getCurrentAnimFrames() {
            switch (this.state) {
                case 'walking':
                    return this.getWalkAnim();
                case 'jumping':
                    return this.animations.jump;
                case 'throwing':
                    return this.getThrowAnim();
                case 'defeat':
                    return this.animations.defeat;
                case 'hurt':
                    return this.getIdleAnim();
                case 'idle':
                default:
                    return this.getIdleAnim();
            }
        }

        update(dt) {
            if (this.state === 'defeat') {
                // Play defeat animation then stop
                this.updateAnimation(dt);
                return;
            }

            const controls = Game.controls;

            // --- Throwing timer ---
            if (this.state === 'throwing') {
                this.throwTimer -= dt;
                if (this.throwTimer <= 0) {
                    this.state = this.grounded ? 'idle' : 'jumping';
                }
            }

            // --- Hurt timer ---
            if (this.hurtTimer > 0) {
                this.hurtTimer -= dt;
                this.flashTimer += dt;
                // Flash every 0.1s
                this.visible = Math.floor(this.flashTimer / 0.1) % 2 === 0;
                if (this.hurtTimer <= 0) {
                    this.invincible = false;
                    this.visible = true;
                    this.hurtTimer = 0;
                    if (this.state === 'hurt') {
                        this.state = 'idle';
                    }
                }
            }

            // --- Horizontal movement ---
            if (this.state !== 'throwing') {
                let moveX = 0;
                if (controls && controls.isDown) {
                    if (controls.isDown('left')) moveX -= 1;
                    if (controls.isDown('right')) moveX += 1;
                }

                this.vx = moveX * this.speed;

                if (moveX !== 0) {
                    this.facingRight = moveX > 0;
                    if (this.grounded && this.state !== 'hurt') {
                        this.state = 'walking';
                    }
                } else if (this.grounded && this.state !== 'hurt' && this.state !== 'throwing') {
                    this.state = 'idle';
                }

                // --- Jump ---
                if (controls && controls.justPressed && controls.justPressed('jump') && this.grounded) {
                    this.vy = this.jumpForce;
                    this.grounded = false;
                    this.state = 'jumping';
                    if (Game.audio && Game.audio.playSound) {
                        Game.audio.playSound('jump');
                    }
                }

                // --- Throw ---
                if (controls && controls.justPressed && controls.justPressed('throw')) {
                    this.throwStone();
                }
            }

            // --- Gravity ---
            if (!this.grounded) {
                this.vy += this.gravity * dt;
            }

            // --- Update position ---
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // --- Ground check ---
            if (this.y + this.height > this.groundY) {
                this.y = this.groundY - this.height;
                this.vy = 0;
                if (!this.grounded) {
                    this.grounded = true;
                    if (this.state === 'jumping') {
                        this.state = 'idle';
                    }
                    if (Game.audio && Game.audio.playSound) {
                        Game.audio.playSound('land');
                    }
                }
            }

            // --- Clamp to world bounds ---
            if (this.x < 0) this.x = 0;
            // Right bound: allow scrolling through the train world
            const worldWidth = (Game.trainWorld && Game.trainWorld.worldWidth) ? Game.trainWorld.worldWidth : 6400;
            if (this.x + this.width > worldWidth) {
                this.x = worldWidth - this.width;
            }

            // --- Update projectiles ---
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 300 * dt; // projectile gravity
                p.life -= dt;

                if (p.life <= 0 || p.x < -50 || p.x > worldWidth + 50) {
                    this.projectiles.splice(i, 1);
                }
            }

            // --- Update animation ---
            this.updateAnimation(dt);

            // --- Check health -> defeat ---
            if (this.health <= 0 && this.state !== 'defeat') {
                this.state = 'defeat';
                this.vx = 0;
                this.animFrame = 0;
                this.animTimer = 0;
            }
        }

        updateAnimation(dt) {
            this.animTimer += dt;
            const frames = this.getCurrentAnimFrames();
            if (!frames || frames.length === 0) return;

            const speed = this.state === 'walking' ? 0.12 : 
                          this.state === 'jumping' ? 0.1 : 
                          this.state === 'throwing' ? 0.12 :
                          this.state === 'defeat' ? 0.3 : 0.2;

            if (this.animTimer >= speed) {
                this.animTimer -= speed;
                this.animFrame++;

                if (this.state === 'defeat') {
                    // Don't loop defeat - stay on last frame
                    if (this.animFrame >= frames.length) {
                        this.animFrame = frames.length - 1;
                    }
                } else {
                    this.animFrame = this.animFrame % frames.length;
                }
            }
        }

        render(ctx) {
            if (!this.visible) return;

            const frames = this.getCurrentAnimFrames();
            if (!frames || frames.length === 0) return;

            const frame = frames[this.animFrame % frames.length];
            if (!frame) return;

            const cameraX = (Game.renderer && Game.renderer.cameraX) ? Game.renderer.cameraX : 0;
            const drawX = this.x - cameraX;
            const drawY = this.y;

            // Normalize sprite to consistent display size
            // Scale to fit height = 90, maintain aspect ratio
            const srcW = frame.naturalWidth || frame.width || 69;
            const srcH = frame.naturalHeight || frame.height || 181;
            const scale = this.height / srcH;
            const displayW = srcW * scale;
            const displayH = this.height;

            ctx.save();

            if (!this.facingRight) {
                // Flip horizontally
                ctx.translate(drawX + displayW / 2, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(frame, -displayW / 2, 0, displayW, displayH);
            } else {
                ctx.drawImage(frame, drawX, drawY, displayW, displayH);
            }

            ctx.restore();

            // --- Render projectiles ---
            const stoneImg1 = Game.assets.images['piedra_1'];
            const stoneImg2 = Game.assets.images['piedra_2'];
            for (let i = 0; i < this.projectiles.length; i++) {
                const p = this.projectiles[i];
                const px = p.x - cameraX;
                const py = p.y;
                const stoneImg = (i % 2 === 0) ? stoneImg1 : stoneImg2;
                if (stoneImg) {
                    ctx.drawImage(stoneImg, px - 8, py - 8, 16, 16);
                } else {
                    // Fallback: draw a small circle
                    ctx.fillStyle = '#888';
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        takeDamage(amount) {
            if (this.invincible || this.state === 'defeat') return;

            this.health -= amount;
            if (this.health < 0) this.health = 0;
            Game.health = this.health;

            this.state = 'hurt';
            this.invincible = true;
            this.hurtTimer = 1.0; // 1 second of invincibility
            this.flashTimer = 0;

            if (Game.audio && Game.audio.playSound) {
                Game.audio.playSound('hit');
            }
        }

        throwStone() {
            if (Game.stones <= 0) return;
            if (this.state === 'throwing') return;

            Game.stones--;
            this.state = 'throwing';
            this.throwTimer = this.throwDuration;
            this.animFrame = 0;
            this.animTimer = 0;

            // Create projectile
            const dir = this.facingRight ? 1 : -1;
            this.projectiles.push({
                x: this.x + (this.facingRight ? this.width : 0),
                y: this.y + this.height * 0.3,
                vx: 300 * dir,
                vy: -80,
                life: 2.0
            });

            if (Game.audio && Game.audio.playSound) {
                Game.audio.playSound('throw');
            }
        }

        reset() {
            this.x = 100;
            this.y = this.groundY - this.height;
            this.vx = 0;
            this.vy = 0;
            this.grounded = true;
            this.facingRight = true;
            this.state = 'idle';
            this.health = 100;
            this.hurtTimer = 0;
            this.invincible = false;
            this.visible = true;
            this.animFrame = 0;
            this.animTimer = 0;
            this.projectiles = [];
            Game.health = 100;
        }

        /**
         * Returns the bounding box for collision detection
         */
        getBounds() {
            return {
                x: this.x + 8,  // slight inset for more forgiving collisions
                y: this.y + 5,
                width: this.width - 16,
                height: this.height - 5
            };
        }
    }

    // Register on Game global
    if (!window.Game) window.Game = {};
    window.Game.Player = Player;

    // Create instance and register
    const player = new Player();
    window.Game.player = player;
})();
