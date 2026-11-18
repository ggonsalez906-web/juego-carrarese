// equipment.js - Visual equipment overlay / tracking system
(function() {
    'use strict';

    class EquipmentManager {
        constructor() {
            // Icon images (set after assets load)
            this.icons = {};
            this.notification = null; // {text, timer}
        }

        init() {
            const imgs = Game.assets.images;
            this.icons = {
                camiseta: imgs['camiseta'] || null,
                bufanda: imgs['bufanda'] || null,
                gorra: imgs['gorra'] || null
            };
        }

        /**
         * Returns the correct animation key set based on current equipment.
         * Used by Player to determine which animation frames to use.
         */
        getAnimationSet() {
            const eq = Game.equipment;
            const hasAll = eq.camiseta && eq.bufanda && eq.gorra;

            return {
                idle: hasAll ? 'throw_full' :
                      eq.camiseta ? 'walk_camiseta' :
                      eq.bufanda ? 'walk_bufanda' : 'idle',

                walk: hasAll ? 'throw_full' :
                      eq.camiseta ? 'walk_camiseta' :
                      eq.bufanda ? 'walk_bufanda' : 'walk_base',

                jump: 'jump',

                throwAnim: hasAll ? 'throw_full' : 'throw_base',

                defeat: 'defeat'
            };
        }

        /**
         * Returns how many items are equipped (0-3)
         */
        getEquippedCount() {
            const eq = Game.equipment;
            let count = 0;
            if (eq.camiseta) count++;
            if (eq.bufanda) count++;
            if (eq.gorra) count++;
            return count;
        }

        /**
         * Check if fully equipped
         */
        isFullyEquipped() {
            const eq = Game.equipment;
            return eq.camiseta && eq.bufanda && eq.gorra;
        }

        /**
         * Called when an item is equipped
         */
        onEquip(itemType) {
            this.notification = {
                text: '¡' + itemType.charAt(0).toUpperCase() + itemType.slice(1) + ' equipada!',
                timer: 2.0
            };
        }

        update(dt) {
            // Update notification timer
            if (this.notification) {
                this.notification.timer -= dt;
                if (this.notification.timer <= 0) {
                    this.notification = null;
                }
            }
        }

        /**
         * Render equipment HUD indicators (top-right area)
         */
        renderHUD(ctx) {
            const eq = Game.equipment;
            const startX = Game.WIDTH - 110;
            const startY = 8;
            const iconSize = 24;
            const gap = 6;

            // Background bar for equipment slots
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            const totalW = (iconSize + gap) * 3 + gap;
            ctx.fillRect(startX - gap, startY - 2, totalW, iconSize + 4);
            ctx.strokeRect(startX - gap, startY - 2, totalW, iconSize + 4);

            // Draw each equipment slot
            const items = ['camiseta', 'bufanda', 'gorra'];
            for (let i = 0; i < items.length; i++) {
                const itemName = items[i];
                const ix = startX + i * (iconSize + gap);
                const iy = startY;

                if (eq[itemName]) {
                    // Equipped: draw icon
                    if (this.icons[itemName]) {
                        ctx.drawImage(this.icons[itemName], ix, iy, iconSize, iconSize);
                    } else {
                        // Fallback: filled box with label
                        ctx.fillStyle = '#4488FF';
                        ctx.fillRect(ix, iy, iconSize, iconSize);
                        ctx.fillStyle = '#FFF';
                        ctx.font = '8px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(itemName.charAt(0).toUpperCase(), ix + iconSize / 2, iy + iconSize / 2 + 3);
                    }
                } else {
                    // Empty slot: dark outline
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.strokeRect(ix + 1, iy + 1, iconSize - 2, iconSize - 2);

                    // Question mark
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.font = '12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('?', ix + iconSize / 2, iy + iconSize / 2 + 4);
                }
            }

            // Reset text alignment
            ctx.textAlign = 'left';

            // Render notification popup if active
            if (this.notification) {
                const alpha = Math.min(1, this.notification.timer);
                const ny = 40 - (1 - alpha) * 10;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = 'rgba(0, 80, 200, 0.8)';
                ctx.font = 'bold 12px monospace';
                const tw = ctx.measureText(this.notification.text).width;
                ctx.fillRect(Game.WIDTH / 2 - tw / 2 - 10, ny - 2, tw + 20, 20);
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.fillText(this.notification.text, Game.WIDTH / 2, ny + 12);
                ctx.textAlign = 'left';
                ctx.restore();
            }
        }

        reset() {
            Game.equipment = { camiseta: false, bufanda: false, gorra: false };
            this.notification = null;
        }
    }

    // Register
    if (!window.Game) window.Game = {};
    const mgr = new EquipmentManager();
    window.Game.equipment_manager = mgr;
    window.Game.EquipmentManager = EquipmentManager;
})();
