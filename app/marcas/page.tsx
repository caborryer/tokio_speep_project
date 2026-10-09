import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/scene/Icon";
import { Lines } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";
import type { IconName } from "@/lib/sceneIcons";

const MARCAS_COPY = [
  "Tu marca también corre esta historia.",
  "Más que un patrocinio, es una plataforma de contenido, experiencias y comunidad.",
];

export const metadata: Metadata = {
  title: "Tu Marca | El Reto 500 Kilómetros",
  description: "Súmate como marca a El Reto 500 Kilómetros: visibilidad, contenido real, experiencias, comunidad y propósito.",
};

/** Destino del botón "Quiero ser parte" (formulario, correo, WhatsApp...). Ponlo cuando lo tengas. */
const JOIN_HREF = "#";

type Benefit = { icon: IconName; label: string; l: number; t: number; w: number };

/** Posición (centro vertical) de cada beneficio en el escenario de 1920 x 1080. */
const BENEFITS: Benefit[] = [
  { icon: "ojo", label: "Visibilidad", l: 96, t: 550, w: 93 },
  { icon: "celular", label: "Contenido real", l: 350, t: 558, w: 92 },
  { icon: "megafono", label: "Experiencias", l: 690, t: 552, w: 72 },
  { icon: "zapatilla", label: "Comunidad", l: 228, t: 660, w: 129 },
  { icon: "medalla", label: "Propósito", l: 547, t: 662, w: 77 },
];

/** Etiquetas sobre la camioneta (coordenadas locales del diseño: x, y, ancho, alto, rotación, tamaño de letra). */
type Mark = { x: number; y: number; w: number; h: number; r: number; f?: number; text: string; kind?: "win" | "lamp" };
const MARKS: Mark[] = [
  // banderas
  { x: 98, y: 30, w: 118, h: 30, r: -11, f: 17, text: "Tu marca" },
  { x: 105, y: 88, w: 110, h: 30, r: -10, f: 17, text: "Tu marca" },
  { x: 110, y: 141, w: 100, h: 28, r: -8, f: 16, text: "Tu marca" },
  // ventanas (escritas a mano en el diseño)
  { x: 238, y: 262, w: 90, h: 36, r: -12, f: 22, text: "Tu marca", kind: "win" },
  { x: 352, y: 268, w: 90, h: 36, r: -8, f: 22, text: "Tu marca", kind: "win" },
  { x: 506, y: 262, w: 90, h: 36, r: -10, f: 22, text: "Tu marca", kind: "win" },
  // carrocería
  { x: 290, y: 346, w: 142, h: 33, r: -1, f: 17, text: "Tu marca" },
  { x: 226, y: 425, w: 66, h: 36, r: -3, f: 11, text: "Tu marca" },
  { x: 500, y: 350, w: 114, h: 106, r: -4, f: 15, text: "Tu marca puede estar aquí" },
  { x: 660, y: 365, w: 152, h: 74, r: -3, f: 15, text: "Tu marca puede estar aquí" },
  { x: 838, y: 380, w: 28, h: 52, r: 0, text: "", kind: "lamp" },
];

export default function MarcasPage() {
  return (
    <Scene
      bg="marcas"
      map={{ star: { l: 1546, t: 872 }, head: { l: 1325, t: 778, w: 90 }, bubble: { l: 1525, t: 765, w: 103 } }}
      stats={{
        km: { icon: "camioneta", value: "320" },
        temp: { icon: "chile", value: "50" },
        goal: { icon: "seven" },
      }}
    >
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.kTitle}`}>Tu Marca</h1>

        <p className={`${v.copy} ${v.kCopy}`}>
          <Lines lines={MARCAS_COPY} />
        </p>

        <div className={v.benefits}>
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              className={v.benefit}
              style={{ "--l": b.l, "--t": b.t, "--w": b.w } as React.CSSProperties}
            >
              <span className={v.bi}><Icon name={b.icon} className={v.imgC} /></span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        <div className={v.truck}>
          <Image
            src="/scene/photos/camioneta.webp"
            alt="Camioneta del reto con espacio para tu marca"
            width={1116}
            height={586}
            unoptimized
            className={v.truckImg}
          />
          {MARKS.map((m, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`${v.tm} ${m.kind === "win" ? v.tmWin : ""} ${m.kind === "lamp" ? v.tmLamp : ""}`}
              style={
                { "--x": m.x, "--y": m.y, "--w": m.w, "--h": m.h, "--r": m.r, "--f": m.f ?? 17 } as React.CSSProperties
              }
            >
              {m.text}
            </span>
          ))}
        </div>

        <a href={JOIN_HREF} className={`${v.yTag} ${v.joinBtn}`}>Quiero ser parte</a>
      </div>
    </Scene>
  );
}
