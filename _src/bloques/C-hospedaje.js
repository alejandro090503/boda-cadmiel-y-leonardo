/* INSERTAR: <script> propio al final de index.html. Sin dependencias (Leaflet 1.9.4 se carga de cdnjs al abrir la vista Mapa). Datos: data-* de .hsx-slide y de #hsxMap */
(function(){
  var sec=document.getElementById('hospedaje');
  if(!sec) return;
  function $(s,r){return (r||sec).querySelector(s);}
  function $$(s,r){return [].slice.call((r||sec).querySelectorAll(s));}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{
    var hasJost=[].some.call(document.querySelectorAll('link[href*="fonts.googleapis"]'),function(l){return /Jost/.test(l.href)});
    if(!hasJost){var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Jost:wght@500;600&display=swap';document.head.appendChild(lk);}
  }catch(e){}

  /* ═════════ Selector Lista / Mapa ═════════ */
  var seg=$('#hsxSeg'),tabs=$$('#hsxSeg button'),vL=$('#hsxLista'),vM=$('#hsxMapa');
  function show(v){
    seg.setAttribute('data-v',v);
    tabs.forEach(function(t){t.setAttribute('aria-selected',t.getAttribute('data-v')===v?'true':'false');});
    vL.hidden=(v!=='lista');vM.hidden=(v!=='mapa');
    if(v==='mapa') buildMap(); else closeFicha();
  }
  tabs.forEach(function(t){t.addEventListener('click',function(){show(t.getAttribute('data-v'));});});

  /* ═════════ Carrusel por hotel ═════════ */
  var vp=$('.hsx-viewport'),track=$('.hsx-track'),slides=$$('.hsx-slide'),dots=$$('.hsx-dots button'),idx=0,n=slides.length;
  function go(i,anim){
    idx=((i%n)+n)%n;
    track.style.transition=(anim===false||reduce)?'none':'';
    track.style.transform='translate3d('+(-idx*100)+'%,0,0)';
    dots.forEach(function(d,k){d.classList.toggle('on',k===idx);});
    slides.forEach(function(s,k){s.setAttribute('aria-hidden',k===idx?'false':'true');});
  }
  $('.hsx-prev').addEventListener('click',function(){go(idx-1);});
  $('.hsx-next').addEventListener('click',function(){go(idx+1);});
  dots.forEach(function(d,k){d.addEventListener('click',function(){go(k);});});
  /* swipe */
  var sx=null,sy=0,dx=0,drag=null,pid=0;
  vp.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0) return;
    sx=e.clientX;sy=e.clientY;dx=0;drag=null;pid=e.pointerId;
  });
  vp.addEventListener('pointermove',function(e){
    if(sx===null||e.pointerId!==pid) return;
    var mx=e.clientX-sx,my=e.clientY-sy;
    if(drag===null){
      if(Math.abs(mx)>10&&Math.abs(mx)>Math.abs(my)*1.2){drag=true;track.style.transition='none';try{vp.setPointerCapture(pid);}catch(_){}}
      else if(Math.abs(my)>10){drag=false;sx=null;return;}
    }
    if(drag){dx=mx;track.style.transform='translate3d('+(-idx*vp.offsetWidth+dx)+'px,0,0)';}
  });
  function endSwipe(){
    if(sx===null) return;
    if(drag){if(Math.abs(dx)>50)go(idx+(dx<0?1:-1));else go(idx);}
    sx=null;drag=null;
  }
  vp.addEventListener('pointerup',endSwipe);
  vp.addEventListener('pointercancel',endSwipe);
  window.addEventListener('resize',function(){go(idx,false);},{passive:true});
  go(0,false);
  /* miniaturas: cambian la foto circular */
  slides.forEach(function(s){
    var main=$('.hsx-main',s),ths=$$('.hsx-thumbs button',s);
    ths.forEach(function(b){
      b.addEventListener('click',function(){
        if(b.classList.contains('on')) return;
        ths.forEach(function(x){x.classList.toggle('on',x===b);});
        main.classList.add('sw');
        setTimeout(function(){main.src=b.getAttribute('data-full');main.classList.remove('sw');},reduce?0:220);
      });
    });
  });

  /* ═════════ Mapa ═════════ */
  var map=null,mapBuilt=false,items=[],venue=null,ficha=$('#hsxFicha'),hint=$('#hsxHint'),msg=$('#hsxMsg'),selIdx=-1;
  var LCSS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  var LJS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  function loadLeaflet(cb){
    if(window.L&&window.L.map) return cb();
    var pend=2,fail=false;
    function done(){if(--pend===0&&!fail)cb();}
    function bad(){fail=true;var m=$('#hsxMap');if(m)m.innerHTML='<p style="padding:40px 20px;color:#E4E9F2;font:500 16px Jost,sans-serif">No se pudo cargar el mapa. Usa la vista Lista.</p>';}
    if(!document.querySelector('link[href*="leaflet"]')){
      var c=document.createElement('link');c.rel='stylesheet';c.href=LCSS;c.onload=done;c.onerror=done;document.head.appendChild(c);
    }else pend--;
    var s=document.createElement('script');s.src=LJS;s.onload=done;s.onerror=bad;document.head.appendChild(s);
  }
  function buildMap(){
    if(mapBuilt){setTimeout(function(){if(map){map.invalidateSize();fitAll(false);}},60);return;}
    mapBuilt=true;
    loadLeaflet(initMap);
  }
  function initMap(){
    var el=$('#hsxMap'),L=window.L;
    var touch=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
    map=L.map(el,{zoomControl:false,attributionControl:true,dragging:!touch,scrollWheelZoom:false,touchZoom:true,doubleClickZoom:true,boxZoom:false,keyboard:false,
      zoomSnap:.25,maxZoom:16,minZoom:8,inertia:true,tap:false});
    map.attributionControl.setPrefix(false);
    var base='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
    L.tileLayer(base+'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:16,attribution:'Esri'}).addTo(map);
    L.tileLayer(base+'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:16,maxZoom:16}).addTo(map);

    /* hoteles: TODOS el mismo punto metálico, sin números */
    slides.forEach(function(s,i){
      var ll=L.latLng(parseFloat(s.dataset.lat),parseFloat(s.dataset.lng));
      var mk=L.marker(ll,{icon:L.divIcon({className:'hsx-pin',html:'<span class="hsx-dot"></span>',iconSize:[44,44],iconAnchor:[22,22]}),
        title:s.dataset.nombre,keyboard:true,riseOnHover:true}).addTo(map);
      mk.on('click',function(){openFicha(i);});
      items.push({ll:ll,mk:mk,s:s});
    });
    /* recepción / ceremonia: píldora clara con piquito */
    var vll=L.latLng(parseFloat(el.dataset.lat),parseFloat(el.dataset.lng));
    venue=L.marker(vll,{icon:L.divIcon({className:'hsx-pin',html:'<span class="hsx-pill">'+el.dataset.label+'</span>',iconSize:[0,0],iconAnchor:[0,0]}),
      interactive:false,keyboard:false,zIndexOffset:500}).addTo(map);
    items.push({ll:vll,mk:venue,s:null});

    map.on('zoomend',spread);
    map.on('click',closeFicha);
    fitAll(false);

    /* controles propios */
    var ctl=$('#hsxCtl');
    L.DomEvent.disableClickPropagation(ctl);
    ctl.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b) return;
      var a=b.getAttribute('data-act');
      if(a==='in')map.zoomIn(1);else if(a==='out')map.zoomOut(1);else{closeFicha();fitAll(true);}
    });
    L.DomEvent.disableClickPropagation(ficha);
    $('#hsxFx').addEventListener('click',closeFicha);

    /* móvil: un dedo hace scroll de la página, dos dedos mueven el mapa */
    if(touch){
      var mt=0;
      el.addEventListener('touchstart',function(e){
        if(e.touches.length>=2)map.dragging.enable();else map.dragging.disable();
      },{passive:true});
      el.addEventListener('touchmove',function(e){
        if(e.touches.length===1&&msg){
          msg.classList.add('on');clearTimeout(mt);mt=setTimeout(function(){msg.classList.remove('on');},1500);
        }
      },{passive:true});
      el.addEventListener('touchend',function(e){if(e.touches.length<2)map.dragging.disable();},{passive:true});
    }
    setTimeout(function(){map.invalidateSize();fitAll(false);},120);
  }
  function fitAll(animate){
    if(!map) return;
    var L=window.L,b=L.latLngBounds(items.map(function(it){return it.ll;}));
    map.fitBounds(b,{paddingTopLeft:[48,58],paddingBottomRight:[48,66],maxZoom:15,animate:!!animate&&!reduce});
    setTimeout(spread,animate?500:0);
  }
  /* nada encimado: marcadores a < 28 px se separan con offset */
  function spread(){
    if(!map) return;
    var L=window.L,pts=items.map(function(it){return map.latLngToContainerPoint(it.ll);});
    for(var i=0;i<items.length;i++){
      var p=pts[i];
      for(var j=0;j<i;j++){
        var q=pts[j];
        if(Math.hypot(p.x-q.x,p.y-q.y)<28){var a=i*2.4+.5;p=L.point(q.x+Math.cos(a)*30,q.y+Math.sin(a)*30);}
      }
      pts[i]=p;
      items[i].mk.setLatLng(map.containerPointToLatLng(p));
    }
  }
  function openFicha(i){
    var it=items[i],s=it.s;if(!s||!map) return;
    selIdx=i;
    items.forEach(function(x,k){var e=x.mk.getElement&&x.mk.getElement();if(e&&x.s)e.classList.toggle('sel',k===i);});
    $('#hsxFt').textContent=s.dataset.tipo;
    $('#hsxFn').textContent=s.dataset.nombre;
    $('#hsxFa').textContent=s.dataset.dir;
    $('#hsxFd').textContent=s.dataset.mi+' mi · '+s.dataset.min+' min a la recepción';
    $('#hsxFu').href=s.dataset.ubic;
    $('#hsxFr').href=s.dataset.res;
    ficha.classList.add('on');ficha.setAttribute('aria-hidden','false');
    hint.classList.add('off');                 /* el aviso se oculta tras el primer toque */
    var mh=map.getSize().y,fh=ficha.offsetHeight||170;
    var vis=Math.max(60,mh-fh-10),ty=Math.max(28,vis/2);                  /* el punto queda centrado en la franja libre sobre la ficha */
    var z=Math.max(map.getZoom(),13),pt=map.project(it.ll,z);pt.y+=(mh/2-ty);
    var c=map.unproject(pt,z);
    if(reduce)map.setView(c,z,{animate:false});else map.flyTo(c,z,{duration:.9,easeLinearity:.3});
  }
  function closeFicha(){
    selIdx=-1;
    if(ficha){ficha.classList.remove('on');ficha.setAttribute('aria-hidden','true');}
    items.forEach(function(x){var e=x.mk.getElement&&x.mk.getElement();if(e)e.classList.remove('sel');});
  }
})();
