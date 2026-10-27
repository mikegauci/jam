// Let the initial images, fonts and document finish before the autoplay video
// competes for bandwidth. It still starts automatically, muted and looping.
const hero=document.querySelector<HTMLVideoElement>('#hero-video');
const startHero=()=>{
 if(!hero)return;
 const source=hero.querySelector<HTMLSourceElement>('source[data-src]');
 if(!source)return;
 source.src=source.dataset.src!;hero.load();hero.play().catch(()=>{});
};
hero?.addEventListener('playing',()=>hero.classList.add('is-playing'),{once:true});
if(document.readyState==='complete')startHero();else window.addEventListener('load',startHero,{once:true});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#load-film')?.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src='https://player.vimeo.com/video/824061382?h=0223bcd008&dnt=1&autoplay=1';frame.title='Wedding Norbert & Joanne Trailer';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;document.querySelector('.film')!.replaceChildren(frame);frame.focus()});
const slides=document.querySelector<HTMLElement>('.slides')!;const items=Array.from(slides?.children??[]) as HTMLElement[];const dots=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slide]'));
let current=0;
function go(i:number){current=Math.max(0,Math.min(i,items.length-1));slides.scrollTo({left:items[current].offsetLeft-slides.offsetLeft,behavior:reduced.matches?'instant':'smooth'});update()}
function update(){document.querySelector<HTMLButtonElement>('.carousel-prev')!.disabled=current===0;document.querySelector<HTMLButtonElement>('.carousel-next')!.disabled=current===items.length-1;dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===current)));items.forEach((item,i)=>{const link=item.querySelector<HTMLAnchorElement>('a');if(link)link.tabIndex=i===current?0:-1})}
document.querySelector('.carousel-prev')?.addEventListener('click',()=>go(current-1));document.querySelector('.carousel-next')?.addEventListener('click',()=>go(current+1));dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
slides?.addEventListener('scroll',()=>{current=Math.round(slides.scrollLeft/slides.clientWidth);update()},{passive:true});
slides?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(current-1)}if(e.key==='ArrowRight'){e.preventDefault();go(current+1)}});update();
// Touchscreens use native horizontal scrolling and CSS scroll snapping.
// Mouse pointers need explicit dragging because browsers otherwise drag the image.
let mouseDrag:{pointerId:number;startX:number;startScroll:number;startSlide:number}|undefined;
slides?.addEventListener('dragstart',event=>event.preventDefault());
slides?.addEventListener('pointerdown',event=>{
 if(event.pointerType!=='mouse'||event.button!==0||(event.target as HTMLElement).closest('a,button'))return;
 mouseDrag={pointerId:event.pointerId,startX:event.clientX,startScroll:slides.scrollLeft,startSlide:Math.round(slides.scrollLeft/slides.clientWidth)};
 slides.classList.add('dragging');slides.setPointerCapture(event.pointerId);
});
slides?.addEventListener('pointermove',event=>{
 if(!mouseDrag||event.pointerId!==mouseDrag.pointerId)return;
 event.preventDefault();slides.scrollLeft=mouseDrag.startScroll-(event.clientX-mouseDrag.startX);
});
function finishDrag(event:PointerEvent,cancelled=false){
 if(!mouseDrag||event.pointerId!==mouseDrag.pointerId)return;
 const drag=mouseDrag;mouseDrag=undefined;slides.classList.remove('dragging');
 if(slides.hasPointerCapture(event.pointerId))slides.releasePointerCapture(event.pointerId);
 const distance=event.clientX-drag.startX;
 const target=!cancelled&&Math.abs(distance)>Math.min(60,slides.clientWidth*.12)?drag.startSlide+(distance<0?1:-1):Math.round(slides.scrollLeft/slides.clientWidth);
 go(target);
}
slides?.addEventListener('pointerup',event=>finishDrag(event));
slides?.addEventListener('pointercancel',event=>finishDrag(event,true));
slides?.addEventListener('lostpointercapture',event=>finishDrag(event,true));
