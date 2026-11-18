"use client";

import React from "react";
import { usePathname } from "next/navigation";

const FULL_VIEWPORT_ROOTS = [
  "/dona",
  "/manu",
  "/marcas",
  "/road-to-500",
  "/reto",
  "/tienda",
  "/aliados",
  "/juego",
];

function isFullViewportRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return FULL_VIEWPORT_ROOTS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullViewport = isFullViewportRoute(pathname);

  return (
    <div
      style={
        fullViewport
          ? { height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }
          : { minHeight: "100vh", display: "flex", flexDirection: "column" }
      }
    >
      <main style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}
