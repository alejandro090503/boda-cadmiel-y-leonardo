import io, re, os, shutil
R = 'C:/Users/aleja/boda-cadmiel-y-leonardo/'
B = R + '_src/bloques/'
P = R + 'index.html'
s = io.open(P, encoding='utf-8').read()
def rd(f):
    t = io.open(B + f, encoding='utf-8').read()
    return t.split('\n', 1)[1] if t.lstrip().startswith(('/*', '<!--', '//')) and 'INSERTAR' in t.split('\n', 1)[0] else t

def one(a):
    n = s.count(a); assert n == 1, (n, a[:70])

# assets de C
shutil.copy(B + 'C-caballero.png', R + 'caballero.png')
shutil.copy(B + 'C-dama.png', R + 'dama.png')

# km en lugar de millas
for f in ['C-hospedaje.html']:
    t = io.open(B + f, encoding='utf-8').read()
    t = t.replace('5.8 mi · 10 min', '9 km · 10 min').replace('6.8 mi · 11 min', '11 km · 11 min')
    io.open(B + f, 'w', encoding='utf-8', newline='\n').write(t)

# 1) Reemplazo de secciones
def section(id_, new):
    global s
    m = re.search(r'<section id="%s"[^>]*>.*?</section>' % id_, s, re.S)
    assert m, id_
    assert len(re.findall(r'<section id="%s"' % id_, s)) == 1
    s = s[:m.start()] + new.strip() + s[m.end():]
section('hospedaje', rd('C-hospedaje.html'))
section('itinerary', rd('C-itinerario.html'))
section('dresscode', rd('C-dresscode.html'))
section('gifts', rd('C-sobres.html'))
one('<section id="gifts"')
s = s.replace('<section id="gifts"', rd('P-adultos.html').strip() + '\n\n\n<section id="gifts"', 1)

# 2) Vinilo (botón + CSS)
m = re.search(r'<button class="vinyl-btn" id="vinyl-btn".*?</button>', s, re.S); assert m
s = s[:m.start()] + rd('C-vinilo.html').strip() + s[m.end():]
i = s.index('/* ── MUSIC BTN'); j = s.index('/* ── TOAST', i)
s = s[:i] + rd('C-vinilo.css').strip() + '\n\n' + s[j:]

# 3) Tintas + adornos como primeros hijos
def groups(f):
    out = {}
    for m in re.finditer(r'<!-- <section id="([\w-]+)">[^\n]*-->\n(.*?)(?=\n<!-- <section id=|\Z)', rd(f), re.S):
        out[m.group(1)] = m.group(2).strip()
    return out
tin, ado = groups('A-tintas.html'), groups('A-adornos.html')
for sid in set(tin) | set(ado):
    m = re.search(r'<section id="%s"[^>]*>' % sid, s)
    if not m: print('sin seccion', sid); continue
    ins = '\n  ' + tin.get(sid, '') + ('\n  ' + ado[sid] if sid in ado else '')
    s = s[:m.end()] + ins + s[m.end():]

# 4) CSS
css = ['A-tintas.css', 'A-adornos.css', 'C-dresscode.css', 'C-hospedaje.css', 'C-itinerario.css', 'C-sobres.css',
       'P-principal.css', 'P-adultos.css', 'D-vivo.css', 'D-brillo.css']
one('</style>')
s = s.replace('</style>', '\n'.join('/* ===== %s ===== */\n%s' % (f, rd(f).strip()) for f in css) + '\n</style>')

# 5) JS
js = []
for f in ['C-dresscode.js', 'C-hospedaje.js', 'C-itinerario.js', 'C-sobres.js', 'C-vinilo.js', 'A-particulas.js']:
    js.append('<script>/* %s */\n%s\n</script>' % (f, rd(f).strip()))
for f in ['P-principal.js', 'D-vivo.js', 'D-brillo.js']:
    js.append('<!-- %s -->\n%s' % (f, rd(f).strip()))
one('</body>')
s = s.replace('</body>', '\n'.join(js) + '\n</body>')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
for sid in ['hospedaje', 'itinerary', 'dresscode', 'gifts', 'adultos', 'rsvp', 'album', 'family', 'gallery']:
    print(sid, len(re.findall(r'id="%s"' % sid, s)))
print('vinyl', s.count('id="vinyl-btn"'), 'ink', s.count('class="ink-bg'), 'ad', s.count('class="ad '))
