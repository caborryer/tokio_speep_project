"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/scene/Icon";
import { Lines, LOREM_9 } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";

/**
 * Video del recuadro amarillo. Pon aquí la URL del video:
 *  - archivo directo (.mp4 / .webm), o
 *  - URL de "embed" de YouTube / Vimeo (https://www.youtube.com/embed/ID).
 * Mientras esté vacío se muestra el recuadro con el botón de play.
 */
const VIDEO_URL: string = "https://www.youtube.com/watch?v=egdad1czyDo";

/** Convierte enlaces normales de YouTube / Vimeo (watch, youtu.be, shorts) a su versión "embed". */
function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const m = u.pathname.match(/^\/(shorts|live)\/([\w-]+)/);
      if (m) return `https://www.youtube.com/embed/${m[2]}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.match(/^\/(\d+)/)?.[1];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* URL inválida: se usa tal cual */
  }
  return url;
}

export default function RetoPage() {
  const [playing, setPlaying] = useState(false);
  const isFile = /\.(mp4|webm|mov)(\?.*)?$/i.test(VIDEO_URL);

  return (
    <Scene
      bg="home"
      map={{
        start: true,
        star: { l: 365, t: 821 },
        head: { l: 435, t: 669, w: 100 },
        bubble: { l: 545, t: 689, w: 134 },
      }}
      stats={{
        km: { icon: "casa-playa", value: "0" },
        temp: { icon: "ventilador", value: "10" },
        goal: { icon: "ficha" },
      }}
    >
      <div className={v.content}>
        <div className={v.hTitleBox}>
          <h1 className={`${v.gothic} ${v.hTitle}`} aria-label="El Reto, 500 Kilómetros">
            <span className={v.tEl} aria-hidden="true">el</span>
            <span className={v.tReto} aria-hidden="true">Reto</span>
            <span className={v.t500} aria-hidden="true">500</span>
            <span className={v.tKm} aria-hidden="true">Kilometros</span>
          </h1>
          <div className={`${v.yTag} ${v.speed}`}>The Speed Project</div>
        </div>

        <p className={`${v.copy} ${v.hCopy}`}>
          <Lines lines={LOREM_9} />
        </p>

        <div className={v.video}>
          {playing && VIDEO_URL ? (
            isFile ? (
              <video src={VIDEO_URL} controls autoPlay playsInline />
            ) : (
              <iframe
                src={`${toEmbed(VIDEO_URL)}${toEmbed(VIDEO_URL).includes("?") ? "&" : "?"}autoplay=1&rel=0`}
                title="Video de El Reto 500 Kilómetros"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )
          ) : (
            <button
              type="button"
              className={v.playBtn}
              onClick={() => setPlaying(true)}
              disabled={!VIDEO_URL}
              aria-label="Reproducir video"
            >
              <Icon name="play" className={v.playIcon} />
            </button>
          )}
        </div>
        <Image src="/scene/photos/cinta.webp" alt="" width={700} height={700} unoptimized priority className={v.tape1} />
        <Image src="/scene/photos/cinta.webp" alt="" width={700} height={700} unoptimized className={v.tape2} />
      </div>
    </Scene>
  );
}
