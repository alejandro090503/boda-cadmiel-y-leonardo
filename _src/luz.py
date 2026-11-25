"""Luz Premium (kit-efectos-elysium/luz) en boda-cadmiel-y-leonardo — encargo de la sesión de efectos."""
import io, re
R = 'C:/Users/aleja/boda-cadmiel-y-leonardo/'
K = 'C:/Users/aleja/kit-efectos-elysium/luz/'
P = R + 'index.html'
s = io.open(P, encoding='utf-8').read()
def one(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:70]); s = s.replace(a, b)

kcss = io.open(K + 'luz-premium.css', encoding='utf-8').read()
kjs = io.open(K + 'luz-premium.js', encoding='utf-8').read()
assert 'luz-premium' not in s.lower() or 'Luz Premium Elysium' not in s, 'ya aplicado'

SEDA = ['countdown', 'calendar', 'itinerary', 'adultos', 'album', 'rsvp']
MID = 'rgb(39,70,100)'  # tono medio de la seda (#1F2E4A + #2F5E7E)

# ── HTML ──
# 1 · destello: portada y tarjeta principal del RSVP
one('<section id="hero">', '<section id="hero" class="lp-claro">\n  <div class="lp-flare" data-x="18%" data-y="20%"></div>')
one('<div class="rsvp-form-wrap">', '<div class="rsvp-form-wrap">\n    <div class="lp-flare" data-x="82%" data-y="12%" data-s=".8"></div>')
# 2 + 10 · nombres de portada: glints + cascada
one('<p class="h-names" id="hNames">Leonardo <i>&amp;</i> Cadmiel</p>',
    '<p class="h-names lp-glints" id="hNames"><span class="lp-cascada">Leonardo</span> <i>&amp;</i> <span class="lp-cascada">Cadmiel</span></p>')
# 3 + 12 · caída y niebla en portada y pie
PET = 'assets/petalo-marfil-1.webp,assets/petalo-oro-1.webp,assets/petalo-teal-1.webp,assets/petalo-marfil-2.webp,assets/petalo-oro-2.webp,assets/petalo-teal-2.webp'
one('  <div class="h-ov"></div>', '  <div class="h-ov"></div>\n  <div class="lp-niebla"></div>\n  <canvas class="lp-caida" data-sprites="%s"></canvas>' % PET)
one('<footer id="footer">', '<footer id="footer" class="lp-claro">\n  <div class="lp-niebla"></div>\n  <canvas class="lp-caida" data-n="10" data-sprites="%s"></canvas>' % PET)
# 10 · nombres del pie
one('<p class="ft-msg">Te esperamos con mucho cariño...</p>',
    '<p class="ft-names"><span class="lp-cascada">Leonardo</span> <i>&amp;</i> <span class="lp-cascada">Cadmiel</span></p>\n    <p class="ft-msg">Te esperamos con mucho cariño...</p>')
# 14 · seda: primer hijo de cada sección; quitar su fondo de Gemini
for sid in SEDA:
    m = re.search(r'<section id="%s"([^>]*)>' % sid, s); assert m, sid
    attrs = m.group(1) + ' data-top="%s" data-bot="%s"' % (MID, MID)
    if 'class="' in attrs: attrs = attrs.replace('class="', 'class="is-seda ', 1)
    else: attrs += ' class="is-seda"'
    s = s[:m.start()] + '<section id="%s"%s>\n  <canvas class="lp-seda"></canvas>' % (sid, attrs) + s[m.end():]
    i = s.index('<section id="%s"' % sid); j = s.index('</section>', i)
    seg = s[i:j]; seg = seg.replace('\n  <div class="fl-bg" aria-hidden="true"></div>', ''); s = s[:i] + seg + s[j:]

# ── menos polvo ──
one('var N = innerWidth < 700 ? 14 : 26;', 'var N = innerWidth < 700 ? 6 : 12;')
one('for (var i = 0; i < 15; i++) {', 'for (var i = 0; i < 7; i++) {')

