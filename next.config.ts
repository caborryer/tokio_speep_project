import type { NextConfig } from "next";

/**
 * Prelanzamiento (ver lib/siteConfig.ts) — rama sitio-completo.
 * - En los despliegues de PRUEBA de Vercel (ramas / pull requests, VERCEL_ENV=preview) siempre se muestra
 *   el sitio completo, sin depender de cómo estén configuradas las variables en el panel de Vercel.
 * - Si defines NEXT_PUBLIC_PRELAUNCH (terminal, .env.local o Vercel) manda ese valor ("false" = sitio completo).
 * - Si no la defines: en LOCAL (pnpm dev) se ve el sitio completo; en una compilación de producción, el prelanzamiento.
 */
const prelaunch =
  process.env.VERCEL_ENV === "preview"
    ? "false"
    : process.env.NEXT_PUBLIC_PRELAUNCH ?? (process.env.NODE_ENV === "production" ? "true" : "false");

/** Caché de imágenes, fuentes y sprites: el navegador no los vuelve a pedir en cada visita. */
const cache = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig: NextConfig = {
  // Carpeta de compilación propia para las pruebas e2e del sitio completo (corre junto a otro servidor sin pisarse)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Permite abrir el servidor de desarrollo desde otros dispositivos de tu red (celular, Firefox por IP, etc.)
  allowedDevOrigins: ["192.168.0.105", "127.0.0.1", "localhost"],
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
