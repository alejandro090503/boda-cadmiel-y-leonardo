import re, io
P = 'C:/Users/aleja/boda-cadmiel-y-leonardo/index.html'
s = io.open(P, encoding='utf-8').read()
URL = 'https://boda-cadmiel-y-leonardo.vercel.app'
MAPS = 'https://www.google.com/maps/place/Thesan+Jard%C3%ADn/@18.8358233,-99.2132066,17z/data=!4m6!3m5!1s0x85cdd8eb6cc84dcf:0xc1e92ee0097a849d!8m2!3d18.8358233!4d-99.2132066!16s%2Fg%2F11hbpsl7qt'

def rep(a, b, count=1):
    global s
    n = s.count(a)
    assert n >= 1, ('NO ENCONTRADO', a[:80])
    if count == 1: assert n == 1, ('DUPLICADO', n, a[:80])
    s = s.replace(a, b)

def resub(pat, b, flags=re.S):
    global s
    s2, n = re.subn(pat, b, s, count=1, flags=flags)
    assert n == 1, ('REGEX', pat[:80]); s = s2

# HEAD
rep('<meta name="theme-color" content="#395a7f">', '<meta name="theme-color" content="#1F2E4A">')
rep('<title>Jorge &amp; Griselda · 25 · Julio · 2026</title>', '<title>Leonardo &amp; Cadmiel · 24 · Abril · 2027</title>')
rep('content="Jorge &amp; Griselda · 25 · Julio · 2026"', 'content="Leonardo &amp; Cadmiel · 24 · Abril · 2027"')
rep('content="¡Estás invitado a nuestra boda! Tijuana, Baja California · 25 de Julio 2026"', 'content="¡Estás invitado a nuestra boda! Temixco, Morelos · 24 de abril de 2027"')
s = s.replace('https://boda-griselda-y-jorge.vercel.app/sobre.jpg', URL + '/og-image.jpg')
rep('<meta property="og:url" content="https://boda-griselda-y-jorge.vercel.app">\n', '')
rep("const RSVP_URL  = 'https://boda-griselda-y-jorge.vercel.app';", "const RSVP_URL  = '" + URL + "';")
# Fuentes: agregar Jost (tipo Century Gothic, pedido del cliente)
rep('family=Great+Vibes&family=Lato:wght@400;500;700', 'family=Great+Vibes&family=Jost:wght@400;500;600;700&family=Lato:wght@400;500;700')

# PALETA (blanco + navy/petróleo/caramelo de su foto de decoración)
rep("""  --peach:        #395a7f;            /* azul profundo (acento principal) */
  --peach-lt:     #9badc4;            /* azul claro */
  --peach-accent: #2a4360;            /* azul más oscuro (texto sobre claros) */
  --peach-dim:    rgba(57,90,127,.14);""", """  --peach:        #2F5E7E;            /* azul petróleo (acento medio) */
  --peach-lt:     #9fb6c8;            /* azul claro */
  --peach-accent: #1F2E4A;            /* navy (títulos y texto sobre claros) */
  --peach-dim:    rgba(47,94,126,.14);
  --gold:         #A9824F;            /* oro caramelo (metálico) */
  --gold-soft:    #D9C3A0;
  --gold-deep:    #7A5A33;""")
rep("--ink2:         #f3f6fa;            /* marfil azulado */", "--ink2:         #F6F2EC;            /* marfil cálido */")
rep("--ink3:         #e8eef5;            /* crema azulada */", "--ink3:         #EFE8DD;            /* crema */")
rep("--hair:         #c8d4e2;            /* hairline azul clara */", "--hair:         #DCCDB4;            /* hairline caramelo clara */")
s = s.replace('#f3f6fa', '#F6F2EC')

# Tipografía: Lato -> Jost (Century Gothic-like) en todo el sitio
s = s.replace("'Lato',sans-serif", "'Jost',sans-serif")

# SOBRE / VINILO / HERO
rep('alt="Sobre de invitación Jorge y Griselda"', 'alt="Sobre de invitación Leonardo y Cadmiel"')
rep('<div class="vinyl-label-text">J&amp;G<small>2026</small></div>', '<div class="vinyl-label-text">L&amp;C<small>2027</small></div>')
rep('<img src="fotos-cliente/foto-3.jpg" alt="Jorge y Griselda" loading="eager">', '<img src="fotos-cliente/foto-15.jpg" alt="Leonardo y Cadmiel" loading="eager">')
rep('<span class="mono-k">J</span><span class="mono-amp">&amp;</span><span class="mono-m">G</span>', '<span class="mono-k">L</span><span class="mono-amp">&amp;</span><span class="mono-m">C</span>')

