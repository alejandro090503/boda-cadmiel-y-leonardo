/* INSERTAR: en un <script> propio antes de </body> (GSAP ya cargado). Diamantina dorada: destellos que caen, giran en 3D y titilan. */
(function(){
  if(!window.gsap) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var N = innerWidth < 700 ? 14 : 26;
  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden','true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2;perspective:600px';
  document.body.appendChild(layer);
  var tweens = [];
  var rnd = function(a,b){ return a + Math.random()*(b-a); };
  for(var i=0;i<N;i++){
    var big = i % 4 === 0;                       // 1 de cada 4: mas grande y desenfocada
    var star = Math.random() < .6;
    var src = 'assets/particula-' + (star ? 'destello' : 'polvo') + (big ? '-b' : '') + '.webp';
    var el = new Image();
    el.alt = ''; el.decoding = 'async'; el.draggable = false;
    el.onerror = function(){ this.remove(); };
    el.src = src;
    var size = big ? rnd(34,52) : (star ? rnd(12,22) : rnd(6,11));
    var peak = big ? rnd(.2,.32) : rnd(.3,.5);
    el.style.cssText = 'position:absolute;left:0;top:0;width:'+size+'px;height:auto;opacity:0;will-change:transform,opacity;transform-style:preserve-3d';
    layer.appendChild(el);
    var x0 = rnd(0, innerWidth), H = innerHeight;
    gsap.set(el,{x:x0,y:-60,transformPerspective:600});
    // caida con negativo para que desde el inicio haya diamantina repartida
    var dur = rnd(11,19);
    var fall = gsap.to(el,{y:H+60,duration:dur,ease:'none',repeat:-1,delay:-rnd(0,dur),
      onRepeat:(function(e){return function(){ gsap.set(e,{x:rnd(0,innerWidth)}); };})(el)});
    var sway = gsap.to(el,{x:'+='+rnd(-40,40),duration:rnd(3,5),ease:'sine.inOut',yoyo:true,repeat:-1});
    var flip = gsap.to(el,{rotationX:rnd(50,85)*(Math.random()<.5?-1:1),rotationY:rnd(50,85)*(Math.random()<.5?-1:1),
      rotation:rnd(-40,40),duration:rnd(1.6,3.2),ease:'sine.inOut',yoyo:true,repeat:-1});
    var twk = gsap.fromTo(el,{opacity:peak*.15},{opacity:peak,duration:rnd(.5,1.5),ease:'sine.inOut',yoyo:true,repeat:-1,delay:rnd(0,1.5)});
    tweens.push(fall,sway,flip,twk);
  }
  // solo con la pestana visible
  document.addEventListener('visibilitychange',function(){
    tweens.forEach(function(t){ document.hidden ? t.pause() : t.resume(); });
  });
  if(document.hidden) tweens.forEach(function(t){ t.pause(); });
})();
