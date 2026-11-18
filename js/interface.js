// ============================================================
// interface.js - HUD, Menus, Options, Credits, Victory & Defeat screens
// ============================================================
(function () {
  'use strict';

  class InterfaceManager {
    constructor() {
      this.initInput();
    }

    initInput() {
      // Global canvas click handler to trigger menu buttons
      window.addEventListener('click', (e) => {
        const G = window.Game;
        if (!G || !G.canvas || !G.stateManager) return;

        // Resume AudioContext on first user interaction
        if (G.audio) G.audio.resume();

        const rect = G.canvas.getBoundingClientRect();
        const scaleX = G.WIDTH / rect.width;
        const scaleY = G.HEIGHT / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        this.handleClick(mouseX, mouseY);
      });
    }

    handleClick(x, y) {
      const G = window.Game;
      const curState = G.stateManager.current;

      if (curState && curState.onClick) {
        curState.onClick(x, y);
      }
    }

    // --- In-Game HUD ---
    renderHUD(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // 1. Top HUD Background Bar
      ctx.fillStyle = 'rgba(10, 20, 40, 0.75)';
      ctx.fillRect(0, 0, G.WIDTH, 34);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 34);
      ctx.lineTo(G.WIDTH, 34);
      ctx.stroke();

      // 2. Score (Top Left)
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SCORE: ' + (G.score || 0), 10, 16);

      // 3. Stones Counter with mini stone icon
      const stoneImg = imgs['piedra_1'];
      if (stoneImg && stoneImg.complete) {
        ctx.drawImage(stoneImg, 10, 19, 12, 12);
      } else {
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(16, 25, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('x ' + (G.stones || 0) + ' PIEDRAS [F]', 28, 28);

      // 4. Progress bar along the train (Center)
      const playerX = G.player ? G.player.x : 0;
      const worldW = (G.trainWorld && G.trainWorld.worldWidth) ? G.trainWorld.worldWidth : 6400;
      const progress = Math.min(1, Math.max(0, playerX / worldW));

      const barW = 140;
      const barH = 8;
      const barX = G.WIDTH / 2 - barW / 2;
      const barY = 12;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = '#888';
      ctx.strokeRect(barX, barY, barW, barH);

      // Progress fill
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(barX + 1, barY + 1, (barW - 2) * progress, barH - 2);

      // Carriage indicator
      const currentCar = Math.min(10, Math.floor(progress * 10) + 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VAGÓN ' + currentCar + ' / 10', G.WIDTH / 2, barY + 18);

      // 5. Health Bar (Top Right)
      const hp = G.player ? G.player.health : 100;
      const maxHp = 100;
      const hpW = 100;
      const hpH = 10;
      const hpX = G.WIDTH - hpW - 120;
      const hpY = 8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(hpX, hpY, hpW, hpH);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(hpX, hpY, hpW, hpH);

      const hpColor = hp > 50 ? '#00e676' : hp > 25 ? '#ffeb3b' : '#ff1744';
      ctx.fillStyle = hpColor;
      ctx.fillRect(hpX + 1, hpY + 1, (hpW - 2) * (hp / maxHp), hpH - 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('ENERGÍA: ' + hp + '%', hpX - 6, hpY + 9);

      // 6. Equipment Icons HUD
      if (G.equipment_manager && G.equipment_manager.renderHUD) {
        G.equipment_manager.renderHUD(ctx);
      }
    }
  }

  // --- MENU STATE ---
  const MenuState = {
    enter() {
      const G = window.Game;
      if (G.audio) {
        G.audio.playMusic('menu');
      }
    },
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // 1. Imagen de portada subida a los assets (FONDO PARA LA PORTADA CANCHA.png)
      const portada = imgs['fondo_para_la_portada_cancha'];
      if (portada && portada.complete) {
        ctx.drawImage(portada, 0, 0, G.WIDTH, G.HEIGHT);
      } else {
        // Fallback gradiente azul
        const grad = ctx.createLinearGradient(0, 0, 0, G.HEIGHT);
        grad.addColorStop(0, '#0c1b33');
        grad.addColorStop(0.6, '#142d54');
        grad.addColorStop(1, '#081324');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }

      // Sutil sombreado para contraste óptimo de interfaz
      ctx.fillStyle = 'rgba(0, 10, 25, 0.45)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      // 2. Escudo Carrarese
      const escudo = imgs['escudo_carrarese'];
      if (escudo && escudo.complete) {
        ctx.drawImage(escudo, G.WIDTH / 2 - 24, 12, 48, 64);
      }

      // 3. Cartel del Carrarese
      const cartel = imgs['cartel_carrarese'];
      if (cartel && cartel.complete) {
        ctx.drawImage(cartel, G.WIDTH / 2 - 160, 80, 320, 72);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EL VIAJE DEL HINCHA', G.WIDTH / 2, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText('DEL CARRARESE', G.WIDTH / 2, 125);
      }

      // Subtítulo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(G.WIDTH / 2 - 140, 158, 280, 20);
      ctx.fillStyle = '#81d4fa';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LA TRASFERTA VERSO IL DERBY APUANO', G.WIDTH / 2, 172);

      // 4. Botones con assets oficiales
      // Botón JUGAR (BOTON JUGAR.png)
      const btnJugar = imgs['boton_jugar'];
      if (btnJugar && btnJugar.complete) {
        ctx.drawImage(btnJugar, G.WIDTH / 2 - 75, 192, 150, 52);
      }

      // Botón OPCIONES (BOTON OPCIONES.png)
      const btnOpciones = imgs['boton_opciones'];
      if (btnOpciones && btnOpciones.complete) {
        ctx.drawImage(btnOpciones, G.WIDTH / 2 - 145, 256, 135, 42);
      }

      // Botón CRÉDITOS (BOTON CREDITOS.png)
      const btnCreditos = imgs['boton_creditos'];
      if (btnCreditos && btnCreditos.complete) {
        ctx.drawImage(btnCreditos, G.WIDTH / 2 + 10, 256, 135, 42);
      }

      // Hint de controles
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.font = '9px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Controles: [A][D] Mover | [ESPACIO] Saltar | [F] Lanzar Piedras | [ESC] Pausa', G.WIDTH / 2, G.HEIGHT - 12);
      ctx.shadowBlur = 0;
    },

    onClick(x, y) {
      const G = window.Game;
      if (G.audio) G.audio.playSound('button');

      // Click BOTON JUGAR (x: G.WIDTH/2 - 75 .. +75, y: 192 .. 244)
      if (x >= G.WIDTH / 2 - 80 && x <= G.WIDTH / 2 + 80 && y >= 190 && y <= 250) {
        G.stateManager.switch('INTRO');
        return;
      }

      // Click BOTON OPCIONES (x: G.WIDTH/2 - 145 .. -10, y: 256 .. 298)
      if (x >= G.WIDTH / 2 - 150 && x <= G.WIDTH / 2 - 5 && y >= 252 && y <= 302) {
        G.stateManager.push('OPTIONS');
        return;
      }

      // Click BOTON CREDITOS (x: G.WIDTH/2 + 10 .. 145, y: 256 .. 298)
      if (x >= G.WIDTH / 2 + 5 && x <= G.WIDTH / 2 + 150 && y >= 252 && y <= 302) {
        G.stateManager.push('CREDITS');
        return;
      }
    }
  };

  // --- PLAYING STATE ---
  const PlayingState = {
    enter() {
      const G = window.Game;
      if (G.audio) {
        G.audio.playMusic('game');
      }
      if (G.trainWorld) {
        G.trainWorld.init();
      }
    },
    exit() {},
    update(dt) {
      const G = window.Game;

      // Pause toggle
      if (G.controls && G.controls.justPressed('pause')) {
        G.stateManager.push('PAUSE');
        return;
      }

      // Update train world
      if (G.trainWorld) G.trainWorld.update(dt);

      // Update player
      if (G.player) {
        G.player.update(dt);
        if (G.player.state === 'defeat') {
          // Player lost all HP
          G.stateManager.switch('DEFEAT');
          return;
        }
      }

      // Update collectibles
      if (G.collectibleManager) G.collectibleManager.update(dt);

      // Update equipment notifications
      if (G.equipment_manager) G.equipment_manager.update(dt);

      // Update obstacles
      if (G.obstacleManager) G.obstacleManager.update(dt);

      // Update final boss
      if (G.boss) G.boss.update(dt);
    },
    render(ctx) {
      const G = window.Game;

      // 1. Render train scenery and parallax
      if (G.trainWorld) G.trainWorld.render(ctx);

      // 2. Render collectibles
      if (G.collectibleManager) G.collectibleManager.render(ctx);

      // 3. Render obstacles
      if (G.obstacleManager) G.obstacleManager.render(ctx);

      // 4. Render boss
      if (G.boss) G.boss.render(ctx);

      // 5. Render player
      if (G.player) G.player.render(ctx);

      // 6. Render HUD on top of everything
      if (G.interfaceManager) G.interfaceManager.renderHUD(ctx);
    }
  };

  // --- VICTORY STATE ---
  const VictoryState = {
    enter() {
      const G = window.Game;
      if (G.audio) {
        G.audio.stopMusic();
        G.audio.playMusic('stadium');
      }
    },
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      // Alberto Picco Stadium background (CANCHA SPEZIA)
      const stadium = imgs['cancha_spezia'];
      if (stadium && stadium.complete) {
        ctx.drawImage(stadium, 0, 0, G.WIDTH, G.HEIGHT);
      } else {
        ctx.fillStyle = '#0a2312';
        ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);
      }

      // Dark overlay for contrast
      ctx.fillStyle = 'rgba(5, 15, 30, 0.65)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      // Laureles decoration
      const laureles = imgs['laureles'];
      if (laureles && laureles.complete) {
        ctx.drawImage(laureles, G.WIDTH / 2 - 80, 20, 160, 120);
      }

      // GANASTE banner
      const ganaste = imgs['ganaste'];
      if (ganaste && ganaste.complete) {
        ctx.drawImage(ganaste, G.WIDTH / 2 - 100, 60, 200, 70);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 26px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('¡LLEGASTE AL DERBY!', G.WIDTH / 2, 90);
      }

      // Hero in front of stadium wearing full Carrarese kit
      const heroImg = imgs['pj_ropa_completo_piedra_1'] || imgs['pj_camiseta_caminando_1'];
      if (heroImg && heroImg.complete) {
        ctx.drawImage(heroImg, G.WIDTH / 2 - 35, 140, 70, 100);
      }

      // Stats Box
      ctx.fillStyle = 'rgba(0, 20, 50, 0.85)';
      ctx.fillRect(G.WIDTH / 2 - 160, 245, 320, 60);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(G.WIDTH / 2 - 160, 245, 320, 60);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PUNTUACIÓN FINAL: ' + (G.score || 0), G.WIDTH / 2, 262);

      const eq = G.equipment || {};
      const eqText = (eq.camiseta ? '✓ Camiseta  ' : '') + (eq.bufanda ? '✓ Bufanda  ' : '') + (eq.gorra ? '✓ Gorra' : '');
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('Vestuario Carrarese: ' + (eqText || 'Completo'), G.WIDTH / 2, 280);
      ctx.fillText('¡Forza Carrarese! ¡Listos para el Derby!', G.WIDTH / 2, 296);

      // Button Volver al Menú
      const btnMenu = imgs['boton_menu_principal'] || imgs['boton_volver_al_menú'];
      if (btnMenu && btnMenu.complete) {
        ctx.drawImage(btnMenu, G.WIDTH / 2 - 60, 312, 120, 40);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(G.WIDTH / 2 - 70, 315, 140, 32);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('MENÚ PRINCIPAL', G.WIDTH / 2, 335);
      }
    },
    onClick(x, y) {
      const G = window.Game;
      if (y >= 310 && y <= 355 && x >= G.WIDTH / 2 - 80 && x <= G.WIDTH / 2 + 80) {
        this.resetGame();
        G.stateManager.switch('MENU');
      }
    },
    resetGame() {
      const G = window.Game;
      G.score = 0;
      G.stones = 0;
      G.health = 100;
      if (G.player) G.player.reset();
      if (G.collectibleManager) G.collectibleManager.reset();
      if (G.equipment_manager) G.equipment_manager.reset();
      if (G.obstacleManager) G.obstacleManager.reset();
      if (G.boss) G.boss.reset();
    }
  };

  // --- DEFEAT STATE ---
  const DefeatState = {
    enter() {
      const G = window.Game;
      if (G.audio) {
        G.audio.stopMusic();
        G.audio.playSound('hit');
      }
    },
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      const imgs = G.assets.images;

      ctx.fillStyle = '#110303';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      // Carrarese Pierde banner
      const pierdeCartel = imgs['cartel_carrarese_pierde'] || imgs['carrarese_pierde'];
      if (pierdeCartel && pierdeCartel.complete) {
        ctx.drawImage(pierdeCartel, G.WIDTH / 2 - 110, 40, 220, 80);
      } else {
        ctx.fillStyle = '#ff3333';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CARRARESE PIERDE', G.WIDTH / 2, 80);
      }

      // Defeated player sprite
      const defeatImg = imgs['pj_derrota_3'] || imgs['pj_derrota_1'];
      if (defeatImg && defeatImg.complete) {
        ctx.drawImage(defeatImg, G.WIDTH / 2 - 30, 140, 60, 90);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('¡No pudiste llegar al Derby de La Spezia!', G.WIDTH / 2, 250);

      // Buttons
      // Intentar de nuevo
      const btnRetry = imgs['boton_intentar_de_nuevo'];
      if (btnRetry && btnRetry.complete) {
        ctx.drawImage(btnRetry, G.WIDTH / 2 - 130, 280, 110, 42);
      } else {
        ctx.fillStyle = '#0055aa';
        ctx.fillRect(G.WIDTH / 2 - 130, 280, 110, 36);
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText('REINTENTAR', G.WIDTH / 2 - 75, 302);
      }

      // Menu Principal
      const btnMenu = imgs['boton_menu_principal'];
      if (btnMenu && btnMenu.complete) {
        ctx.drawImage(btnMenu, G.WIDTH / 2 + 20, 280, 110, 42);
      } else {
        ctx.fillStyle = '#444';
        ctx.fillRect(G.WIDTH / 2 + 20, 280, 110, 36);
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText('MENÚ', G.WIDTH / 2 + 75, 302);
      }
    },
    onClick(x, y) {
      const G = window.Game;
      // Reintentar
      if (y >= 275 && y <= 325 && x >= G.WIDTH / 2 - 135 && x <= G.WIDTH / 2 - 15) {
        VictoryState.resetGame();
        G.stateManager.switch('PLAYING');
      }
      // Menu
      if (y >= 275 && y <= 325 && x >= G.WIDTH / 2 + 15 && x <= G.WIDTH / 2 + 135) {
        VictoryState.resetGame();
        G.stateManager.switch('MENU');
      }
    }
  };

  // --- PAUSE STATE ---
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', G.WIDTH / 2, G.HEIGHT / 2 - 40);

      // Buttons
      ctx.fillStyle = '#1a3263';
      ctx.fillRect(G.WIDTH / 2 - 80, G.HEIGHT / 2 - 10, 160, 34);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(G.WIDTH / 2 - 80, G.HEIGHT / 2 - 10, 160, 34);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('CONTINUAR', G.WIDTH / 2, G.HEIGHT / 2 + 12);

      ctx.fillStyle = '#333';
      ctx.fillRect(G.WIDTH / 2 - 80, G.HEIGHT / 2 + 35, 160, 34);
      ctx.strokeStyle = '#aaa';
      ctx.strokeRect(G.WIDTH / 2 - 80, G.HEIGHT / 2 + 35, 160, 34);
      ctx.fillStyle = '#fff';
      ctx.fillText('SALIR AL MENÚ', G.WIDTH / 2, G.HEIGHT / 2 + 57);
    },
    onClick(x, y) {
      const G = window.Game;
      if (x >= G.WIDTH / 2 - 80 && x <= G.WIDTH / 2 + 80) {
        if (y >= G.HEIGHT / 2 - 10 && y <= G.HEIGHT / 2 + 25) {
          G.stateManager.pop();
        } else if (y >= G.HEIGHT / 2 + 35 && y <= G.HEIGHT / 2 + 70) {
          VictoryState.resetGame();
          G.stateManager.switch('MENU');
        }
      }
    }
  };

  // --- OPTIONS STATE ---
  const OptionsState = {
    enter() {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = 'rgba(8, 18, 36, 0.95)';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OPCIONES DE SONIDO', G.WIDTH / 2, 60);

      // SFX Volume
      const sfxVol = G.audio ? Math.round(G.audio.sfxVolume * 100) : 70;
      ctx.fillStyle = '#fff';
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText('EFECTOS (SFX): ' + sfxVol + '%', G.WIDTH / 2, 130);
      this.drawVolumeButtons(ctx, G.WIDTH / 2, 155);

      // Music Volume
      const musVol = G.audio ? Math.round(G.audio.musicVolume * 100) : 50;
      ctx.fillStyle = '#fff';
      ctx.fillText('MÚSICA: ' + musVol + '%', G.WIDTH / 2, 210);
      this.drawVolumeButtons(ctx, G.WIDTH / 2, 235);

      // Back Button
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(G.WIDTH / 2 - 60, 290, 120, 34);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('VOLVER', G.WIDTH / 2, 312);
    },
    drawVolumeButtons(ctx, cx, y) {
      // [-] and [+] buttons
      ctx.fillStyle = '#1a3263';
      ctx.fillRect(cx - 70, y, 40, 26);
      ctx.fillRect(cx + 30, y, 40, 26);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(cx - 70, y, 40, 26);
      ctx.strokeRect(cx + 30, y, 40, 26);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('-', cx - 50, y + 18);
      ctx.fillText('+', cx + 50, y + 18);
    },
    onClick(x, y) {
      const G = window.Game;
      if (!G.audio) return;

      // SFX buttons (y: 155-181)
      if (y >= 155 && y <= 181) {
        if (x >= G.WIDTH / 2 - 70 && x <= G.WIDTH / 2 - 30) {
          G.audio.setSFXVolume(G.audio.sfxVolume - 0.1);
          G.audio.playSound('button');
        } else if (x >= G.WIDTH / 2 + 30 && x <= G.WIDTH / 2 + 70) {
          G.audio.setSFXVolume(G.audio.sfxVolume + 0.1);
          G.audio.playSound('button');
        }
      }

      // Music buttons (y: 235-261)
      if (y >= 235 && y <= 261) {
        if (x >= G.WIDTH / 2 - 70 && x <= G.WIDTH / 2 - 30) {
          G.audio.setMusicVolume(G.audio.musicVolume - 0.1);
        } else if (x >= G.WIDTH / 2 + 30 && x <= G.WIDTH / 2 + 70) {
          G.audio.setMusicVolume(G.audio.musicVolume + 0.1);
        }
      }

      // Volver (y: 290-324)
      if (y >= 290 && y <= 324 && x >= G.WIDTH / 2 - 60 && x <= G.WIDTH / 2 + 60) {
        G.stateManager.pop();
      }
    }
  };

  // --- CREDITS STATE ---
  const CreditsState = {
    enter() {},
    exit() {},
    update(dt) {},
    render(ctx) {
      const G = window.Game;
      ctx.fillStyle = '#060d1a';
      ctx.fillRect(0, 0, G.WIDTH, G.HEIGHT);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EL VIAJE DEL HINCHA DEL CARRARESE', G.WIDTH / 2, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText('Un videojuego homenaje al Carrarese Calcio 1908', G.WIDTH / 2, 85);
      ctx.fillText('y al Derby Apuano contra Spezia.', G.WIDTH / 2, 105);

      ctx.fillStyle = '#ffd700';
      ctx.fillText('DESARROLLO:', G.WIDTH / 2, 140);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Equipo de Desarrollo HTML5 Canvas 2D', G.WIDTH / 2, 160);

      ctx.fillStyle = '#ffd700';
      ctx.fillText('ARTE & PIXEL ART:', G.WIDTH / 2, 195);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Assets originales del hincha y escenario ferroviario', G.WIDTH / 2, 215);

      ctx.fillStyle = '#ffd700';
      ctx.fillText('SONIDO & MÚSICA:', G.WIDTH / 2, 250);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Sintetizador Chiptune Web Audio API', G.WIDTH / 2, 270);

      // Back Button
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(G.WIDTH / 2 - 60, 305, 120, 32);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('VOLVER', G.WIDTH / 2, 326);
    },
    onClick(x, y) {
      const G = window.Game;
      if (y >= 300 && y <= 340 && x >= G.WIDTH / 2 - 60 && x <= G.WIDTH / 2 + 60) {
        G.stateManager.pop();
      }
    }
  };

  // Register in Game
  window.Game = window.Game || {};
  const iface = new InterfaceManager();
  window.Game.interfaceManager = iface;
  window.Game.InterfaceManager = InterfaceManager;

  // Register full state objects into stateManager
  if (window.Game.stateManager) {
    window.Game.stateManager.register('MENU', MenuState);
    window.Game.stateManager.register('PLAYING', PlayingState);
    window.Game.stateManager.register('VICTORY', VictoryState);
    window.Game.stateManager.register('DEFEAT', DefeatState);
    window.Game.stateManager.register('PAUSE', PauseState);
    window.Game.stateManager.register('OPTIONS', OptionsState);
    window.Game.stateManager.register('CREDITS', CreditsState);
  }
})();
