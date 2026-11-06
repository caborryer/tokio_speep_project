"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./DinoLoader.module.css";
import {
  clearProfile,
  fetchTop,
  loadProfile,
  saveProfile,
  submitScore,
  type Profile,
  type Session,
  type TopRow,
} from "@/lib/leaderboardClient";

const pad = (n: number) => String(Math.max(0, Math.min(99999, n))).padStart(5, "0");

const ERRORS: Record<string, string> = {
  invalid_nick: "APODO NO VÁLIDO: 3 A 16 LETRAS, NÚMEROS, ESPACIOS, _ - .",
  invalid_email: "REVISA TU CORREO",
  consent_required: "DEBES ACEPTAR PARA ENTRAR AL RANKING",
  nick_taken: "ESE APODO YA ESTÁ EN USO, ELIGE OTRO",
  rate_limited: "DEMASIADOS INTENTOS, ESPERA UN POCO",
  invalid_score: "NO PUDIMOS VALIDAR ESA PARTIDA. JUEGA OTRA VEZ",
  invalid_session: "NO PUDIMOS VALIDAR ESA PARTIDA. JUEGA OTRA VEZ",
  session_used: "ESA PARTIDA YA SE GUARDÓ",
  ranking_unavailable: "EL RANKING NO ESTÁ DISPONIBLE AHORA",
  unavailable: "EL RANKING NO ESTÁ DISPONIBLE AHORA",
};

type Props = {
  /** Puntaje de la partida que acaba de terminar. null = solo ver el ranking. */
  score: number | null;
  /** Token de esa partida (lo entrega el servidor al empezar a correr). */
  session: Session | null;
  playLabel: string;
  onPlay: () => void;
};

