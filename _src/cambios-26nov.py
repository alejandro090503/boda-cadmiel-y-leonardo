import io, re
P = 'C:/Users/aleja/boda-cadmiel-y-leonardo/index.html'
s = io.open(P, encoding='utf-8').read()
def one(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80]); s = s.replace(a, b)

# ── Itinerario: 3 horarios más "Por confirmar" ──
ICO = {
 'Cena': '<path d="M8 22a16 16 0 0 0 32 0z"/><path d="M5 22h38"/><path d="M24 6v4"/><path d="M14 14a12 12 0 0 1 20 0"/><path d="M12 38h24"/>',
 'Primer baile': '<path d="M18 8a3 3 0 1 1 0 .1M30 8a3 3 0 1 1 0 .1"/><path d="M18 13v11l-4 16M18 24l4 16M30 13l-2 9 6 18H22l4-18"/><path d="M18 17l12 0"/>',
 'Fiesta': '<path d="M24 4l3.2 8.6L36 14l-6.8 5.6L31.4 28 24 23.2 16.6 28l2.2-8.4L12 14l8.8-1.4z"/><path d="M10 34l2 6M24 32v8M38 34l-2 6"/><circle cx="8" cy="28" r="1.2"/><circle cx="40" cy="28" r="1.2"/>',
}
rows = ''
for k, (ev, ico) in enumerate(ICO.items()):
    side = 'itx-l' if k % 2 == 0 else 'itx-r'
    rows += '''
      <li class="itx-row %s itx-rv">
        <div class="itx-h"><span class="itx-n itx-pc">Por confirmar</span></div>
        <span class="itx-dot" aria-hidden="true"></span>
        <div class="itx-t">
          <svg class="itx-ico" viewBox="0 0 48 48" aria-hidden="true">%s</svg>
          <span class="itx-ev">%s</span>
          <span class="itx-pl">Thesan Jardín</span>
        </div>
      </li>''' % (side, ico, ev)
i = s.index('<section id="itinerary"'); j = s.index('    </ol>', i)
s = s[:j] + rows.lstrip('\n') + '\n' + s[j:]

# ── Fuente elegante y única para los nombres de los eventos: Playfair Display ──
one('family=Jost:wght@400;500;600;700', 'family=Jost:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,600')

css = '''
/* ===== Ajustes 26-nov ===== */
/* Itinerario sobre seda: horas, iconos y eventos en claro */
#itinerary.is-seda .itx-row .itx-n,#itinerary.is-seda .itx-row.is-lit .itx-n{color:#F6F2EC!important;-webkit-text-fill-color:#F6F2EC!important;background:none!important;text-shadow:0 1px 12px rgba(10,20,36,.7)!important}
#itinerary.is-seda .itx-row.is-lit .itx-n{text-shadow:0 0 18px rgba(233,214,179,.75),0 1px 10px rgba(10,20,36,.6)!important}
#itinerary .itx-pc{font-family:'Jost',sans-serif!important;font-style:normal!important;font-weight:600!important;font-size:15px!important;letter-spacing:2px!important;text-transform:uppercase;white-space:nowrap}
#itinerary.is-seda .itx-ico{width:56px!important;height:56px!important;stroke:#F1DDB6!important;stroke-width:2!important;filter:drop-shadow(0 0 6px rgba(241,221,182,.45)) drop-shadow(0 2px 6px rgba(10,20,36,.6))}
#itinerary.is-seda .itx-ico circle{fill:#F1DDB6!important}
#itinerary .itx-ev{font-family:'Playfair Display',serif!important;font-style:italic!important;font-weight:600!important;font-size:22px!important;letter-spacing:.2px!important;line-height:1.2!important}
/* Hero: nombres y textos legibles + novios centrados */
.h-bg .hero-drift img{object-position:62% 28%!important}
#hero .h-cnt{position:relative}
#hero .h-cnt::before{content:'';position:absolute;left:50%;top:50%;width:150%;height:130%;transform:translate(-50%,-48%);z-index:-1;pointer-events:none;
  background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(255,255,255,.9) 0%,rgba(255,255,255,.72) 45%,rgba(255,255,255,0) 100%)}
#hero .h-names{font-size:clamp(24px,6.6vw,30px)!important;font-weight:700!important}
#hero .h-names .lp-cascada span{filter:drop-shadow(0 1px 0 rgba(255,255,255,.9))}
#hero.lp-claro .h-names .lp-cascada span{background-image:linear-gradient(104deg,transparent 30%,#D9C3A0 50%,transparent 70%),linear-gradient(178deg,#7A5A33 6%,#5E4426 40%,#8A6638 62%,#5E4426 98%)!important}
#hero .h-meta{color:#1F2E4A!important;font-weight:600!important;font-size:17px!important}
#hero .h-meta b{color:#6B4E2B!important;font-size:19px!important}
#hero .mono-k,#hero .mono-m{color:#1F2E4A!important;-webkit-text-fill-color:#1F2E4A!important}
/* Carrusel 3D: tarjetas que apenas se tocan */
.wheel-card{backface-visibility:hidden;-webkit-backface-visibility:hidden}
'''
one('\nhtml{overflow-x:clip}', css + '\nhtml{overflow-x:clip}')
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok', s.count('class="itx-row'))
