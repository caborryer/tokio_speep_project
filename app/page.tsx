"use client";

import Image from "next/image";
import Link from "next/link";
import DinoLoader from "@/components/DinoLoader";
import styles from "@/components/Home.module.css";

/** Cambia aquí el texto de apoyo (en el diseño es un Lorem ipsum de relleno). */
const COPY = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  "sed do eiusmod tempor incididunt ut labore et dolore",
  "magna aliqua. Quis ipsum suspendisse ultrices gravida.",
  "Risus commodo viverra maecenas accumsan lacus.",
];

/** Imágenes del home (se precargan mientras corre el loader). */
const HOME_ASSETS = [
  "/home/foto.webp",
  "/home/manu.webp",
  "/home/degrado.webp",
  "/home/textura-topo.webp",
  "/home/textura-puntos.webp",
  "/home/estrella.svg",
  "/home/linea-punteada.svg",
];

type PicProps = { src: string; w: number; h: number; className?: string; priority?: boolean };

/** Imagen decorativa (los SVG/WebP ya vienen optimizados, por eso `unoptimized`). */
function Pic({ src, w, h, className = "", priority }: PicProps) {
  return (
    <Image
      src={src}
      alt=""
      width={w}
      height={h}
      unoptimized
      priority={priority}
      draggable={false}
      className={`${styles.img} ${className}`}
    />
  );
}

export default function Home() {
  return (
    <div className={styles.home}>
      {/* Loader de inicio: juego tipo dinosaurio de Chrome con Manuel (KAPLAY) */}
      <DinoLoader assets={HOME_ASSETS} />

      {/* Fondo: foto + degradado + texturas */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgFoto} />
        <div className={styles.bgDegrado} />
        <div className={styles.bgTopo} />
        <div className={styles.bgPuntos} />
      </div>

      <div className={styles.stage}>
        {/* Navegación */}
        <nav className={styles.nav} aria-label="Principal">
          <Link href="/reto" className={styles.tag}>El Reto</Link>
          <Link href="/dona" className={styles.tag}>Dona un km</Link>
          <Link href="/manu" className={styles.tag}>Manu</Link>
          <Link href="/marcas" className={styles.tag}>Marcas</Link>
        </nav>
        <Link href="/dona" className={`${styles.tag} ${styles.donate}`}>Dona ahora</Link>

        {/* Manuel */}
        <div className={styles.hero}>
        <div className={`${styles.abs} ${styles.estrella}`} aria-hidden="true">
          <Pic src="/home/estrella.svg" w={492} h={514} />
        </div>
        <div className={`${styles.abs} ${styles.manu}`}>
          <Image
            src="/home/manu.webp"
            alt="Manuel, corredor de The Speed Project"
            width={413}
            height={967}
            unoptimized
            priority
            className={styles.img}
          />
        </div>
        </div>

        {/* Título */}
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
          {COPY.map((line) => (
            <span key={line}>{line} </span>
          ))}
        </p>

        {/* Mapa del recorrido */}
        <div className={styles.mapWrap}>
        <div className={styles.map} aria-hidden="true">
          <div className={styles.mRoute}><Pic src="/home/linea-punteada.svg" w={1394} h={206} className={styles.line} /></div>
          <div className={styles.mStar}><Pic src="/home/estrella-mapa.svg" w={347} h={331} /></div>
          <div className={styles.mSanta}><Pic src="/home/santa-monica.svg" w={1037} h={457} className={styles.line} /></div>
          <div className={styles.mCity}><Pic src="/home/city.svg" w={1390} h={426} className={styles.line} /></div>
          <div className={styles.mDeath}><Pic src="/home/death-valley.svg" w={1140} h={646} className={styles.line} /></div>
          <div className={styles.mBubble}><Pic src="/home/bocadillo.svg" w={657} h={588} /></div>
          <div className={styles.brand}>
            {/* Reemplaza este texto por el logo real de la marca (SVG) cuando lo tengas */}
            <span>éx<span className={styles.i}>ı</span>to</span>
          </div>
          <div className={styles.mVegas}><Pic src="/home/las-vegas.svg" w={680} h={672} className={styles.line} /></div>
        </div>
        </div>

        {/* Datos */}
        <div className={styles.stats}>
          <div className={styles.sBrujula}><Pic src="/home/brujula.svg" w={92} h={118} /></div>
          <div className={`${styles.sTxt} ${styles.sKm}`}>500<br />km</div>
          <div className={styles.sEnc}><Pic src="/home/encendedor.svg" w={640} h={640} /></div>
          <div className={`${styles.sTxt} ${styles.sTemp}`}>+50<small>Temperature</small></div>
          <div className={styles.sFicha}><Pic src="/home/ficha.svg" w={1024} h={1024} /></div>
          <div className={`${styles.sTxt} ${styles.sGoal}`}>The<br />Goal</div>
        </div>
      </div>
    </div>
  );
}
