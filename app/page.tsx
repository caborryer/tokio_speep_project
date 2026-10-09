"use client";

import Image from "next/image";
import Link from "next/link";
import DinoLoader from "@/components/DinoLoader";
import Icon from "@/components/scene/Icon";
import { PRELAUNCH } from "@/lib/siteConfig";
import styles from "@/components/Home.module.css";

/** Imágenes del home (se precargan mientras corre el loader). */
const HOME_ASSETS = [
  "/home/foto.webp",
  "/home/degrado.webp",
  "/home/textura-topo.webp",
  "/home/textura-puntos.webp",
  "/home/manu.webp",
  "/home/estrella.svg",
  "/home/linea-punteada.svg",
  "/home/santa-monica.svg",
  "/home/city.svg",
  "/home/death-valley.svg",
  "/home/las-vegas.svg",
  "/home/bocadillo.svg",
  "/home/estrella-mapa.svg",
  "/home/brujula.svg",
  "/home/encendedor.svg",
  "/home/ficha.svg",
  "/scene/icons/manu-pixel.webp",
  "/scene/icons/start.webp",
];

const COPY = [
  "Primer colombiano en completar",
  "THE SPEED PROJECT.",
];

function Pic({ src, w, h, className = "", priority }: { src: string; w: number; h: number; className?: string; priority?: boolean }) {
  return (
    <Image src={src} alt="" width={w} height={h} unoptimized priority={priority} draggable={false} className={`${styles.img} ${className}`} />
  );
}

export default function Home() {
  // Prelanzamiento: solo el juego de Manuel (ver lib/siteConfig.ts)
  if (PRELAUNCH) return <DinoLoader persistent />;

  return (
    <>
      {/* Loader de inicio: juego tipo dinosaurio de Chrome con Manuel (KAPLAY) */}
      <DinoLoader assets={HOME_ASSETS} />

      <main className={styles.home}>
        <div className={styles.bg} aria-hidden="true">
          <div className={styles.bgFoto} />
          <div className={styles.bgDegrado} />
          <div className={styles.bgTopo} />
          <div className={styles.bgPuntos} />
        </div>

        <div className={styles.stage}>
          <nav className={styles.nav} aria-label="Principal">
            <Link href="/" className={styles.tag}>Inicio</Link>
            <Link href="/reto" className={styles.tag}>El Reto</Link>
            <Link href="/dona" className={styles.tag}>Dona un km</Link>
            <Link href="/manu" className={styles.tag}>Manu</Link>
            <Link href="/marcas" className={styles.tag}>Marcas</Link>
            <Link href="/road-to-500" className={styles.tag}>Road to 500</Link>
          </nav>
          <Link href="/dona" className={`${styles.tag} ${styles.donate}`}>Dona ahora</Link>

          <div className={styles.hero}>
            <div className={`${styles.abs} ${styles.estrella}`}>
              <Pic src="/home/estrella.svg" w={492} h={514} priority />
            </div>
            <div className={`${styles.abs} ${styles.manu}`}>
              <Pic src="/home/manu.webp" w={413} h={967} priority />
            </div>
          </div>

          <div className={styles.titleBox}>
            <h1 className={styles.title} aria-label="El Reto, 500 Kilómetros">
              <span className={styles.tEl} aria-hidden="true">el</span>
              <span className={styles.tReto} aria-hidden="true">Reto</span>
              <span className={styles.t500} aria-hidden="true">500</span>
              <span className={styles.tKm} aria-hidden="true">Kilometros</span>
            </h1>
            <div className={`${styles.tag} ${styles.speed}`}>The Speed Project</div>
          </div>

          <p className={styles.copy}>
            {COPY.map((l, i) => (
              <span key={i}>{l} </span>
            ))}
          </p>

          <div className={styles.mapWrap}>
            <div className={styles.map} aria-hidden="true">
              <div className={styles.mRoute}><Pic src="/home/linea-punteada.svg" w={1394} h={206} className={styles.line} /></div>
              <div className={styles.mSanta}><Pic src="/home/santa-monica.svg" w={1037} h={457} className={styles.line} /></div>
              <div className={styles.mCity}><Pic src="/home/city.svg" w={1390} h={426} className={styles.line} /></div>
              <div className={styles.mDeath}><Pic src="/home/death-valley.svg" w={1140} h={646} className={styles.line} /></div>
              <div className={styles.mVegas}><Pic src="/home/las-vegas.svg" w={680} h={672} className={styles.line} /></div>
              <div className={styles.mHead}><Icon name="manu-pixel" className={styles.img} /></div>
              <div className={styles.mStart}><Icon name="start" className={styles.img} /></div>
              <div className={styles.mBubble}><Pic src="/home/bocadillo.svg" w={657} h={588} /></div>
              {/* Reemplaza este texto por el logo real de la marca (SVG) cuando lo tengas */}
              <div className={styles.brand}>éx<span className={styles.i}>ı</span>to</div>
              <div className={styles.mStar}><Pic src="/home/estrella-mapa.svg" w={347} h={331} /></div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.sBrujula}><Pic src="/home/brujula.svg" w={92} h={118} /></div>
            <div className={`${styles.sTxt} ${styles.sKm}`}>500<br />km</div>
            <div className={styles.sEnc}><Pic src="/home/encendedor.svg" w={103} h={103} /></div>
            <div className={`${styles.sTxt} ${styles.sTemp}`}>+50<small>Temperatura</small></div>
            <div className={styles.sFicha}><Pic src="/home/ficha.svg" w={95} h={95} /></div>
            <div className={`${styles.sTxt} ${styles.sGoal}`}>La<br />Meta</div>
          </div>
        </div>
      </main>
    </>
  );
}
