/* INSERTAR: antes de </body> */
<script>
/* ═══ PRINCIPAL (paquete premium): hero vivo, levitación, fusiones, menú, auto-scroll ═══ */
(function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: foto en envoltorio con deriva + capa de brillo */
  var bg = document.getElementById('heroBg');
  if (bg && !bg.querySelector('.hero-drift')) {
    var img = bg.querySelector('img'); var dr = document.createElement('i'); dr.className = 'hero-drift';
    bg.insertBefore(dr, img); dr.appendChild(img);
    var sh = document.createElement('div'); sh.className = 'h-shine'; sh.setAttribute('aria-hidden','true');
    var html = '<div class="h-glow g1"></div><div class="h-glow g2"></div><div class="h-glow g3"></div><div class="h-glow g4"></div><div class="h-lens"></div><div class="h-vig"></div>';
    for (var i = 0; i < 15; i++) {
      var sz = 2 + Math.random() * 2;
      html += '<span class="h-dot" style="left:' + (4 + Math.random() * 92).toFixed(1) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;animation-duration:' + (9 + Math.random() * 9).toFixed(1) + 's;animation-delay:-' + (Math.random() * 16).toFixed(1) + 's"></span>';
    }
    sh.innerHTML = html; bg.parentNode.insertBefore(sh, bg.nextSibling);
  }

  /* Levitación en tarjetas y fotos */
  var LEV = '.loc-unified-photo,.fam-parent-card,.hotel-photo,.dc-figure,.dc-look,.dc-medal,.dc-dot,.dc-swatch,.cd-unit,.cd-box';
  document.querySelectorAll(LEV).forEach(function(el, i){
    el.classList.add('lev'); el.style.animationDelay = (-(i * 2.15) % 6.5).toFixed(2) + 's';
  });

  /* Fusiones entre secciones: color medio → transparente a cada lado de la frontera */
  function initSectionFades(){
    var page = 'rgb(255, 255, 255)';
    var secs = [].slice.call(document.querySelectorAll('body > section, body > footer'));
    function col(el, edge){
      var d = el.getAttribute('data-' + edge); if (d) return d;
      var c = getComputedStyle(el).backgroundColor;
      return (!c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c)) ? page : c;
    }
    function mix(a, b){
      var x = a.match(/[\d.]+/g).map(Number), y = b.match(/[\d.]+/g).map(Number);
      return 'rgb(' + [0,1,2].map(function(k){ return Math.round((x[k] + y[k]) / 2); }).join(',') + ')';
    }
    function grad(c, dir){
      var m = c.match(/[\d.]+/g).slice(0,3).join(','), st = [];
      for (var k = 0; k <= 8; k++) { var t = k / 8, a = 1 - t * t * (3 - 2 * t); st.push('rgba(' + m + ',' + a.toFixed(3) + ') ' + Math.round(t * 100) + '%'); }
      return 'linear-gradient(' + dir + ',' + st.join(',') + ')';
    }
    for (var i = 0; i < secs.length - 1; i++) {
      var A = secs[i], B = secs[i + 1];
      var ca = col(A, 'bot'), cb = col(B, 'top');
      if (ca === cb) continue;
      var m = mix(ca, cb);
      [[A, 'bot', 'to top'], [B, 'top', 'to bottom']].forEach(function(p){
        if (p[0].id === 'hero' && p[1] === 'top') return;
        var f = document.createElement('div'); f.className = 'sfade ' + p[1]; f.setAttribute('aria-hidden','true');
        f.style.background = grad(m, p[2]);
        if (p[0].id === 'hero') f.style.height = '90px';
        p[0].style.isolation = 'isolate'; if (getComputedStyle(p[0]).position === 'static') p[0].style.position = 'relative';
        p[0].appendChild(f);
      });
    }
  }
  if (document.readyState === 'complete') initSectionFades(); else window.addEventListener('load', initSectionFades);

  /* Menú: un solo botón abajo al centro */
  var LABELS = [['hero','Inicio'],['fecha','Nos casamos'],['countdown','Cuenta regresiva'],['location','Ubicación'],['itinerary','Itinerario'],['dresscode','Código de vestimenta'],['hospedaje','Hospedaje'],['gallery','Galería'],['family','Nuestros padres'],['adultos','Aviso importante'],['gifts','Mesa de regalos'],['album','Álbum de fotos'],['rsvp','Confirmar asistencia']];
  var btn = document.createElement('button'); btn.id = 'elyMenuBtn'; btn.type = 'button'; btn.setAttribute('aria-label','Abrir menú');
  btn.innerHTML = '<span class="mb-lines" aria-hidden="true"><i></i><i></i><i></i></span><span>Menú</span>';
  var menu = document.createElement('nav'); menu.id = 'elyMenu'; menu.setAttribute('aria-label','Secciones');
  var lis = LABELS.filter(function(l){ return document.getElementById(l[0]); }).map(function(l){ return '<li><a href="#' + l[0] + '" data-go="' + l[0] + '">' + l[1] + '</a></li>'; }).join('');
  menu.innerHTML = '<button class="mn-x" type="button" aria-label="Cerrar menú">×</button><p class="mn-mono">L &amp; C</p><div class="mn-rule"></div><ul>' + lis + '</ul>';
  document.body.appendChild(btn); document.body.appendChild(menu);
  function openM(){ window.__elyStopAuto && window.__elyStopAuto(); menu.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  function closeM(){ menu.classList.remove('open'); document.documentElement.style.overflow = ''; }
  btn.addEventListener('click', openM);
  menu.querySelector('.mn-x').addEventListener('click', closeM);
  menu.addEventListener('click', function(e){
    var a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); closeM();
    var t = document.getElementById(a.dataset.go); if (!t) return;
    var y = t.getBoundingClientRect().top + window.pageYOffset - 6;
    setTimeout(function(){ window.scrollTo({ top: y, behavior: 'smooth' }); }, 60);
  });

  /* Al abrir el sobre: aparecen menú y vinilo, y arranca el recorrido */
  function onOpen(){
    if (onOpen.done) return; onOpen.done = true;
    btn.classList.add('on');
    setTimeout(startAuto, 2500);
  }
  var mo = new MutationObserver(function(){ if (!document.getElementById('loader')) { mo.disconnect(); onOpen(); } });
  mo.observe(document.body, { childList: true });
  if (!document.getElementById('loader')) onOpen();

  /* Recorrido automático sin botón */
  var stopped = false, running = false, raf = 0, acc = 0, last = 0, startT = 0, lastSetY = -1, speed = 0;
  function pre(){ return !!document.getElementById('loader'); }
  function stop(){ if (stopped || pre()) return; stopped = true; running = false; cancelAnimationFrame(raf); document.documentElement.style.scrollBehavior = ''; }
  window.__elyStopAuto = stop;
  ['wheel','touchstart','pointerdown'].forEach(function(ev){ window.addEventListener(ev, function(){ if (running || !stopped) stop(); }, { passive: true, capture: true }); });
  window.addEventListener('keydown', function(e){ if (/^(Arrow|PageUp|PageDown|Home|End| |Spacebar)/.test(e.key) || e.key === ' ') stop(); }, { capture: true });
  window.addEventListener('scroll', function(){
    if (!running) return;
    if (lastSetY >= 0 && Math.abs(window.pageYOffset - lastSetY) > 3) stop();
  }, { passive: true, capture: true });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { if (running) { running = false; cancelAnimationFrame(raf); } }
    else if (!stopped && !running && startT) { running = true; last = 0; raf = requestAnimationFrame(step); }
  });
  function slowZone(){
    var mid = window.innerHeight * 0.5, ids = ['hero','gallery','fecha'];
    for (var i = 0; i < ids.length; i++) { var el = document.getElementById(ids[i]); if (!el) continue; var r = el.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) return true; }
    return false;
  }
  function step(t){
    if (!running) return;
    if (!last) last = t;
    var dt = Math.min(64, t - last) / 1000; last = t;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.pageYOffset;
    var target = slowZone() ? 24 : 38;
    var ramp = Math.min(1, (t - startT) / 1000);
    var remain = max - y; if (remain < 120) target *= Math.max(0.15, remain / 120);
    speed += (target * ramp - speed) * Math.min(1, dt * 3);
    acc += speed * dt;
    if (acc >= 1) { var px = Math.floor(acc); acc -= px; lastSetY = Math.min(max, y + px); window.scrollTo(0, lastSetY); }
    if (y >= max - 1) { stop(); return; }
    raf = requestAnimationFrame(step);
  }
  function startAuto(){
    if (stopped || RM || document.hidden || location.hash || /[?&]noauto/.test(location.search)) { stopped = true; return; }
    document.documentElement.style.scrollBehavior = 'auto';
    running = true; startT = performance.now(); last = 0; raf = requestAnimationFrame(function(t){ startT = t; step(t); });
  }
  /* Abrir lightbox, regalos, mapa o RSVP también detiene */
  document.addEventListener('click', function(e){ if (e.target.closest('a,button,[role=button]')) stop(); }, true);
})();
</script>
