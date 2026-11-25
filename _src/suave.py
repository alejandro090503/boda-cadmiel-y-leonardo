"""Apertura suave (sobre → portada) y apariciones uniformes; portada sin monograma, '&' entre los nombres."""
import io
P = 'C:/Users/aleja/boda-cadmiel-y-leonardo/index.html'
s = io.open(P, encoding='utf-8').read()
def one(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80]); s = s.replace(a, b)

# 1 · Portada: sin iniciales; Leonardo / & / Cadmiel
one('    <p class="h-monogram" id="hMono"><span class="mono-k">L</span><span class="mono-amp">&amp;</span><span class="mono-m">C</span></p>\n', '')
one('<p class="h-names lp-glints" id="hNames"><span class="lp-cascada">Leonardo</span> <i>&amp;</i> <span class="lp-cascada">Cadmiel</span></p>',
    '<p class="h-names lp-glints" id="hNames"><span class="lp-cascada">Leonardo</span><i class="h-amp">&amp;</i><span class="lp-cascada">Cadmiel</span></p>')

# 2 · El sobre se disuelve en la portada: la invitación arranca debajo y el sobre se desvanece despacio
one("""      gsap.to(loaderEl, {
        opacity:0, duration:.6, ease:'power2.out',
        onComplete() {
          loaderEl.remove();
          initInvitation();
          ambientWind();
          initRSVP();
          startMusic();
        }""", """      initInvitation();
      ambientWind();
      initRSVP();
      startMusic();
      gsap.to(loaderEl, {
        opacity:0, duration:2, ease:'sine.inOut', delay:.15,
        onComplete() {
          loaderEl.remove();
        }""")

# 3 · Portada: la foto aparece desde el blanco y los textos llegan escalonados, sin saltos
one("""  gsap.set('#hMono', { opacity:0, scale:.85 });
  gsap.set('#hScroll', { opacity:0 });
  gsap.timeline({ defaults:{ ease:'power3.out' } })
    .to('#hMono',  { opacity:1, scale:1, duration:1.2 }, .2)
    .to('#hScroll',{ opacity:1, duration:.5 }, 1.4);
  gsap.set(['#hNames','#hMeta'],{opacity:0,y:16});
  gsap.to(['#hNames','#hMeta'],{opacity:1,y:0,duration:1,stagger:.18,delay:.7,ease:'power3.out'});""",
"""  gsap.set('#heroBg', { opacity:0 });
  gsap.set(['#hNames','#hMeta','#hScroll'], { opacity:0, y:18 });
  gsap.timeline({ defaults:{ ease:'sine.out' } })
    .to('#heroBg',  { opacity:1, duration:2.4 }, 0)
    .to('#hNames',  { opacity:1, y:0, duration:1.8 }, .9)
    .to('#hMeta',   { opacity:1, y:0, duration:1.6 }, 1.5)
    .to('#hScroll', { opacity:1, y:0, duration:1.4 }, 2.3);""")

# 4 · Todas las apariciones al hacer scroll: más lentas, sin rebote, desplazamiento corto
one("""  gsap.registerPlugin(ScrollTrigger);""", """  gsap.registerPlugin(ScrollTrigger);
  /* Apariciones uniformes y suaves: toda entrada gsap.from dura >=1.2 s, sin rebote, desplazamiento corto */
  (function(){
    var _from = gsap.from.bind(gsap);
    gsap.from = function(t, v){
      if (v && !(v.scrollTrigger && v.scrollTrigger.scrub)) {
        v.duration = Math.max(1.2, (v.duration || .5) * 1.9);
        v.ease = 'sine.out';
        if (typeof v.stagger === 'number') v.stagger = Math.max(.18, v.stagger * 1.5);
        ['y','x'].forEach(function(k){ if (typeof v[k] === 'number') v[k] = Math.sign(v[k]) * Math.min(Math.abs(v[k]), 18); });
        if (typeof v.scale === 'number' && v.scale < .95) v.scale = .95;
      }
      return _from(t, v);
    };
  })();""")

css = '''
/* ===== Apertura y apariciones suaves ===== */
#hero .h-names{display:flex;flex-direction:column;align-items:center;gap:0;line-height:1.15}
#hero .h-names .h-amp{display:block;font-family:'Great Vibes',cursive;font-style:normal;text-transform:none;letter-spacing:0;font-size:1.5em;line-height:1;margin:2px 0;color:#7A5A33!important;-webkit-text-fill-color:#7A5A33!important}
#elyMenuBtn{transition:opacity 1.6s ease 1.2s!important}
.vinyl-btn{transition:opacity 1.6s ease 1.4s,transform 1.6s cubic-bezier(.2,.7,.2,1) 1.4s!important}
html.dcx-js #dresscode .dcx-rv,html.itx-js #itinerary .itx-rv{transition:opacity 1.4s ease,transform 1.4s cubic-bezier(.25,.6,.3,1)!important}
.sec-medal{transition:none}
@media (prefers-reduced-motion:reduce){#elyMenuBtn,.vinyl-btn{transition:none!important}}
'''
one('\nhtml{overflow-x:clip}', css + '\nhtml{overflow-x:clip}')
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
