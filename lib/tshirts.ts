import type { RailGarment } from "@/components/ui/product-rail-gallery";

/**
 * Camisetas del riel de /tienda/camisetas.
 *
 * - Las imágenes salen de `python3 scripts/cutout-tshirts.py` (fondo transparente, lienzo 200:310)
 *   y viven en /public/tshirts/rail/.
 * - `backImage` es opcional: sin espalda se muestra el frente al girar la prenda.
 * - `tag` es la etiqueta colgante (por ejemplo "$30"). Sin `tag` no se muestra etiqueta.
 */
export const TSHIRTS: RailGarment[] = [
  {
    id: "gotica",
    name: "Gótica",
    description: "Camiseta gris con el escudo TSP al frente y el diablo corredor en la espalda.",
    details: ["Algodón", "Gris", "Estampado frente y espalda"],
    image: "/tshirts/rail/gotica-front.png",
    backImage: "/tshirts/rail/gotica-back.png",
  },
  {
    id: "samurai",
    name: "Samurái",
    description: "Camiseta gris con el estampado azul “Cállate y corre” y el samurái en la espalda.",
    details: ["Algodón", "Gris", "Estampado frente y espalda"],
    image: "/tshirts/rail/samurai-front.png",
    backImage: "/tshirts/rail/samurai-back.png",
  },
  {
    id: "plastilina",
    name: "Plastilina",
    description: "Camiseta gris con el logo en relieve de plastilina y el diablito en la espalda.",
    details: ["Algodón", "Gris", "Estampado frente y espalda"],
    image: "/tshirts/rail/plastilina-front.png",
    backImage: "/tshirts/rail/plastilina-back.png",
  },
  {
    id: "amarillo",
    name: "Amarillo",
    description: "Camiseta gris con el diablo y “Callate y corre” en amarillo.",
    details: ["Algodón", "Gris", "Estampado al frente"],
    image: "/tshirts/rail/amarillo-front.png",
  },
];
