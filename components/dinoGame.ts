/**
 * Juego tipo "dinosaurio de Chrome" con Manuel, hecho con KAPLAY.
 * Se importa de forma dinámica para que nunca corra en el servidor (SSR).
 */

export type DinoCallbacks = {
  /** Los sprites ya cargaron y el juego empieza a correr. */
  onReady?: () => void;
  /** Se llama cuando cambia el puntaje visible (entero). */
  onScore?: (score: number) => void;
  /** Manuel chocó con un cactus. */
  onGameOver?: (score: number) => void;
  /** El jugador reinició después de chocar. */
  onRestart?: () => void;
};

const SPRITES = {
  manuel: "/loader/manuel-ciclo4.png",
  nube: "/loader/nube.svg",
  cactus1: "/loader/cactus-1.svg",
  cactus2: "/loader/cactus-2.svg",
  desierto: "/loader/desierto.svg",
} as const;

export async function startDinoGame(
  canvas: HTMLCanvasElement,
  cb: DinoCallbacks = {},
  signal?: AbortSignal,
): Promise<() => void> {
  const { default: kaplay } = await import("kaplay");
  // En React StrictMode (dev) el efecto se monta/desmonta dos veces: no inicializar si ya se canceló
  if (signal?.aborted) return () => {};

  // Tamaño lógico del "mundo". En vertical (celular) usamos un mundo más angosto.
  const portrait = window.innerWidth < window.innerHeight * 0.85;
  const W = portrait ? 560 : 960;
  const H = 540;
  const GROUND_Y = Math.round(H * 0.8);

  const k = kaplay({
    canvas,
    width: W,
    height: H,
    pixelDensity: 2,
    background: [0, 0, 0, 0], // transparente: se ve la cuadrícula del overlay
    global: false,
    debug: false,
    focus: false,
    touchToMouse: true,
    loadingScreen: false,
    texFilter: "linear",
  });

  // ---------- Carga de sprites ----------
  for (const [name, url] of Object.entries(SPRITES)) {
    if (name === "manuel") k.loadSprite(name, url, { sliceX: 4, sliceY: 1 });
    else k.loadSprite(name, url);
  }
  await new Promise<void>((resolve, reject) => {
    k.onLoad(() => resolve());
    k.onError?.(() => reject(new Error("No se pudieron cargar los sprites del loader")));
  });

  if (signal?.aborted) {
    k.quit();
    return () => {};
  }

  // ---------- Constantes de juego ----------
  const MAN_H = 130;
  const MAN_X = Math.round(W * (portrait ? 0.2 : 0.17));
  const GRAVITY = 1900;
  const JUMP_V = 800;
  const START_SPEED = 240;
  const MAX_SPEED = 380;

  // ---------- Estado ----------
  let speed = START_SPEED;
  let distance = 0;
  let lastScore = -1;
  let alive = true;
  let vy = 0; // velocidad vertical (px/s, + = hacia abajo)
  let lift = 0; // altura sobre el suelo (px, >= 0)
  let stepT = 0;
  let dustT = 0;
  let spawnIn = 2.4; // el siguiente cactus, después del primero
  let introT = 0;
  let deadAt = 0;

  // ---------- Fondo: desierto (estático, como en la referencia) ----------
  k.add([
    k.sprite("desierto", { width: Math.min(540, W * 0.94) }),
    k.pos(W / 2, GROUND_Y + 2),
    k.anchor("bot"),
    k.opacity(0.8),
    k.z(0),
  ]);

  // ---------- Nubes ----------
  const clouds = Array.from({ length: portrait ? 3 : 4 }, (_, i) => {
    const w = k.rand(90, 130);
    const c = k.add([
      k.sprite("nube", { width: w }),
      k.pos(((i + 0.5) / (portrait ? 3 : 4)) * W + k.rand(-40, 40), k.rand(H * 0.07, H * 0.24)),
      k.anchor("center"),
      k.opacity(0.95),
      k.z(1),
    ]);
    return { obj: c, factor: k.rand(0.06, 0.14) };
  });

  // ---------- Suelo con rayitas que corren ----------
  const dashes = Array.from({ length: 34 }, () => ({
    x: k.rand(0, W),
    y: k.rand(8, 34),
    w: Math.round(k.rand(3, 16)),
    o: k.rand(0.4, 1),
  }));
  k.add([
    k.pos(0, 0),
    k.z(2),
    {
      draw() {
        k.drawRect({ pos: k.vec2(0, GROUND_Y), width: W, height: 2, color: k.rgb(255, 255, 255) });
        for (const d of dashes) {
          k.drawRect({
            pos: k.vec2(Math.round(d.x), GROUND_Y + d.y),
            width: d.w,
            height: 2,
            color: k.rgb(255, 255, 255),
            opacity: d.o,
          });
        }
      },
    },
  ]);

  // ---------- Manuel ----------
  const man = k.add([
    k.sprite("manuel", { height: MAN_H, frame: 0 }),
    k.pos(-120, GROUND_Y + 3),
    k.anchor("bot"),
    k.rotate(0),
    k.opacity(1),
    k.z(5),
  ]);
  const manW = man.width;

  // Caja de colisión de Manuel (en px, relativa a su punto "bot-center").
  const hit = () => ({
    l: man.pos.x - manW * 0.16,
    r: man.pos.x + manW * 0.2,
    t: man.pos.y - MAN_H * 0.95,
    b: man.pos.y - MAN_H * 0.08,
  });

  // ---------- Obstáculos ----------
  const spawnObstacle = (x = W + 60, single = false) => {
    const double = !single && k.rand(0, 1) < 0.4;
    const h = double ? 56 : 69;
    const o = k.add([
      k.sprite(double ? "cactus2" : "cactus1", { height: h }),
      k.pos(x, GROUND_Y + 2),
      k.anchor("bot"),
      k.z(3),
      "obstacle",
    ]);
    return o;
  };

  // ---------- Sonido (sintetizado con Web Audio, sin archivos) ----------
  let ac: AudioContext | null = null;
  const unlock = () => {
    try {
      if (!ac) {
        const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (C) ac = new C();
      }
      if (ac && ac.state === "suspended") void ac.resume();
    } catch {
      /* sin audio */
    }
  };
  const tone = (freq: number, dur: number, vol = 0.05, delay = 0, slideTo?: number) => {
    if (!ac) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  };
  const sfx = {
    jump: () => tone(440, 0.15, 0.05, 0, 820),
    point: () => {
      tone(880, 0.08, 0.04);
      tone(1175, 0.14, 0.04, 0.09);
    },
    die: () => {
      tone(320, 0.12, 0.06, 0, 160);
      tone(150, 0.3, 0.06, 0.13, 60);
    },
  };

  // ---------- Entrada ----------
  const jump = () => {
    unlock();
    if (!alive) {
      if (k.time() - deadAt < 0.45) return; // evita reinicio accidental
      restart();
      return;
    }
    if (introT < 1) return;
    if (lift <= 0.5) {
      vy = -JUMP_V;
      sfx.jump();
    }
  };
  // Un toque rápido de tecla siempre da el salto completo (sin salto variable).
  const isJumpKey = (e: KeyboardEvent) =>
    e.code === "Space" ||
    e.code === "ArrowUp" ||
    e.code === "KeyW" ||
    e.key === " " ||
    e.key === "Spacebar" ||
    e.key === "ArrowUp" ||
    e.keyCode === 32;
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isJumpKey(e)) return;
    e.preventDefault();
    if (!e.repeat) jump();
  };
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keydown", onKeyDown, true);
  k.onClick(jump);

  const restart = () => {
    k.destroyAll("obstacle");
    distance = 0;
    speed = START_SPEED;
    spawnObstacle(W * 0.8, true);
    spawnIn = 2;
    vy = 0;
    lift = 0;
    alive = true;
    man.opacity = 1;
    man.angle = 0;
    cb.onRestart?.();
  };

  // El primer cactus ya está en pantalla desde el inicio y llega a Manuel en ~2 s,
  // cuando él ya terminó de entrar y puede saltar.
  spawnObstacle(W * 0.72, true);

  cb.onReady?.();

  // ---------- Loop principal ----------
  k.onUpdate(() => {
    const dt = Math.min(k.dt(), 1 / 20);

    // Nubes siempre se mueven (incluso con game over)
    const flow = alive ? speed : 40;
    for (const c of clouds) {
      c.obj.pos.x -= flow * c.factor * dt;
      if (c.obj.pos.x < -c.obj.width) {
        c.obj.pos.x = W + c.obj.width;
        c.obj.pos.y = k.rand(H * 0.07, H * 0.24);
      }
    }

    // Entrada de Manuel corriendo desde la izquierda
    if (introT < 1) {
      introT = Math.min(1, introT + dt / 0.9);
      const e = 1 - Math.pow(1 - introT, 3);
      man.pos.x = -120 + (MAN_X + 120) * e;
    }

    if (!alive) {
      // Parpadeo de "derrota"
      man.opacity = Math.sin(k.time() * 24) > 0 ? 1 : 0.25;
      return;
    }

    // Velocidad / distancia / puntaje
    speed = Math.min(MAX_SPEED, START_SPEED + distance * 0.01);
    distance += speed * dt;
    const score = Math.floor(distance / 25);
    if (score !== lastScore) {
      lastScore = score;
      if (score > 0 && score % 100 === 0) sfx.point(); // pitido cada 100 puntos, como el dino
      cb.onScore?.(score);
    }

    // Rayitas del suelo
    for (const d of dashes) {
      d.x -= speed * dt;
      if (d.x + d.w < 0) {
        d.x = W + k.rand(0, 60);
        d.y = k.rand(8, 34);
        d.w = Math.round(k.rand(3, 16));
      }
    }

    // Física del salto
    if (lift > 0 || vy < 0) {
      vy += GRAVITY * dt;
      lift -= vy * dt;
      if (lift <= 0) {
        lift = 0;
        vy = 0;
      }
    }

    // Ciclo de carrera: 1-2-3-4 (pies alternando), cuadro fijo mientras salta
    if (lift <= 0) {
      stepT += dt * (speed / START_SPEED) * 10;
      man.frame = Math.floor(stepT) % 4;
      man.pos.y = GROUND_Y + 3;
      man.angle = 0;

      // polvito
      dustT -= dt;
      if (dustT <= 0 && introT >= 0.5) {
        dustT = 0.09;
        const s = Math.round(k.rand(3, 6));
        k.add([
          k.rect(s, s),
          k.pos(man.pos.x - manW * 0.28, GROUND_Y - k.rand(0, 8)),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.move(k.vec2(-1, k.rand(-0.35, 0)), k.rand(110, 210)),
          k.lifespan(0.4, { fade: 0.3 }),
          k.z(4),
        ]);
      }
    } else {
      man.frame = 0;
      man.pos.y = GROUND_Y + 3 - lift;
      man.angle = -4;
    }

    // Obstáculos
    if (introT >= 1) {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawnObstacle(W + 60, distance < 3500); // al principio solo cactus sencillos
        // separación mínima en píxeles => siempre hay espacio para aterrizar
        spawnIn = k.rand(430, 800) / speed;
      }
    }

    const m = hit();
    for (const o of k.get("obstacle")) {
      o.pos.x -= speed * dt;
      if (o.pos.x < -160) {
        o.destroy();
        continue;
      }
      const ow = o.width * 0.5;
      const oh = o.height * 0.92;
      const ol = o.pos.x - ow / 2;
      const or = o.pos.x + ow / 2;
      const ot = o.pos.y - oh;
      const ob = o.pos.y;
      if (m.r > ol && m.l < or && m.b > ot && m.t < ob) {
        alive = false;
        deadAt = k.time();
        man.angle = -14;
        sfx.die();
        cb.onGameOver?.(lastScore);
        break;
      }
    }
  });

  return () => {
    window.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    try {
      void ac?.close();
    } catch {
      /* ya cerrado */
    }
    try {
      k.quit();
    } catch {
      /* ya estaba cerrado */
    }
  };
}