/** Panel de fin de partida: guardar puntaje (apodo + correo) y ver el top 10 global. */
export default function Leaderboard({ score, session, playLabel, onPlay }: Props) {
  const canSave = score !== null && score > 0 && !!session;
  const [top, setTop] = useState<TopRow[] | null>(null);
  // null = aún no sabemos si el ranking está configurado en el servidor: no se muestra el formulario hasta saberlo
  const [configured, setConfigured] = useState<boolean | null>(null);
  // Este panel solo se monta después de una acción del jugador (nunca en el servidor): leer localStorage aquí es seguro
  const [saved] = useState<Profile | null>(() => loadProfile());
  // Jugador nuevo → formulario. Jugador ya registrado → confirmar (nunca se guarda ni se salta nada sin que lo decida).
  const [view, setView] = useState<"form" | "confirm" | "ranking">(
    score !== null && score > 0 ? (saved ? "confirm" : "form") : "ranking",
  );
  const [profile, setProfile] = useState<Profile | null>(saved);
  const [nick, setNick] = useState(saved?.nick ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [consent, setConsent] = useState(!!saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ rank: number; best: number; improved: boolean } | null>(null);
  const started = useRef(false);
  const firstField = useRef<HTMLInputElement>(null);
  const playBtn = useRef<HTMLButtonElement>(null);

  const save = async (p: Profile) => {
    if (!canSave || !session || score === null) return;
    setBusy(true);
    setError("");
    const r = await submitScore({ nick: p.nick, email: p.email, score, session });
    setBusy(false);
    if (!r.ok) {
      setError(ERRORS[r.error] ?? ERRORS.unavailable);
      setView("form");
      return;
    }
    saveProfile(p);
    setProfile(p);
    setResult({ rank: r.rank, best: r.best, improved: r.improved });
    setTop(r.top);
    setView("ranking");
  };

  // Al abrir: carga el top 10; si el jugador ya está registrado en este navegador, guarda el puntaje solo.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetchTop().then((r) => {
      setConfigured(r.configured);
      setTop((cur) => cur ?? r.top);
      if (!r.configured) setView("ranking");
    });
  }, []);

  // Anti-"pasa muy rápido": quien está mal (espacio / toques seguidos para reintentar) no debe cerrar el panel
  // sin querer. El botón de jugar solo se activa ~1 s después de abrir el panel o de cambiar de vista.
  const armedAt = useRef(0);
  useEffect(() => {
    armedAt.current = performance.now() + 1000;
    if (view === "form") {
      firstField.current?.focus({ preventScroll: true }); // (el formulario aparece cuando el servidor confirma el ranking)
      return;
    }
    const t = setTimeout(() => playBtn.current?.focus({ preventScroll: true }), 1000);
    return () => clearTimeout(t);
  }, [view]);
  useEffect(() => {
    if (view === "form" && configured === true) firstField.current?.focus({ preventScroll: true });
  }, [view, configured]);
  const play = () => {
    if (performance.now() < armedAt.current) return;
    onPlay();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const n = nick.trim().replace(/\s+/g, " ");
    const m = email.trim().toLowerCase();
    if (!/^[\p{L}\p{N}_\-. ]{3,16}$/u.test(n)) return setError(ERRORS.invalid_nick);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) return setError(ERRORS.invalid_email);
    if (!consent) return setError(ERRORS.consent_required);
    void save({ nick: n, email: m });
  };

  const mine = profile?.nick.toLowerCase();
  const heading = score !== null ? "GAME OVER" : "RANKING";

  return (
    <div className={styles.panelBackdrop} role="dialog" aria-modal="true" aria-label={heading}>
      <div className={styles.panel}>
        <h2 className={styles.pTitle}>{heading}</h2>
        {score !== null && (
          <p className={styles.pScore}>
            TU PUNTAJE <strong>{pad(score)}</strong>
          </p>
        )}

        {view === "confirm" && configured === true && profile ? (
          <div className={styles.form}>
            <p className={styles.pHelp}>
              JUGANDO COMO <strong>{profile.nick}</strong>
            </p>
            {error && <p className={styles.err}>{error}</p>}
            <div className={styles.actions}>
              <button type="button" className={styles.btn} disabled={busy || !canSave} onClick={() => void save(profile)}>
                {busy ? "GUARDANDO..." : "GUARDAR PUNTAJE"}
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setView("ranking")}>
                VER RANKING
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => {
                  clearProfile();
                  setProfile(null);
                  setNick("");
                  setEmail("");
                  setConsent(false);
                  setView("form");
                }}
              >
                CAMBIAR DE JUGADOR
              </button>
            </div>
            {!canSave && <p className={styles.pHelp}>SIN CONEXIÓN CON EL RANKING: INTENTA JUGAR OTRA VEZ</p>}
          </div>
        ) : view === "form" && configured === true ? (
          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <p className={styles.pHelp}>ENTRA AL RANKING GLOBAL Y COMPITE POR PREMIOS DE LAS MARCAS</p>
            <label className={styles.field}>
              <span>APODO</span>
              <input
                ref={firstField}
                value={nick}
                onChange={(e) => setNick(e.target.value.replace(/^\s+/, ""))}
                maxLength={16}
                autoComplete="nickname"
                placeholder="MANU500"
                spellCheck={false}
              />
            </label>
            <label className={styles.field}>
              <span>CORREO</span>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                autoComplete="email"
                placeholder="tu@correo.com"
                spellCheck={false}
              />
            </label>
            <label className={styles.consent}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                ACEPTO QUE THE SPEED PROJECT USE MI CORREO PARA CONTACTARME SI GANO UN PREMIO. EN EL RANKING SOLO SE
                MUESTRA MI APODO.
              </span>
            </label>
            {error && <p className={styles.err}>{error}</p>}
            <div className={styles.actions}>
              <button type="submit" className={styles.btn} disabled={busy || !canSave}>
                {busy ? "GUARDANDO..." : "GUARDAR PUNTAJE"}
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setView("ranking")}>
                VER RANKING
              </button>
            </div>
            {!canSave && <p className={styles.pHelp}>SIN CONEXIÓN CON EL RANKING: INTENTA JUGAR OTRA VEZ</p>}
          </form>
        ) : (
          <>
            {result && (
              <p className={styles.pResult}>
                {result.improved
                  ? `¡ESTÁS #${result.rank} DEL RANKING!`
                  : `SIGUES #${result.rank} · TU MEJOR: ${pad(result.best)}`}
              </p>
            )}
            {error && <p className={styles.err}>{error}</p>}
            {configured === false ? (
              <p className={styles.pHelp}>EL RANKING GLOBAL ESTARÁ DISPONIBLE MUY PRONTO</p>
            ) : top === null ? (
              <p className={styles.pHelp}>CARGANDO...</p>
            ) : top.length === 0 ? (
              <p className={styles.pHelp}>AÚN NO HAY PUNTAJES. ¡SÉ EL PRIMERO!</p>
            ) : (
              <ol className={styles.table}>
                {top.map((r) => (
                  <li key={r.rank} className={r.nick.toLowerCase() === mine ? styles.me : undefined}>
                    <span className={styles.rk}>{r.rank}</span>
                    <span className={styles.nk}>{r.nick}</span>
                    <span className={styles.sc}>{pad(r.score)}</span>
                  </li>
                ))}
              </ol>
            )}
            {score !== null && score > 0 && configured && !result && (
              <button type="button" className={styles.btnGhost} onClick={() => setView(profile ? "confirm" : "form")}>
                GUARDAR MI PUNTAJE
              </button>
            )}
            {profile && (
              <p className={styles.pHelp}>
                JUGANDO COMO <strong>{profile.nick}</strong> ·{" "}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    clearProfile();
                    setProfile(null);
                    setNick("");
                    setEmail("");
                    setConsent(false);
                    setResult(null);
                    if (canSave) setView("form");
                  }}
                >
                  CAMBIAR
                </button>
              </p>
            )}
          </>
        )}

        <button ref={playBtn} type="button" className={styles.btn} onClick={play}>
          {playLabel}
        </button>
      </div>
    </div>
  );
}
