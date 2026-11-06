/**
 * Token de partida firmado (HMAC): el servidor lo entrega cuando Manuel empieza a correr y lo exige al
 * guardar el puntaje. Con él se comprueba que el puntaje es posible para el tiempo transcurrido
 * y que cada partida se registra una sola vez. No hace el ranking "a prueba de tramposos",
 * pero descarta los envíos falsos más simples.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type Session = { sid: string; ts: number; sig: string };

const secret = () =>
  process.env.SCORE_SECRET ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "dev-only-secret";

const sign = (sid: string, ts: number) => createHmac("sha256", secret()).update(`${sid}.${ts}`).digest("hex");

export function newSession(): Session {
  const sid = randomBytes(12).toString("hex");
  const ts = Date.now();
  return { sid, ts, sig: sign(sid, ts) };
}

export function verifySession(s: Partial<Session> | undefined): s is Session {
  if (!s || typeof s.sid !== "string" || typeof s.sig !== "string" || typeof s.ts !== "number") return false;
  if (!/^[0-9a-f]{24}$/.test(s.sid) || !/^[0-9a-f]{64}$/.test(s.sig)) return false;
  const a = Buffer.from(sign(s.sid, s.ts), "hex");
  const b = Buffer.from(s.sig, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** La partida más rápida suma ~22.4 puntos/s (velocidad máxima 560 px/s ÷ 25). Margen para el arranque. */
export const MAX_SCORE_PER_SEC = 24;
export const maxPlausibleScore = (elapsedMs: number) => Math.floor((elapsedMs / 1000) * MAX_SCORE_PER_SEC) + 30;
export const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;
