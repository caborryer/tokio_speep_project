/**
 * Temperatura actual de Santa Monica (EE. UU.) para el HUD de las vistas.
 *
 * Fuente: Servicio Meteorológico Nacional de EE. UU. (api.weather.gov) — gratuito, sin clave, dominio público.
 * Estación: KSMO (Aeropuerto Municipal de Santa Monica). Si esa estación no trae dato, se prueban las observaciones recientes.
 */
export const STATION = "KSMO";
const BASE = "https://api.weather.gov";
// El NWS pide identificar quién consulta (sin datos personales).
const HEADERS = { "User-Agent": "callateycorre.com (sitio web de El Reto 500 Kilometros)", Accept: "application/geo+json" };

export type Reading = { celsius: number; observedAt: string; station: string };

type Obs = { properties?: { temperature?: { value?: number | null; unitCode?: string }; timestamp?: string } };

/** Convierte una observación del NWS en lectura válida (o null si no trae temperatura). */
export function toReading(o: Obs | undefined): Reading | null {
  const t = o?.properties?.temperature;
  if (!t || typeof t.value !== "number" || !Number.isFinite(t.value)) return null;
  // El NWS entrega °C (wmoUnit:degC); si alguna vez llegara en °F lo convertimos.
  const celsius = t.unitCode?.endsWith("degF") ? ((t.value - 32) * 5) / 9 : t.value;
  if (celsius < -60 || celsius > 70) return null; // lectura imposible: se descarta
  return {
    celsius: Math.round(celsius * 10) / 10,
    observedAt: o?.properties?.timestamp ?? new Date().toISOString(),
    station: STATION,
  };
}

async function getJson(path: string, revalidate: number): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS, next: { revalidate }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  return res.json();
}

/** Última temperatura disponible de la estación, o null si el servicio no responde. */
export async function fetchSantaMonicaTemp(): Promise<Reading | null> {
  try {
    const latest = (await getJson(`/stations/${STATION}/observations/latest`, 600)) as Obs;
    const r = toReading(latest);
    if (r) return r;
  } catch {
    /* se prueba el listado reciente */
  }
  try {
    const list = (await getJson(`/stations/${STATION}/observations?limit=8`, 600)) as { features?: Obs[] };
    for (const f of list.features ?? []) {
      const r = toReading(f);
      if (r) return r;
    }
  } catch {
    /* sin datos */
  }
  return null;
}
