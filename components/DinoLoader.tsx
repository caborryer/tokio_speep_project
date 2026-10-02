"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DinoLoader.module.css";
import { startDinoGame } from "./dinoGame";

/** Para no repetir el loader al navegar de vuelta al inicio sin recargar. */
let hasShown = false;

/** Imágenes de la página que queremos tener listas antes de quitar el loader. */
const DEFAULT_ASSETS = [
  "/5.png",
  "/trail.svg",
  "/thermometer-hot.svg",
  "/mountains.svg",
  "/conqueror.svg",
];

const FADE_MS = 700;
const MAX_MS = 15000; // por seguridad: nunca bloquear la página más de esto

const pad = (n: number) => String(Math.max(0, Math.min(99999, n))).padStart(5, "0");

type Props = {
  /** Imágenes a precargar (cuentan para la barra de progreso). */
  assets?: string[];
  /** Tiempo mínimo en pantalla (ms) para que se alcance a ver la animación. */
  minDuration?: number;
};

export default function DinoLoader({ assets = DEFAULT_ASSETS, minDuration = 4000 }: Props) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">(hasShown ? "done" : "loading");

  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const hiRef = useRef<HTMLSpanElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const bestRef = useRef(0);

  // Bloquea el scroll de la página mientras el loader está visible
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // ---------- Juego (KAPLAY) ----------
  useEffect(() => {
    if (hasShown) return;
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    try {
      bestRef.current = Number(localStorage.getItem("tsp-dino-best") || 0);
    } catch {
      /* sin storage */
    }
    if (hiRef.current) hiRef.current.textContent = `HI ${pad(bestRef.current)}`;

    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);

    const ctrl = new AbortController();
    let cancelled = false;
    let stop: (() => void) | undefined;

    startDinoGame(canvas, {
      onScore: (s) => {
        if (scoreRef.current) scoreRef.current.textContent = pad(s);
      },
      onGameOver: (s) => {
        msgRef.current?.classList.add(styles.show);
        if (s > bestRef.current) {
          bestRef.current = s;
          if (hiRef.current) hiRef.current.textContent = `HI ${pad(s)}`;
          try {
            localStorage.setItem("tsp-dino-best", String(s));
          } catch {
            /* sin storage */
          }
        }
      },
      onRestart: () => msgRef.current?.classList.remove(styles.show),
    }, ctrl.signal)
      .then((cleanup) => {
        if (cancelled) cleanup();
        else stop = cleanup;
      })
      .catch((err) => console.warn("[DinoLoader] El juego no pudo iniciar:", err));

    return () => {
      cancelled = true;
      ctrl.abort();
      stop?.();
      canvas.remove();
    };
  }, []);

  // ---------- Progreso real de carga ----------
  useEffect(() => {
    if (hasShown) return;

    const start = performance.now();
    let loadedAssets = 0;
    let fontsReady = false;
    let windowLoaded = document.readyState === "complete";
    let shown = 0;
    let raf = 0;
    let finished = false;
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;

    const bump = () => {
      loadedAssets += 1;
    };
    assets.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump; // un asset roto no debe trabar el loader
      img.src = src;
    });

    document.fonts?.ready.then(() => (fontsReady = true)).catch(() => (fontsReady = true));
    if (!document.fonts) fontsReady = true;
    const onLoad = () => (windowLoaded = true);
    if (!windowLoaded) window.addEventListener("load", onLoad);

    const finish = () => {
      if (finished) return;
      finished = true;
      if (labelRef.current) labelRef.current.textContent = "LISTO!";
      setPhase("leaving");
      leaveTimer = setTimeout(() => {
        hasShown = true;
        setPhase("done");
      }, FADE_MS + 250);
    };

    const tick = () => {
      const elapsed = performance.now() - start;
      const assetsFrac = assets.length ? loadedAssets / assets.length : 1;
      const real = assetsFrac * 0.8 + (fontsReady ? 0.1 : 0) + (windowLoaded ? 0.1 : 0);
      // La barra nunca va más rápido que el tiempo mínimo, ni más allá de lo realmente cargado
      const target = Math.min(real, elapsed / minDuration);
      shown += (target - shown) * 0.08;
      if (target >= 1 && shown > 0.995) shown = 1;
      if (fillRef.current) fillRef.current.style.width = `${(shown * 100).toFixed(1)}%`;

      if (shown >= 1 || elapsed > MAX_MS) {
        if (fillRef.current) fillRef.current.style.width = "100%";
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (leaveTimer) clearTimeout(leaveTimer);
      window.removeEventListener("load", onLoad);
    };
  }, [assets, minDuration]);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.overlay} ${phase === "leaving" ? styles.leaving : ""}`}
      role="progressbar"
      aria-label="Cargando The 500 KM Project"
      aria-busy={phase === "loading"}
    >
      <div className={styles.grid} />
      <div className={styles.canvasWrap} ref={canvasWrapRef} />

      <div className={styles.hud} aria-hidden="true">
        <span className={styles.hi} ref={hiRef}>HI 00000</span>
        <span ref={scoreRef}>00000</span>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.line1}>
            <span className={styles.el}>el</span>Reto
          </span>
          <span className={styles.line2}>
            <span className={styles.num}>500</span>
            <span className={styles.km}>Kilometros</span>
          </span>
          <span className={styles.tag}>The Speed Project</span>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.bar}>
            <div className={styles.fill} ref={fillRef} />
          </div>
          <span ref={labelRef}>RUNNING...</span>
        </div>
      </div>

      <div className={styles.message} ref={msgRef} aria-hidden="true">
        <strong>GAME OVER</strong>
        <span>TOCA O PRESIONA ESPACIO PARA REINTENTAR</span>
      </div>

      <div className={styles.hint} aria-hidden="true">
        ESPACIO / TOCA PARA SALTAR
      </div>
    </div>
  );
}
