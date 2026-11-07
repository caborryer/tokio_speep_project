import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Icon from "./Icon";
import FitStage from "../FitStage";
import SiteNav from "../SiteNav";
import LiveTemp from "./LiveTemp";
import DraggableHead from "./DraggableHead";
import type { IconName } from "@/lib/sceneIcons";
import styles from "./Scene.module.css";

/** Fondo de cada vista (ver Scene.module.css). */
export type SceneBg = "home" | "dona" | "manu" | "marcas" | "road";

/** Posición sobre el escenario de 1920 x 1080 (en "unidades de diseño"). */
export type Pos = { l: number; t: number; w?: number };

/** Dónde va Manuel en el mapa del recorrido (avance del reto). Omitir `map` oculta todo el mapa. */
export type MapConfig = {
  star: Pos;
  head?: Pos;
  bubble?: Pos;
  /** Muestra la etiqueta "START" sobre Santa Monica. */
  start?: boolean;
};

export type StatsConfig = {
  km: { icon: IconName; value: string };
  /** La temperatura es en vivo (Santa Monica): no lleva valor. */
  temp: { icon: IconName };
  goal: { icon: IconName };
};

type Props = {
  bg: SceneBg;
  map?: MapConfig | null;
  /** Datos de km / temperatura / meta (abajo a la derecha). Omitir `stats` los oculta. */
  stats?: StatsConfig | null;
  children?: ReactNode;
};

/** El mapa mide 1700 x 430 y arranca en (110, 635) del escenario. */
const MAP_X = 110;
const MAP_Y = 635;

const at = (p: Pos): CSSProperties =>
  ({ "--l": p.l - MAP_X, "--t": p.t - MAP_Y, "--w": p.w ?? 0 }) as CSSProperties;

function Pic({ src, w, h, className = "" }: { src: string; w: number; h: number; className?: string }) {
  return (
    <Image src={src} alt="" width={w} height={h} unoptimized draggable={false} className={`${styles.img} ${className}`} />
  );
}

/**
 * Estructura común de las vistas: fondo, navegación (etiquetas amarillas), botón "Compra ahora",
 * mapa del recorrido y datos (km / temperatura / meta). El contenido propio de cada vista va en `children`.
 */
export default function Scene({ bg, map, stats, children }: Props) {
  return (
    <div className={`${styles.scene} ${styles[`bg_${bg}`]}`}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.photo} />
        <div className={styles.shade} />
        <div className={styles.grid} />
        <div className={styles.topo} />
        <div className={styles.dots} />
      </div>

      <FitStage className={styles.fit}>
      <div className={styles.stage}>
        <SiteNav />

        {children}

        {map && (
          <div className={styles.mapWrap}>
            <div className={styles.map} data-route-map>
              <div className={styles.mRoute}><Pic src="/home/linea-punteada.svg" w={1394} h={206} className={styles.line} /></div>
              <div className={styles.mSanta}><Pic src="/home/santa-monica.svg" w={1037} h={457} className={styles.line} /></div>
              <div className={styles.mCity}><Pic src="/home/city.svg" w={1390} h={426} className={styles.line} /></div>
              <div className={styles.mDeath}><Pic src="/home/death-valley.svg" w={1140} h={646} className={styles.line} /></div>
              <div className={styles.mVegas}><Pic src="/home/las-vegas.svg" w={680} h={672} className={styles.line} /></div>

              {map.start && (
                <div className={styles.mStart}><Icon name="start" className={styles.img} /></div>
              )}
              {map.head && (
                <DraggableHead className={styles.mHead} style={at(map.head)}><Icon name="manu-pixel" className={styles.img} /></DraggableHead>
              )}
              {map.bubble && (
                <div className={styles.mBubble} style={at(map.bubble)}>
                  <Pic src="/home/logo.webp" w={450} h={450} />
                </div>
              )}
              <div className={styles.mStar} style={at(map.star)}>
                <Pic src="/home/estrella-mapa.svg" w={347} h={331} />
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className={styles.stats}>
            <div className={`${styles.sIcon} ${styles.sI1}`}><Icon name={stats.km.icon} className={styles.imgC} /></div>
            <div className={`${styles.sTxt} ${styles.sT1}`}>
              <span className={styles.big}>{stats.km.value}</span>
              <br />Km
            </div>
            <div className={`${styles.sIcon} ${styles.sI2}`}><Icon name={stats.temp.icon} className={styles.imgC} /></div>
            <div className={`${styles.sTxt} ${styles.sT2}`}>
              <span className={styles.big}><LiveTemp /> (°C)</span>
              <small>Temperatura</small>
            </div>
            <div className={`${styles.sIcon} ${styles.sI3}`}><Icon name={stats.goal.icon} className={styles.imgC} /></div>
            <div className={`${styles.sTxt} ${styles.sT3}`}>La<br />Meta</div>
          </div>
        )}
      </div>
      </FitStage>
    </div>
  );
}
