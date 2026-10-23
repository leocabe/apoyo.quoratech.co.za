"""Valida recursos e limites da versão estática antes de publicar."""
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'docs'
expected = {'index.html', 'styles.css', 'script.js', 'config.js', '.nojekyll'}
assert {p.name for p in root.iterdir()} == expected, 'Arquivos inesperados na pasta pública'

class Resources(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value and not value.startswith(('https://', 'http://', '#')):
                assert not value.startswith('/'), f'Caminho incompatível com subpasta: {value}'
                target = (root / value).resolve()
                assert target.is_relative_to(root.resolve()) and target.is_file(), f'Recurso inválido: {value}'

html = (root / 'index.html').read_text()
Resources().feed(html)
script = (root / 'script.js').read_text()
assert html.index('config.js') < html.index('script.js')
assert '/api/' not in script, 'O Pages não executa API'
assert 'selectedAmount' not in script, 'O valor deve ser escolhido no Stripe'
assert "paymentState==='success'" not in script, 'URL de retorno não confirma pagamentos'
for path in root.iterdir():
    text = path.read_text()
    assert 'sk_live_' not in text and 'sk_test_' not in text, 'Chave secreta nos arquivos públicos'
print('OK: recursos, subpastas, configuração e checkout estático.')
