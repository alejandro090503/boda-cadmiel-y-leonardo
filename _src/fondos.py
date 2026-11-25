"""Fondos florales de Gemini -> fondos/*.webp (blanco a #fff puro, mitades recortadas)."""
import os
import numpy as np
from PIL import Image
D = 'C:/Users/aleja/Downloads/'
OUT = 'C:/Users/aleja/boda-cadmiel-y-leonardo/fondos/'
os.makedirs(OUT, exist_ok=True)
files = sorted([f for f in os.listdir(D) if f.startswith('Gemini_Generated_Image_') and f.endswith('.jpeg')],
               key=lambda f: -os.path.getmtime(D + f))[:13][::-1]
names = ['fecha', 'ubicacion', 'franja', 'hospedaje', 'itinerario', 'vestimenta', 'adultos',
         'regalos-arriba', 'regalos-abajo', 'album', 'padres', 'rsvp', 'pie']

def clean(im):
    """Lleva el papel casi blanco a blanco puro para que multiply no deje velo gris."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    lum = a.mean(-1, keepdims=True)
    k = np.clip((lum - 228) / (246 - 228), 0, 1)  # 0 = flor, 1 = papel
    a = a * (1 - k) + 255 * k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))

def trim_rows(im, keep_top):
    a = np.asarray(im.convert('L'))
    ink = (a < 238).sum(1) > 3
    ys = np.nonzero(ink)[0]
    if not len(ys): return None
    return im.crop((0, 0, im.width, min(im.height, ys.max() + 20))) if keep_top else im.crop((0, max(0, ys.min() - 20), im.width, im.height))

for f, n in zip(files, names):
    im = clean(Image.open(D + f))
    im.save(OUT + n + '.webp', quality=82, method=6)
    h = im.height // 2
    t = trim_rows(im.crop((0, 0, im.width, h)), True)
    b = trim_rows(im.crop((0, h, im.width, im.height)), False)
    if t: t.save(OUT + n + '-top.webp', quality=82, method=6)
    if b: b.save(OUT + n + '-bot.webp', quality=82, method=6)
    print(n, f[23:31], im.size, t and t.size, b and b.size)
