const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#load-film')?.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src='https://player.vimeo.com/video/824061382?h=0223bcd008&dnt=1&autoplay=1';frame.title='Wedding Norbert & Joanne Trailer';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;document.querySelector('.film')!.replaceChildren(frame);frame.focus()});
const slides=document.querySelector<HTMLElement>('.slides')!;const items=Array.from(slides?.children??[]) as HTMLElement[];const dots=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slide]'));
let current=0;
function go(i:number){current=Math.max(0,Math.min(i,items.length-1));slides.scrollTo({left:items[current].offsetLeft-slides.offsetLeft,behavior:reduced.matches?'instant':'smooth'});update()}
function update(){document.querySelector<HTMLButtonElement>('.carousel-prev')!.disabled=current===0;document.querySelector<HTMLButtonElement>('.carousel-next')!.disabled=current===items.length-1;dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===current)));items.forEach((item,i)=>{const link=item.querySelector<HTMLAnchorElement>('a');if(link)link.tabIndex=i===current?0:-1})}
document.querySelector('.carousel-prev')?.addEventListener('click',()=>go(current-1));document.querySelector('.carousel-next')?.addEventListener('click',()=>go(current+1));dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
slides?.addEventListener('scroll',()=>{current=Math.round(slides.scrollLeft/slides.clientWidth);update()},{passive:true});
slides?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(current-1)}if(e.key==='ArrowRight'){e.preventDefault();go(current+1)}});update();
