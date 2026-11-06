/** Cliente del ranking global (llama a /api/scores). Todo falla en silencio: el juego nunca depende de esto. */

export type Session = { sid: string; ts: number; sig: string };
export type TopRow = { rank: number; nick: string; score: number };
export type Profile = { nick: string; email: string };

const PROFILE_KEY = "tsp-player";

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Profile>;
    return typeof p.nick === "string" && typeof p.email === "string" ? { nick: p.nick, email: p.email } : null;
  } catch {
    return null;
  }
}
export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* sin storage */
  }
}
export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* sin storage */
  }
}

export async function fetchTop(): Promise<{ configured: boolean; top: TopRow[] }> {
  try {
    const r = await fetch("/api/scores", { cache: "no-store" });
    const j = (await r.json()) as { configured?: boolean; top?: TopRow[] };
    return { configured: j.configured !== false, top: j.top ?? [] };
  } catch {
    return { configured: false, top: [] };
  }
}

/** Token de la partida que empieza. null si el ranking no está disponible. */
export async function fetchSession(): Promise<Session | null> {
  try {
    const r = await fetch("/api/scores/session", { method: "POST", cache: "no-store" });
    const j = (await r.json()) as { configured?: boolean; session?: Session };
    return j.configured && j.session ? j.session : null;
  } catch {
    return null;
  }
}

export type SubmitResult =
  | { ok: true; best: number; improved: boolean; rank: number; top: TopRow[] }
  | { ok: false; error: string };

export async function submitScore(p: { nick: string; email: string; score: number; session: Session }): Promise<SubmitResult> {
  try {
    const r = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nick: p.nick, email: p.email, consent: true, score: p.score, session: p.session }),
    });
    const j = (await r.json()) as { ok?: boolean; error?: string; best: number; improved: boolean; rank: number; top: TopRow[] };
    if (r.ok && j.ok) return { ok: true, best: j.best, improved: j.improved, rank: j.rank, top: j.top };
    return { ok: false, error: j.error ?? "unavailable" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