# FECHA + frase del cliente (literal)
rep('<p class="fch-n1">Jorge</p>', '<p class="fch-n1">Leonardo</p>')
rep('<p class="fch-n1">Griselda</p>', '<p class="fch-n1">Cadmiel</p>')
rep('<p class="fch-honor">Creemos que algunas almas están destinadas a encontrarse.<br>Hoy comenzamos un nuevo capítulo juntos y queremos que seas parte de este día tan especial en nuestra historia.</p>',
    '<p class="fch-honor">“Esperamos con paciencia la promesa y recibimos lo que Dios había prometido”<br><span class="fch-cita">Hebreos 6:15</span></p>')
rep('<p class="fch-date">25.07.26</p>', '<p class="fch-date">24.04.27</p>')

# UBICACIÓN
rep('<img src="fotos-cliente/jardin-shanti-noche.jpg" alt="Jardín Shanti Petite — Tijuana, Baja California" loading="lazy">',
    '<img src="fotos-cliente/thesan-jardin.jpg" alt="Thesan Jardín — Temixco, Morelos" loading="lazy">')
rep('<h3 class="loc-unified-venue">Jardín Shanti Petite</h3>', '<h3 class="loc-unified-venue">Thesan Jardín</h3>')
rep('<p class="loc-unified-addr">Calz. Defensores de Baja California 330<br>Ruiz Cortinez · Tijuana, B.C.</p>',
    '<p class="loc-unified-addr">Tulio Estrada 125, Col. Miguel Hidalgo<br>62580 Temixco, Morelos</p>')
rep('<span class="loc-time-label">Ceremonia</span>', '<span class="loc-time-label">Ceremonia religiosa</span>')
rep('<span class="loc-time-value">6:20 PM</span>', '<span class="loc-time-value">2:00 PM</span>')
rep('<span class="loc-time-value">7:00 PM</span>', '<span class="loc-time-value">3:50 PM</span>')
resub(r'href="https://maps\.apple\.com/place\?[^"]*"', 'href="' + MAPS + '"')

# CALENDARIO (24 abr 2027 2:00 PM CDMX = 20:00 UTC)
resub(r'href="https://calendar\.google\.com/calendar/render\?[^"]*"',
      'href="https://calendar.google.com/calendar/render?action=TEMPLATE&amp;text=Boda+de+Leonardo+%26+Cadmiel&amp;dates=20270424T200000Z/20270425T040000Z&amp;details=Ceremonia+religiosa+2:00+PM+%C2%B7+Recepci%C3%B3n+3:50+PM.+Thesan+Jard%C3%ADn%2C+Temixco%2C+Morelos&amp;location=Thesan+Jard%C3%ADn%2C+Tulio+Estrada+125%2C+Miguel+Hidalgo%2C+62580+Temixco%2C+Mor."')

# COUNTDOWN / RSVP
rep("const WED = new Date('2026-07-25T18:20:00');", "const WED = new Date('2027-04-24T14:00:00-06:00');")
rep('const DEADLINE  = new Date(2026, 6, 6, 23, 59, 59, 999);', 'const DEADLINE  = new Date(2027, 1, 20, 23, 59, 59, 999);')
rep('<p class="rsvp-date-big">25 de Julio de 2026</p>', '<p class="rsvp-date-big">24 de abril de 2027</p>')
rep('<span class="rsvp-dl">6 de Julio de 2026</span>', '<span class="rsvp-dl">20 de febrero de 2027</span>')
rep('<p class="ft-date">Tijuana · 25 de Julio de 2026</p>', '<p class="ft-date">Temixco, Morelos · 24 de abril de 2027</p>')

