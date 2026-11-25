"""Adornos florales v2: menos hojas, más flores en la paleta (blanco, navy, petróleo, caramelo).
Fuentes reales reutilizadas de otras bodas. Verdes -> gris azulado; versiones -b difuminadas."""
import numpy as np
from PIL import Image, ImageFilter
import colorsys
U = 'C:/Users/aleja/'
OUT = U + 'boda-cadmiel-y-leonardo/assets/'
SRC = {
    'rosas':      U + 'boda-eliseo-hernandez-sinico-y-arely-castro-esteban/rosas-blancas.webp',
    'peonia':     U + 'boda-diana-quijano-y-sebastian-ortiz/public/assets/esquina-floral.png',
    'peonia2':    U + 'boda-luz-monica-serrano-lopez-y-juan-diego-bobadilla-romero/public/assets/esquina-floral.png',
    'rosa-azul':  U + 'boda-andrea-giovana-gomez-sanchez-luis-uriel-licona-rojas/flores/esq-grande.webp',
    'hortensia':  U + 'boda-luz-monica-serrano-lopez-y-juan-diego-bobadilla-romero/public/mx/hort-esquina.webp',
    'hortensia1': U + 'boda-luz-monica-serrano-lopez-y-juan-diego-bobadilla-romero/public/mx/hortensia-1.webp',
}

def recolor(im, blue_shift=False):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    rgb, al = a[..., :3], a[..., 3:]
    hsv = np.zeros_like(rgb)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, d / (mx + 1e-6), 0); v = mx
    # hojas (verde/amarillo-verde 0.14-0.45) -> gris azulado petróleo, menos saturado y más claro
    leaf = (h > 0.13) & (h < 0.47) & (s > 0.12)
    h = np.where(leaf, 0.56, h); s = np.where(leaf, s * 0.35, s); v = np.where(leaf, np.minimum(1, v * 1.08 + 0.05), v)
    # rosas/pinks -> blanco marfil (quitar rosa)
    pink = ((h > 0.88) | (h < 0.04)) & (s > 0.08)
    s = np.where(pink, s * 0.25, s)
    if blue_shift:  # azul rey -> azul petróleo/navy de la paleta (h≈0.57)
        blu = (h > 0.52) & (h < 0.75)
        h = np.where(blu, 0.575, h); s = np.where(blu, np.minimum(s, 0.55) * 0.9, s); v = np.where(blu, v * 0.82, v)
    i = np.floor(h * 6) % 6; f = h * 6 - np.floor(h * 6)
    p, q, t = v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)
    out = np.select([(i == k)[..., None] for k in range(6)],
                    [np.stack(x, -1) for x in [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]])
    return Image.fromarray((np.concatenate([out, al], -1) * 255).clip(0, 255).astype(np.uint8), 'RGBA')

def save(im, name, w):
    im = im.copy(); im.thumbnail((w, w * 2), Image.LANCZOS)
    im.save(OUT + name + '.webp', quality=86, method=6)
    # difuminada: más grande, blur horneado, alfa bajo
    big = im.resize((int(im.width * 1.25), int(im.height * 1.25)), Image.LANCZOS)
    pad = 60
    c = Image.new('RGBA', (big.width + pad * 2, big.height + pad * 2), (0, 0, 0, 0)); c.alpha_composite(big, (pad, pad))
    c = c.filter(ImageFilter.GaussianBlur(14))
    c.save(OUT + name + '-b.webp', quality=80, method=6)
    print(name, im.size, c.size)

save(recolor(Image.open(SRC['rosas'])), 'flor-rosas', 520)
save(recolor(Image.open(SRC['peonia']), True), 'flor-peonia', 520)
save(recolor(Image.open(SRC['peonia2']), True), 'flor-peonia-azul', 520)
save(recolor(Image.open(SRC['rosa-azul']), True), 'flor-rosa-azul', 480)
save(recolor(Image.open(SRC['hortensia']), True), 'flor-hortensia', 460)
save(recolor(Image.open(SRC['hortensia1']), True), 'flor-hortensia-sola', 420)
