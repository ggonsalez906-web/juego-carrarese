// ============================================================
// gameState.js - State Machine for El viaje del hincha del Carrarese
// ============================================================
(function () {
  'use strict';

  // --- State Manager ---
  class GameStateManager {
    constructor() {
      this.states = {};
      this.stack = [];
      this.current = null;
    }

    register(name, stateObj) {
      this.states[name] = stateObj;
    }

    switch(name, params) {
      if (this.current && this.current.exit) {
        this.current.exit();
      }
      this.stack = [];
      this.current = this.states[name] || null;
      if (this.current && this.current.enter) {
        this.current.enter(params);
      }
    }

    push(name, params) {
      if (this.current) {
        this.stack.push(this.current);
        if (this.current.pause) this.current.pause();
      }
      this.current = this.states[name] || null;
      if (this.current && this.current.enter) {
        this.current.enter(params);
      }
    }

    pop() {
      if (this.current && this.current.exit) {
        this.current.exit();
      }
      this.current = this.stack.pop() || null;
      if (this.current && this.current.resume) {
        this.current.resume();
      }
    }

    update(dt) {
      if (this.current && this.current.update) {
        this.current.update(dt);
      }
    }

    render(ctx) {
      // Render underlying states in stack first (for overlay states like pause)
      for (let i = 0; i < this.stack.length; i++) {
        if (this.stack[i] && this.stack[i].render) {
          this.stack[i].render(ctx);
        }
      }
      if (this.current && this.current.render) {
        this.current.render(ctx);
      }
    }
  }

  // --- State Templates (placeholder implementations) ---
  // Other workers' modules will extend / override these via Game.stateManager.register()

  const MenuState = {
    enter() {
      // Will be populated by interface.js
    },
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#1a3a2a';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('El viaje del hincha del Carrarese', G.WIDTH / 2, G.HEIGHT / 2 - 40);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('Cargando módulos...', G.WIDTH / 2, G.HEIGHT / 2 + 20);
    }
  };

  const IntroState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Intro...', G.WIDTH / 2, G.HEIGHT / 2);
    }
  };

  const MapState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#2a2a1a';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
    }
  };

  const PlayingState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
    }
  };

  const BossState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#3a1a1a';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
    }
  };

  const VictoryState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#1a3a1a';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#FFD700';
      ctx.font = '28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('¡VICTORIA!', G.WIDTH / 2, G.HEIGHT / 2);
    }
  };

  const DefeatState = {
    enter(params) {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#1a0000';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#ff4444';
      ctx.font = '28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DERROTA', G.WIDTH / 2, G.HEIGHT / 2);
    }
  };

  const PauseState = {
    enter() {},
    exit() {},
    update(dt) {
      const G = window.Game;
      if (G.controls && G.controls.justPressed('pause')) {
        G.stateManager.pop();
      }
    },
    render(ctx) {
      const G = window.Game;
      // Dim overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', G.WIDTH / 2, G.HEIGHT / 2 - 20);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('Presiona ESC para continuar', G.WIDTH / 2, G.HEIGHT / 2 + 20);
    }
  };

  const OptionsState = {
    enter() {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OPCIONES', G.WIDTH / 2, G.HEIGHT / 2);
    }
  };

  const CreditsState = {
    enter() {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRÉDITOS', G.WIDTH / 2, G.HEIGHT / 2 - 30);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('El viaje del hincha del Carrarese', G.WIDTH / 2, G.HEIGHT / 2 + 10);
    }
  };

  // --- Expose ---
  window.Game = window.Game || {};
  const manager = new GameStateManager();

  manager.register('MENU', MenuState);
  manager.register('INTRO', IntroState);
  manager.register('MAP', MapState);
  manager.register('PLAYING', PlayingState);
  manager.register('BOSS', BossState);
  manager.register('VICTORY', VictoryState);
  manager.register('DEFEAT', DefeatState);
  manager.register('PAUSE', PauseState);
  manager.register('OPTIONS', OptionsState);
  manager.register('CREDITS', CreditsState);

  // Also register sub-state aliases used by other modules
  manager.register('TRAIN_ENTERING', IntroState);
  manager.register('TRAIN_DECELERATING', IntroState);
  manager.register('TRAIN_STOPPED', IntroState);
  manager.register('MAP_TRANSITION', MapState);
  manager.register('MAP_ANIMATION', MapState);
  manager.register('GAME_TRANSITION', PlayingState);
  manager.register('GAME_START', PlayingState);
  manager.register('BOSS_INTRO', BossState);
  manager.register('BOSS_FIGHT', BossState);

  window.Game.stateManager = manager;
  window.Game.GameStateManager = GameStateManager;
})();
