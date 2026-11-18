#!/usr/bin/env python3
"""
Compone las camisetas de /tienda/camisetas sobre una prenda base gris colgada en gancho
de madera (enfoque híbrido: caída fotorrealista + estampados originales 100% fieles).

Uso (desde la raíz del repo):
    python3 scripts/cutout-tshirts.py

Requiere: pip install pillow numpy scipy   (solo herramienta de desarrollo)

Qué hace:
  1. Lee las prendas base ya recortadas en lienzo 800×1240 (proporción 200:310):
       public/tshirts/rail/base-front.png
       public/tshirts/rail/base-back.png
       public/tshirts/rail/base-side.png  (se usa directamente como sideImage)
  2. Alinea las fotos planas originales de public/tshirts/*.png y extrae cada estampado
     comparando contra la tela gris limpia (sin alterar tipografías ni ilustraciones).
  3. Compone cada estampado sobre base-front.png o base-back.png aplicando:
       - desplazamiento sutil según el mapa de pliegues verticales de la tela colgada,
       - modulación de luz y sombra de los pliegues para integrarlo como tinta real,
       - recorte al canal alfa de la prenda base.
  4. Escribe public/tshirts/rail/<slug>-front.png y <slug>-back.png sin tocar los originales.

Piezas nuevas:
  - Agrega el archivo en public/tshirts/ y una entrada en PRINTS con su cara ("front" | "back"),
    región de origen (src_roi en coordenadas normalizadas 0..1 del recorte plano) y destino
    (dst_cx, dst_y, dst_w en coordenadas normalizadas 0..1 sobre la camiseta colgada).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "tshirts"
OUT = SRC / "rail"

NORM_SIZE = 720  # tamaño común para alinear los mockups planos originales

# Configuración por cara:
# (slug, side, src_file, roi=(x0,y0,x1,y1) en [0..1] del mockup plano,
#  dst=(cx, top_y, width) en px del lienzo 800x1240, diff_thr, fold_shade)
PRINTS = [
    # Gótica: escudo TSP en pecho izquierdo + diablo corredor grande en espalda
    ("gotica", "front", "gotic.png", (0.50, 0.20, 0.74, 0.44), (496, 368, 126), 18.0, 0.78),
    ("gotica", "back", "gotic_ok.png", (0.28, 0.14, 0.72, 0.78), (400, 290, 278), 16.0, 0.80),
    # Samurái: logo azul en pecho izquierdo + envoltura samurái en espalda
    ("samurai", "front", "samu.png", (0.50, 0.19, 0.75, 0.44), (496, 364, 126), 18.0, 0.78),
    ("samurai", "back", "samira.png", (0.27, 0.16, 0.73, 0.68), (400, 306, 290), 18.0, 0.80),
    # Plastilina: parche en pecho izquierdo + diablito de plastilina en espalda
    ("plastilina", "front", "plat.png", (0.50, 0.21, 0.76, 0.44), (498, 368, 134), 24.0, 0.72),
    ("plastilina", "back", "plasti_dia.png", (0.29, 0.16, 0.71, 0.76), (400, 304, 266), 22.0, 0.75),
    # Amarillo: diablo rojo + CALLATE Y CORRE centrado en el pecho
    ("amarillo", "front", "amarillo.png", (0.29, 0.20, 0.70, 0.46), (398, 366, 262), 26.0, 0.72),
]


def crop_flat(name: str) -> Image.Image:
    """Recorta el mockup plano original exactamente a la silueta de la camiseta."""
    im = Image.open(SRC / name).convert("RGBA")
    a = np.array(im)
    lum = a[..., :3].astype(np.float32).mean(axis=2)
    sat = a[..., :3].max(axis=2).astype(np.int16) - a[..., :3].min(axis=2).astype(np.int16)
    bg_like = (a[..., 3] < 10) | ((lum >= 200) & (sat < 14))
    labels, _ = ndimage.label(bg_like)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    fg = ~np.isin(labels, border)
    fl, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, fl, range(1, n + 1))
        fg = fl == (int(np.argmax(sizes)) + 1)
    fg = ndimage.binary_fill_holes(fg)
    ys, xs = np.where(fg)
    return im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def build_clean_reference(names: list[str]) -> np.ndarray:
    """Reconstruye la camiseta gris plana limpia eligiendo en cada píxel el más cercano a la tela neutra."""
    stack = np.stack(
        [
            np.array(crop_flat(n).resize((NORM_SIZE, NORM_SIZE), Image.LANCZOS), dtype=np.float32)[..., :3]
            for n in names
        ],
        axis=0,
    )
    # Color medio de la tela gris limpia muestreado en la parte baja del torso
    grey = np.median(stack[:, 540:660, 240:480, :].reshape(-1, 3), axis=0)
    dist = np.linalg.norm(stack - grey[None, None, None, :], axis=3)
    best_idx = np.argmin(dist, axis=0)
    yy, xx = np.indices((NORM_SIZE, NORM_SIZE))
    clean = stack[best_idx, yy, xx]
    # Si algún píxel sigue contaminado en todas las fotos, rellenar con gris suave local
    sat = clean.max(axis=2) - clean.min(axis=2)
    d_clean = np.linalg.norm(clean - grey[None, None, :], axis=2)
    bad = (sat > 12) | (d_clean > 24)
    if np.any(bad):
        bad = ndimage.binary_dilation(bad, iterations=2)
        filled = np.where(bad[..., None], grey[None, None, :], clean)
        smooth = np.stack([ndimage.gaussian_filter(filled[..., c], sigma=6.0) for c in range(3)], axis=2)
        clean = np.where(bad[..., None], smooth, clean)
    return clean


def extract_print(
    src_file: str,
    clean_ref: np.ndarray,
    roi: tuple[float, float, float, float],
    diff_thr: float,
) -> Image.Image:
    """Extrae el estampado original (RGBA) usando diferencia contra la tela gris limpia."""
    arr = np.array(crop_flat(src_file).resize((NORM_SIZE, NORM_SIZE), Image.LANCZOS), dtype=np.float32)[..., :3]
    x0, y0, x1, y1 = [round(v * NORM_SIZE) for v in roi]
    patch = arr[y0:y1, x0:x1]
    ref = clean_ref[y0:y1, x0:x1]

    # Distancia de color contra la tela gris de referencia + saturación propia del estampado
    diff = np.linalg.norm(patch - ref, axis=2)
    sat = patch.max(axis=2) - patch.min(axis=2)
    # También detecta tonos neutros mucho más oscuros o más claros que la tela (p. ej. blanco de plastilina / negro de zapatilla / TSP gris oscuro)
    lum_diff = np.abs(patch.mean(axis=2) - ref.mean(axis=2))
    signal = np.maximum(diff, np.maximum(sat * 1.4, lum_diff * 1.25))

    # Máscara suave con rampa anti-aliasing
    alpha = np.clip((signal - diff_thr) / 14.0, 0.0, 1.0)
    # Elimina motas aisladas de ruido (< 12 px) fuera del estampado
    solid = alpha > 0.25
    solid = ndimage.binary_closing(solid, iterations=1)
    labels, n = ndimage.label(solid)
    if n > 0:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        keep = np.isin(labels, np.where(sizes >= 12)[0] + 1)
        keep_soft = ndimage.binary_dilation(keep, iterations=2)
        alpha = np.where(keep_soft, alpha, 0.0)

    # Descontaminar el gris de la tela en los bordes semitransparentes
    semi = (alpha > 0.02) & (alpha < 0.96)
    out_rgb = patch.copy()
    if np.any(semi):
        al = alpha[semi, None]
        out_rgb[semi] = np.clip((patch[semi] - ref[semi] * (1.0 - al)) / np.maximum(al, 0.18), 0, 255)

    rgba = np.dstack([out_rgb, alpha * 255.0]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    bbox = im.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    if bbox is None:
        raise RuntimeError(f"No se detectó estampado en {src_file}")
    return im.crop(bbox)


def composite_on_base(
    base_im: Image.Image,
    graphic: Image.Image,
    dst: tuple[int, int, int],
    fold_shade: float,
) -> Image.Image:
    """Compone el estampado sobre la prenda colgada siguiendo pliegues e iluminación de la tela."""
    cx, top_y, target_w = dst
    scale = target_w / graphic.width
    gw, gh = round(graphic.width * scale), round(graphic.height * scale)
    g_im = graphic.resize((gw, gh), Image.LANCZOS)

    # Colocar el estampado en un lienzo del mismo tamaño que la prenda base
    W, H = base_im.size
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = round(cx - gw / 2)
    py = top_y
    layer.alpha_composite(g_im, (px, py))

    base_arr = np.array(base_im, dtype=np.float32)
    base_lum = base_arr[..., :3].mean(axis=2)
    base_alpha = base_arr[..., 3] / 255.0

    # Mapa suave de pliegues dentro de la zona del estampado
    g_arr = np.array(layer, dtype=np.float32)
    g_mask = g_arr[..., 3] > 5
    ys_m, xs_m = np.where(g_mask)
    if len(ys_m) == 0:
        return base_im.copy()

    # Desplazamiento sutil horizontal/vertical siguiendo la luz de los pliegues
    smooth_lum = ndimage.gaussian_filter(base_lum, sigma=9.0)
    ref_lum = float(np.median(base_lum[g_mask]))
    disp_x = np.clip((smooth_lum - ref_lum) * 0.11, -3.0, 3.0)
    disp_y = np.clip((smooth_lum - ref_lum) * 0.04, -1.5, 1.5)

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    coords = np.array([np.clip(yy + disp_y, 0, H - 1), np.clip(xx + disp_x, 0, W - 1)])
    warped = np.empty_like(g_arr)
    for c in range(4):
        warped[..., c] = ndimage.map_coordinates(g_arr[..., c], coords, order=1, mode="nearest")

    # Sombreado natural de los pliegues + grano sutil de algodón sobre el estampado
    rel_light = np.clip(base_lum / max(ref_lum, 1.0), 0.70, 1.16)
    shade = 1.0 + (rel_light - 1.0) * fold_shade
    shaded_rgb = np.clip(warped[..., :3] * shade[..., None], 0, 255)

    # Mezcla alpha respetando la silueta exacta de la camiseta base
    a = np.clip((warped[..., 3] / 255.0) * base_alpha, 0.0, 1.0)[..., None]
    out_rgb = base_arr[..., :3] * (1.0 - a) + shaded_rgb * a
    out = np.dstack([np.clip(out_rgb, 0, 255), base_arr[..., 3]]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def recenter_torso(im: Image.Image) -> Image.Image:
    """Centra horizontalmente el torso en x = W/2 para evitar cabeceo al girar frente/espalda."""
    arr = np.array(im)
    xs = np.where(arr[550:1050, :, 3] > 128)[1]
    if len(xs) == 0:
        return im
    torso_cx = (int(xs.min()) + int(xs.max())) / 2.0
    shift = round(im.width / 2.0 - torso_cx)
    if abs(shift) <= 1:
        return im
    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
    canvas.alpha_composite(im, (shift, 0))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Asegurar centrado exacto de torso en base-front y base-back
    bases = {}
    for side in ("front", "back"):
        p = OUT / f"base-{side}.png"
        im = recenter_torso(Image.open(p).convert("RGBA"))
        im.save(p, optimize=True)
        bases[side] = im

    # Reconstruir tela plana limpia desde los 4 frentes (y usarla también en el torso trasero)
    clean_front = build_clean_reference(["gotic.png", "samu.png", "plat.png", "amarillo.png"])
    # Para la espalda, el cuerpo es la misma foto gris plana salvo el cuello; combinamos la mediana
    # de los 3 traseros con clean_front donde los 3 traseros tienen estampado superpuesto.
    clean_back = build_clean_reference(["gotic_ok.png", "samira.png", "plasti_dia.png"])
    # En la zona central donde coinciden estampados traseros, usar el gris limpio de clean_front
    sat_b = clean_back.max(axis=2) - clean_back.min(axis=2)
    lum_b = clean_back.mean(axis=2)
    dirty_back = (sat_b > 10) | (lum_b < 118) | (lum_b > 175)
    dirty_back = ndimage.binary_dilation(dirty_back, iterations=4)
    clean_back = np.where(dirty_back[..., None], clean_front, clean_back)

    for slug, side, src_file, roi, dst, diff_thr, fold_shade in PRINTS:
        ref = clean_front if side == "front" else clean_back
        graphic = extract_print(src_file, ref, roi, diff_thr)
        result = composite_on_base(bases[side], graphic, dst, fold_shade)
        out_path = OUT / f"{slug}-{side}.png"
        result.save(out_path, optimize=True)
        print(f"ok {slug}-{side}.png  print={graphic.size} -> dst={dst}")


if __name__ == "__main__":
    main()
