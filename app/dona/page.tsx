import type { Metadata } from "next";
import InfoPopup from "@/components/InfoPopup";
import Icon from "@/components/scene/Icon";
import { Lines } from "@/components/scene/Lorem";
import Scene from "@/components/scene/Scene";
import v from "@/components/scene/Views.module.css";

const DONA_COPY = [
  "Tu aporte se convierte en kilómetros reales para llevar a Manu a la meta.",
];

export const metadata: Metadata = {
  title: "Dona un km | El Reto 500 Kilómetros",
  description: "Cada dólar mueve un kilómetro. Dona y ayuda a Manuel a llegar a Las Vegas.",
};

/** Avance actual del reto (km completados de 500). */
const DONE_KM = 250;
const GOAL_KM = 500;

/**
 * Qué incluye cada pago (texto de ejemplo: reemplázalo por el real).
 * Se muestra en el pop-up al hacer clic en la moneda.
 */
const TIERS = [
  { usd: "$ 10", km: "0.1 Km", includes: ["0.1 km de la ruta de Manu", "Tu nombre en el muro de donantes"] },
  { usd: "$ 40", km: "0.5 Km", includes: ["0.5 km de la ruta de Manu", "Tu nombre en el muro de donantes", "Sticker oficial del reto"] },
  { usd: "$ 80", km: "1 Km", includes: ["1 km de la ruta de Manu", "Tu nombre en el muro de donantes", "Sticker oficial del reto", "Mención en las redes de Manu"] },
  { usd: "$ 400", km: "5 Km", includes: ["5 km de la ruta de Manu", "Tu nombre en el muro de donantes", "Camiseta oficial del reto", "Póster firmado por Manu"] },
  { usd: "$ 800", km: "10 Km", includes: ["10 km de la ruta de Manu", "Tu nombre en el muro de donantes", "Camiseta y póster firmados", "Tu marca o nombre en el vehículo de apoyo"] },
];
const ROW_Y = [226, 305, 388, 469, 557];

export default function DonaPage() {
  const pct = Math.min(100, Math.round((DONE_KM / GOAL_KM) * 100));
  return (
    <Scene
      bg="dona"
      map={{ star: { l: 720, t: 845 }, bubble: { l: 677, t: 706, w: 151 } }}
      stats={{
        km: { icon: "semaforo", value: "15" },
        temp: { icon: "helado" },
        goal: { icon: "carta" },
      }}
    >
      <div className={v.content}>
        <h1 className={`${v.gothic} ${v.dTitle}`}>
          <span className={v.dT1}>Cada Dolar</span>
          <span className={v.dT2}>mueve un Kilometro</span>
        </h1>

        <p className={`${v.copy} ${v.dCopy}`}>
          <Lines lines={DONA_COPY} />
        </p>

        <div className={v.progress}>
          <div className={v.progressRow}>
            <div className={v.dHead}><Icon name="manu-pixel" className={v.img} /></div>
            <div
              className={v.bar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={GOAL_KM}
              aria-valuenow={DONE_KM}
              aria-label="Kilómetros completados"
              style={{ "--p": `${pct}%` } as React.CSSProperties}
            >
              <div className={v.barFill} />
            </div>
          </div>
          <div className={v.barText}>{DONE_KM} km/{GOAL_KM} Km</div>
        </div>

        <ul className={v.coins}>
          {TIERS.map((t, i) => (
            <li key={t.usd} className={v.coin} style={{ "--y": ROW_Y[i] - 188 } as React.CSSProperties}>
              <InfoPopup
                trigger={<Icon name="moneda" className={v.coinImg} />}
                triggerLabel={`Ver qué incluye el pago de ${t.usd}`}
                title={`Qué incluye ${t.usd}`}
                subtitle={`Equivale a ${t.km} de la ruta`}
              >
                <ul>
                  {t.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </InfoPopup>
              <span className={`${v.yTag} ${v.price}`}>{t.usd}</span>
              <span className={v.coinKm}>{t.km}</span>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}
