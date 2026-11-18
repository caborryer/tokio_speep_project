import type { Metadata } from "next";
import Link from "next/link";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";
import ClothingRailHero from "@/components/ui/product-rail-gallery";
import { TSHIRTS } from "@/lib/tshirts";
import { STORE_URL } from "@/lib/store";

export const metadata: Metadata = {
  title: "Camisetas | El Reto 500 Kilómetros",
  description: "Las camisetas de El Reto 500 Kilómetros: recorre el riel, gira cada pieza y mira el frente y la espalda.",
};

const LABELS = { front: "Frente", back: "Espalda", close: "Cerrar", show: "Ver", zoom: "Ampliar" };

export default function CamisetasPage() {
  return (
    <Scene bg="road">
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.sTitle}`}>Camisetas</h1>

        <Link className={`${v.yTag} ${v.railBack}`} href="/tienda">
          ← Tienda
        </Link>

        <div className={v.railBox}>
          <ClothingRailHero
            items={TSHIRTS}
            hanger="matte"
            labels={LABELS}
            caption="Pasa el cursor por el riel, arrastra una percha y toca una pieza para ver la espalda."
            action={
              STORE_URL ? (
                <a className={`${v.yTag} ${v.railCta}`} href={STORE_URL} target="_blank" rel="noopener noreferrer">
                  Ir a la tienda ↗
                </a>
              ) : null
            }
          />
        </div>
      </div>
    </Scene>
  );
}
