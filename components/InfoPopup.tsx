"use client";

import { useId, useRef, type ReactNode } from "react";
import styles from "./InfoPopup.module.css";

type Props = {
  /** Lo que se ve en el botón que abre el pop-up (un icono, texto…). */
  trigger: ReactNode;
  /** Clase para posicionar/estilar el botón. */
  triggerClassName?: string;
  /** Lectura para lectores de pantalla del botón, p. ej. "Ver qué incluye $ 10". */
  triggerLabel: string;
  title: string;
  /** Texto corto bajo el título (opcional). */
  subtitle?: string;
  /** Contenido del pop-up. */
  children: ReactNode;
  /** Botón de acción opcional al pie. */
  cta?: { href: string; label: string };
};

/**
 * Pop-up reutilizable: un botón que abre un diálogo modal con información.
 * Usa <dialog> nativo: se cierra con Esc, con la X o haciendo clic fuera, atrapa el foco
 * y devuelve el foco al botón al cerrarse.
 */
export default function InfoPopup({ trigger, triggerClassName, triggerLabel, title, subtitle, children, cta }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${triggerClassName ?? ""}`}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close(); // clic en el fondo
        }}
      >
        <div className={styles.card}>
          <button type="button" className={styles.close} aria-label="Cerrar" onClick={() => ref.current?.close()}>
            ×
          </button>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.body}>{children}</div>
          {cta && (
            <a className={styles.cta} href={cta.href}>
              {cta.label}
            </a>
          )}
        </div>
      </dialog>
    </>
  );
}
