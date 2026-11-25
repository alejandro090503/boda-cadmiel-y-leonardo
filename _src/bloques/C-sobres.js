/* INSERTAR: <script> propio al final de index.html. Sin dependencias (no usa GSAP). Lluvia detrás siempre (solo con la sección en pantalla), sobre que aterriza al centrar la sección, toque infalible y copiar CLABE */
(function(){
  var sec=document.getElementById('gifts'),rain=document.getElementById('sbxRain'),
      stage=document.getElementById('sbxStage'),btn=document.getElementById('sbxEnv'),
      body=document.getElementById('sbxBody'),hint=document.getElementById('sbxHint'),
      open=document.getElementById('sbxOpen');
  if(!sec||!rain||!btn) return;
  try{
    var hasJost=[].some.call(document.querySelectorAll('link[href*="fonts.googleapis"]'),function(l){return /Jost/.test(l.href)});
    if(!hasJost){var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Jost:wght@500;600&display=swap';document.head.appendChild(lk);}
  }catch(e){}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Sobre: aterriza, respira, abre/cierra ── */
  var landed=false,isOpen=false;
  function land(){
    if(landed) return; landed=true;
    btn.classList.add('landed');
    if(btn.animate&&!reduce){
      btn.animate([
        {transform:'translateY(-190px) rotate(-12deg) scale(.82)',opacity:0,offset:0},
        {opacity:1,offset:.22},
        {transform:'translateY(18px) rotate(2deg) scale(1)',opacity:1,offset:.6},
        {transform:'translateY(-8px) rotate(-1deg) scale(1)',opacity:1,offset:.8},
        {transform:'translateY(0) rotate(0) scale(1)',opacity:1,offset:1}
      ],{duration:1250,easing:'cubic-bezier(.33,.6,.4,1)'}).onfinish=function(){body.classList.add('breathe');hint.classList.add('show');};
    }else{body.classList.add('breathe');hint.classList.add('show');}
    window.removeEventListener('scroll',check);window.removeEventListener('resize',check);
  }
  function check(){
    var r=stage.getBoundingClientRect(),vh=window.innerHeight||document.documentElement.clientHeight;
    if(r.height&&(r.top+r.height/2)<vh*.62&&r.bottom>0) land();
  }
  function toggle(e){
    if(e&&e.preventDefault) e.preventDefault();
    land();                         /* si tocan antes de aterrizar: aterriza y abre */
    isOpen=!isOpen;
    btn.classList.toggle('open',isOpen);
    open.classList.toggle('on',isOpen);
    btn.setAttribute('aria-expanded',isOpen?'true':'false');
    btn.setAttribute('aria-label',isOpen?'Sobre abierto, toca para cerrar':'Sobre de regalo, toca para abrir');
    hint.textContent=isOpen?'Toca para cerrar':'Toca para abrir';
    if(isOpen) body.classList.remove('breathe'); else if(landed) body.classList.add('breathe');
  }
  btn.addEventListener('click',toggle);
  hint.addEventListener('click',toggle);
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check,{passive:true});
  window.addEventListener('load',check);
  setTimeout(check,400);

  /* ── Lluvia: sobres crema con borde y solapa dorados, mini-sello del acento, 3 profundidades ── */
  var SVGNS='http://www.w3.org/2000/svg';
  var tpl=document.createElementNS(SVGNS,'svg');
  tpl.setAttribute('viewBox','0 0 34 24');
  tpl.innerHTML='<rect x="1" y="1" width="32" height="22" rx="2.5" fill="#FBF4E4" stroke="#A9824F" stroke-width="1.3"/>'+
    '<path d="M1.6 1.6 L17 13 L32.4 1.6" fill="none" stroke="#A9824F" stroke-width="1.3" stroke-linejoin="round"/>'+
    '<circle cx="17" cy="12.6" r="3" fill="#2F5E7E"/><circle cx="17" cy="12.6" r="3" fill="none" stroke="#D9C3A0" stroke-width=".6"/>';
  var DEPTHS=[{w:14,v:34,o:.5,a:6},{w:24,v:54,o:.7,a:9},{w:38,v:84,o:.88,a:12}];
  var MAX=22,pool=[],visible=false,raf=0,last=0,acc=0,H=0,W=0;

  function size(){H=sec.offsetHeight;W=sec.offsetWidth;}
  function spawn(seed){
    if(pool.length>=MAX) return;
    var d=DEPTHS[(Math.random()*3)|0];
    var el=document.createElement('span');el.className='sbx-r';
    var svg=tpl.cloneNode(true);svg.style.width=d.w+'px';svg.style.height=(d.w*24/34)+'px';svg.style.display='block';
    el.appendChild(svg);el.style.opacity=d.o;
    rain.appendChild(el);
    var o={el:el,w:d.w,v:d.v*(.85+Math.random()*.3),a:d.a*(.6+Math.random()*.8),
      x:Math.random()*(W-d.w),y:seed?Math.random()*H:-d.w*1.2-Math.random()*60,
      ph:Math.random()*6.28,fq:.5+Math.random()*.7,r:(Math.random()-.5)*60,rv:(Math.random()-.5)*34,t:0};
    pool.push(o);
  }
  function tick(now){
    raf=0;if(!visible) return;
    var dt=last?Math.min((now-last)/1000,.05):.016;last=now;
    acc+=dt;
    if(acc>.5){acc=0;spawn(false);}
    for(var i=pool.length-1;i>=0;i--){
      var o=pool[i];
      o.t+=dt;o.y+=o.v*dt;o.r+=o.rv*dt;
      if(o.y>H+10){o.el.remove();pool.splice(i,1);continue;}
      o.el.style.transform='translate3d('+(o.x+Math.sin(o.t*o.fq+o.ph)*o.a).toFixed(1)+'px,'+o.y.toFixed(1)+'px,0) rotate('+o.r.toFixed(1)+'deg)';
    }
    raf=requestAnimationFrame(tick);
  }
  function start(){
    if(reduce){ /* un cuadro fijo, sin movimiento */
      if(!pool.length){size();for(var i=0;i<12;i++){spawn(true);}pool.forEach(function(o){o.el.style.transform='translate3d('+o.x.toFixed(1)+'px,'+o.y.toFixed(1)+'px,0) rotate('+o.r.toFixed(1)+'deg)';});}
      return;
    }
    size();
    if(!pool.length){for(var i=0;i<14;i++)spawn(true);}
    last=0;if(!raf)raf=requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)start();},{rootMargin:'80px 0px'}).observe(sec);
  }else{visible=true;start();}
  window.addEventListener('resize',function(){size();},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){last=0;}else if(visible){start();}});

  /* ── Copiar CLABE ── */
  var CLABE='638180010133434139',cb=document.getElementById('sbxCopy'),ok=document.getElementById('sbxOk'),tm=0;
  function fb(){
    if(ok){ok.textContent='CLABE copiada';clearTimeout(tm);tm=setTimeout(function(){ok.textContent='';},2400);}
    try{if(typeof window.toast==='function')window.toast('CLABE copiada');}catch(e){}
  }
  function fallback(){
    var ta=document.createElement('textarea');ta.value=CLABE;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,CLABE.length);
    var good=false;try{good=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta);
    if(good)fb();else if(ok){ok.textContent='CLABE: '+CLABE;}
  }
  if(cb) cb.addEventListener('click',function(){
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(CLABE).then(fb).catch(fallback);}
    else fallback();
  });
})();
