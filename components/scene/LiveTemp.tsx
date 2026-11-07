"use client";

import { useEffect, useState } from "react";

const REFRESH_MS = 10 * 60 * 1000; // el servicio actualiza cada ~10-20 min

/**
 * Temperatura actual de Santa Monica (EE. UU.), en °C, actualizada sola cada 10 minutos.
 * Muestra "--" mientras carga o si el servicio del tiempo no responde (nunca un número inventado).
 */
export default function LiveTemp() {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/temperature");
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { celsius?: number };
        if (alive && typeof data.celsius === "number") setValue(Math.round(data.celsius));
      } catch {
        /* se mantiene el último valor (o "--") y se reintenta en el próximo ciclo */
      }
    };
    void load();
    const id = setInterval(load, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <span title="Temperatura actual en Santa Monica, EE. UU." data-testid="live-temp">
      {value === null ? "--" : value}
    </span>
  );
}