# ── CSS ──
css = '\n/* ===== LUZ PREMIUM (kit-efectos-elysium/luz) ===== */\n' + kcss + '''
/* Metálico de la invitación: oro caramelo */
:root{--lp-metal-1:#7A5A33;--lp-metal-2:#A9824F;--lp-metal-3:#F6E7C8;--lp-metal-4:#D9C3A0;--lp-metal-5:#A9824F;--lp-glow:217,195,160}
.lp-fl b{background-image:url(assets/flare-oro.webp)}
#hero .kx-flare,.rsvp-form-wrap .kx-flare{display:none!important}
.rsvp-form-wrap{position:relative}
#hero .lp-caida,#hero .lp-niebla{z-index:3}
#hero .h-cnt{z-index:6}
#hero .lp-niebla{top:55%}
#footer{position:relative;isolation:isolate}
#footer .lp-niebla{top:40%;opacity:.8}
#footer .lp-caida{z-index:1}
#footer .ft-body{position:relative;z-index:3}
.h-names .lp-cascada,.ft-names .lp-cascada{-webkit-text-fill-color:initial;text-shadow:none!important}
.ft-names{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:clamp(24px,6.6vw,30px);letter-spacing:5px;text-transform:uppercase;line-height:1.3;margin:0 0 14px}
.ft-names i{font-family:'Great Vibes',cursive;font-style:normal;text-transform:none;letter-spacing:0;font-size:1.25em;color:var(--gold-deep);padding:0 .15em}
/* Secciones con seda (fondo navy/petróleo): texto claro */
.is-seda{background:transparent!important;isolation:isolate;position:relative}
.is-seda .fl-bg,.is-seda .ad.b{display:none!important}
.is-seda .lbl{color:#E9D6B3!important}
.is-seda .ttl,.is-seda .ttl.foil-text,.is-seda .cd-falta,.is-seda .itx-title,.is-seda h2{background:none!important;color:#F6F2EC!important;-webkit-text-fill-color:#F6F2EC!important;text-shadow:0 2px 14px rgba(10,20,36,.55)!important}
.is-seda .gline{background:linear-gradient(to right,transparent,#D9C3A0,transparent)!important}
.is-seda p,.is-seda .cal-sub,.is-seda .alb-hint,.is-seda .rsvp-sub,.is-seda .rsvp-date-big,.is-seda .rsvp-para-note,.is-seda #rsvp-feedback{color:#F6F2EC!important;-webkit-text-fill-color:#F6F2EC!important;text-shadow:0 1px 10px rgba(10,20,36,.6)}
.is-seda .rsvp-dl{color:#F1DDB6!important;-webkit-text-fill-color:#F1DDB6!important}
.is-seda .btn-blue{background:#F6F2EC!important;color:#1F2E4A!important;border-color:#D9C3A0!important}
.is-seda .btn:not(.btn-blue){color:#F6F2EC!important;border-color:#D9C3A0!important}
.is-seda .adl-card p,.is-seda .cd-cell *,.is-seda .rsvp-pases-display *,.is-seda .rsvp-toggle-btn{text-shadow:none}
.is-seda .adl-card .adl-txt{color:#1A1A1A!important;-webkit-text-fill-color:#1A1A1A!important}
.is-seda .adl-card .adl-tit,.is-seda .rsvp-pases-display *{color:#1F2E4A!important;-webkit-text-fill-color:#1F2E4A!important}
.is-seda .rsvp-toggle-btn{background:rgba(246,242,236,.92)!important}
.is-seda .rsvp-toggle-btn.rsvp-toggle-selected-yes,.is-seda .rsvp-toggle-btn.rsvp-toggle-selected-no{background:#F1DDB6!important}
#album.is-seda .alb-qr-wrap::before{display:none!important}
#album.is-seda .alb-qr-wrap{margin-top:10px!important}
#hospedaje,#dresscode,#gifts{padding-top:175px!important}
#itinerary{padding-top:80px!important}
'''
one('\nhtml{overflow-x:clip}', css + '\nhtml{overflow-x:clip}')

# ── JS (config + kit tal cual) al final del body ──
cfg = "<script>window.LP_CONFIG={flareMini:'assets/flare-oro-mini.webp',seda:{sombra:'#1F2E4A',base:'#2F5E7E',luz:'#F6F2EC'},niebla:'246,242,236'};</script>\n<script>\n" + kjs + "\n</script>\n"
i = s.rindex('</body>'); s = s[:i] + cfg + s[i:]
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok', s.count('lp-seda"'), s.count('class="fl-bg"'))
