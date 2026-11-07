import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Lines } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";
import { BRANDS, LINK_LABEL } from "@/lib/brands";

export const metadata: Metadata = {
  title: "Marcas aliadas | El Reto 500 Kilómetros",
  description: "Las marcas que corren con Manu El Reto 500 Kilómetros.",
};

const COPY = ["Las marcas que corren esta historia con Manu."];

/** Columnas según la cantidad de marcas, para que todo quepa sin scroll. */
const cols = (n: number) => (n <= 8 ? 4 : n <= 15 ? 5 : 6);

export default function AliadosPage() {
  const total = BRANDS.length + 1; // + tarjeta "Tu marca aquí"
  return (
    <Scene bg="marcas">
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.sTitle}`}>Aliados</h1>

        <p className={`${v.copy} ${v.sCopy}`}>
          <Lines lines={COPY} />
        </p>

        <ul className={v.allyGrid} style={{ "--cols": cols(total) } as CSSProperties}>
          {BRANDS.map((b) => (
            <li key={b.name} className={v.allyCard}>
              <span className={v.allyLogo}>
                {b.logo ? (
                  <Image src={b.logo} alt={`Logo de ${b.name}`} width={400} height={200} unoptimized />
                ) : (
                  <span className={`${v.gothic} ${v.allyInitial}`} aria-hidden="true">{b.name.charAt(0)}</span>
                )}
              </span>
              <span className={v.allyName}>{b.name}</span>
              {b.links && b.links.length > 0 && (
                <span className={v.allyLinks}>
                  {b.links.map((l) => (
                    <a
                      key={l.href}
                      className={v.allyLink}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${b.name} en ${LINK_LABEL[l.type]} (se abre en una pestaña nueva)`}
                    >
                      {LINK_LABEL[l.type]} ↗
                    </a>
                  ))}
                </span>
              )}
            </li>
          ))}
          <li className={`${v.allyCard} ${v.allyJoin}`}>
            <span className={`${v.gothic} ${v.allyJoinTitle}`}>Tu marca aquí</span>
            <Link href="/marcas" className={v.allyLink}>Quiero ser parte</Link>
          </li>
        </ul>
      </div>
    </Scene>
  );
}
