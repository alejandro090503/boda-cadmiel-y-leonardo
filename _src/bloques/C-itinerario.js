/* INSERTAR: <script> propio al final de index.html. Sin dependencias (no usa GSAP): el scroll conduce una estela de luz; cada punto se enciende al llegar y se apaga al subir */
(function(){
  var wrap=document.getElementById('itxWrap');
  if(!wrap) return;
  var sec=document.getElementById('itinerary');
  try{
    var hasJost=[].some.call(document.querySelectorAll('link[href*="fonts.googleapis"]'),function(l){return /Jost/.test(l.href)});
    if(!hasJost){var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Jost:wght@500;600&display=swap';document.head.appendChild(lk);}
  }catch(e){}
  document.documentElement.classList.add('itx-js');

  /* entrada suave */
  var rv=sec.querySelectorAll('.itx-rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.15,rootMargin:'0px 0px -5% 0px'});
    [].forEach.call(rv,function(n){io.observe(n);});
  }else{[].forEach.call(rv,function(n){n.classList.add('in');});}

  var rows=[].slice.call(wrap.querySelectorAll('.itx-row'));
  var dots=[].slice.call(wrap.querySelectorAll('.itx-dot'));
  var line=document.getElementById('itxLine'),track=document.getElementById('itxTrack'),head=document.getElementById('itxHead');
  var colas=[{el:document.getElementById('itxT1'),px:118},{el:document.getElementById('itxT2'),px:74},{el:document.getElementById('itxT3'),px:34}];
  var all=[line,track].concat(colas.map(function(c){return c.el;}));
  all.forEach(function(p){p.setAttribute('pathLength','1');});

  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var x=0,y0=0,y1=1,total=1,hitos=[];

  function geo(){
    if(wrap.offsetWidth<10||!dots.length) return;
    /* offsets (no rects): ignoran el translateY de la entrada */
    var list=dots[0].offsetParent||wrap;
    var lx=list===wrap?0:list.offsetLeft,ly=list===wrap?0:list.offsetTop;
    var cs=dots.map(function(d){return {x:lx+d.offsetLeft+d.offsetWidth/2,y:ly+d.offsetTop+d.offsetHeight/2};});
    x=cs[0].x;
    y0=Math.max(0,cs[0].y-56);
    y1=Math.min(wrap.offsetHeight,cs[cs.length-1].y+56);
    total=Math.max(1,y1-y0);
    hitos=cs.map(function(c){return (c.y-y0)/total;});
    var pts=x.toFixed(1)+','+y0.toFixed(1)+' '+x.toFixed(1)+','+y1.toFixed(1);
    all.forEach(function(p){p.setAttribute('points',pts);});
  }

  if(reduce){
    geo();line.style.strokeDashoffset=0;rows.forEach(function(r){r.classList.add('is-lit');});
    window.addEventListener('resize',function(){geo();line.style.strokeDashoffset=0;},{passive:true});
    return;
  }

  var meta=0,p=-1,raf=0,last=0;
  function target(){
    var r=wrap.getBoundingClientRect(),vh=window.innerHeight||document.documentElement.clientHeight;
    var t=(vh*.78-r.top)/(vh*.2+r.height);
    return Math.max(0,Math.min(1,t));
  }
  function pinta(){
    var d=p*total;
    line.style.strokeDashoffset=1-p;
    colas.forEach(function(c){
      var largo=Math.min(d,c.px)/total;
      c.el.style.strokeDasharray=largo+' 2';
      c.el.style.strokeDashoffset=-(p-largo);
      c.el.style.opacity=p>.002?1:0;
    });
    head.style.transform='translate3d('+x.toFixed(2)+'px,'+(y0+d).toFixed(2)+'px,0)';
    head.classList.toggle('is-on',p>.003);
    rows.forEach(function(r,i){r.classList.toggle('is-lit',p>=(hitos[i]||0)-.006&&p>.001);});
  }
  function loop(now){
    raf=0;
    var dt=last?Math.min((now-last)/1000,.05):.016;last=now;
    p+=(meta-p)*(1-Math.exp(-dt/.17));
    var quieto=Math.abs(meta-p)<.0005;
    if(quieto)p=meta;
    pinta();
    if(!quieto)raf=requestAnimationFrame(loop);else last=0;
  }
  function kick(){if(!raf)raf=requestAnimationFrame(loop);}
  function onScroll(){meta=target();kick();}
  function refresh(){geo();meta=target();if(p<0)p=meta;kick();}

  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('load',refresh);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
  [150,600,1500].forEach(function(t){setTimeout(refresh,t);});
  refresh();
})();
