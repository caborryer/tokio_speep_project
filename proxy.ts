import { NextResponse, type NextRequest } from "next/server";

/**
 * Prelanzamiento: todas las rutas de página (menos "/") redirigen al juego de Manuel.
 * Los archivos estáticos (imágenes, fuentes, _next, etc.) no pasan por aquí.
 * Se desactiva con NEXT_PUBLIC_PRELAUNCH=false (ver lib/siteConfig.ts).
 */
export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_PRELAUNCH === "false") return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url), 307);
}

export const config = {
  // Todo menos: "/", _next, favicon, carpetas de assets y cualquier archivo con extensión
  matcher: ["/((?!$|_next/|favicon.ico|loader/|home/|fonts/|.*\\..*).*)"],
};
