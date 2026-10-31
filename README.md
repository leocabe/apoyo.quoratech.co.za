# Pedrinho Guerreiro

Landing page estática e responsiva da campanha Pedrinho Guerreiro, em inglês, com doações em dólar e checkout via UniversePay.

## Publicar na Vercel

1. Importe este repositório no painel da Vercel.
2. Use o preset **Other**.
3. Não defina comando de build.
4. O diretório de saída já está configurado como `dist` em `vercel.json`.
5. Clique em **Deploy**.

O projeto não depende de variáveis de ambiente nem de instalação de pacotes.

## Publicar no GitHub Pages

1. Envie **todo o conteúdo desta pasta** para a raiz do repositório no GitHub, incluindo `index.html` e a pasta `dist/`.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch publicada (por exemplo, `main`) e a pasta `/(root)`, depois clique em **Save**.
5. Aguarde a publicação e abra o endereço indicado nessa página. O `index.html` da raiz encaminha para `dist/index.html`.

Não selecione apenas a pasta `dist/`: o GitHub Pages permite publicar a raiz ou `/docs`, e a entrada da raiz deste repositório encaminha para a página em `dist/`.

Os parâmetros `utm_*` presentes no endereço da campanha, bem como os identificadores de publicidade disponibilizados pela UTMify, são agora acrescentados ao URL do checkout UniversePay junto com o valor da doação.

## Estrutura

- `dist/index.html`: página principal.
- `dist/styles.css`: estilos e responsividade.
- `dist/script.js`: interações e checkout.
- `dist/assets/`: imagens locais.
- `index.html`: entrada para publicação no GitHub Pages.
- `vercel.json`: configuração de deploy da Vercel.
