import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/scene/Icon";
import { Lines, LOREM_3 } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";

export const metadata: Metadata = {
  title: "Manuel Agudelo | El Reto 500 Kilómetros",
  description: "Conoce a Manuel Agudelo, el corredor detrás de El Reto 500 Kilómetros.",
};

/** Foto dentro del polaroid. Para cambiarla, reemplaza /public/scene/photos/manu-retrato.webp. */
const PORTRAIT = "/scene/photos/manu-retrato.webp";

export default function ManuPage() {
  return (
    <Scene
      bg="manu"
      map={{
        star: { l: 975, t: 872 },
        head: { l: 607, t: 730, w: 120 },
        bubble: { l: 996, t: 802, w: 100 },
      }}
      stats={{
        km: { icon: "cactus", value: "42" },
        temp: { icon: "arma", value: "32" },
        goal: { icon: "cerezas" },
      }}
    >
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.mTitle}`}>Manuel Agudelo</h1>

        <p className={`${v.copy} ${v.mCopy}`}>
          <Lines lines={LOREM_3} />
        </p>

        <p className={v.quote}>“CALLATE Y CORRE”</p>

        <div className={v.polaroid}>
          <div className={v.polaroidPhoto}>
            <Image src={PORTRAIT} alt="Manuel Agudelo" width={874} height={900} unoptimized />
          </div>
          <Image
            src="/scene/photos/marco.webp"
            alt=""
            width={900}
            height={1060}
            unoptimized
            className={v.polaroidFrame}
          />
          <Image
            src="/scene/photos/cinta.webp"
            alt=""
            width={700}
            height={700}
            unoptimized
            className={v.polaroidTape}
          />
          <Link href="/road-to-500" className={v.storyBtn}>
            <Icon name="flecha" className={v.arrow} />
            <span className={`${v.yTag}`}>Conoce mi historia</span>
          </Link>
        </div>
      </div>
    </Scene>
  );
}
