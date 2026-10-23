"""Gera somente os arquivos públicos para o GitHub Pages."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
output = root / 'docs'
output.mkdir(exist_ok=True)
for name in ('index.html', 'styles.css', 'script.js'):
    shutil.copy2(root / 'site' / name, output / name)
html = (output / 'index.html').read_text()
html = html.replace('<script src="script.js"></script>', '<script src="config.js"></script>\n    <script src="script.js"></script>')
html = html.replace('<div class="amounts">', '<div class="amounts" style="display:none">')
html = html.replace('<label class="custom-label">', '<label class="custom-label" style="display:none">')
html = html.replace('Elige cuánto quieres donar', 'Haz tu donación')
html = html.replace('Serás redirigido al pago seguro de Stripe.', 'Elige el importe en la página segura de Stripe.')
html = html.replace('Continuar con $25', 'Continuar en Stripe')
html = html.replace('Recaudación en tiempo real', 'Recaudación informada')
html = html.replace('Progreso público en tiempo real', 'Progreso actualizado por la organización')
html = html.replace('<h3>Donaciones recientes</h3>', '<h3>Donaciones informadas</h3>')
html = html.replace('<span>de $2,500</span>', '<span>de $2,500 · actualización manual</span>')
(output / 'index.html').write_text(html)
script = (output / 'script.js').read_text()
amount_start = script.index('const amountButtons=')
amount_end = script.index('const toast=', amount_start)
script = script[:amount_start] + "const continueButton=document.querySelector('#continue');\n" + script[amount_end:]
selected_start = script.index('const selectedAmount=')
selected_end = script.index("continueButton.addEventListener", selected_start)
script = script[:selected_start] + script[selected_end:]
script = script.replace("'hoy'", "'Registro informado'").replace("'ayer'", "'Registro informado'")
start = script.index("continueButton.addEventListener('click',async()=>{")
end = script.index("document.querySelector('#cookies')", start)
script = script[:start] + """continueButton.addEventListener('click',()=>{
  const paymentLink=window.SITE_CONFIG?.stripePaymentLink?.trim();
  if(!paymentLink){showToast('Las donaciones aún no están disponibles. Vuelve más tarde.',5000);return}
  let target;
  try{target=new URL(paymentLink)}catch{showToast('El enlace de pago no es válido.');return}
  if(target.protocol!=='https:'||target.hostname!=='buy.stripe.com'){showToast('El enlace de Stripe no es válido.');return}
  window.location.assign(target.href);
});
""" + script[end:]
(output / 'script.js').write_text(script)
shutil.copy2(root / 'pages-config.js', output / 'config.js')
(output / '.nojekyll').touch()
print(f'GitHub Pages preparado em {output}')
