import type { Metadata } from "next";
import DinoLoader from "@/components/DinoLoader";

export const metadata: Metadata = {
  title: "Juega con Manu | El Reto 500 Kilómetros",
  description: "Corre con Manu, esquiva los obstáculos y entra al ranking global.",
};

/** El juego de Manu siempre disponible durante toda la campaña (con ranking global). */
export default function JuegoPage() {
  return <DinoLoader persistent label="CORRE CON MANU" backHref="/" />;
}
