import { NextResponse } from "next/server";
import { fetchSantaMonicaTemp, type Reading } from "@/lib/temperature";

export const runtime = "nodejs";

/** Última lectura buena, por si el servicio del tiempo falla un rato (se sirve hasta 6 h). */
let lastGood: { reading: Reading; at: number } | null = null;
const STALE_MS = 6 * 60 * 60 * 1000;

/** GET /api/temperature → { celsius, observedAt, station, stale? } */
export async function GET() {
  const fresh = await fetchSantaMonicaTemp();
  if (fresh) {
    lastGood = { reading: fresh, at: Date.now() };
    return NextResponse.json(fresh, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
    });
  }
  if (lastGood && Date.now() - lastGood.at < STALE_MS) {
    return NextResponse.json({ ...lastGood.reading, stale: true }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  }
  return NextResponse.json({ error: "temperature_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
