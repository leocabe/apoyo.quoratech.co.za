const donors=[['María González',100,'Registro informado'],['Carlos Ramírez',25,'Registro informado'],['Lucía Fernández',50,'Registro informado'],['Javier Morales',25,'Registro informado'],['Sofía Herrera',25,'Registro informado'],['Andrés Vargas',100,'Registro informado'],['Camila Torres',25,'Registro informado'],['Diego Castillo',50,'Registro informado'],['Valentina Ruiz',25,'Registro informado'],['Miguel Ortega',25,'Registro informado'],['Isabella Pérez',25,'Registro informado'],['Rodrigo Mendoza',50,'Registro informado'],['Daniela Rojas',25,'Registro informado'],['Fernando Silva',25,'Registro informado'],['Gabriela Ávila',25,'Registro informado'],['Pablo Cárdenas',25,'Registro informado'],['Elena Navarro',25,'Registro informado'],['Sebastián Ríos',25,'Registro informado'],['Paula Delgado',25,'Registro informado'],['Ricardo Aguilar',25,'Registro informado'],['Natalia Soto',25,'Registro informado'],['Alejandro Vega',25,'Registro informado'],['Mónica Salinas',25,'Registro informado'],['Tomás Guzmán',25,'Registro informado'],['Renata Peña',25,'Registro informado'],['Hugo Bautista',25,'Registro informado'],['Carolina Ibarra',25,'Registro informado'],['Óscar Miranda',25,'Registro informado']];
const list=document.querySelector('#donors');
list.innerHTML=donors.map(([name,amount,ago])=>`<li><span class="donor-left"><span class="avatar">${name[0]}</span><span class="donor-name">${name}<small class="ago">${ago}</small></span></span><b class="donor-amount">$${amount}</b></li>`).join('');

const modal=document.querySelector('#donation-modal');
const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''};
document.querySelectorAll('[data-donate]').forEach(button=>button.addEventListener('click',openModal));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',closeModal));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});

const continueButton=document.querySelector('#continue');
const toast=document.querySelector('#toast');
const showToast=(message,duration=3600)=>{toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),duration)};
continueButton.addEventListener('click',()=>{
  const paymentLink=window.SITE_CONFIG?.stripePaymentLink?.trim();
  if(!paymentLink){showToast('Las donaciones aún no están disponibles. Vuelve más tarde.',5000);return}
  let target;
  try{target=new URL(paymentLink)}catch{showToast('El enlace de pago no es válido.');return}
  if(target.protocol!=='https:'||target.hostname!=='buy.stripe.com'){showToast('El enlace de Stripe no es válido.');return}
  window.location.assign(target.href);
});
document.querySelector('#cookies').addEventListener('click',()=>{toast.textContent='Preferencias de cookies abertas em modo demonstrativo.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)});
