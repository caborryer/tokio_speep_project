/**
 * Almacenamiento del ranking global.
 *
 * Producción: Redis (Upstash) por REST — se conecta desde Vercel → Storage → Upstash Redis,
 * que define KV_REST_API_URL y KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_URL / _TOKEN).
 * Desarrollo (`next dev`) sin Redis: memoria del proceso, solo para probar.
 *
 * Datos:
 *  - tsp:lb       ZSET  id -> score*1e6 + desempate (a igual puntaje gana quien lo logró primero)
 *  - tsp:players  HASH  id -> JSON { nick, email, best, consentAt, createdAt, updatedAt }
 *  - tsp:nicks    HASH  apodo en minúsculas -> id (apodos únicos)
 *  id = sha256(correo en minúsculas): el correo nunca se usa como clave pública.
 */
import { createHash } from "node:crypto";

export type Player = {
  nick: string;
  email: string;
  best: number;
  consentAt: number;
  createdAt: number;
  updatedAt: number;
};
export type TopRow = { rank: number; nick: string; score: number };
export type ExportRow = TopRow & { email: string; updatedAt: number };

export type SubmitResult =
  | { ok: true; best: number; improved: boolean; rank: number }
  | { ok: false; reason: "nick_taken" };

export interface Store {
  /** Contador con vencimiento (límite de peticiones). Devuelve el valor tras sumar. */
  incr(key: string, ttlSec: number): Promise<number>;
  /** true si la clave no existía (y queda reservada). Para tokens de un solo uso. */
  claim(key: string, ttlSec: number): Promise<boolean>;
  submit(p: { email: string; nick: string; score: number; consentAt: number }): Promise<SubmitResult>;
  top(n: number): Promise<TopRow[]>;
  all(limit: number): Promise<ExportRow[]>;
}

export const emailId = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

/** Desempate: a igual puntaje, el que lo logró antes queda arriba. */
const T0 = Date.UTC(2026, 10, 1);
const zscore = (score: number, now: number) => score * 1e6 + (999999 - Math.min(999999, Math.floor((now - T0) / 60000)));
const scoreOf = (z: number) => Math.floor(z / 1e6);

// ---------------------------------------------------------------- Redis (REST)

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

type Cmd = (string | number)[];

async function redis(cfg: { url: string; token: string }, cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((o) => {
    if (o.error) throw new Error(`Redis: ${o.error}`);
    return o.result;
  });
}

function redisStore(cfg: { url: string; token: string }): Store {
  const rows = async (flat: string[]) => {
    // ZREVRANGE ... WITHSCORES => [id, z, id, z, ...]
    const ids: string[] = [];
    const zs: number[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      ids.push(flat[i]);
      zs.push(Number(flat[i + 1]));
    }
    if (!ids.length) return [] as { id: string; z: number; p: Player | null }[];
    const [raw] = (await redis(cfg, [["HMGET", "tsp:players", ...ids]])) as [(string | null)[]];
    return ids.map((id, i) => ({ id, z: zs[i], p: raw[i] ? (JSON.parse(raw[i] as string) as Player) : null }));
  };

  return {
    async incr(key, ttl) {
      const [n] = await redis(cfg, [["INCR", key], ["EXPIRE", key, ttl, "NX"]]);
      return Number(n);
    },
    async claim(key, ttl) {
      const [r] = await redis(cfg, [["SET", key, "1", "NX", "EX", ttl]]);
      return r === "OK";
    },
    async submit({ email, nick, score, consentAt }) {
      const id = emailId(email);
      const lower = nick.toLowerCase();
      const now = Date.now();
      const [owner, oldZ, oldRaw] = (await redis(cfg, [
        ["HGET", "tsp:nicks", lower],
        ["ZSCORE", "tsp:lb", id],
        ["HGET", "tsp:players", id],
      ])) as [string | null, string | null, string | null];
      if (owner && owner !== id) return { ok: false, reason: "nick_taken" };

      const old = oldRaw ? (JSON.parse(oldRaw) as Player) : null;
      const prevBest = oldZ ? scoreOf(Number(oldZ)) : 0;
      const improved = score > prevBest;
      const best = Math.max(score, prevBest);
      const player: Player = {
        nick,
        email: email.trim().toLowerCase(),
        best,
        consentAt: old?.consentAt ?? consentAt,
        createdAt: old?.createdAt ?? now,
        updatedAt: now,
      };
      const cmds: Cmd[] = [
        ["HSET", "tsp:players", id, JSON.stringify(player)],
        ["HSET", "tsp:nicks", lower, id],
      ];
      if (old && old.nick.toLowerCase() !== lower) cmds.push(["HDEL", "tsp:nicks", old.nick.toLowerCase()]);
      if (improved) cmds.push(["ZADD", "tsp:lb", zscore(score, now), id]);
      cmds.push(["ZREVRANK", "tsp:lb", id]);
      const res = await redis(cfg, cmds);
      return { ok: true, best, improved, rank: Number(res[res.length - 1]) + 1 };
    },
    async top(n) {
      const [flat] = (await redis(cfg, [["ZREVRANGE", "tsp:lb", 0, n - 1, "WITHSCORES"]])) as [string[]];
      return (await rows(flat)).map((r, i) => ({ rank: i + 1, nick: r.p?.nick ?? "—", score: scoreOf(r.z) }));
    },
    async all(limit) {
      const [flat] = (await redis(cfg, [["ZREVRANGE", "tsp:lb", 0, limit - 1, "WITHSCORES"]])) as [string[]];
      return (await rows(flat)).map((r, i) => ({
        rank: i + 1,
        nick: r.p?.nick ?? "—",
        email: r.p?.email ?? "",
        score: scoreOf(r.z),
        updatedAt: r.p?.updatedAt ?? 0,
      }));
    },
  };
}

