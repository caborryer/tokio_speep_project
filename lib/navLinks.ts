/**
 * Menú principal del sitio (etiquetas amarillas). ÚNICO lugar donde se define:
 * lo usa el componente <SiteNav /> en la home y en todas las vistas.
 * Para agregar, quitar o renombrar un botón, edita solo esta lista.
 * (Si pasas de 9 botones, revisa que quepan sin chocar con el contenido de cada vista.)
 */
export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/reto", label: "El Reto" },
  { href: "/dona", label: "Dona un km" },
  { href: "/manu", label: "Manu" },
  { href: "/marcas", label: "Marcas" },
  { href: "/aliados", label: "Aliados" },
  { href: "/road-to-500", label: "Road to 500" },
  { href: "/tienda", label: "Tienda" },
  { href: "/juego", label: "Juego" },
];

/** Botón amarillo grande de arriba a la derecha. */
export const CTA_LINK: NavLink = { href: "/dona", label: "Compra ahora" };
