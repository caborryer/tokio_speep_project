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
  /** Empieza una partida nueva (la primera y cada reinicio): útil para pedir el token del ranking. */
  onRunStart?: () => void;
};

/** Control del juego desde fuera (React). */
export type DinoControls = {
  stop: () => void;
  /** Reinicia la partida si Manuel ya chocó. */
  restart: () => void;
  /** Pausa el juego e ignora el teclado/toques (por ejemplo, mientras hay un panel abierto). */
  setLocked: (locked: boolean) => void;
  isAlive: () => boolean;
};

type ObstacleKind = "cactus1" | "cactus2" | "cactusBig" | "cactusTriple" | "rock" | "weed" | "birdLow" | "birdHigh";

/** Cuerpo de colisión de un obstáculo (centro-abajo en px, relativo al suelo). */
type Obstacle = {
  obj: { pos: { x: number; y: number }; destroy: () => void; width?: number };
  kind: ObstacleKind;
  /** Multiplicador de velocidad respecto al suelo (>1: se acerca más rápido). */
  rel: number;
  hw: number; // semiancho de la caja
  hh: number; // semialto de la caja
  /** Altura (px) del centro de la caja sobre el suelo. */
  cy: () => number;
  /** Animación propia (aleteo, rodar...). */
  tick?: (dt: number, step: number) => void;
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
): Promise<DinoControls> {
  const noop: DinoControls = { stop: () => {}, restart: () => {}, setLocked: () => {}, isAlive: () => false };
  const { default: kaplay } = await import("kaplay");
  // En React StrictMode (dev) el efecto se monta/desmonta dos veces: no inicializar si ya se canceló
  if (signal?.aborted) return noop;

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
    return noop;
  }

  // ---------- Constantes de juego ----------
  const MAN_H = 130;
  const MAN_X = Math.round(W * (portrait ? 0.2 : 0.17));
  const GRAVITY = 1900;
  const JUMP_V = 800;
  const START_SPEED = 240;
  const MAX_SPEED = 560;
  const SPEED_RAMP = 0.012; // px/s extra por cada px recorrido
  const DUCK_SCALE = 0.58; // Manuel agachado (escala vertical)

  // Solo en desarrollo (se elimina del build de producción): ?dbg=700 empieza con ese puntaje y ?god=1 no muere.
  const DEV = process.env.NODE_ENV !== "production";
  const qs = DEV ? new URLSearchParams(window.location.search) : null;
  const dbgStart = Number(qs?.get("dbg") ?? 0) * 25;
  const god = DEV && qs?.get("god") === "1";

  // ---------- Estado ----------
  let speed = START_SPEED;
  let distance = dbgStart;
  let lastScore = -1;
  let alive = true;
  let vy = 0; // velocidad vertical (px/s, + = hacia abajo)
  let lift = 0; // altura sobre el suelo (px, >= 0)
  let stepT = 0;
  let dustT = 0;
  let spawnIn = 2.4; // el siguiente cactus, después del primero
  let introT = 0;
  let deadAt = 0;
  let ducking = false;
  let locked = false;
  let obstacles: Obstacle[] = [];

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
    k.scale(1),
    k.opacity(1),
    k.z(5),
  ]);
  const manW = man.width;

  // Caja de colisión de Manuel (en px, relativa a su punto "bot-center").
  const hit = () => {
    const duck = ducking && lift <= 0.5;
    return {
      l: man.pos.x - manW * 0.16,
      r: man.pos.x + manW * 0.2,
      t: man.pos.y - MAN_H * 0.95 * (duck ? DUCK_SCALE : 1),
      b: man.pos.y - MAN_H * 0.08 * (duck ? DUCK_SCALE : 1),
    };
  };

  // ---------- Obstáculos ----------
  // Se dibujan con las primitivas de KAPLAY (drawPolygon, drawCircle, drawLines...) en blanco
  // para que combinen con el estilo del juego. Cada uno trae su propia caja de colisión.
  const WHITE = k.rgb(255, 255, 255);
  const INK = k.rgb(5, 5, 5);

  const addCactus = (sprite: "cactus1" | "cactus2", h: number, x: number, kind: ObstacleKind) => {
    const o = k.add([k.sprite(sprite, { height: h }), k.pos(x, GROUND_Y + 2), k.anchor("bot"), k.z(3), "obstacle"]);
    const hh = h * 0.46;
    obstacles.push({ obj: o, kind, rel: 1, hw: o.width * 0.25, hh, cy: () => hh - 2 });
  };

  const addRock = (x: number) => {
    const body = [k.vec2(-34, 0), k.vec2(-27, -17), k.vec2(-11, -29), k.vec2(7, -34), k.vec2(24, -25), k.vec2(36, -9), k.vec2(35, 0)];
    const o = k.add([
      k.pos(x, GROUND_Y + 2),
      k.z(3),
      {
        draw() {
          k.drawPolygon({ pts: body, color: WHITE });
          k.drawLines({ pts: [k.vec2(-6, -30), k.vec2(-2, -18), k.vec2(-9, -10)], width: 2, color: INK });
          k.drawLines({ pts: [k.vec2(15, -26), k.vec2(12, -14)], width: 2, color: INK });
        },
      },
      "obstacle",
    ]);
    obstacles.push({ obj: o, kind: "rock", rel: 1, hw: 28, hh: 14, cy: () => 14 });
  };

  /** Matorral rodante: llega más rápido que el suelo y va dando saltitos. */
  const WEED_REL = 1.28;
  const addWeed = (x: number) => {
    const r = 22;
    let ang = 0;
    let bt = k.rand(0, 6);
    const chords: [number, number, number, number][] = [
      [-0.75, -0.2, 0.7, 0.25],
      [-0.3, -0.8, 0.35, 0.75],
      [-0.7, 0.35, 0.6, -0.4],
      [0.05, -0.95, -0.05, 0.9],
    ];
    const o = k.add([
      k.pos(x, GROUND_Y - r),
      k.z(3),
      {
        draw() {
          k.pushTransform();
          k.pushRotate(ang);
          k.drawCircle({ radius: r, fill: false, outline: { width: 3, color: WHITE } });
          for (const [x1, y1, x2, y2] of chords) {
            k.drawLines({ pts: [k.vec2(x1 * r, y1 * r), k.vec2(x2 * r, y2 * r)], width: 2, color: WHITE });
          }
          k.popTransform();
        },
      },
      "obstacle",
    ]);
    obstacles.push({
      obj: o,
      kind: "weed",
      rel: WEED_REL,
      hw: 17,
      hh: 17,
      cy: () => GROUND_Y - o.pos.y,
      tick: (dt, sp) => {
        bt += dt * 5;
        o.pos.y = GROUND_Y - r - Math.abs(Math.sin(bt)) * 16;
        ang -= ((sp * WEED_REL * dt) / r) * 57.3;
      },
    });
  };

  /** Pájaro: bajo (hay que saltarlo) o alto (hay que agacharse con ↓ / S, o saltarlo con buen tiempo). */
  const BIRD_REL = 1.18;
  const addBird = (x: number, above: number) => {
    let t = k.rand(0, 3);
    const o = k.add([
      k.pos(x, GROUND_Y - above),
      k.z(3),
      {
        draw() {
          const f = Math.sin(t * 15); // aleteo
          // cola
          k.drawPolygon({ pts: [k.vec2(14, -1), k.vec2(30, -5), k.vec2(30, 5)], color: WHITE });
          // ala (arriba/abajo)
          k.drawPolygon({ pts: [k.vec2(-8, -5), k.vec2(10, -5), k.vec2(6, -5 - 24 * f)], color: WHITE });
          // cuerpo y cabeza
          k.drawEllipse({ radiusX: 17, radiusY: 8, color: WHITE });
          k.drawCircle({ pos: k.vec2(-19, -3), radius: 6.5, color: WHITE });
          k.drawPolygon({ pts: [k.vec2(-24, -5), k.vec2(-35, 0), k.vec2(-24, 0)], color: WHITE });
          k.drawCircle({ pos: k.vec2(-21, -5), radius: 1.6, color: INK });
        },
      },
      "obstacle",
    ]);
    obstacles.push({
      obj: o,
      kind: above > 50 ? "birdHigh" : "birdLow",
      rel: BIRD_REL,
      hw: 20,
      hh: 11,
      cy: () => above,
      tick: (dt) => {
        t += dt;
      },
    });
  };

  const spawn = (kind: ObstacleKind, x: number) => {
    switch (kind) {
      case "cactus1":
        return addCactus("cactus1", 69, x, kind);
      case "cactus2":
        return addCactus("cactus2", 56, x, kind);
      case "cactusBig":
        return addCactus("cactus1", 104, x, kind);
      case "cactusTriple":
        addCactus("cactus1", 66, x, kind);
        addCactus("cactus1", 50, x + 44, kind);
        return addCactus("cactus1", 66, x + 88, kind);
      case "rock":
        return addRock(x);
      case "weed":
        return addWeed(x);
      case "birdLow":
        return addBird(x, 26);
      case "birdHigh":
        return addBird(x, 88);
    }
  };

  const REL: Record<ObstacleKind, number> = {
    cactus1: 1, cactus2: 1, cactusBig: 1, cactusTriple: 1, rock: 1, weed: WEED_REL, birdLow: BIRD_REL, birdHigh: BIRD_REL,
  };

  /** Dificultad progresiva según el puntaje: va sumando obstáculos nuevos. */
  const pickKind = (): ObstacleKind => {
    const sc = Math.max(0, lastScore);
    const pool: [ObstacleKind, number][] = [["cactus1", 3], ["cactus2", 2]];
    if (sc >= 150) pool.push(["cactusTriple", 2], ["rock", 2], ["cactusBig", 1]);
    if (sc >= 350) pool.push(["weed", 3]);
    if (sc >= 600) pool.push(["birdLow", 2], ["birdHigh", 3]);
    const total = pool.reduce((a, [, w]) => a + w, 0);
    let r = k.rand(0, total);
    for (const [kind, w] of pool) {
      if ((r -= w) <= 0) return kind;
    }
    return "cactus1";
  };

  const SPAWN_X = W + 60;
  let nextKind: ObstacleKind = pickKind();
  /** Segundos hasta el siguiente obstáculo: siempre deja espacio para aterrizar y reaccionar. */
  const gapSeconds = (kind: ObstacleKind) => {
    const minGap = speed * 0.9 + 130; // px
    const tight = lastScore >= 350 && k.rand(0, 1) < 0.2; // a veces, obstáculos "pegados"
    const gap = tight ? minGap + k.rand(0, 40) : minGap + k.rand(60, 460);
    // los que llegan más rápido (pájaros, matorral) necesitan salir un poco más tarde
    const catchUp = REL[kind] > 1 ? ((SPAWN_X - MAN_X) / speed) * (1 - 1 / REL[kind]) : 0;
    return gap / speed + catchUp;
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
    if (locked) return;
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
  const isDuckKey = (e: KeyboardEvent) => e.code === "ArrowDown" || e.code === "KeyS" || e.key === "ArrowDown";
  const onKeyDown = (e: KeyboardEvent) => {
    if (locked) return; // panel abierto (formulario / ranking): no robar el teclado
    if (isDuckKey(e)) {
      e.preventDefault();
      ducking = true;
      return;
    }
    if (!isJumpKey(e)) return;
    e.preventDefault();
    if (!e.repeat) jump();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (isDuckKey(e)) ducking = false;
  };
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  k.onClick(jump);

  // En celular: tocar = saltar; mantener el dedo y deslizar hacia abajo = agacharse.
  let touchY0 = 0;
  const onTouchStart = (e: TouchEvent) => {
    touchY0 = e.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!locked && (e.touches[0]?.clientY ?? 0) - touchY0 > 30) ducking = true;
  };
  const onTouchEnd = () => {
    ducking = false;
  };
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: true });

  const restart = () => {
    k.destroyAll("obstacle");
    obstacles = [];
    distance = dbgStart;
    lastScore = -1;
    speed = START_SPEED;
    spawn("cactus1", W * 0.8);
    nextKind = pickKind();
    spawnIn = 2;
    vy = 0;
    lift = 0;
    ducking = false;
    man.scale = k.vec2(1, 1);
    alive = true;
    man.opacity = 1;
    man.angle = 0;
    cb.onRestart?.();
    cb.onRunStart?.();
  };

  // El primer cactus ya está en pantalla desde el inicio y llega a Manuel en ~2 s,
  // cuando él ya terminó de entrar y puede saltar.
  spawn("cactus1", W * 0.72);

  cb.onReady?.();
  cb.onRunStart?.();

  // ---------- Loop principal ----------
  k.onUpdate(() => {
    if (locked) return; // pausa (panel abierto)
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
    speed = Math.min(MAX_SPEED, START_SPEED + distance * SPEED_RAMP);
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
      vy += GRAVITY * (ducking ? 2.4 : 1) * dt; // ↓ en el aire = caída rápida
      man.scale = k.vec2(1, 1);
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
      man.scale = ducking ? k.vec2(1.1, DUCK_SCALE) : k.vec2(1, 1); // agachado

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
        spawn(nextKind, SPAWN_X);
        nextKind = pickKind();
        spawnIn = gapSeconds(nextKind);
      }
    }

    const m = hit();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.obj.pos.x -= speed * ob.rel * dt;
      ob.tick?.(dt, speed);
      if (ob.obj.pos.x < -160) {
        ob.obj.destroy();
        obstacles.splice(i, 1);
        continue;
      }
      const cy = GROUND_Y - ob.cy();
      if (
        !god &&
        m.r > ob.obj.pos.x - ob.hw &&
        m.l < ob.obj.pos.x + ob.hw &&
        m.b > cy - ob.hh &&
        m.t < cy + ob.hh
      ) {
        alive = false;
        deadAt = k.time();
        man.angle = -14;
        man.scale = k.vec2(1, 1);
        sfx.die();
        cb.onGameOver?.(lastScore);
        break;
      }
    }
  });

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    locked = true;
    window.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("touchcancel", onTouchEnd);
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

  return {
    stop,
    restart: () => {
      if (!alive) restart();
    },
    setLocked: (v: boolean) => {
      locked = v;
      if (v) ducking = false;
    },
    isAlive: () => alive,
  };
}
