"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { MAP_W, ROUTE_POINTS, buildRoute, nearestT, pointAt } from "@/lib/routePath";
import styles from "./DraggableHead.module.css";

const ROUTE = buildRoute(ROUTE_POINTS);
const KEY_STEP = 0.02;

type Props = {
  /** Clase que posiciona la cabeza en el mapa (la de cada vista). */
  className: string;
  style?: CSSProperties;
  /** El icono de Manu. */
  children: ReactNode;
};

/**
 * La cabeza de Manu en el mapa: se arrastra con el mouse (o el dedo) a lo largo de la ruta, sin salirse de ella.
 * También se mueve con las flechas del teclado, y con doble clic vuelve a su sitio.
 * Debe estar dentro de un contenedor con el atributo `data-route-map` (el mapa de 1700 unidades de ancho).
 */
export default function DraggableHead({ className, style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef<number | null>(null);
  // posición del centro de la cabeza y su medio ancho / medio alto, en unidades del mapa
  const [pos, setPos] = useState<{ x: number; y: number; hw: number; hh: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const mapBox = () => {
    const map = ref.current?.closest<HTMLElement>("[data-route-map]");
    if (!map) return null;
    const r = map.getBoundingClientRect();
    return { r, s: r.width / MAP_W }; // s = píxeles por unidad del mapa
  };

  const measure = () => {
    const box = mapBox();
    const el = ref.current;
    if (!box || !el) return null;
    const h = el.getBoundingClientRect();
    return { box, head: h, hw: h.width / box.s / 2, hh: h.height / box.s / 2 };
  };

  const moveTo = (clientX: number, clientY: number) => {
    const m = measure();
    if (!m) return;
    const x = (clientX - m.box.r.left) / m.box.s;
    const y = (clientY - m.box.r.top) / m.box.s;
    t.current = nearestT(ROUTE, x, y, t.current ?? undefined);
    setPos({ ...pointAt(ROUTE, t.current), hw: m.hw, hh: m.hh });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    moveTo(e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) moveTo(e.clientX, e.clientY);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? KEY_STEP : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -KEY_STEP : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    if (t.current === null) {
      // primera vez: parte del punto de la ruta más cercano a donde está la cabeza ahora
      const m = measure();
      if (!m) return;
      const cx = (m.head.left + m.head.width / 2 - m.box.r.left) / m.box.s;
      const cy = (m.head.top + m.head.height / 2 - m.box.r.top) / m.box.s;
      t.current = nearestT(ROUTE, cx, cy);
    }
    const m = measure();
    if (!m) return;
    t.current = e.key === "Home" ? 0 : e.key === "End" ? 1 : Math.min(1, Math.max(0, t.current + delta));
    setPos({ ...pointAt(ROUTE, t.current), hw: m.hw, hh: m.hh });
  };

  const reset = () => {
    t.current = null;
    setPos(null);
  };

  const placed: CSSProperties | undefined = pos
    ? {
        left: `calc(var(--u) * ${(pos.x - pos.hw).toFixed(2)})`,
        top: `calc(var(--u) * ${(pos.y - pos.hh).toFixed(2)})`,
      }
    : undefined;

  return (
    <div
      ref={ref}
      className={`${className} ${styles.head} ${dragging ? styles.dragging : ""}`}
      style={{ ...style, ...placed }}
      role="button"
      tabIndex={0}
      aria-roledescription="arrastrable"
      aria-label="Manu en la ruta. Arrástralo o usa las flechas para moverlo; doble clic para devolverlo"
      title="Arrastra a Manu por la ruta (doble clic para devolverlo)"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={reset}
    >
      {children}
    </div>
  );
}
