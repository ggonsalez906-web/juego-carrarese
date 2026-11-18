// ============================================================
// physics.js - Gravity, velocity, collision detection/response
// ============================================================
(function () {
  'use strict';

  const GRAVITY = 980; // pixels per second^2
  const MAX_FALL_SPEED = 600;
  const GROUND_Y = 310; // Default ground level (world coords, bottom of play area)

  /**
   * Apply gravity to an entity.
   * Entity must have: { x, y, vx, vy, width, height, grounded }
   */
  function applyGravity(entity, dt) {
    if (!entity.grounded) {
      entity.vy += GRAVITY * dt;
      if (entity.vy > MAX_FALL_SPEED) {
        entity.vy = MAX_FALL_SPEED;
      }
    }
  }

  /**
   * Move entity by its velocity.
   */
  function applyVelocity(entity, dt) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
  }

  /**
   * AABB collision check.
   * Returns overlap object {x, y, width, height} or null if no collision.
   */
  function checkCollision(a, b) {
    const ax = a.x, ay = a.y, aw = a.width || 0, ah = a.height || 0;
    const bx = b.x, by = b.y, bw = b.width || 0, bh = b.height || 0;

    const overlapX = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
    const overlapY = Math.min(ay + ah, by + bh) - Math.max(ay, by);

    if (overlapX > 0 && overlapY > 0) {
      return {
        x: Math.max(ax, bx),
        y: Math.max(ay, by),
        width: overlapX,
        height: overlapY
      };
    }
    return null;
  }

  /**
   * Simple AABB boolean overlap test.
   */
  function overlaps(a, b) {
    return (
      a.x < b.x + (b.width || 0) &&
      a.x + (a.width || 0) > b.x &&
      a.y < b.y + (b.height || 0) &&
      a.y + (a.height || 0) > b.y
    );
  }

  /**
   * Resolve collision between a moving entity and a solid platform/ground.
   * Adjusts entity position and velocity.
   * platform: { x, y, width, height, solid: true }
   */
  function resolveCollision(entity, platform) {
    const overlap = checkCollision(entity, platform);
    if (!overlap) return false;

    // Determine smallest axis to push out
    const pushX = overlap.width;
    const pushY = overlap.height;

    if (pushY <= pushX) {
      // Vertical resolution
      const entityCenterY = entity.y + (entity.height || 0) / 2;
      const platformCenterY = platform.y + (platform.height || 0) / 2;

      if (entityCenterY < platformCenterY) {
        // Entity is above platform - land on top
        entity.y = platform.y - (entity.height || 0);
        if (entity.vy > 0) {
          entity.vy = 0;
          entity.grounded = true;
        }
      } else {
        // Entity is below - bonk head
        entity.y = platform.y + (platform.height || 0);
        if (entity.vy < 0) {
          entity.vy = 0;
        }
      }
    } else {
      // Horizontal resolution
      const entityCenterX = entity.x + (entity.width || 0) / 2;
      const platformCenterX = platform.x + (platform.width || 0) / 2;

      if (entityCenterX < platformCenterX) {
        entity.x = platform.x - (entity.width || 0);
      } else {
        entity.x = platform.x + (platform.width || 0);
      }
      entity.vx = 0;
    }

    return true;
  }

  /**
   * Check and resolve ground collision at GROUND_Y.
   */
  function resolveGroundCollision(entity, groundY) {
    groundY = (groundY !== undefined) ? groundY : GROUND_Y;
    if (entity.y + (entity.height || 0) >= groundY) {
      entity.y = groundY - (entity.height || 0);
      entity.vy = 0;
      entity.grounded = true;
      return true;
    }
    return false;
  }

  /**
   * Check if entity is standing on any platform in the given array.
   * Returns the platform it's on or null.
   */
  function checkPlatforms(entity, platforms) {
    entity.grounded = false;
    let landedOn = null;

    for (let i = 0; i < platforms.length; i++) {
      if (resolveCollision(entity, platforms[i])) {
        if (entity.grounded) {
          landedOn = platforms[i];
        }
      }
    }

    return landedOn;
  }

  /**
   * Create a standard entity object.
   */
  function createEntity(x, y, width, height) {
    return {
      x: x || 0,
      y: y || 0,
      vx: 0,
      vy: 0,
      width: width || 32,
      height: height || 48,
      grounded: false,
      active: true
    };
  }

  // Expose
  window.Game = window.Game || {};
  window.Game.physics = {
    GRAVITY: GRAVITY,
    MAX_FALL_SPEED: MAX_FALL_SPEED,
    GROUND_Y: GROUND_Y,
    applyGravity: applyGravity,
    applyVelocity: applyVelocity,
    checkCollision: checkCollision,
    overlaps: overlaps,
    resolveCollision: resolveCollision,
    resolveGroundCollision: resolveGroundCollision,
    checkPlatforms: checkPlatforms,
    createEntity: createEntity
  };
})();
