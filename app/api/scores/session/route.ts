import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/scoreStore";
import { newSession } from "@/lib/scoreSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ip = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

/** Entrega el token de una partida nueva (se pide cuando Manuel empieza a correr). */
export async function POST(req: NextRequest) {
  const store = getStore();
  if (!store) return NextResponse.json({ configured: false }, { status: 200 });
  try {
    const n = await store.incr(`tsp:rl:session:${ip(req)}:${Math.floor(Date.now() / 3600000)}`, 3700);
    if (n > 600) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  } catch {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  return NextResponse.json({ configured: true, session: newSession() }, { headers: { "Cache-Control": "no-store" } });
}
