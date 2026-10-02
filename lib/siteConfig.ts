/**
 * Modo PRELANZAMIENTO.
 *
 * Mientras esté activo, el sitio solo muestra el juego de Manuel (en "/") y cualquier otra
 * ruta (/reto, /dona, /manu...) redirige al inicio. Además se le pide a Google no indexar el sitio.
 *
 * Para lanzar el sitio completo, define NEXT_PUBLIC_PRELAUNCH=false en el hosting
 * (o en .env.local) y vuelve a desplegar. Cualquier otro valor, o no definirla, deja el prelanzamiento activo.
 */
export const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH !== "false";
