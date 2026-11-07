/**
 * Tienda (página /tienda).
 *
 * El sitio muestra la vitrina; la compra y el pago los hace una tienda externa (Shopify, Dissent, etc.).
 * 1) Pon en STORE_URL la dirección de tu tienda.  Mientras esté vacío, la vitrina muestra "Próximamente".
 * 2) Si cada categoría tiene su propia dirección, ponla en `href`; si no, todas llevan a STORE_URL.
 * 3) Para mostrar una foto del producto, sube la imagen a /public/tienda/ y pon `image: "/tienda/camisetas.webp"`.
 */
export const STORE_URL: string = "";

export type StoreCategory = {
  id: string;
  name: string;
  blurb: string;
  /** Imagen en /public (opcional). Sin imagen se muestra el nombre sobre fondo negro. */
  image?: string;
  /** Dirección propia de la categoría (opcional). */
  href?: string;
};

export const STORE_CATEGORIES: StoreCategory[] = [
  { id: "camisetas", name: "Camisetas", blurb: "Para correr esta historia" },
  { id: "posters", name: "Posters", blurb: "Para tu pared" },
  { id: "stickers", name: "Stickers", blurb: "Para donde quieras" },
  { id: "dissent", name: "Ropa Dissent", blurb: "Colección Dissent" },
];

export const categoryHref = (c: StoreCategory): string => c.href || STORE_URL;
