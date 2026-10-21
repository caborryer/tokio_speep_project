"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Hace que cada vista quepa SIN scroll vertical en cualquier pantalla.
 *
 * - Escritorio / tablet horizontal: el escenario 1920x1080 se ajusta con CSS (alto y ancho) — aquí no hace nada.
 * - Móvil vertical (composición apilada): mide la altura natural del contenido y lo reduce
 *   uniformemente (--s) hasta que cabe en la pantalla.
 */
export default function FitStage({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    const stage = el?.firstElementChild as HTMLElement | null;
    if (!el || !host || !stage) return;

    const fit = () => {
      const W = host.clientWidth;
      const H = host.clientHeight;
      const stacked = W < 900 && W <= H; // mismo criterio que el @container del CSS
      let s = 1;
      if (stacked) {
        el.style.setProperty("--s", "1");
        const h = stage.offsetHeight;
        if (h > H) s = Math.max(0.5, (H / h) * 0.995);
      }
      el.style.setProperty("--s", String(s));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    ro.observe(stage);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    window.addEventListener("load", fit);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      window.removeEventListener("load", fit);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