// ---------------------------------------------------------------- Memoria (solo desarrollo)

type MemState = {
  counters: Map<string, { n: number; exp: number }>;
  claims: Map<string, number>;
  players: Map<string, Player & { z: number }>;
  nicks: Map<string, string>;
};
const g = globalThis as unknown as { __tspMem?: MemState };

function memoryStore(): Store {
  const st = (g.__tspMem ??= { counters: new Map(), claims: new Map(), players: new Map(), nicks: new Map() });
  const sorted = () => [...st.players.entries()].sort((a, b) => b[1].z - a[1].z);
  return {
    async incr(key, ttl) {
      const now = Date.now();
      const c = st.counters.get(key);
      if (!c || c.exp < now) {
        st.counters.set(key, { n: 1, exp: now + ttl * 1000 });
        return 1;
      }
      return ++c.n;
    },
    async claim(key, ttl) {
      const now = Date.now();
      if ((st.claims.get(key) ?? 0) > now) return false;
      st.claims.set(key, now + ttl * 1000);
      return true;
    },
    async submit({ email, nick, score, consentAt }) {
      const id = emailId(email);
      const lower = nick.toLowerCase();
      const owner = st.nicks.get(lower);
      if (owner && owner !== id) return { ok: false, reason: "nick_taken" };
      const now = Date.now();
      const old = st.players.get(id);
      const prevBest = old?.best ?? 0;
      const improved = score > prevBest;
      const best = Math.max(score, prevBest);
      if (old && old.nick.toLowerCase() !== lower) st.nicks.delete(old.nick.toLowerCase());
      st.nicks.set(lower, id);
      st.players.set(id, {
        nick,
        email: email.trim().toLowerCase(),
        best,
        consentAt: old?.consentAt ?? consentAt,
        createdAt: old?.createdAt ?? now,
        updatedAt: now,
        z: improved ? zscore(score, now) : old!.z,
      });
      return { ok: true, best, improved, rank: sorted().findIndex(([i]) => i === id) + 1 };
    },
    async top(n) {
      return sorted().slice(0, n).map(([, p], i) => ({ rank: i + 1, nick: p.nick, score: p.best }));
    },
    async all(limit) {
      return sorted().slice(0, limit).map(([, p], i) => ({
        rank: i + 1, nick: p.nick, email: p.email, score: p.best, updatedAt: p.updatedAt,
      }));
    },
  };
}

/** null = ranking no disponible (producción sin Redis configurado). */
export function getStore(): Store | null {
  const cfg = redisConfig();
  if (cfg) return redisStore(cfg);
  if (process.env.NODE_ENV !== "production") return memoryStore();
  return null;
}
