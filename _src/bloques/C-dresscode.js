/* INSERTAR: dentro de un <script> al final de index.html (después de initScroll; no depende de GSAP) */
(function(){
  var sec=document.getElementById('dresscode');
  if(!sec) return;
  /* Jost (texto del cliente): se añade solo si la página aún no lo carga */
  try{
    var hasJost=[].some.call(document.querySelectorAll('link[href*="fonts.googleapis"]'),function(l){return /Jost/.test(l.href)});
    if(!hasJost){var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Jost:wght@500;600&display=swap';document.head.appendChild(lk);}
  }catch(e){}
  document.documentElement.classList.add('dcx-js');
  var items=sec.querySelectorAll('.dcx-rv');
  if(!('IntersectionObserver' in window)){[].forEach.call(items,function(n){n.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        var n=e.target; n.style.transitionDelay=(n.dataset.dl||0)+'ms'; n.classList.add('in'); io.unobserve(n);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  [].forEach.call(items,function(n,i){n.dataset.dl=Math.min(i,4)*70;io.observe(n);});
  /* animaciones solo con la sección en pantalla */
  var vis=new IntersectionObserver(function(es){es[0]&&sec.classList.toggle('is-off',!es[0].isIntersecting);},{rootMargin:'120px 0px'});
  vis.observe(sec);
})();
