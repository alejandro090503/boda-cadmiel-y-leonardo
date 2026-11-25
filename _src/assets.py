"""Módulo A: tintas, adornos, partículas y aguja. Paleta azul/oro caramelo."""
import colorsys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

R = 'C:/Users/aleja/'
P = R + 'boda-cadmiel-y-leonardo/'
os.makedirs(P + 'ink', exist_ok=True)
os.makedirs(P + 'assets', exist_ok=True)


def hx(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def ramp(t, stops):
    """stops: [(pos, '#hex'), ...] -> rgb float (..., 3)"""
    pos = np.array([s[0] for s in stops])
    cols = np.array([hx(s[1]) for s in stops])
    return np.dstack([np.interp(t, pos, cols[:, i]) for i in range(3)])


# ---------- 1. TINTAS ----------
STOPS = [(0, '#1F2E4A'), (.2, '#2F5E7E'), (.45, '#5F8CA6'), (.68, '#A9C3D1'), (.86, '#DCE7EC'), (1, '#FFFFFF')]
METAL = [(0, '#7A5A33'), (.5, '#A9824F'), (1, '#D9C3A0')]
for n in ('hero', 'top', 'oval', 'corner', 'footer'):
    im = Image.open(R + f'save-the-date-lekshmy-jaylin/ink-{n}.jpg').convert('RGB')
    L = np.asarray(im.convert('L'), float)
    t = np.clip((L - 20) / (246 - 20), 0, 1) ** 1.25
    base = ramp(t, STOPS)
    g = ndi.gaussian_filter(L, 2.2)
    d = np.abs(g - L) * 6 / 255
    d = np.clip((d - .08) / .6, 0, 1)
    H, W = L.shape
    y, x = np.mgrid[0:H, 0:W]
    dg = x / W + y / H
    m = np.clip(.5 + .28 * np.sin(dg * 11) + .3 * (L / 255 - .5), 0, 1)
    metal = ramp(m, METAL)
    k = (d * .85)[..., None]
    rgb = base * (1 - k) + metal * k
    out = Image.fromarray(rgb.clip(0, 255).astype('uint8'))
    for q in range(86, 30, -3):
        out.save(P + f'ink/{n}.webp', quality=q, method=6)
        if os.path.getsize(P + f'ink/{n}.webp') <= 118000:
            break
    print('ink', n, os.path.getsize(P + f'ink/{n}.webp') // 1024, 'KB q', q)


# ---------- 3. ADORNOS ----------
def feather(a, frac=.035):
    h, w = a.shape
    e = max(2, int(min(h, w) * frac))
    yy = np.minimum(np.arange(h), np.arange(h)[::-1])
    xx = np.minimum(np.arange(w), np.arange(w)[::-1])
    ry = np.clip(yy / e, 0, 1)[:, None]
    rx = np.clip(xx / e, 0, 1)[None, :]
    r = ry * rx
    return a * (r * r * (3 - 2 * r))


def recolor(rgb, mode):
    """rgb float 0-1 (h,w,3). Verdes -> azul petróleo/eucalipto frío; pétalos crema -> navy."""
    h_, w_ = rgb.shape[:2]
    out = rgb.copy()
    mx = rgb.max(2)
    mn = rgb.min(2)
    v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-4), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # tono aproximado
    hue = np.zeros_like(v)
    dlt = np.maximum(mx - mn, 1e-4)
    hue = np.where(mx == g, 60 * ((b - r) / dlt) + 120, hue)
    hue = np.where(mx == r, 60 * (((g - b) / dlt) % 6), hue)
    hue = np.where(mx == b, 60 * ((r - g) / dlt) + 240, hue)
    verde = np.clip((hue - 62) / 18, 0, 1) * np.clip((175 - hue) / 18, 0, 1) * np.clip(s * 4, 0, 1)
    if mode == 'verde':
        # sólo verdes: giro hacia azul-verde petróleo, menos saturado
        hh = (175 + (hue - 100) * .35) / 360
        ss = np.clip(s * .62, 0, 1)
        vv = np.clip(v * .93, 0, 1)
        new = np.zeros_like(rgb)
        flat = [colorsys.hsv_to_rgb(a, b_, c) for a, b_, c in zip(hh.ravel(), ss.ravel(), vv.ravel())]
        new = np.array(flat).reshape(rgb.shape)
        k = verde[..., None]
        return rgb * (1 - k) + new * k
    if mode == 'navy':
        petalo = 1 - verde
        lum = (rgb * [.3, .59, .11]).sum(2)
        lt = np.clip((lum - .25) / .7, 0, 1) ** 1.2
        nav = ramp(lt, [(0, '#16233F'), (.35, '#1F2E4A'), (.7, '#2F5E7E'), (1, '#8FB1C7')]) / 255
        # verdes -> eucalipto frío
        hh = (175 + (hue - 100) * .35) / 360
        flat = [colorsys.hsv_to_rgb(a, b_, c) for a, b_, c in zip(hh.ravel(), np.clip(s * .6, 0, 1).ravel(), (v * .9).ravel())]
        gre = np.array(flat).reshape(rgb.shape)
        k = petalo[..., None]
        return nav * k + gre * (1 - k)
    return rgb


def adorno(src, nombre, mode, maxw, blur=1.8):
    im = Image.open(src).convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox())
    im.thumbnail((maxw, maxw), Image.LANCZOS)
    a = np.asarray(im, float) / 255
    rgb = recolor(a[..., :3], mode)
    al = feather(a[..., 3], .04)
    out = np.dstack([rgb, al])
    img = Image.fromarray((out * 255).clip(0, 255).astype('uint8'), 'RGBA')
    img.save(P + f'assets/{nombre}.webp', quality=86, alpha_quality=92, method=6)
    # versión desenfocada horneada (premultiplicado para no sangrar color)
    pm = np.dstack([rgb * al[..., None], al])
    ch = [ndi.gaussian_filter(pm[..., i], blur) for i in range(4)]
    A = np.maximum(ch[3], 1e-4)
    rgb_b = np.dstack([ch[i] / A for i in range(3)]).clip(0, 1)
    ib = Image.fromarray((np.dstack([rgb_b, ch[3]]) * 255).clip(0, 255).astype('uint8'), 'RGBA')
    ib.save(P + f'assets/{nombre}-b.webp', quality=82, alpha_quality=90, method=6)
    print(nombre, img.size, os.path.getsize(P + f'assets/{nombre}.webp') // 1024, 'KB')


E = R + 'boda-eliseo-hernandez-sinico-y-arely-castro-esteban/'
AN = R + 'boda-anette-gonzález-y-abraham-gonzález/'
adorno(E + 'rosas-blancas.webp', 'adorno-rosas', 'verde', 560)
adorno(AN + '_src/assets-busqueda/originales/v_eucalipto.png', 'adorno-eucalipto', 'verde', 520)
adorno(R + 'boda-dorian-y-sarahi/adornos/peonia-esquina.webp', 'adorno-flor-azul', 'navy', 520)
adorno(AN + 'assets/rama-1.webp', 'adorno-rama', 'verde', 560)


# ---------- 4. PARTÍCULAS: diamantina dorada ----------
def guarda_rgba(rgb, al, nombre, q=90):
    im = np.dstack([rgb, al])
    Image.fromarray((im.clip(0, 1) * 255 + .5).astype('uint8'), 'RGBA').save(P + f'assets/{nombre}.webp', quality=q, alpha_quality=95, method=6)


def rej(n):
    c = (n - 1) / 2
    y, x = np.mgrid[0:n, 0:n]
    return (x - c) / c, (y - c) / c


n = 128
x, y = rej(n)
r = np.hypot(x, y)
# destello de 4 puntas finas + núcleo
ray = lambda u, v, w, l: np.exp(-(v / w) ** 2) * np.exp(-np.abs(u) / l)
a = np.exp(-(r / .07) ** 2) * 1.4 + np.exp(-r / .16) * .35 + ray(x, y, .018, .55) * .95 + ray(y, x, .018, .55) * .95
a += (ray((x + y) / 1.414, (x - y) / 1.414, .014, .17) + ray((x - y) / 1.414, (x + y) / 1.414, .014, .17)) * .3
a *= np.clip((1 - r) / .12, 0, 1)
a = np.clip(1 - np.exp(-a * 1.6), 0, 1)
col = np.dstack([np.full_like(a, 1.0), np.full_like(a, .88), np.full_like(a, .62)])
col = col * (1 - np.exp(-(r / .12) ** 2) * .55)[..., None] + np.array([1, .98, .92]) * (np.exp(-(r / .12) ** 2) * .55)[..., None]
guarda_rgba(col, a, 'particula-destello')
# desenfocada horneada
ab = ndi.gaussian_filter(a, 1.8)
guarda_rgba(col, ab, 'particula-destello-b')
# polvo: puntito suave dorado
n2 = 64
x, y = rej(n2)
r = np.hypot(x, y)
a = np.clip(np.exp(-(r / .38) ** 2) * 1.1, 0, 1) * np.clip((1 - r) / .2, 0, 1)
col = np.dstack([np.full_like(a, .97), np.full_like(a, .84), np.full_like(a, .58)])
guarda_rgba(col, a, 'particula-polvo')
guarda_rgba(col, ndi.gaussian_filter(a, 1.6), 'particula-polvo-b')
for f in ('particula-destello', 'particula-destello-b', 'particula-polvo', 'particula-polvo-b'):
    print(f, os.path.getsize(P + f'assets/{f}.webp'), 'B')


# ---------- 5. AGUJA ----------
src = Image.open(R + 'boda-dorian-y-sarahi/assets/aguja.webp').convert('RGBA')
a = np.asarray(src, float)
lum = (a[..., :3] * [.3, .59, .11]).sum(2) / 255
lt = np.clip((lum - .12) / .75, 0, 1)
oro = ramp(lt, [(0, '#4A3320'), (.3, '#7A5A33'), (.6, '#A9824F'), (.85, '#D9C3A0'), (1, '#F6EBD6')])
out = np.dstack([oro, a[..., 3:4]]).astype('uint8')
Image.fromarray(out, 'RGBA').save(P + 'assets/aguja.webp', quality=90, alpha_quality=95, method=6)
print('aguja', src.size)

# ---------- hojas de revisión ----------
names = ['adorno-rosas', 'adorno-eucalipto', 'adorno-flor-azul', 'adorno-rama', 'adorno-rosas-b', 'adorno-flor-azul-b', 'aguja', 'particula-destello', 'particula-polvo']
W = Image.new('RGB', (260 * len(names), 300), (255, 255, 255))
for i, nm in enumerate(names):
    im = Image.open(P + f'assets/{nm}.webp').convert('RGBA')
    im.thumbnail((250, 290))
    W.paste(im, (i * 260, 0), im)
W.save(P + '_src/ver/adornos.jpg', quality=90)
Wd = Image.new('RGB', (len(names) * 260, 300), (11, 18, 32))
for i, nm in enumerate(['particula-destello', 'particula-destello-b', 'particula-polvo', 'aguja']):
    im = Image.open(P + f'assets/{nm}.webp').convert('RGBA')
    im.thumbnail((250, 290), Image.LANCZOS)
    Wd.paste(im, (i * 260, 0), im)
Wd.save(P + '_src/ver/particulas.jpg', quality=90)
iw = Image.new('RGB', (5 * 300, 536), (255, 255, 255))
for i, n in enumerate(('hero', 'top', 'oval', 'corner', 'footer')):
    im = Image.open(P + f'ink/{n}.webp').resize((300, 536))
    iw.paste(im, (i * 300, 0))
iw.save(P + '_src/ver/inks.jpg', quality=88)
