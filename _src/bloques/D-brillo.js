/* INSERTAR: antes de </body> (ancla única), después de D-vivo.js */
<script>
/* ── D-BRILLO · filos de luz, vidrio, destellos y foil ───────────────────────── */
(function(){
  if (window.__elyBrillo) return; window.__elyBrillo = 1;

  var TARJETAS = '.loc-unified,.hotel-card,.fam-padcard,.adl-card,.rsvp-pases-display,.alb-qr-frame,' +
    '#gifts [class*="card"],#gifts > div[style*="border-radius"],[class*="gracias"],[class*="thanks"],.ely-card';
  var FOIL = '.ttl,.itx-title,.dcx-title,.fch-headline,.fch-n1,.fch-amp,.mono-k,.mono-amp,.mono-m,.h-names,' +
    '.ft-nofaltes,.ft-names,.cd-num,.adl-tit,.ely-foil';
  var PRINCIPALES = '.ttl,.itx-title,.dcx-title,.fch-headline,.ft-nofaltes,.h-names';
  /* nunca foil ni destellos en datos de lectura */
  var DATOS = '.it-time,.itx-h,.itx-n,.itx-m,.loc-time-value,.fch-date,.ft-date,.rsvp-date-big,.rsvp-dl,#giftClabe,input,button,a';

  function alAbrir(fn){
    var hecho = false;
    function go(){ if (hecho) return; hecho = true; requestAnimationFrame(function(){ fn(); }); }
    function revisa(){ if (!document.getElementById('loader')) { go(); return true; } return false; }
    function arranque(){
      if (revisa()) return;
      var mo = new MutationObserver(function(){ if (revisa()) mo.disconnect(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranque); else arranque();
  }

  var n = 0;
  function flare(padre, x, y, s, mini){
    var f = document.createElement('i'), b = document.createElement('b');
    f.className = 'kx-flare' + (mini ? ' is-mini' : '');
    f.setAttribute('aria-hidden', 'true');
    f.style.setProperty('--x', x); f.style.setProperty('--y', y); f.style.setProperty('--s', s || 1);
    var dur = mini ? 5.5 + (n % 3) * .9 : 8 + (n % 3);           /* proporción áurea: nunca florecen dos juntos */
    f.style.setProperty('--dur', dur + 's');
    f.style.setProperty('--del', (-((n * .618034) % 1) * dur).toFixed(2) + 's');
    f.appendChild(b); padre.appendChild(f); n++;
    return f;
  }
  function capa(padre, cl, conHijo, k){
    var e = document.createElement('i');
    e.className = cl; e.setAttribute('aria-hidden', 'true');
    if (conHijo){ var h = document.createElement('i'); h.style.setProperty('--del', (-(k * 3.1)).toFixed(1) + 's'); e.appendChild(h); }
    padre.appendChild(e);
  }
  function oscuro(el){
    if (el.closest('#hero,#countdown,.is-dark')) return true;
    for (var p = el; p && p !== document.documentElement; p = p.parentElement){
      var c = getComputedStyle(p).backgroundColor.match(/[\d.]+/g);
      if (c && (c.length < 4 || +c[3] > .5)) return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255 < .42;
    }
    return false;
  }

  /* ── Tarjetas ── */
  function tarjetas(){
    var lista = [].slice.call(document.querySelectorAll(TARJETAS)).filter(function(c, i, A){
      return A.indexOf(c) === i && !A.some(function(o){ return o !== c && o.contains(c); }) && c.offsetWidth > 120;
    });
    lista.forEach(function(c, k){
      if (c.querySelector(':scope > .kx-rim')) return;
      var cs = getComputedStyle(c);
      if (cs.position === 'static') c.style.position = 'relative';
      var r = parseFloat(cs.borderTopLeftRadius) || 14;
      c.style.setProperty('--kx-r', r + 'px');
      c.classList.add('kx-card');
      /* que los destellos no se corten: la foto conserva sus esquinas */
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden'){
        [].forEach.call(c.children, function(h){
          if (h.querySelector('img,iframe,video') || /^(IMG|IFRAME|VIDEO|PICTURE)$/.test(h.tagName)){
            var top = h.offsetTop < 2, bot = h.offsetTop + h.offsetHeight > c.clientHeight - 2;
            h.style.borderRadius = (top ? r + 'px ' + r + 'px ' : '0 0 ') + (bot ? r + 'px ' + r + 'px' : '0 0');
            h.style.overflow = 'hidden';
          }
        });
        c.style.overflow = 'visible';
      }
      [].forEach.call(c.children, function(h){
        if (/^kx-/.test(h.className)) return;
        if (getComputedStyle(h).position === 'static'){ h.style.position = 'relative'; h.style.zIndex = '4'; }
      });
      capa(c, 'kx-halo'); capa(c, 'kx-sheen', true, k); capa(c, 'kx-line'); capa(c, 'kx-rim', true, k);
      var chica = c.offsetWidth < 220;
      flare(c, '6%', '0', chica ? .82 : 1.05);            /* grande: 156–200 px */
      flare(c, '92%', '100%', chica ? .78 : .84);          /* mediano en la opuesta: ~150–160 px */
    });
  }

  /* ── Foil ── */
  function rectChar(el, ultimo){
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: function(t){
      return /\S/.test(t.nodeValue) && !t.parentElement.closest('.kx-flare,.kx-polvo') ? 1 : 3; } }), t, sel = null;
    while ((t = w.nextNode())){ sel = t; if (!ultimo) break; }
    if (!sel) return null;
    var v = sel.nodeValue, i = ultimo ? v.search(/\S\s*$/) : v.search(/\S/), rg = document.createRange();
    rg.setStart(sel, i); rg.setEnd(sel, i + 1);
    var r = rg.getBoundingClientRect(), e = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: r.left - e.left + r.width * (ultimo ? .7 : .35), y: r.top - e.top + r.height * .32 };
  }
  var foils = [];
  function foil(){
    var lista = [].slice.call(document.querySelectorAll(FOIL)).filter(function(el){
      return !el.closest(DATOS) && !el.matches(DATOS) && !el.parentElement.closest('.foil-text');
    });
    lista.forEach(function(el, i){
      if (el.classList.contains('foil-text')) return;
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 16;
      if (cs.display === 'inline') el.style.display = 'inline-block';
      if (cs.position === 'static') el.style.position = 'relative';
      /* ⚠️ background-clip:text: aire para que no se corten las mayúsculas script */
      var pv = .22 * fs, ph = .45 * fs, lh = parseFloat(cs.lineHeight), extra = 0;
      if (lh && lh < 1.25 * fs && el.getClientRects().length <= 1 && el.offsetHeight < lh * 1.6){
        extra = (1.25 * fs - lh) / 2; el.style.lineHeight = '1.25';
      }
      var mt = parseFloat(cs.marginTop) || 0, mb = parseFloat(cs.marginBottom) || 0, ml = parseFloat(cs.marginLeft) || 0, mr = parseFloat(cs.marginRight) || 0;
      el.style.paddingTop = (parseFloat(cs.paddingTop) + pv) + 'px';
      el.style.paddingBottom = (parseFloat(cs.paddingBottom) + pv) + 'px';
      el.style.marginTop = (mt - pv - extra) + 'px';
      el.style.marginBottom = (mb - pv - extra) + 'px';
      var centrado = cs.display === 'block' && ml > .5 && Math.abs(ml - mr) < 1;
      if (!centrado){
        el.style.paddingLeft = (parseFloat(cs.paddingLeft) + ph) + 'px';
        el.style.paddingRight = (parseFloat(cs.paddingRight) + ph) + 'px';
        el.style.marginLeft = (ml - ph) + 'px';
        el.style.marginRight = (mr - ph) + 'px';
      }
      el.classList.add('foil-text');
      var osc = oscuro(el);
      if (osc) el.classList.add('is-oscuro');
      el.style.setProperty('--fd', (-(i * .618034 % 1) * 7).toFixed(2) + 's');
      /* destello 60–90 px sobre la primera letra y uno mini al final */
      var esCifra = el.matches('.cd-num'), o = { el: el };
      if (!esCifra || i % 2 === 0){
        o.a = flare(el, '0px', '0px', esCifra ? .34 : (fs > 40 ? .44 : .36));
        o.z = esCifra ? null : flare(el, '0px', '0px', fs > 40 ? 1 : .8, true);
      }
      if (el.matches(PRINCIPALES)){
        var pz = document.createElement('span'); pz.className = 'kx-polvo' + (osc ? ' is-oscuro' : ''); pz.setAttribute('aria-hidden', 'true');
        for (var j = 0; j < 6; j++){
          var d = document.createElement('i'), a = (j * 137.5 + i * 40) * Math.PI / 180;
          d.style.setProperty('--x', (50 + Math.cos(a) * (38 + (j % 3) * 7)).toFixed(1) + '%');
          d.style.setProperty('--y', (50 + Math.sin(a) * (42 + (j % 2) * 10)).toFixed(1) + '%');
          d.style.setProperty('--z', (2 + (j % 3)) + 'px');
          d.style.setProperty('--t', (3.6 + (j % 4) * .7).toFixed(1) + 's');
          d.style.setProperty('--d', (-(j * .618 % 1) * 4).toFixed(2) + 's');
          pz.appendChild(d);
        }
        el.appendChild(pz);
      }
      foils.push(o);
    });
    coloca();
  }
  function coloca(){
    foils.forEach(function(o){
      if (o.a){ var p = rectChar(o.el, false); if (p){ o.a.style.setProperty('--x', p.x.toFixed(1) + 'px'); o.a.style.setProperty('--y', p.y.toFixed(1) + 'px'); } }
      if (o.z){ var q = rectChar(o.el, true); if (q){ o.z.style.setProperty('--x', q.x.toFixed(1) + 'px'); o.z.style.setProperty('--y', q.y.toFixed(1) + 'px'); } }
    });
  }

  /* ── Detalles: donde la luz pegaría de verdad (centro y filos de la rosa) ── */
  function detalles(){
    document.querySelectorAll('.ely-rosa').forEach(function(r, i){
      if (r.querySelector('.kx-flare')) return;
      flare(r, '50%', '40%', .62);
      flare(r, i % 2 ? '26%' : '74%', '30%', .9, true);
      flare(r, i % 2 ? '70%' : '30%', '62%', .7, true);
    });
  }

  /* ── Solo se anima lo que está cerca de la pantalla ── */
  function vivos(){
    var secs = document.querySelectorAll('section,footer');
    if (!('IntersectionObserver' in window)){ [].forEach.call(secs, function(s){ s.classList.add('kx-live'); }); return; }
    var io = new IntersectionObserver(function(E){ E.forEach(function(e){ e.target.classList.toggle('kx-live', e.isIntersecting); }); }, { rootMargin: '200px 0px' });
    [].forEach.call(secs, function(s){ io.observe(s); });
  }

  function init(){
    tarjetas(); foil(); detalles(); vivos();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(coloca, 60); });
    var tm = 0;
    window.addEventListener('resize', function(){ clearTimeout(tm); tm = setTimeout(coloca, 180); }, { passive: true });
    setTimeout(coloca, 1400);   /* después de las entradas de GSAP */
    if (window.ScrollTrigger) setTimeout(function(){ ScrollTrigger.refresh(); }, 80);
  }
  alAbrir(function(){ setTimeout(init, 120); });   /* después de D-vivo (crea las rosas) */
})();
</script>
