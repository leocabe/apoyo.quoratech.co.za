const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const body=document.body, menu=$('#sideMenu'), backdrop=$('#menuBackdrop'), menuBtn=$('#menuButton');
function setMenu(open){menu.classList.toggle('open',open);backdrop.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));menuBtn.setAttribute('aria-expanded',String(open));body.classList.toggle('locked',open)}
menuBtn.addEventListener('click',()=>setMenu(true)); $('#menuClose').addEventListener('click',()=>setMenu(false)); backdrop.addEventListener('click',()=>setMenu(false)); $$('.side-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
$('#shareButton').addEventListener('click',async()=>{const data={title:document.title,text:"Learn Pedrinho Guerreiro's story",url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);toast('Link copied!')}}catch(e){}});

$$('[data-carousel]').forEach(carousel=>{const track=$('.carousel-track',carousel), slides=[...track.children], dotsWrap=carousel.nextElementSibling;let index=0,startX=0,drag=false;
  slides.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Go to item ${i+1}`);b.addEventListener('click',()=>go(i));dotsWrap.appendChild(b)});
  const dots=$$('button',dotsWrap);function go(i){index=(i+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`;dots.forEach((d,n)=>d.classList.toggle('active',n===index))}go(0);
  $('.prev',carousel).addEventListener('click',()=>go(index-1));$('.next',carousel).addEventListener('click',()=>go(index+1));
  track.addEventListener('pointerdown',e=>{startX=e.clientX;drag=true;track.setPointerCapture(e.pointerId)});track.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-startX;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));drag=false});
});

const bankToggle=$('#bankToggle'), bankPanel=$('#bankPanel');if(bankToggle&&bankPanel)bankToggle.addEventListener('click',()=>{const open=bankToggle.getAttribute('aria-expanded')==='true';bankToggle.setAttribute('aria-expanded',String(!open));bankPanel.classList.toggle('open',!open)});
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);const old=b.textContent;b.textContent='Copied!';toast('Copied');setTimeout(()=>b.textContent=old,1500)}catch(e){toast('Select and copy manually')}}));

const modal=$('#donationModal'), step1=$('[data-step="1"]'), step2=$('[data-step="2"]'), continueBtn=$('#continueDonation'), selectedLabel=$('#selectedAmount'), input=$('#customAmount'), addTenPercent=$('#addTenPercent'), boostTotal=$('#boostTotal');let chosen='';
const MIN_DONATION=15, chosenAmount=()=>Number(String(chosen).replace('$',''));
const formatAmount=value=>`$${value.toFixed(2)}`;
const TRACKING_PARAMS=new Set(['gclid','fbclid','ttclid','tbclid','gbraid','wbraid','msclkid','src','xcod','sck']);
function appendTrackingParameters(url){
  const params=new URLSearchParams(location.search);
  window.utmParams?.forEach((value,key)=>{
    const normalizedKey=key.toLowerCase();
    if((normalizedKey.startsWith('utm_')||TRACKING_PARAMS.has(normalizedKey))&&!params.has(key))params.set(key,value);
  });
  params.forEach((value,key)=>{
    const normalizedKey=key.toLowerCase();
    if(normalizedKey.startsWith('utm_')||TRACKING_PARAMS.has(normalizedKey))url.searchParams.set(key,value);
  });
}
const checkoutUrl=()=>{const amount=chosenAmount()*(addTenPercent.checked?1.1:1),url=new URL('https://universepay.online/pay/295ee2f2-91d8-4f8e-a82b-927089c1676c');url.searchParams.set('amount',amount.toFixed(2));appendTrackingParameters(url);return url.toString()};
function updateDonationTotal(){const amount=chosenAmount();boostTotal.textContent=amount&&addTenPercent.checked?formatAmount(amount*1.1):''}
function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');body.classList.add('locked');step1.classList.remove('hidden');step2.classList.add('hidden');addTenPercent.checked=false;updateDonationTotal();setTimeout(()=>$('.amounts button',modal)?.focus(),30)}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');body.classList.remove('locked')}
$$('.js-donate').forEach(b=>b.addEventListener('click',openModal));$$('[data-close]').forEach(b=>b.addEventListener('click',closeModal));
$$('.amounts button').forEach(b=>b.addEventListener('click',()=>{$$('.amounts button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');chosen=b.childNodes[0].textContent.trim();input.value='';continueBtn.disabled=false;updateDonationTotal()}));
input.addEventListener('input',()=>{$$('.amounts button').forEach(x=>x.classList.remove('selected'));chosen=input.value?`$${input.value}`:'';continueBtn.disabled=!(chosenAmount()>=MIN_DONATION);updateDonationTotal()});
addTenPercent.addEventListener('change',updateDonationTotal);
continueBtn.addEventListener('click',()=>{const baseAmount=chosenAmount();if(!(baseAmount>=MIN_DONATION))return;location.href=checkoutUrl()});$('#backDonation').addEventListener('click',()=>{step2.classList.add('hidden');step1.classList.remove('hidden')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();setMenu(false)}});

$('#playButton').addEventListener('click',()=>toast('The full story will be available soon'));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(el=>observer.observe(el));
let toastTimer;function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
