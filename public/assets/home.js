(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.cinema-hero');
  if (!hero) return;
  const panels = [...hero.querySelectorAll('.hero-panel')];
  const tabs = [...hero.querySelectorAll('.slide-tab')];
  const pause = hero.querySelector('.carousel-pause');
  let index = 0, elapsed = 0, previous = performance.now(), playing = !reduced;
  let hover = false, focus = false;
  const duration = 7500;
  hero.dataset.active = '0';
  function select(next) {
    index = (next + panels.length) % panels.length; elapsed = 0;
    hero.dataset.active = String(index);
    panels.forEach((panel,i) => {const active=i===index;panel.classList.toggle('is-active',active);panel.setAttribute('aria-hidden',String(!active));panel.inert=!active;});
    tabs.forEach((tab,i) => {tab.classList.toggle('is-active',i===index);tab.setAttribute('aria-current',String(i===index));tab.style.setProperty('--slide-progress','0');});
  }
  tabs.forEach((tab,i) => tab.addEventListener('click',() => select(i)));
  function updatePause(){pause.setAttribute('aria-label',playing?'Pause banner rotation':'Resume banner rotation');pause.innerHTML=`<span aria-hidden="true">${playing?'Ⅱ':'▶'}</span>`;}
  pause.addEventListener('click',() => {playing=!playing;updatePause();});updatePause();
  hero.addEventListener('mouseenter',() => {hover=true;});hero.addEventListener('mouseleave',() => {hover=false;});
  hero.addEventListener('focusin',() => {focus=true;});hero.addEventListener('focusout',e => {focus=hero.contains(e.relatedTarget);});
  hero.addEventListener('keydown',e => {if(e.key==='ArrowRight'){select(index+1);tabs[index].focus();}if(e.key==='ArrowLeft'){select(index-1);tabs[index].focus();}});
  let touchX=null;hero.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;},{passive:true});hero.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>65)select(index+(dx<0?1:-1));touchX=null;},{passive:true});
  const layers=[...document.querySelectorAll('[data-parallax]')];
  let scrollDirty=true;
  const header=document.querySelector('.header');
  addEventListener('scroll',()=>{scrollDirty=true;},{passive:true});addEventListener('resize',()=>{scrollDirty=true;});
  if(!reduced && 'IntersectionObserver' in window){
    document.documentElement.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  function frame(now){
    const delta=Math.min(now-previous,100);previous=now;
    const bounds=hero.getBoundingClientRect();
    if(playing && !hover && !focus && !document.hidden && bounds.bottom>0 && bounds.top<innerHeight){elapsed+=delta;if(elapsed>=duration)select(index+1);}
    tabs[index].style.setProperty('--slide-progress',String(elapsed/duration));
    if(scrollDirty){header.classList.toggle('is-scrolled',scrollY>40);if(!reduced && innerWidth>800){layers.forEach(layer=>{const host=layer.closest('section');const rect=host.getBoundingClientRect();if(rect.bottom>0 && rect.top<innerHeight){const offset=host===hero?-rect.top:(innerHeight/2-rect.top-rect.height/2);const y=Math.max(-90,Math.min(90,offset*Number(layer.dataset.parallax)));layer.style.transform=`translate3d(0,${y}px,0)`;}});}scrollDirty=false;}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