# REGALOS: CLABE + Liverpool (sin Venmo)
rep('4152&nbsp;3138&nbsp;4754&nbsp;6475', '6381&nbsp;8001&nbsp;0133&nbsp;4341&nbsp;39')
rep("""<p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:var(--cream);margin:0 0 14px;">A nombre de Griselda Aparicio</p>\n""", '')
resub(r'<!-- Venmo -->.*?</div>\n</section>', '''<!-- Liverpool -->
  <div style="max-width:340px;margin:22px auto 0;padding:24px 22px;background:#F6F2EC;border:1px solid var(--hair);border-radius:14px;text-align:center;">
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;color:var(--peach-accent);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12v9H4v-9"/><rect x="2" y="7" width="20" height="5"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
      <span style="font-family:'Jost',sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Liverpool</span>
    </div>
    <p style="font-family:'Jost',sans-serif;font-size:16px;color:var(--cream);margin:0 0 14px;">Evento 60060918</p>
    <a href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/60060918" target="_blank" rel="noopener" class="btn" style="display:inline-flex;width:auto;padding:11px 22px;font-size:12px;letter-spacing:2.5px;text-decoration:none;">Ver mesa de regalos</a>
  </div>
</section>''')
rep('hemos elegido recibir<br>aportaciones en efectivo o transferencias<br>para nuestros futuros proyectos.', 'aquí te dejamos algunas opciones.')

# ÁLBUM (QR -> /album, bloqueado hasta el día del evento)
resub(r'<div class="alb-qr-wrap">\s*<div class="alb-qr-frame">\s*<img src="https://api\.qrserver[^>]*>\s*</div>\s*</div>\s*<a href="https://photos[^"]*"[^>]*class="btn alb-btn">(.*?)Abrir álbum\s*</a>\s*<p class="alb-hint">.*?</p>',
      '''<div class="alb-qr-wrap album-qr" data-fecha="2027-04-24">
    <div class="alb-qr-frame">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=480x480&amp;margin=10&amp;color=1F2E4A&amp;bgcolor=F6F2EC&amp;data=https%3A%2F%2Fboda-cadmiel-y-leonardo.vercel.app%2Falbum"
           alt="Código QR del álbum de fotos" class="alb-qr" width="240" height="240" loading="lazy">
    </div>
    <a href="/album" class="btn alb-btn album-btn">\\1Subir mis fotos</a>
  </div>
  <p class="alb-hint album-aviso">El álbum se habilita el día de la boda. Regresa aquí y sube todas tus fotos.</p>''')
rep("/* ── CLABE COPY", """/* ── ÁLBUM: se desbloquea el día del evento ── */
(function(){
  var box = document.querySelector('.album-qr'); if(!box) return;
  var p = box.dataset.fecha.split('-');
  if(new Date() < new Date(+p[0], +p[1]-1, +p[2], 0, 0, 0)) box.classList.add('bloqueado');
})();

/* ── CLABE COPY""")
rep('</style>', '''.album-qr{display:flex;flex-direction:column;align-items:center;gap:20px}
.album-qr.bloqueado img{filter:blur(7px);opacity:.75}
.album-qr.bloqueado .album-btn{pointer-events:none;opacity:.45}
.album-qr:not(.bloqueado) + .album-aviso{display:none}
.fch-cita{display:block;margin-top:10px;font-family:'Jost',sans-serif;font-style:normal;font-size:15px;letter-spacing:3px;text-transform:uppercase;font-weight:600}
</style>''')

# GALERÍA (fotos de la sesión en la puerta/patio)
fotos = [10, 12, 14, 16, 17, 11, 13, 7]
resub(r'(<div class="wheel-ring" id="wheel-ring">).*?(\n    </div>)',
      '\\1\n' + '\n'.join('      <div class="wheel-card"><img src="fotos-cliente/foto-%d.jpg" alt="Leonardo y Cadmiel" loading="lazy"></div>' % n for n in fotos) + '\\2')

# PADRES (sin padrinos: el cliente no dio)
rep('<span>J. Ascención Aparicio</span>', '<span>Federico Cisneros Cabrera</span>')
rep('<span>Ofelia Pulido</span>', '<span>María Esperanza Mejía Castañeda</span>')
rep('<span>Jorge López</span>', '<span>Miguel Martínez Solares</span>')
rep('<span>Martha Fernández</span>', '<span>Fabiola Linares Pérez</span>')
resub(r'\s*<div class="fam-orn">✦</div>\s*<p class="fam-pad-intro">.*?<!-- Damas / Caballeros — PENDIENTE: el cliente no especificó -->', '\n')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
left = re.findall(r'(?i)jorge|griselda|tijuana|shanti|venmo|aparicio|2026', s)
print('OK; restos:', sorted(set(left)))
