/**
 * Marcas aliadas (página /aliados).
 *
 * Para agregar o cambiar una marca:
 * 1) Sube su logo a /public/aliados/ (PNG, SVG o WebP; mejor con fondo transparente).
 * 2) Agrega una entrada con su nombre, el logo y sus enlaces. Los enlaces son opcionales: solo se muestran los que pongas.
 *
 *   {
 *     name: "Mi Marca",
 *     logo: "/aliados/mi-marca.svg",
 *     links: [
 *       { type: "web", href: "https://mimarca.com" },
 *       { type: "instagram", href: "https://instagram.com/mimarca" },
 *     ],
 *   },
 *
 * Las entradas de ejemplo de abajo (sin logo ni enlaces) se reemplazan por las marcas reales.
 */
export type LinkType = "web" | "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "x";

export const LINK_LABEL: Record<LinkType, string> = {
  web: "Web",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X",
};

export type Brand = {
  name: string;
  /** Ruta del logo en /public. Sin logo se muestra la inicial de la marca. */
  logo?: string;
  links?: { type: LinkType; href: string }[];
};

export const BRANDS: Brand[] = [
  { name: "Marca aliada 1" },
  { name: "Marca aliada 2" },
  { name: "Marca aliada 3" },
  { name: "Marca aliada 4" },
  { name: "Marca aliada 5" },
  { name: "Marca aliada 6" },
  { name: "Marca aliada 7" },
];
