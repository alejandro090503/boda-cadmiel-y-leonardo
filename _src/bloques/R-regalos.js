/* INSERTAR: <script> propio antes de </body> */
(function(){
  var box    = document.getElementById('rgBox');
  var cta    = document.getElementById('rgCta');
  var reveal = document.getElementById('rgBackdrop');
  var closeB = document.getElementById('rgClose');
  var track  = document.getElementById('rgTrack');
  var viewp  = document.getElementById('rgViewport');
  var dotsEl = document.getElementById('rgDots');
  var canvas = document.getElementById('rgConfetti');
  var prevBtn = document.getElementById('rgPrev');
  var nextBtn = document.getElementById('rgNext');
  if(!box || !reveal || !track || !viewp) return;

  var slides = track.querySelectorAll('.rg-slide');
  var total  = slides.length;
  var idx    = 0;

  /* ---------- Puntos ---------- */
  for(var i=0;i<total;i++){
    (function(n){
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'rg-dot' + (n===0?' is-active':'');
      d.setAttribute('aria-label','Opción ' + (n+1) + ' de ' + total);
      d.addEventListener('click', function(){ goTo(n); });
      dotsEl.appendChild(d);
    })(i);
  }
  var dots = dotsEl.querySelectorAll('.rg-dot');

  function layoutSlides(){
    var h = 0, a, b;
    for(a=0;a<slides.length;a++){ slides[a].style.height = 'auto'; h = Math.max(h, slides[a].scrollHeight); }
    for(b=0;b<slides.length;b++) slides[b].style.height = h + 'px';
    goTo(idx, 'auto');
  }
  window.addEventListener('resize', function(){ if(reveal.classList.contains('is-open')) layoutSlides(); });

  function syncUI(){
    var k, m, q, f;
    for(k=0;k<dots.length;k++) dots[k].classList.toggle('is-active', k===idx);
    for(m=0;m<slides.length;m++){
      slides[m].setAttribute('aria-hidden', m===idx ? 'false' : 'true');
      f = slides[m].querySelectorAll('a,button');
      for(q=0;q<f.length;q++){
        if(m===idx) f[q].removeAttribute('tabindex'); else f[q].setAttribute('tabindex','-1');
      }
    }
    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === total-1);
  }

  function goTo(n, behavior){
    idx = Math.max(0, Math.min(total-1, n));
    var target = idx * viewp.clientWidth;
    try{ viewp.scrollTo({ left: target, behavior: behavior || 'smooth' }); }
    catch(e){ viewp.scrollLeft = target; }
    // red de seguridad si el scroll suave no se aplica
    setTimeout(function(){
      if(Math.abs(viewp.scrollLeft - target) > 4) viewp.scrollLeft = target;
    }, 420);
    syncUI();
  }

  prevBtn.addEventListener('click', function(){ goTo(idx-1); });
  nextBtn.addEventListener('click', function(){ goTo(idx+1); });

  // El scroll nativo (dedo, trackpad) manda: se lee la posición y se sincroniza
  function syncFromScroll(){
    var n = Math.round(viewp.scrollLeft / Math.max(1, viewp.clientWidth));
    n = Math.max(0, Math.min(total-1, n));
    if(n !== idx){ idx = n; syncUI(); }
  }
  var scrollTick = null;
  viewp.addEventListener('scroll', function(){
    if(scrollTick) clearTimeout(scrollTick);
    scrollTick = setTimeout(syncFromScroll, 90);
  }, {passive:true});
  viewp.addEventListener('scrollend', syncFromScroll);
  viewp.addEventListener('touchend', function(){
    setTimeout(syncFromScroll, 160);
    setTimeout(syncFromScroll, 520);
  }, {passive:true});

  /* Arrastre con ratón (escritorio) */
  var mDown = false, mStartX = 0, mStartScroll = 0, moved = 0;
  viewp.addEventListener('mousedown', function(e){
    if(e.target.closest('a,button')) return;
    mDown = true; moved = 0;
    mStartX = e.clientX; mStartScroll = viewp.scrollLeft;
    viewp.style.cursor = 'grabbing';
    viewp.style.scrollSnapType = 'none';
  });
  window.addEventListener('mousemove', function(e){
    if(!mDown) return;
    var d = e.clientX - mStartX;
    moved = Math.abs(d);
    if(moved > 3) e.preventDefault();
    viewp.scrollLeft = mStartScroll - d;
  });
  window.addEventListener('mouseup', function(){
    if(!mDown) return;
    mDown = false; viewp.style.cursor = ''; viewp.style.scrollSnapType = '';
    goTo(Math.round(viewp.scrollLeft / Math.max(1, viewp.clientWidth)));
  });
  viewp.addEventListener('click', function(e){
    if(moved > 8){ e.preventDefault(); e.stopPropagation(); moved = 0; }
  }, true);

  /* Teclado */
  viewp.setAttribute('tabindex','0');
  viewp.setAttribute('role','group');
  viewp.setAttribute('aria-label','Opciones de regalo');
  viewp.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){  e.preventDefault(); goTo(idx-1); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); goTo(idx+1); }
  });

  /* ---------- Copiar CLABE ---------- */
  var copyB = document.getElementById('rgCopy');
  var okEl  = document.getElementById('rgOk');
  var okTimer = null;
  function copiado(ok){
    var msg = ok ? 'CLABE copiada' : 'No se pudo copiar, selecciónala a mano';
    if(okEl) okEl.textContent = msg;
    if(copyB && ok){ copyB.classList.add('is-copied'); copyB.textContent = 'CLABE copiada'; }
    try{ if(typeof window.toast === 'function') window.toast(msg); }catch(e){}
    clearTimeout(okTimer);
    okTimer = setTimeout(function(){
      if(okEl) okEl.textContent = '';
      if(copyB){ copyB.classList.remove('is-copied'); copyB.textContent = 'Copiar CLABE'; }
    }, 2400);
  }
  function respaldo(txt){
    var ok = false;
    try{
      var ta = document.createElement('textarea');
      ta.value = txt; ta.setAttribute('readonly','');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      document.body.appendChild(ta);
      ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length);
      ok = document.execCommand('copy');
      ta.parentNode.removeChild(ta);
    }catch(e){ ok = false; }
    copiado(ok);
  }
  if(copyB) copyB.addEventListener('click', function(){
    var txt = copyB.getAttribute('data-clabe') || '';
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ copiado(true); }, function(){ respaldo(txt); });
    } else respaldo(txt);
  });

  /* ---------- Confeti ---------- */
  function burst(){
    if(!canvas || !canvas.getContext) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stage = canvas.parentElement;
    var W = stage.offsetWidth, H = stage.offsetHeight;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var colors = ['#A9824F','#D9C3A0','#7A5A33','#2F5E7E','#1F2E4A','#F6F2EC','#7E98B4'];
    var parts = [], cx = W/2, cy = H/2, n = window.innerWidth < 520 ? 70 : 120, i;
    for(i=0;i<n;i++){
      var a = (Math.PI * 2 * i / n) + (i % 7) * 0.11;
      var sp = 3.4 + (i % 11) * 0.62;
      parts.push({
        x:cx, y:cy,
        vx: Math.cos(a) * sp * (0.6 + (i%5)*0.14),
        vy: Math.sin(a) * sp * (0.6 + (i%3)*0.2) - 3.6,
        w: 5 + (i%4)*2.4, h: 3 + (i%3)*2,
        rot: (i%360) * 0.0175, vr: ((i%2?1:-1)) * (0.06 + (i%5)*0.02),
        c: colors[i % colors.length], life: 1
      });
    }
    var t0 = null;
    function frame(ts){
      if(t0 === null) t0 = ts;
      var el = (ts - t0) / 1000, alive = false, j, p;
      ctx.clearRect(0,0,W,H);
      for(j=0;j<parts.length;j++){
        p = parts[j];
        p.vy += 0.14; p.vx *= 0.992;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        p.life = Math.max(0, 1 - el/2.6);
        if(p.life > 0 && p.y < H + 40){
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.c; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
          ctx.restore();
        }
      }
      if(alive) requestAnimationFrame(frame); else ctx.clearRect(0,0,W,H);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Apertura / cierre ---------- */
  var isOpen = false, viaTeclado = false;

  // El modal se monta en <body>: ningún ancestro con contain/transform rompe su position:fixed
  if(reveal.parentElement !== document.body) document.body.appendChild(reveal);

  // Bloqueo de scroll compatible con iOS
  var savedScrollY = 0;
  function lockScroll(){
    var s = document.body.style;
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    s.position = 'fixed'; s.top = (-savedScrollY) + 'px'; s.left = '0'; s.right = '0'; s.width = '100%';
    document.body.classList.add('rg-locked');
  }
  function unlockScroll(){
    var s = document.body.style;
    document.body.classList.remove('rg-locked');
    s.position = ''; s.top = ''; s.left = ''; s.right = ''; s.width = '';
    // scroll-behavior:smooth en html haría que el regreso se anime: lo forzamos instantáneo
    var de = document.documentElement, prev = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    de.style.scrollBehavior = prev;
  }

  function openGift(){
    if(isOpen) return;
    isOpen = true;
    try{ window.__elyStopAuto && window.__elyStopAuto(); }catch(e){}
    box.classList.add('is-open');
    box.setAttribute('aria-expanded','true');
    if(cta) cta.classList.add('is-hidden');
    burst();
    setTimeout(function(){
      reveal.classList.add('is-open');
      lockScroll();
      requestAnimationFrame(function(){
        layoutSlides();
        goTo(0, 'auto');
        if(viaTeclado && closeB) closeB.focus();
      });
    }, 240);
  }

  function closeGift(){
    if(!isOpen) return;
    isOpen = false;
    reveal.classList.remove('is-open');
    unlockScroll();
    setTimeout(function(){
      box.classList.remove('is-open');
      box.setAttribute('aria-expanded','false');
      if(cta) cta.classList.remove('is-hidden');
      goTo(0, 'auto');
    }, 420);
    if(viaTeclado) box.focus();
    viaTeclado = false;
  }

  box.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') viaTeclado = true; });
  box.addEventListener('mousedown',  function(){ viaTeclado = false; });
  box.addEventListener('touchstart', function(){ viaTeclado = false; }, {passive:true});
  box.addEventListener('click', openGift);
  if(closeB) closeB.addEventListener('click', closeGift);
  reveal.addEventListener('click', function(e){ if(e.target === reveal) closeGift(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) closeGift(); });

  syncUI();
})();
