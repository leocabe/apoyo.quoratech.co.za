const donors=[['María González',100,'hoy'],['Carlos Ramírez',25,'hoy'],['Lucía Fernández',50,'hoy'],['Javier Morales',25,'hoy'],['Sofía Herrera',25,'hoy'],['Andrés Vargas',100,'hoy'],['Camila Torres',25,'hoy'],['Diego Castillo',50,'hoy'],['Valentina Ruiz',25,'hoy'],['Miguel Ortega',25,'hoy'],['Isabella Pérez',25,'hoy'],['Rodrigo Mendoza',50,'hoy'],['Daniela Rojas',25,'hoy'],['Fernando Silva',25,'hoy'],['Gabriela Ávila',25,'ayer'],['Pablo Cárdenas',25,'ayer'],['Elena Navarro',25,'ayer'],['Sebastián Ríos',25,'ayer'],['Paula Delgado',25,'ayer'],['Ricardo Aguilar',25,'ayer'],['Natalia Soto',25,'ayer'],['Alejandro Vega',25,'ayer'],['Mónica Salinas',25,'ayer'],['Tomás Guzmán',25,'ayer'],['Renata Peña',25,'ayer'],['Hugo Bautista',25,'ayer'],['Carolina Ibarra',25,'ayer'],['Óscar Miranda',25,'ayer']];
const list=document.querySelector('#donors');
list.innerHTML=donors.map(([name,amount,ago])=>`<li><span class="donor-left"><span class="avatar">${name[0]}</span><span class="donor-name">${name}<small class="ago">${ago}</small></span></span><b class="donor-amount">$${amount}</b></li>`).join('');

const checkoutUrl='https://universepay.online/pay/73d5cea3-fff1-4335-981f-4a7b0bebafc8';
const modal=document.querySelector('#donation-modal');
const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''};
document.querySelectorAll('[data-donate]').forEach(button=>button.addEventListener('click',openModal));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',closeModal));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});
const amountButtons=[...document.querySelectorAll('.amounts button')];
const continueButton=document.querySelector('#continue');
const customInput=document.querySelector('.custom input');
amountButtons.forEach(button=>button.addEventListener('click',()=>{amountButtons.forEach(item=>item.classList.remove('selected'));button.classList.add('selected');customInput.value='';continueButton.textContent=`Continuar con ${button.textContent}`}));
customInput.addEventListener('input',()=>{amountButtons.forEach(item=>item.classList.remove('selected'));continueButton.textContent=`Continuar con $${customInput.value||'0'}`});
continueButton.addEventListener('click',()=>{
  const preset=document.querySelector('.amounts button.selected');
  const amount=Number(customInput.value.trim().replace(',','.')||preset?.textContent.replace('$','')||0);
  if(!Number.isFinite(amount)||amount<15){showToast('La donación mínima es de $15.');return}
  const destination=new URL(checkoutUrl);
  destination.searchParams.set('amount',amount.toFixed(2));
  window.location.assign(destination.toString());
});

const toast=document.querySelector('#toast');
const showToast=(message,duration=3600)=>{toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),duration)};
document.querySelector('#cookies').addEventListener('click',()=>{toast.textContent='Preferencias de cookies abertas em modo demonstrativo.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)});
