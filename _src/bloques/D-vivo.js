/* INSERTAR: antes de </body> (ancla única), después de los <script> de GSAP y del script principal */
<script>
/* ── D-VIVO · Rosa blanca iluminada por zonas con diamantina dorada ─────────────
   Un solo motor dibuja la rosa en tiempo real (luz por pétalo + filo de oro + diamantina
   que destella según el ángulo de la luz). Cada adorno visible copia el cuadro; el
   siguiente va espejado. Solo anima lo visible, se detiene con la pestaña oculta y con
   prefers-reduced-motion queda un cuadro fijo. Sin librerías. */
(function(){
  if (window.__elyRosa) return; window.__elyRosa = 1;

  /* Dónde asoma la rosa (siempre en una orilla, lejos del texto) */
  var LUGARES = [
    { sec: '#fecha',     cls: 'is-aba-der' },
    { sec: '#hospedaje', cls: 'is-arr-izq' },
    { sec: '#gifts',     cls: 'is-aba-der' },
    { sec: '#rsvp',      cls: 'is-arr-der' }
  ];

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

  /* ── Motor ── */
  function crearMotorRosa(cv, S){
    cv.width = cv.height = S;
    var ctx = cv.getContext('2d');
    if (!ctx) return null;
    var k = S / 220, CX = 110 * k, CY = 108 * k, Q = .7, TAU = Math.PI * 2;
    function azar(n){ var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    function nrm(v){ var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }

    /* Capas: de afuera (abiertas, miran al cielo) hacia adentro (erguidas) */
    var CAPAS = [
      { n: 5, r0: 8,  r1: 76, w: 36, lift: 0,  off: .30, abre: .28 },
      { n: 5, r0: 7,  r1: 63, w: 32, lift: 6,  off: .93, abre: .42 },
      { n: 5, r0: 5,  r1: 48, w: 27, lift: 11, off: .12, abre: .58 },
      { n: 4, r0: 4,  r1: 35, w: 22, lift: 16, off: .70, abre: .74 },
      { n: 3, r0: 3,  r1: 23, w: 16, lift: 20, off: .25, abre: .86 }
    ];
    var petalos = [], sem = 1;
    CAPAS.forEach(function(c, ci){
      for (var i = 0; i < c.n; i++){
        var a = c.off + i / c.n * TAU + (azar(sem++) - .5) * .25;
        var p = { a: a, ci: ci, r0: c.r0 * k, r1: c.r1 * k * (.93 + azar(sem++) * .12), w: c.w * k * (.9 + azar(sem++) * .2),
          lift: c.lift * k, abre: c.abre, curl: .55 + azar(sem++) * .4, motas: [] };
        /* normal de la zona: los de afuera miran arriba, los de adentro hacia afuera */
        p.n = nrm([Math.cos(a) * p.abre, Math.sin(a) * p.abre * .8 - (1 - p.abre) * .25, (1 - p.abre) + .35]);
        /* diamantina sobre el filo del pétalo */
        var m = ci < 2 ? 9 : 6;
        for (var j = 0; j < m; j++){
          var u = .35 + azar(sem++) * .62, lado = azar(sem++) < .5 ? -1 : 1;
          p.motas.push({ u: u, lado: lado, ins: .72 + azar(sem++) * .22,
            n: nrm([p.n[0] + (azar(sem++) - .5) * 1.3, p.n[1] + (azar(sem++) - .5) * 1.3, p.n[2] + (azar(sem++) - .5) * .6]),
            t: azar(sem++) * TAU, s: (.7 + azar(sem++) * .9) * k });
        }
        petalos.push(p);
      }
    });
    /* orden de pintado: capa externa primero; dentro de la capa, los de atrás primero */
    petalos.sort(function(A, B){ return A.ci - B.ci || Math.sin(A.a) - Math.sin(B.a); });
    var HOJAS = [
      { a: 2.6, L: 104, W: 22 }, { a: .45, L: 100, W: 20 }, { a: 3.6, L: 90, W: 18 }, { a: -.4, L: 86, W: 17 }, { a: 1.45, L: 72, W: 15 }
    ].map(function(h, i){ return { a: h.a, L: h.L * k, W: h.W * k, n: nrm([Math.cos(h.a) * .5, Math.sin(h.a) * .4, .8]), i: i }; });

    function mezcla(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function rgb(c, al){ return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (al == null ? 1 : al) + ')'; }
    var SOMBRA = [150, 166, 190], HONDA = [104, 122, 152], MARFIL = [246, 242, 236], BLANCO = [255, 255, 255], CHAMP = [255, 244, 222];
    var ORO_H = [122, 90, 51], ORO = [169, 130, 79], ORO_C = [217, 195, 160];
    var PET_A = [47, 94, 126], PET_C = [118, 158, 182], PET_H = [24, 48, 70];

    function pon(a, lift, esc){
      var c = Math.cos(a) * esc, s = Math.sin(a) * esc;
      ctx.setTransform(c, Q * s, -s, Q * c, CX, CY - lift);
    }
    function formaPetalo(p){
      var r0 = p.r0, r1 = p.r1, L = r1 - r0, W = p.w;
      ctx.beginPath();
      ctx.moveTo(r0, 0);
      ctx.bezierCurveTo(r0 + L * .22, -W * .95, r0 + L * .86, -W * 1.08, r1, -W * .3);
      ctx.quadraticCurveTo(r1 + L * .09, 0, r1, W * .3);
      ctx.bezierCurveTo(r0 + L * .86, W * 1.08, r0 + L * .22, W * .95, r0, 0);
      ctx.closePath();
    }
    function filo(p){
      var r0 = p.r0, r1 = p.r1, L = r1 - r0, W = p.w;
      ctx.beginPath();
      ctx.moveTo(r0 + L * .5, -W * 1.0);
      ctx.bezierCurveTo(r0 + L * .86, -W * 1.06, r1 + L * .02, -W * .5, r1, -W * .3);
      ctx.quadraticCurveTo(r1 + L * .09, 0, r1, W * .3);
      ctx.bezierCurveTo(r1 + L * .02, W * .5, r0 + L * .86, W * 1.06, r0 + L * .5, W * 1.0);
    }
    function posFilo(p, m){
      /* punto aproximado sobre el contorno del pétalo, metido hacia adentro */
      var r0 = p.r0, L = p.r1 - p.r0, u = m.u;
      var x = r0 + L * u, y = p.w * Math.sin(Math.PI * Math.pow(u, .78)) * 1.0 * m.lado * m.ins;
      return [x, y];
    }

    return function pinta(t){
      var L = nrm([Math.cos(t * .42) * .75, -.45 + Math.sin(t * .29) * .35, .62]);
      var L2 = nrm([-L[0] * .6, .7, .5]);
      var ba = Math.sin(t * .55) * .045, esc = 1 + Math.sin(t * .8) * .008;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, S, S);
      /* balanceo leve: se gira el lienzo alrededor del tallo */
      ctx.save();
      ctx.translate(CX, CY + 40 * k); ctx.rotate(ba); ctx.translate(-CX, -CY - 40 * k);
      var base = ctx.getTransform();
      function pon2(a, lift, s){ pon(a, lift, s * esc); var m = ctx.getTransform(); ctx.setTransform(base.multiply(m)); }

      /* hojas azul petróleo con brillo metálico */
      HOJAS.forEach(function(h){
        var d = Math.max(0, h.n[0] * L[0] + h.n[1] * L[1] + h.n[2] * L[2]), sp = Math.pow(d, 18);
        pon2(h.a, -2 * k, 1);
        ctx.beginPath();
        ctx.moveTo(18 * k, 0);
        ctx.bezierCurveTo(18 * k + h.L * .3, -h.W, h.L * .8, -h.W * .7, h.L, 0);
        ctx.bezierCurveTo(h.L * .8, h.W * .7, 18 * k + h.L * .3, h.W, 18 * k, 0);
        var g = ctx.createLinearGradient(0, -h.W, 0, h.W);
        g.addColorStop(0, rgb(mezcla(PET_A, PET_C, .35 + d * .65)));
        g.addColorStop(.5, rgb(mezcla(PET_H, PET_A, .4 + d * .6)));
        g.addColorStop(1, rgb(PET_H));
        ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = 1 * k; ctx.strokeStyle = rgb(mezcla(ORO, ORO_C, sp), .55 + sp * .45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20 * k, 0); ctx.quadraticCurveTo(h.L * .55, -h.W * .08, h.L * .96, 0);
        ctx.lineWidth = .9 * k; ctx.strokeStyle = rgb(ORO_C, .35 + sp * .6); ctx.stroke();
      });

      /* pétalos: luz por zona */
      var destellos = [];
      var copa = false;
      petalos.forEach(function(p){
        if (!copa && p.ci >= 2){
          copa = true; ctx.setTransform(base);
          var sg = ctx.createRadialGradient(CX, CY - 8 * k, 0, CX, CY - 8 * k, 44 * k);
          sg.addColorStop(0, 'rgba(70,90,124,.26)'); sg.addColorStop(1, 'rgba(70,90,124,0)');
          ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(CX, CY - 8 * k, 44 * k, 44 * k * Q, 0, 0, TAU); ctx.fill();
        }
        var d = p.n[0] * L[0] + p.n[1] * L[1] + p.n[2] * L[2], dd = Math.max(0, d);
        var d2 = Math.max(0, p.n[0] * L2[0] + p.n[1] * L2[1] + p.n[2] * L2[2]) * .25;
        var luz = Math.min(1, .2 + dd * .85 + d2), sp = Math.pow(dd, 22);
        var cLuz = mezcla(mezcla(SOMBRA, MARFIL, luz), BLANCO, Math.min(1, sp * 1.4));
        var cBase = mezcla(SOMBRA, MARFIL, luz * .55);
        pon2(p.a, p.lift, 1);
        /* sombra del pétalo de encima */
        ctx.save(); ctx.translate(2 * k, 2.5 * k); formaPetalo(p);
        ctx.fillStyle = 'rgba(31,46,74,' + (.06 + p.ci * .015) + ')'; ctx.fill(); ctx.restore();
        formaPetalo(p);
        var g = ctx.createLinearGradient(p.r0, 0, p.r1, 0);
        g.addColorStop(0, rgb(mezcla(cBase, HONDA, .55 + p.ci * .06)));
        g.addColorStop(.3, rgb(mezcla(cBase, SOMBRA, .4)));
        g.addColorStop(.55, rgb(cBase));
        g.addColorStop(.88, rgb(cLuz));
        g.addColorStop(1, rgb(mezcla(cLuz, CHAMP, .4)));
        ctx.fillStyle = g; ctx.fill();
        /* vena central suave */
        ctx.beginPath(); ctx.moveTo(p.r0 + 2 * k, 0); ctx.quadraticCurveTo((p.r0 + p.r1) * .5, p.w * .06, p.r1 * .9, 0);
        ctx.lineWidth = .7 * k; ctx.strokeStyle = 'rgba(150,165,188,.28)'; ctx.stroke();
        /* filo de oro: se enciende cuando la zona mira a la luz */
        /* contorno frío y fino (el pétalo blanco se recorta sobre blanco) */
        formaPetalo(p); ctx.lineWidth = .6 * k; ctx.strokeStyle = 'rgba(118,136,166,.38)'; ctx.stroke();
        /* orilla enrollada: banda clara en la punta */
        filo(p); ctx.lineCap = 'round';
        ctx.lineWidth = (2.2 + p.curl * 1.6) * k; ctx.strokeStyle = rgb(mezcla(MARFIL, BLANCO, luz), .55 + luz * .45); ctx.stroke();
        /* filo de oro: solo donde la luz pega a esa zona */
        var oro = Math.max(0, dd - .35) / .65;
        if (oro > .02){
          ctx.lineWidth = (.6 + p.curl * .7 + oro * .6) * k;
          ctx.strokeStyle = rgb(mezcla(ORO, ORO_C, oro), oro * .95); ctx.stroke();
        }
        if (sp > .05){ ctx.lineWidth = .7 * k; ctx.strokeStyle = rgb(CHAMP, Math.min(1, sp * 1.6)); ctx.stroke(); }
        /* diamantina */
        p.motas.forEach(function(m){
          var e = Math.max(0, m.n[0] * L[0] + m.n[1] * L[1] + m.n[2] * L[2]);
          var b = Math.pow(e, 30) * (.75 + .25 * Math.sin(t * 3.1 + m.t)), q = posFilo(p, m);
          ctx.fillStyle = rgb(mezcla(ORO, ORO_C, e), .35 + e * .45);
          ctx.fillRect(q[0] - m.s * .5, q[1] - m.s * .5, m.s, m.s);
          if (b > .25){
            var M = ctx.getTransform(), pt = M.transformPoint(new DOMPoint(q[0], q[1]));
            destellos.push([pt.x, pt.y, b, m.s]);
          }
        });
      });

      /* corazón: espiral del botón */
      ctx.setTransform(base);
      var ly = CY - 22 * k;
      for (var s = 0; s < 3; s++){
        ctx.beginPath();
        ctx.ellipse(CX + (s - 1) * 1.2 * k, ly + s * 1.2 * k, (11 - s * 3.2) * k * esc, (7 - s * 2) * k * esc, -.2 + s * .5, .3 + s, 5.4 + s);
        ctx.lineWidth = 1.3 * k; ctx.strokeStyle = rgb(mezcla(ORO_H, ORO_C, .4 + .4 * Math.sin(t * .8 + s)), .85); ctx.stroke();
      }
      var cg = ctx.createRadialGradient(CX - 2 * k, ly - 2 * k, 0, CX, ly, 9 * k);
      cg.addColorStop(0, 'rgba(255,246,226,.9)'); cg.addColorStop(1, 'rgba(255,246,226,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(CX, ly, 9 * k, 0, TAU); ctx.fill();

      /* destellos en cruz de la diamantina que pega con la luz */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      destellos.forEach(function(d){
        var R = (3 + d[2] * 7) * k * (.8 + d[3] / k * .25);
        ctx.globalAlpha = Math.min(1, d[2]);
        var gg = ctx.createRadialGradient(d[0], d[1], 0, d[0], d[1], R * .9);
        gg.addColorStop(0, 'rgba(255,250,236,1)'); gg.addColorStop(.35, 'rgba(217,195,160,.75)'); gg.addColorStop(1, 'rgba(169,130,79,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(d[0], d[1], R * .9, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(169,130,79,.9)';
        ctx.fillRect(d[0] - R, d[1] - .45 * k, R * 2, .9 * k);
        ctx.fillRect(d[0] - .45 * k, d[1] - R, .9 * k, R * 2);
        ctx.fillStyle = '#FFF8EA';
        ctx.fillRect(d[0] - R * .45, d[1] - .3 * k, R * .9, .6 * k);
        ctx.fillRect(d[0] - .3 * k, d[1] - R * .45, .6 * k, R * .9);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
    };
  }
  window.crearMotorRosa = crearMotorRosa;

  function initRosas(){
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(2, window.devicePixelRatio || 1), S = Math.round(Math.min(440, 140 * dpr * 1.4));
    var fuente = document.createElement('canvas'), pinta = crearMotorRosa(fuente, S);
    if (!pinta) return;
    var rosas = [];
    LUGARES.forEach(function(l){
      var sec = document.querySelector(l.sec);
      if (!sec || sec.querySelector(':scope > .ely-rosa-zona')) return;
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      var zona = document.createElement('div'), w = document.createElement('div'), c = document.createElement('canvas');
      zona.className = 'ely-rosa-zona'; zona.setAttribute('aria-hidden', 'true');
      w.className = 'ely-rosa ' + l.cls;
      c.width = c.height = S; c.className = 'ely-rosa-cv';
      w.appendChild(c); zona.appendChild(w); sec.appendChild(zona);
      var x = c.getContext('2d');
      if (rosas.length % 2) x.setTransform(-1, 0, 0, 1, S, 0);
      rosas.push({ el: c, w: w, ctx: x, ve: false });
    });
    /* PNG de rosa que ya existan: la mitad (máx. 4) recibe la luz por zonas con su PNG de máscara */
    var pngs = [].filter.call(document.querySelectorAll('img'), function(im){
      var s = im.getAttribute('src') || '';
      return /ros[ae]/i.test(s) && /\.(png|webp)(\?|$)/i.test(s) && !im.closest('#loader');
    }).filter(function(_, i){ return i % 2 === 0; }).slice(0, 4);
    var masks = pngs.map(function(im){
      var c = document.createElement('canvas');
      ['className', 'id'].forEach(function(a){ if (im[a]) c[a] = im[a]; });
      if (im.getAttribute('style')) c.setAttribute('style', im.getAttribute('style'));
      c.classList.add('ely-rosa-png'); c.setAttribute('aria-hidden', 'true');
      var o = { el: c, im: im, ve: false, ok: false };
      function prep(){
        var r = im.getBoundingClientRect(), W = Math.max(40, Math.round((r.width || im.naturalWidth) * dpr)), H = Math.round(W * im.naturalHeight / im.naturalWidth);
        c.width = Math.min(W, 520); c.height = Math.round(c.width * im.naturalHeight / im.naturalWidth);
        if (!c.style.width && r.width) c.style.width = r.width + 'px';
        o.ctx = c.getContext('2d'); o.ok = true;
        /* zonas brillantes del PNG donde caerá la diamantina */
        var t = document.createElement('canvas'); t.width = 64; t.height = Math.max(1, Math.round(64 * H / W));
        var tx = t.getContext('2d'); tx.drawImage(im, 0, 0, t.width, t.height);
        var D = tx.getImageData(0, 0, t.width, t.height).data, P = [];
        for (var i = 0; i < D.length; i += 4) if (D[i + 3] > 200 && D[i] + D[i + 1] + D[i + 2] > 600) P.push(i / 4);
        o.pts = []; for (var j = 0; j < 14 && P.length; j++){ var q = P[(j * 7919) % P.length]; o.pts.push([(q % t.width + .5) / t.width, (Math.floor(q / t.width) + .5) / t.height, j * 2.4]); }
        im.replaceWith(c);
        dibujaPng(o, 1.2);
      }
      try { if (im.complete && im.naturalWidth) prep(); else im.addEventListener('load', prep, { once: true }); } catch (e) {}
      return o;
    });
    function dibujaPng(o, t){
      if (!o.ok) return;
      var x = o.ctx, W = o.el.width, H = o.el.height;
      x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.drawImage(o.im, 0, 0, W, H);
      x.globalCompositeOperation = 'source-atop';
      var lx = (.5 + Math.cos(t * .42) * .55) * W, ly = (.35 + Math.sin(t * .29) * .3) * H;
      var g = x.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * .55);
      g.addColorStop(0, 'rgba(255,244,222,.55)'); g.addColorStop(.45, 'rgba(217,195,160,.18)'); g.addColorStop(1, 'rgba(31,46,74,.16)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'source-over';
      (o.pts || []).forEach(function(p){
        var px = p[0] * W, py = p[1] * H, dl = Math.hypot(px - lx, py - ly) / Math.max(W, H);
        var b = Math.max(0, 1 - dl * 2.6) * (.6 + .4 * Math.sin(t * 2.7 + p[2]));
        if (b < .2) return;
        var R = (4 + b * 7) * dpr;
        x.globalAlpha = b; x.fillStyle = 'rgba(169,130,79,.9)';
        x.fillRect(px - R, py - .5 * dpr, R * 2, dpr); x.fillRect(px - .5 * dpr, py - R, dpr, R * 2);
        x.fillStyle = '#FFF8EA'; x.fillRect(px - R * .4, py - .35 * dpr, R * .8, .7 * dpr);
        x.globalAlpha = 1;
      });
    }

    var th = 1.3;
    function copia(todas){
      rosas.forEach(function(b){ if (!todas && !b.ve) return; b.ctx.clearRect(0, 0, S, S); b.ctx.drawImage(fuente, 0, 0); });
      masks.forEach(function(o){ if (todas || o.ve) dibujaPng(o, th); });
    }
    pinta(th); copia(true);
    if (RM || !('IntersectionObserver' in window)) return;
    var todos = rosas.concat(masks);
    function hay(){ return todos.some(function(b){ return b.ve; }); }
    var raf = 0, last = 0, acc = 0;
    function loop(now){
      raf = 0;
      if (document.hidden || !hay()) { last = 0; return; }
      var dt = last ? Math.min((now - last) / 1000, .05) : .016;
      last = now; th += dt; acc += dt;
      if (acc >= 1 / 32){ acc = 0; pinta(th); copia(false); }   /* ~30 cps basta y cuida la batería */
      raf = requestAnimationFrame(loop);
    }
    function arranca(){ if (!raf && !document.hidden && hay()) raf = requestAnimationFrame(loop); }
    var io = new IntersectionObserver(function(E){
      E.forEach(function(e){ todos.forEach(function(b){ if (b.el === e.target) b.ve = e.isIntersecting; }); });
      arranca();
    }, { rootMargin: '60px 0px' });
    todos.forEach(function(b){ io.observe(b.el); });
    document.addEventListener('visibilitychange', arranca);
  }
  alAbrir(initRosas);
})();
</script>
