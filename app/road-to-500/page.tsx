import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/scene/Icon";
import { Lines, LOREM_3, LOREM_SHORT } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";
import type { IconName } from "@/lib/sceneIcons";

export const metadata: Metadata = {
  title: "Road to 500 | El Reto 500 Kilómetros",
  description: "El camino de Manuel hacia los 500 kilómetros: el sueño, el camino, la comunidad, la preparación final y la meta.",
};

type Point = { l: number; t: number; w: number };
type Milestone = {
  n: number;
  title: string;
  text: string;
  big?: boolean;
  num: Point;
  star: Point;
  icon: { name: IconName; pos: Point };
  copy: Point;
};

const STEPS: Milestone[] = [
  {
    n: 1, title: "El sueño", text: LOREM_SHORT,
    num: { l: 110, t: 676, w: 68 }, star: { l: 161, t: 722, w: 84 },
    icon: { name: "flags", pos: { l: 259, t: 667, w: 168 } },
    copy: { l: 259, t: 760, w: 330 },
  },
  {
    n: 2, title: "El camino", text: LOREM_SHORT,
    num: { l: 631, t: 577, w: 70 }, star: { l: 686, t: 622, w: 86 },
    icon: { name: "senal", pos: { l: 710, t: 526, w: 100 } },
    copy: { l: 823, t: 528, w: 320 },
  },
  {
    n: 3, title: "La comunidad", text: LOREM_SHORT,
    num: { l: 1010, t: 741, w: 88 }, star: { l: 1071, t: 668, w: 88 },
    icon: { name: "mundo", pos: { l: 1176, t: 662, w: 86 } },
    copy: { l: 1118, t: 770, w: 330 },
  },
  {
    n: 4, title: "Preparación final", text: LOREM_SHORT,
    num: { l: 1370, t: 624, w: 88 }, star: { l: 1354, t: 538, w: 92 },
    icon: { name: "botella", pos: { l: 1459, t: 514, w: 86 } },
    copy: { l: 1474, t: 622, w: 330 },
  },
  {
    n: 5, title: "The Speed Proyect", text: LOREM_SHORT, big: true,
    num: { l: 1656, t: 360, w: 98 }, star: { l: 1669, t: 460, w: 88 },
    icon: { name: "maquina", pos: { l: 1752, t: 440, w: 94 } },
    copy: { l: 1493, t: 202, w: 330 },
  },
];

/** Ruta punteada del recorrido (coordenadas del escenario 1920 x 1080). */
const ROUTE =
  "M213 744 L213 626 L259 607 L389 614 L422 634 L446 660 L499 655 L557 682 L603 714 L672 696 L730 662 L782 656 " +
  "L835 682 L850 706 L960 712 L1075 720 L1118 715 L1186 672 L1212 629 L1277 624 L1354 619 L1392 586 L1411 566 " +
  "L1450 566 L1555 605 L1632 581 L1699 533";

const sty = (p: Point) => ({ "--l": p.l, "--t": p.t, "--w": p.w }) as React.CSSProperties;

export default function RoadTo500Page() {
  return (
    <Scene
      bg="road"
      map={null}
      stats={{
        km: { icon: "lasvegas", value: "500" },
        temp: { icon: "luna", value: "25" },
        goal: { icon: "dado" },
      }}
    >
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.rTitle}`}>Road to 500</h1>

        <p className={`${v.copy} ${v.rCopy}`}>
          <Lines lines={LOREM_3} />
        </p>

        <svg className={v.rRoute} viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">
          <path d={ROUTE} />
        </svg>

        <div className={v.roadList}>
          {STEPS.map((s) => (
            <div key={s.n} className={v.ms}>
              <span className={v.msNum} style={sty(s.num)}>{s.n}</span>
              <span className={v.msStar} style={sty(s.star)}>
                <Image src="/home/estrella-mapa.svg" alt="" width={347} height={331} unoptimized className={v.img} />
              </span>
              <span className={v.msIcon} style={sty(s.icon.pos)}>
                <Icon name={s.icon.name} className={v.img} />
              </span>
              <div className={`${v.msText} ${s.big ? v.msBig : ""}`} style={sty(s.copy)}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Manuel, cerca de la meta */}
        <span className={`${v.msIcon} ${v.msHead}`} style={sty({ l: 1574, t: 490, w: 100 })} aria-hidden="true">
          <Icon name="manu-pixel" className={v.img} />
        </span>
      </div>
    </Scene>
  );
}
