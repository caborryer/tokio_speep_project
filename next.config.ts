import type { NextConfig } from "next";

/**
 * Prelanzamiento (ver lib/siteConfig.ts).
 * - En los despliegues de PRUEBA de Vercel (ramas / pull requests, VERCEL_ENV=preview) siempre se muestra
 *   el sitio completo, sin depender de cómo estén configuradas las variables en el panel de Vercel.
 * - En producción y en local manda NEXT_PUBLIC_PRELAUNCH (solo el valor "false" abre el sitio completo).
 */
const prelaunch =
  process.env.VERCEL_ENV === "preview" ? "false" : process.env.NEXT_PUBLIC_PRELAUNCH ?? "true";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRELAUNCH: prelaunch,
  },
};

export default nextConfig;
