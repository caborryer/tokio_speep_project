import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde otros dispositivos de tu red (celular, Firefox por IP, etc.)
  allowedDevOrigins: ["192.168.0.105", "127.0.0.1", "localhost"],
};

export default nextConfig;
