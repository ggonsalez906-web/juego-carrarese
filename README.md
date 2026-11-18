# EL VIAJE DEL HINCHA DEL CARRARESE
## Videojuego Web 2D Arcade en HTML5 Canvas

**"El viaje del hincha del Carrarese"** es un videojuego de aventuras y plataformas lateral retro arcade desarrollado íntegramente con tecnologías web estándar (**HTML5, CSS3 y JavaScript moderno**), sin utilizar motores externos como Godot o Unity.

---

## 1. HISTORIA Y CONCEPTO

El protagonista es un ferviente hincha del **Carrarese Calcio 1908** que viaja en tren desde la estación de **Carrara (Toscana)** hasta **La Spezia (Liguria)** para asistir al apasionante **Derby Apuano** en el estadio **Campo Sportivo Municipale Alberto Picco**.

A lo largo de los 10 vagones de este tren en veloz movimiento, el hincha debe:
1. **Recorrer el tren** saltando obstáculos del suelo (valijas, bultos y banderas rivales de Spezia).
2. **Recuperar su indumentaria del Carrarese**:
   - **Camiseta oficial**: se equipa inmediatamente y cambia el sprite al personaje vistiendo la camiseta.
   - **Bufanda auriazul**: se equipa sobre el personaje y otorga puntos.
   - **Gorra del Carrarese**: completa el atuendo del hincha, desbloqueando el vestuario completo.
3. **Recolectar piedras**: distribuidas por el pasillo del tren como munición limitada.
4. **Vencer al Jefe Final**: en el último vagón, enfrentar al carismático **Líder de la Hinchada de Spezia**, arrojándole piedras para vencerlo.
5. **Llegada y Victoria**: descender del tren y llegar triunfalmente al estadio Alberto Picco de noche, rodeado de laureles y cánticos.

---

## 2. CONTROLES

### Computadora (Teclado)
- **Moverse a la izquierda**: Flecha Izquierda `◀` o tecla `A`
- **Moverse a la derecha**: Flecha Derecha `▶` o tecla `D`
- **Saltar**: `Barra Espaciadora`, Flecha Arriba `▲` o tecla `W`
- **Lanzar piedras**: Tecla `F` (consume piedras del inventario)
- **Interactuar**: Tecla `E`
- **Pausa / Menú**: Tecla `ESC` o `P`

### Dispositivos Móviles (Pantalla Táctil)
- **Botones virtuales en pantalla**:
  - `◀` y `▶` en la esquina inferior izquierda.
  - `▲` (Salto) y `F` (Lanzar piedras) en la esquina inferior derecha.

---

## 3. CÓMO EJECUTAR EL JUEGO

1. **Opción recomendada (con servidor local)**:
   - Haz doble clic en el archivo `INICIAR_JUEGO.bat`.
   - Se abrirá automáticamente en tu navegador predeterminado en `http://localhost:8000/`.
2. **Opción directa**:
   - Haz doble clic directamente en `index.html` para abrirlo en Chrome, Edge o Firefox.

---

## 4. ESTRUCTURA DE ARCHIVOS Y ARQUITECTURA

```
Carrarese_Aventura/
├── index.html                 # Estructura principal y canvas 640x360
├── INICIAR_JUEGO.bat          # Lanzador automático
├── README.md                  # Documentación
├── css/
│   └── style.css              # Estilos, renderizado pixelado y controles táctiles
├── js/
│   ├── main.js                # Game loop central, carga y verificación de assets
│   ├── gameState.js           # Máquina de estados (Menu, Intro, Map, Play, Boss, Victory, Defeat)
│   ├── renderer.js            # Cámara suave, dibujado de sprites y parallax
│   ├── animation.js           # Control de animaciones con deltaTime
│   ├── physics.js             # Físicas, gravedad y sistema de colisiones AABB
│   ├── controls.js            # Gestor de teclado y controles táctiles
│   ├── audio.js               # Sintetizador procedural Web Audio API (efectos y chiptune)
│   ├── equipment.js           # Sistema de equipamiento visual de prendas
│   ├── player.js              # Protagonista, animaciones por indumentaria y proyectiles
│   ├── collectibles.js        # Camiseta, bufanda, gorra, piedras y copa
│   ├── obstacles.js           # Valijas, equipajes y banderas de Spezia
│   ├── train.js               # Escenario interior del tren y paisaje en movimiento
│   ├── intro.js               # Animación cinemática del tren ingresando y deteniéndose
│   ├── map.js                 # Mapa de Italia con el trayecto Carrara -> La Spezia
│   ├── boss.js                # Enfrentamiento contra el Líder de la Hinchada de Spezia
│   └── interface.js           # HUD durante el juego, menús, victoria y derrota
└── assets/
    ├── personajes/            # Sprites del hincha en todas sus poses e indumentarias
    ├── enemigos/              # Sprites del Líder de Spezia y simpatizantes
    ├── escenarios/            # Estación Carrara, trenes, vagón sin fondo, montañas, mapa, estadio
    ├── objetos/               # Indumentaria del Carrarese, valijas, piedras, copa, bandera
    ├── interfaz/              # Botones, carteles, escudo y trofeos
    └── audio/                 # Directorio de audio
```

---

## 5. CARACTERÍSTICAS TÉCNICAS DESTACADAS

- **Resolución nativa**: 640x360 píxeles, escalado responsivo manteniendo el aspect ratio 16:9 y nitidez con `image-rendering: pixelated`.
- **Secuencia cinemática inicial**: El tren ingresa desde la derecha, desacelera suavemente por interpolación física (easing), se detiene exactamente en el andén y abre sus puertas antes de pasar al mapa.
- **Mapa interactivo**: Animación del recorrido ferroviario por la costa del mar Tirreno entre Toscana y Liguria.
- **Interior del tren en movimiento**: Efecto parallax continuo por las ventanas mostrando el paisaje toscano-ligur mientras el jugador recorre 10 vagones conectados.
- **Equipamiento dinámico**: Al tomar cada prenda (camiseta, bufanda, gorra), el protagonista actualiza sus spritesheets para vestir la indumentaria durante todo el trayecto.
- **Combate con piedras limitadas**: Sistema balístico para arrojar piedras contra el jefe final, con físicas y detección de impactos.
- **Audio retro completo**: Sintetizado en tiempo real con Web Audio API (tonos, marchas arcade, arpegios, silbato de tren y música de estadio).
