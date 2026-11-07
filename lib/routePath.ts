/**
 * Línea de la ruta (de Santa Monica a Las Vegas) para mover a Manu sobre el mapa.
 *
 * Los puntos siguen el centro de las rayas de public/home/linea-punteada.svg, ya convertidos a las
 * unidades del mapa (1700 x 430). Si cambias ese dibujo, hay que regenerar esta lista.
 */
export const MAP_W = 1700;

export const ROUTE_POINTS: [number, number][] = [
  [296.7, 200.6],
  [308.3, 183.4],
  [311.9, 162.4],
  [311.9, 144.0],
  [314.7, 117.3],
  [341.0, 95.4],
  [375.2, 107.6],
  [403.7, 116.2],
  [436.5, 117.2],
  [471.3, 122.8],
  [498.4, 144.9],
  [537.1, 153.5],
  [575.4, 176.8],
  [601.2, 195.8],
  [623.1, 213.0],
  [660.1, 212.7],
  [697.1, 201.5],
  [731.5, 195.7],
  [765.6, 192.8],
  [798.1, 194.2],
  [830.5, 218.7],
  [865.7, 242.6],
  [900.9, 251.3],
  [934.3, 256.1],
  [971.0, 263.6],
  [1008.2, 272.5],
  [1043.7, 277.8],
  [1079.3, 274.3],
  [1112.2, 265.6],
  [1132.7, 243.3],
  [1158.4, 218.9],
  [1203.6, 214.6],
  [1254.7, 219.7],
  [1293.5, 204.4],
  [1318.8, 187.0],
  [1352.3, 180.9],
  [1381.7, 189.4],
  [1405.5, 202.0],
  [1428.3, 221.1],
  [1458.8, 227.3],
  [1492.4, 223.0],
  [1517.5, 210.1],
  [1534.4, 190.5],
  [1559.4, 177.1],
  [1586.0, 168.1]
];

export type Route = { pts: [number, number][]; cum: number[]; total: number };

/** Remuestrea la ruta cada ~`step` unidades para que el movimiento sea fluido. */
export function buildRoute(points: [number, number][], step = 4): Route {
  const pts: [number, number][] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, total: cum[cum.length - 1] };
}

/** Punto de la ruta para una posición t entre 0 (Santa Monica) y 1 (Las Vegas). */
export function pointAt(r: Route, t: number): { x: number; y: number } {
  const target = Math.min(1, Math.max(0, t)) * r.total;
  let lo = 0;
  let hi = r.cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (r.cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return { x: r.pts[lo][0], y: r.pts[lo][1] };
}

/**
 * Posición t (0..1) del punto de la ruta más cercano a (x, y).
 * Con `around` solo se busca cerca de esa posición (±`window`), para que al arrastrar no salte de un tramo a otro.
 */
export function nearestT(r: Route, x: number, y: number, around?: number, window = 0.35): number {
  let best = Infinity;
  let bestI = 0;
  for (let i = 0; i < r.pts.length; i++) {
    if (around !== undefined && Math.abs(r.cum[i] / r.total - around) > window) continue;
    const d = (r.pts[i][0] - x) ** 2 + (r.pts[i][1] - y) ** 2;
    if (d < best) {
      best = d;
      bestI = i;
    }
  }
  return r.cum[bestI] / r.total;
}
