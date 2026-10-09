import type { NextConfig } from "next";

/**
 * Prelanzamiento (ver lib/siteConfig.ts).
 * - En los despliegues de PRUEBA de Vercel (ramas / pull requests, VERCEL_ENV=preview) siempre se muestra
 *   el sitio completo, sin depender de cómo estén configuradas las variables en el panel de Vercel.
 * - En producción y en local manda NEXT_PUBLIC_PRELAUNCH (solo el valor "false" abre el sitio completo).
 */
const prelaunch =
  process.env.VERCEL_ENV === "preview" ? "false" : process.env.NEXT_PUBLIC_PRELAUNCH ?? "true";

/** Caché de imágenes, fuentes y sprites: el navegador no los vuelve a pedir en cada visita. */
const cache = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRELAUNCH: prelaunch,
  },
  async headers() {
    return ["home", "loader", "scene", "fonts"].map((dir) => ({
      source: `/${dir}/:path*`,
      headers: cache,
    }));
  },
};

export default nextConfig;
