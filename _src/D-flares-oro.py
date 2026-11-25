"""Destellos de lente en ORO CARAMELO para fondo claro (bloques D, boda Cadmiel & Leonardo).
Sale a assets/flare-oro.webp y assets/flare-oro-mini.webp (no pisa flare.webp de otros bloques).
En blanco un destello blanco no se ve: centro champán, rayos y velo en oro (#D9C3A0 / #A9824F).
Uso: python -I _src/D-flares-oro.py"""
import os
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(RAIZ, 'assets') + os.sep
V = os.path.join(RAIZ, '_src', 'ver') + os.sep
os.makedirs(A, exist_ok=True)
os.makedirs(V, exist_ok=True)

CHAMP = np.array([1, .93, .80])
CLARO = np.array([.85, .76, .63])  # #D9C3A0
ORO = np.array([.66, .51, .31])    # #A9824F
HONDO = np.array([.48, .35, .20])  # #7A5A33


def rejilla(n):
    c = (n - 1) / 2
    y, x = np.mgrid[0:n, 0:n]
    return (x - c) * 512 / n, (y - c) * 512 / n


def rayo(u, v, ancho, largo):
    return np.exp(-(v / ancho) ** 2) * np.exp(-np.abs(u) / largo)


def guarda(rgb, nombre, n):
    rgb = 1 - np.exp(-rgb * 1.5)
    borde = np.clip((256 - np.hypot(*rejilla(n))) / 44, 0, 1)
    rgb *= (borde * borde * (3 - 2 * borde))[..., None]
    al = rgb.max(2)
    col = rgb / np.maximum(al[..., None], .004)
    k = np.clip(al, 0, 1)[..., None]
    col = col * (.50 + .50 * k ** 1.4)   # lo tenue queda en oro hondo: se ve sobre blanco
    al = np.clip(al * 1.45, 0, 1)
    im = np.dstack([col, al])
    Image.fromarray((im.clip(0, 1) * 255 + .5).astype('uint8'), 'RGBA').save(
        A + nombre + '.webp', lossless=False, quality=90, alpha_quality=95, method=6)


n = 420
x, y = rejilla(n)
r = np.hypot(x, y)
u, v = (x + y) / np.sqrt(2), (x - y) / np.sqrt(2)
rgb = (np.exp(-(r / 6.5) ** 2) * 3.0)[..., None] * CHAMP
rgb += (np.exp(-r / 15) * .95)[..., None] * CLARO
rgb += (np.exp(-r / 22) * .22)[..., None] * ORO
rgb += (np.exp(-r / 46) * .30)[..., None] * ORO
rgb += (rayo(x, y, 1.5, 92) * 1.5)[..., None] * ORO
rgb += (rayo(x, y, 5.5, 62) * .16)[..., None] * ORO
rgb += (rayo(y, x, 1.3, 44) * 1.3)[..., None] * ORO
rgb += (rayo(u, v, .85, 16) * .5)[..., None] * ORO
rgb += (rayo(v, u, .85, 16) * .5)[..., None] * ORO
rgb += (np.exp(-((r - 74) / 3.2) ** 2) * .05)[..., None] * HONDO
for gx, gr, ga in ((-112, 8, .07), (92, 5, .08), (150, 11, .045)):
    rgb += (np.exp(-(np.hypot(x - gx, y) / gr) ** 4) * ga)[..., None] * ORO
guarda(rgb, 'flare-oro', n)

n = 150
x, y = rejilla(n)
r = np.hypot(x, y)
u, v = (x + y) / np.sqrt(2), (x - y) / np.sqrt(2)
rgb = (np.exp(-(r / 17) ** 2) * 2.8)[..., None] * CHAMP
rgb += (np.exp(-r / 42) * .55)[..., None] * CLARO
rgb += (rayo(x, y, 3.6, 62) * 1.5)[..., None] * ORO
rgb += (rayo(y, x, 3.6, 62) * 1.5)[..., None] * ORO
rgb += (rayo(u, v, 2.2, 24) * .5)[..., None] * ORO
rgb += (rayo(v, u, 2.2, 24) * .5)[..., None] * ORO
guarda(rgb, 'flare-oro-mini', n)

fondo = Image.new('RGBA', (1260, 440), '#FFFFFF')
for i, c in enumerate(('#FFFFFF', '#F6F2EC', '#1F2E4A')):
    fondo.paste(Image.new('RGBA', (420, 440), c), (i * 420, 0))
    fondo.alpha_composite(Image.open(A + 'flare-oro.webp'), (i * 420, 0))
    fondo.alpha_composite(Image.open(A + 'flare-oro-mini.webp').resize((90, 90)), (i * 420 + 320, 340))
fondo.convert('RGB').save(V + 'D-flares-oro.jpg', quality=90)
print('ok')
