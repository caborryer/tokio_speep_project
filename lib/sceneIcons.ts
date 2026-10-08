/** Iconos de /public/scene/icons (.webp con fondo transparente): [ancho, alto] en px. */
export const ICONS = {
  "arma": [
    212,
    192
  ],
  "botella": [
    422,
    520
  ],
  "cactus": [
    391,
    520
  ],
  "camioneta": [
    520,
    252
  ],
  "carta": [
    372,
    520
  ],
  "casa-playa": [
    520,
    520
  ],
  "celular": [
    518,
    497
  ],
  "cerezas": [
    431,
    431
  ],
  "chile": [
    520,
    501
  ],
  "dado": [
    460,
    480
  ],
  "ficha": [
    518,
    518
  ],
  "flags": [
    499,
    338
  ],
  "flecha": [
    724,
    664
  ],
  "helado": [
    368,
    520
  ],
  "lasvegas": [
    520,
    336
  ],
  "luna": [
    240,
    240
  ],
  "manu-pixel": [
    540,
    690
  ],
  "maquina": [
    520,
    520
  ],
  "medalla": [
    479,
    456
  ],
  "megafono": [
    520,
    460
  ],
  "moneda": [
    472,
    520
  ],
  "mundo": [
    418,
    520
  ],
  "ojo": [
    520,
    370
  ],
  "play": [
    784,
    784
  ],
  "semaforo": [
    175,
    221
  ],
  "senal": [
    166,
    167
  ],
  "seven": [
    520,
    518
  ],
  "start": [
    520,
    157
  ],
  "ventilador": [
    374,
    520
  ],
  "zapatilla": [
    520,
    249
  ]
} as const;

export type IconName = keyof typeof ICONS;
