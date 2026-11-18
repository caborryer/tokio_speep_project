#!/usr/bin/env python3
"""
Recorta las fotos de camisetas de public/tshirts/ para el riel de /tienda/camisetas.

Uso (desde la raíz del repo):
    python3 scripts/cutout-tshirts.py

Requiere: pip install pillow numpy scipy   (solo herramienta de desarrollo)

Qué hace con cada foto:
  1. Quita el fondo (transparente + recuadro gris claro) con un relleno desde los bordes,
     así los estampados claros del interior de la camiseta no se pierden.
  2. Suaviza el borde, recorta a la camiseta y la escala con un factor COMÚN por par
     frente/espalda (para que no cambie de tamaño al girar).
  3. Todas las piezas comparten el mismo ancho de camiseta y el cuello a la misma altura,
     dentro de un lienzo con proporción 200:310 (600 x 930).
  4. Escribe public/tshirts/rail/<slug>-front.png y <slug>-back.png (los originales no se tocan).

Piezas nuevas: agrega una línea a PIECES (slug, foto de frente, foto de espalda o None).
Si el recorte se come parte de la camiseta o deja restos de fondo, ajusta el umbral en TOL
(más alto = quita más fondo).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "tshirts"
OUT = SRC / "rail"

# slug, frente, espalda
PIECES = [
    ("gotica", "gotic.png", "gotic_ok.png"),
    ("samurai", "samu.png", "samira.png"),
    ("plastilina", "plat.png", "plasti_dia.png"),
    ("amarillo", "amarillo.png", None),
]

TOL = {}  # umbral de luminancia por archivo, p. ej. {"plat.png": 205}
DEFAULT_THRESHOLD = 200  # fondo gris ~220, camiseta ~145

CANVAS_W, CANVAS_H = 800, 1240  # 200:310 (la foto original mide 768 px de ancho: más no aporta nitidez)
SHIRT_W = 0.92  # ancho de la camiseta respecto al lienzo
NECK_Y = 0.03  # el borde superior de la camiseta (cuello/hombros) queda a esta altura


def cutout(name: str) -> Image.Image:
    img = Image.open(SRC / name).convert("RGBA")
    a = np.array(img)
    lum = a[..., :3].astype(float).mean(axis=2)
    sat = a[..., :3].max(axis=2).astype(int) - a[..., :3].min(axis=2).astype(int)
    thr = TOL.get(name, DEFAULT_THRESHOLD)
    bg_like = (a[..., 3] < 10) | ((lum >= thr) & (sat < 14))
    labels, _ = ndimage.label(bg_like)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    bg = np.isin(labels, border)
    # el recuadro gris no toca los bordes en todos lados: se incluyen las regiones claras grandes
    # que tocan la franja blanca/transparente (ya cubierto arriba) y se rellenan huecos del fondo
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # quedarse con el componente más grande (la camiseta) y rellenar huecos internos
    fg_labels, n = ndimage.label(alpha > 0)
    if n > 1:
        sizes = ndimage.sum(alpha > 0, fg_labels, range(1, n + 1))
        alpha = np.where(fg_labels == (int(np.argmax(sizes)) + 1), 255, 0).astype(np.uint8)
    alpha = ndimage.binary_fill_holes(alpha > 0).astype(np.uint8) * 255
    alpha = ndimage.binary_erosion(alpha > 0, iterations=1).astype(np.uint8) * 255
    mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.9))
    img.putalpha(mask)
    return img.crop(img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())


def place(img: Image.Image, scale: float, cx_ref: float | None = None) -> Image.Image:
    w, h = round(img.width * scale), round(img.height * scale)
    img = img.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((CANVAS_W - w) // 2, round(CANVAS_H * NECK_Y)))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, front, back in PIECES:
        f = cutout(front)
        b = cutout(back) if back else None
        # factor común por par: el ancho medio de ambas caras
        width = f.width if b is None else (f.width + b.width) / 2
        scale = CANVAS_W * SHIRT_W / width
        place(f, scale).save(OUT / f"{slug}-front.png", optimize=True)
        print("ok", slug, "front", f.size, f"x{scale:.3f}")
        if b is not None:
            place(b, scale).save(OUT / f"{slug}-back.png", optimize=True)
            print("ok", slug, "back", b.size)


if __name__ == "__main__":
    main()
