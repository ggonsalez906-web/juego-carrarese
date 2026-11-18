// ============================================================
// main.js - Entry Point, Asset Preloader & Central Game Loop
// ============================================================
(function () {
  'use strict';

  const WIDTH = 640;
  const HEIGHT = 360;

  // Initialize Game object
  window.Game = window.Game || {};
  window.Game.WIDTH = WIDTH;
  window.Game.HEIGHT = HEIGHT;
  window.Game.score = 0;
  window.Game.stones = 0;
  window.Game.health = 100;
  window.Game.equipment = { camiseta: false, bufanda: false, gorra: false };
  window.Game.assets = { images: {}, sounds: {} };

  // Asset manifest
  const ASSETS_TO_LOAD = [
    // Personajes
    { folder: 'personajes', file: 'PJ BLANCO PARADO 1.png' },
    { folder: 'personajes', file: 'PJ BLANCO PARADO 2.png' },
    { folder: 'personajes', file: 'PJ BLANCO PARADO 3.png' },
    { folder: 'personajes', file: 'PJ BLANCO PARADO 4.png' },
    { folder: 'personajes', file: 'PJ BLANCO PIEDRA 1.png' },
    { folder: 'personajes', file: 'PJ BLANCO PIEDRA 2.png' },
    { folder: 'personajes', file: 'PJ BLANCO PIEDRA 3.png' },
    { folder: 'personajes', file: 'PJ BLANCO PIEDRA 4.png' },
    { folder: 'personajes', file: 'PJ BLANCO SALTO 1.png' },
    { folder: 'personajes', file: 'PJ BLANCO SALTO 2.png' },
    { folder: 'personajes', file: 'PJ BLANCO SALTO 3.png' },
    { folder: 'personajes', file: 'PJ BLANCO SALTO 4.png' },
    { folder: 'personajes', file: 'PJ BLANCO SALTO 5.png' },
    { folder: 'personajes', file: 'PJ CAMINANDO BUFANDA 1.png' },
    { folder: 'personajes', file: 'PJ CAMINANDO BUFANDA 2.png' },
    { folder: 'personajes', file: 'PJ CAMINANDO BUFANDA 3.png' },
    { folder: 'personajes', file: 'PJ CAMINANDO BUFANDA 4.png' },
    { folder: 'personajes', file: 'PJ CAMINANDO BUFANDA 5.png' },
    { folder: 'personajes', file: 'PJ CAMISETA CAMINANDO 1.png' },
    { folder: 'personajes', file: 'PJ CAMISETA CAMINANDO 2.png' },
    { folder: 'personajes', file: 'PJ CAMISETA CAMINANDO 3.png' },
    { folder: 'personajes', file: 'PJ CAMISETA CAMINANDO 4.png' },
    { folder: 'personajes', file: 'PJ CAMISETA CAMINANDO 5.png' },
    { folder: 'personajes', file: 'PJ DERROTA 1.png' },
    { folder: 'personajes', file: 'PJ DERROTA 2.png' },
    { folder: 'personajes', file: 'PJ DERROTA 3.png' },
    { folder: 'personajes', file: 'PJ ROPA COMPLETO PIEDRA 1.png' },
    { folder: 'personajes', file: 'PJ ROPA COMPLETO PIEDRA 2.png' },
    { folder: 'personajes', file: 'PJ ROPA COMPLETO PIEDRA 3.png' },
    { folder: 'personajes', file: 'PJ ROPA COMPLETO PIEDRA 4.png' },

    // Enemigos
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 1.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 2.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 3.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 4.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 5.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 6.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA GORDO 7.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA RUBIO 1.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA RUBIO  2.png' }, // Note 2 spaces
    { folder: 'enemigos', file: 'PJ SPEZIA RUBIO 3.png' },
    { folder: 'enemigos', file: 'PJ SPEZIA RUBIO 4.png' },

    // Escenarios
    { folder: 'escenarios', file: 'CANCHA SOMBRA.png' },
    { folder: 'escenarios', file: 'CANCHA SPEZIA.jpeg' },
    { folder: 'escenarios', file: 'EJEMPLO ESTACION DE TREN 1.png' },
    { folder: 'escenarios', file: 'EJEMPLO VAGON DE ADENTRO 1.png' },
    { folder: 'escenarios', file: 'ESTACION CARRARESE.png' },
    { folder: 'escenarios', file: 'ESTACION SPEZIA.png' },
    { folder: 'escenarios', file: 'FONDO MONTAÑAS.png' },
    { folder: 'escenarios', file: 'MAPA.png' },
    { folder: 'escenarios', file: 'TREN PUERTA ABIERTA.png' },
    { folder: 'escenarios', file: 'TREN PUERTA CERRADA .png' }, // Note trailing space
    { folder: 'escenarios', file: 'TREN PUERTA SEMIABIERTA.png' },
    { folder: 'escenarios', file: 'VAGON SIN FONDO.png' },

    // Objetos
    { folder: 'objetos', file: 'BANDERA SPEZIA.png' },
    { folder: 'objetos', file: 'BUFANDA.png' },
    { folder: 'objetos', file: 'CAMISETA.png' },
    { folder: 'objetos', file: 'COPA.png' },
    { folder: 'objetos', file: 'GORRA.png' },
    { folder: 'objetos', file: 'PIEDRA 1.png' },
    { folder: 'objetos', file: 'PIEDRA 2.png' },
    { folder: 'objetos', file: 'VALIJA.png' },

    // Interfaz
    { folder: 'interfaz', file: 'BOTON CONTINUAR.png' },
    { folder: 'interfaz', file: 'BOTON INTENTAR DE NUEVO.png' },
    { folder: 'interfaz', file: 'BOTON JUGAR.png' },
    { folder: 'interfaz', file: 'BOTON MENU PRINCIPAL.png' },
    { folder: 'interfaz', file: 'BOTON SALIR.png' },
    { folder: 'interfaz', file: 'BOTON VOLVER AL MENÚ.png' },
    { folder: 'interfaz', file: 'CARRARESE PIERDE.png' },
    { folder: 'interfaz', file: 'CARTEL CARRARESE PIERDE.png' },
    { folder: 'interfaz', file: 'CARTEL CARRARESE.png' },
    { folder: 'interfaz', file: 'ESCUDO CARRARESE.png' },
    { folder: 'interfaz', file: 'FLECHA DER 1.png' },
    { folder: 'interfaz', file: 'FLECHA IZQ 1.png' },
    { folder: 'interfaz', file: 'GANASTE.png' },
    { folder: 'interfaz', file: 'LAURELES.png' }
  ];

  function setupCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // Enable pixelated rendering
    ctx.imageSmoothingEnabled = false;

    window.Game.canvas = canvas;
    window.Game.ctx = ctx;

    function resize() {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const scale = Math.min(windowW / WIDTH, windowH / HEIGHT);

      canvas.style.width = Math.floor(WIDTH * scale) + 'px';
      canvas.style.height = Math.floor(HEIGHT * scale) + 'px';
    }

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
  }

  function loadAssets(onProgress, onComplete) {
    let loaded = 0;
    const total = ASSETS_TO_LOAD.length;

    ASSETS_TO_LOAD.forEach((item) => {
      const img = new Image();
      const path = 'assets/' + item.folder + '/' + encodeURIComponent(item.file);

      // Primary key: lowercase, strip extension, replace spaces with underscores
      const baseName = item.file.substring(0, item.file.lastIndexOf('.'));
      const primaryKey = baseName.toLowerCase().replace(/ /g, '_');

      img.onload = () => {
        window.Game.assets.images[primaryKey] = img;

        // Add useful aliases
        if (primaryKey === 'tren_puerta_cerrada_') {
          window.Game.assets.images['tren_puerta_cerrada'] = img;
        }
        if (primaryKey === 'pj_spezia_rubio__2') {
          window.Game.assets.images['pj_spezia_rubio_2'] = img;
        }
        if (primaryKey === 'boton_volver_al_menú') {
          window.Game.assets.images['boton_volver_al_menu'] = img;
        }
        if (primaryKey === 'fondo_montañas') {
          window.Game.assets.images['fondo_montanas'] = img;
        }

        loaded++;
        onProgress(loaded, total);
        if (loaded >= total) {
          onComplete();
        }
      };

      img.onerror = () => {
        console.warn('Could not load image: ' + path);
        // Still count to not get stuck
        loaded++;
        onProgress(loaded, total);
        if (loaded >= total) {
          onComplete();
        }
      };

      img.src = path;
    });
  }

  function renderLoading(loaded, total) {
    const ctx = window.Game.ctx;
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Carrarese themed loading screen
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EL VIAJE DEL HINCHA DEL CARRARESE', WIDTH / 2, HEIGHT / 2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('Cargando recursos del juego...', WIDTH / 2, HEIGHT / 2 - 15);

    // Progress bar
    const barW = 280;
    const barH = 14;
    const barX = WIDTH / 2 - barW / 2;
    const barY = HEIGHT / 2 + 10;

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    const progress = total > 0 ? loaded / total : 0;
    ctx.fillStyle = '#0055ff';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(Math.floor(progress * 100) + '%', WIDTH / 2, barY + barH + 16);
  }

  function startGame() {
    const G = window.Game;

    // Initialize all sub-modules that have an init() method
    if (G.player && G.player.init) G.player.init();
    if (G.collectibleManager && G.collectibleManager.init) G.collectibleManager.init();
    if (G.equipment_manager && G.equipment_manager.init) G.equipment_manager.init();
    if (G.obstacleManager && G.obstacleManager.init) G.obstacleManager.init();
    if (G.trainWorld && G.trainWorld.init) G.trainWorld.init();
    if (G.boss && G.boss.init) G.boss.init();

    // Start in Menu state
    if (G.stateManager) {
      G.stateManager.switch('MENU');
    }

    // Main Game Loop
    let lastTime = performance.now();

    function loop(currentTime) {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Update state
      if (G.stateManager) {
        G.stateManager.update(dt);
      }

      // Update camera / screen effects
      if (G.renderer) {
        G.renderer.updateEffects(dt);
      }

      // Render
      if (G.ctx) {
        // Pixel smoothing off
        G.ctx.imageSmoothingEnabled = false;
        G.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        if (G.stateManager) {
          G.stateManager.render(G.ctx);
        }
      }

      // Clear input justPressed buffers
      if (G.controls && G.controls.update) {
        G.controls.update();
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  // --- Bootstrap ---
  window.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    renderLoading(0, ASSETS_TO_LOAD.length);

    loadAssets(
      (loaded, total) => {
        renderLoading(loaded, total);
      },
      () => {
        startGame();
      }
    );
  });
})();
