/* INSERTAR: <script> propio al final de index.html (después del script que define aud/vBtn/startMusic). No toca el audio: solo aria, inercia al frenar y evita reiniciar si ya suena */
(function(){
  var btn=document.getElementById('vinyl-btn');
  if(!btn) return;
  var spin=btn.querySelector('.vn-spin');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ang=0,preAng=0,coast=null,was=btn.classList.contains('is-playing');

  /* No reiniciar la canción si ya suena (startMusic del script principal pone currentTime=0) */
  try{
    var au=document.getElementById('bgMusic');
    if(typeof window.startMusic==='function'&&au&&!window.startMusic.__ely){
      var orig=window.startMusic;
      window.startMusic=function(){
        if(!au.paused){btn.classList.add('is-playing');return;}
        return orig.apply(this,arguments);
      };
      window.startMusic.__ely=1;
    }
  }catch(e){}

  function curAngle(){
    try{
      var m=getComputedStyle(spin).transform;
      if(!m||m==='none') return ang;
      var v=m.match(/matrix\(([^)]+)\)/); if(!v) return ang;
      var p=v[1].split(',');
      return (Math.atan2(parseFloat(p[1]),parseFloat(p[0]))*180/Math.PI+360)%360;
    }catch(e){return ang;}
  }
  /* ángulo justo antes de que el handler existente quite .is-playing */
  btn.addEventListener('click',function(){ if(btn.classList.contains('is-playing')) preAng=curAngle(); },true);

  function sync(){
    var now=btn.classList.contains('is-playing');
    btn.setAttribute('aria-label',now?'Pausar música':'Reproducir música');
    btn.setAttribute('aria-pressed',now?'true':'false');
    if(now===was) return;
    was=now;
    if(now){
      if(coast){ang=curAngle();coast.cancel();coast=null;}
      spin.style.transform='';
      spin.style.animationDelay=(-(ang/360)*1.8).toFixed(3)+'s';
    }else if(!reduce&&spin.animate){
      var a0=preAng,a1=a0+240;
      spin.style.animationDelay='';
      coast=spin.animate([{transform:'rotate('+a0+'deg)'},{transform:'rotate('+a1+'deg)'}],
        {duration:1300,easing:'cubic-bezier(.12,.7,.2,1)',fill:'forwards'});
      var mine=coast;
      mine.onfinish=function(){
        if(coast!==mine) return;
        ang=a1%360; spin.style.transform='rotate('+ang+'deg)'; mine.cancel(); coast=null;
      };
    }
  }
  if('MutationObserver' in window) new MutationObserver(sync).observe(btn,{attributes:true,attributeFilter:['class']});
  sync();
})();
