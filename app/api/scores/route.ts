import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/scoreStore";
import { maxPlausibleScore, SESSION_MAX_AGE_MS, verifySession, type Session } from "@/lib/scoreSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };
const ip = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const NICK_RE = /^[\p{L}\p{N}_\-. ]{3,16}$/u;

/** Top 10 público: solo apodo y puntaje (nunca correos). */
export async function GET() {
  const store = getStore();
  if (!store) return NextResponse.json({ configured: false, top: [] }, { headers: NO_STORE });
  try {
    return NextResponse.json(
      { configured: true, top: await store.top(10) },
      { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" } },
    );
  } catch (e) {
    console.error("[scores] GET", e);
    return NextResponse.json({ configured: true, top: [], error: "unavailable" }, { status: 503, headers: NO_STORE });
  }
}

type Body = { nick?: unknown; email?: unknown; consent?: unknown; score?: unknown; session?: Partial<Session> };

/** Guarda (o mejora) el puntaje de un jugador. */
export async function POST(req: NextRequest) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "ranking_unavailable" }, { status: 503, headers: NO_STORE });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400, headers: NO_STORE });
  }

  const nick = typeof body.nick === "string" ? body.nick.trim().replace(/\s+/g, " ") : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const score = typeof body.score === "number" ? Math.floor(body.score) : NaN;

  if (!NICK_RE.test(nick)) return NextResponse.json({ error: "invalid_nick" }, { status: 400, headers: NO_STORE });
  if (!EMAIL_RE.test(email) || email.length > 120) return NextResponse.json({ error: "invalid_email" }, { status: 400, headers: NO_STORE });
  if (body.consent !== true) return NextResponse.json({ error: "consent_required" }, { status: 400, headers: NO_STORE });
  if (!Number.isFinite(score) || score < 1 || score > 99999) return NextResponse.json({ error: "invalid_score" }, { status: 400, headers: NO_STORE });

  // El token de partida debe ser nuestro, reciente, y el puntaje posible para el tiempo transcurrido
  if (!verifySession(body.session)) return NextResponse.json({ error: "invalid_session" }, { status: 400, headers: NO_STORE });
  const elapsed = Date.now() - body.session.ts;
  if (elapsed < 0 || elapsed > SESSION_MAX_AGE_MS || score > maxPlausibleScore(elapsed)) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400, headers: NO_STORE });
  }

  try {
    const n = await store.incr(`tsp:rl:submit:${ip(req)}:${Math.floor(Date.now() / 3600000)}`, 3700);
    if (n > 60) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: NO_STORE });
    // cada partida solo se puede registrar una vez
    if (!(await store.claim(`tsp:sid:${body.session.sid}`, 7300))) {
      return NextResponse.json({ error: "session_used" }, { status: 409, headers: NO_STORE });
    }
    const r = await store.submit({ email, nick, score, consentAt: Date.now() });
    if (!r.ok) return NextResponse.json({ error: "nick_taken" }, { status: 409, headers: NO_STORE });
    return NextResponse.json(
      { ok: true, best: r.best, improved: r.improved, rank: r.rank, top: await store.top(10) },
      { headers: NO_STORE },
    );
  } catch (e) {
    console.error("[scores] POST", e);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE });
  }
}
