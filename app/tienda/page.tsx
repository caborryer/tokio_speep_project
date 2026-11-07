import type { Metadata } from "next";
import Image from "next/image";
import { Lines } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";
import { STORE_CATEGORIES, STORE_URL, categoryHref } from "@/lib/store";

export const metadata: Metadata = {
  title: "Tienda | El Reto 500 Kilómetros",
  description: "Camisetas, posters, stickers y ropa de Dissent de El Reto 500 Kilómetros.",
};

const COPY = [
  "Camisetas, posters, stickers y ropa de Dissent.",
  "Lleva puesta esta historia.",
];

export default function TiendaPage() {
  return (
    <Scene bg="road">
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.sTitle}`}>Tienda</h1>

        <p className={`${v.copy} ${v.sCopy}`}>
          <Lines lines={COPY} />
        </p>

        <ul className={v.shopGrid}>
          {STORE_CATEGORIES.map((c) => {
            const href = categoryHref(c);
            const inner = (
              <>
                <span className={v.shopImg}>
                  {c.image ? (
                    <Image src={c.image} alt={c.name} width={640} height={640} unoptimized />
                  ) : (
                    <span className={`${v.gothic} ${v.shopPh}`} aria-hidden="true">{c.name}</span>
                  )}
                </span>
                <span className={v.shopName}>{c.name}</span>
                <span className={v.shopNote}>{c.blurb}</span>
                {!href && <span className={v.shopSoon}>Próximamente</span>}
              </>
            );
            return (
              <li key={c.id}>
                {href ? (
                  <a className={v.shopCard} href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className={`${v.shopCard} ${v.shopOff}`} aria-disabled="true">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {STORE_URL ? (
          <a className={`${v.yTag} ${v.shopCta}`} href={STORE_URL} target="_blank" rel="noopener noreferrer">
            Ir a la tienda ↗
          </a>
        ) : (
          <span className={`${v.yTag} ${v.shopCta} ${v.shopCtaOff}`}>La tienda abre pronto</span>
        )}
      </div>
    </Scene>
  );
}
