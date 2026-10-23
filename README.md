# Publicar no GitHub Pages

A pasta `docs/` contém o site pronto para publicação. Os arquivos de Vercel e Worker foram preservados, mas não são executados pelo GitHub Pages.

## Publicação automática (recomendada)

O arquivo `.github/workflows/pages.yml` gera, valida e publica o site a cada envio à branch `main`. Envie o projeto completo e, em **Settings → Pages → Source**, escolha **GitHub Actions**. Para executar novamente sem alterar arquivos, use **Actions → Publicar no GitHub Pages → Run workflow**.

A publicação exige acesso autenticado ao repositório. O link público do Stripe precisa ser preenchido em `pages-config.js` antes do envio. O fluxo não cria conta Stripe nem inventa dados de pagamentos.

## Subir este projeto completo sem o fluxo automático

1. Envie os arquivos deste projeto para o seu repositório no GitHub, incluindo a pasta `docs`. Não envie `.env`, `.git`, `dist`, `public` ou `.DS_Store`.
2. Abra **Settings → Pages** no repositório.
3. Em **Source**, escolha **Deploy from a branch**.
4. Selecione a branch usada (normalmente `main`) e a pasta **/docs**. Clique em **Save**.
5. Aguarde a publicação. O endereço será mostrado nessa mesma tela, normalmente `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Opção mais simples: ZIP de publicação

O arquivo `github-pages-pronto.zip`, na pasta Donation, contém apenas o site público. Extraia o ZIP e envie **os arquivos de dentro dele** diretamente para a raiz do repositório. O `index.html` deve ficar na raiz. Nesse caso, escolha **main → /(root)** nas configurações do Pages, em vez de `/docs`.

## Ativar as doações

O GitHub Pages só hospeda arquivos estáticos e não executa a API de checkout existente. Por isso, esta versão usa um Stripe Payment Link:

1. Crie no Stripe um Payment Link com a opção de o cliente escolher quanto pagar, em USD.
2. No arquivo `docs/config.js`, preencha `stripePaymentLink` com o link público `https://buy.stripe.com/...`.
3. Envie a alteração ao GitHub. Se usar o ZIP, edite o `config.js` da raiz.

Sem esse link, o botão informa que as doações ainda não estão disponíveis. O valor será escolhido no Stripe. Nunca coloque `STRIPE_SECRET_KEY` ou qualquer chave secreta nos arquivos públicos. O retorno de checkout, por si só, não comprova um pagamento; confirme as doações no painel do Stripe.

## Atualizar o site

Edite os arquivos em `site/` e a configuração em `pages-config.js`, depois execute:

```sh
python3 scripts/build-pages.py
```

Envie também a pasta `docs/` atualizada. Não é necessário instalar dependências.

O vídeo, as fontes e os scripts de rastreamento continuam dependendo dos serviços externos originais. Os nomes dos doadores, valores e contadores são dados fixos no código; não recebem atualizações automáticas de pagamentos.

Instruções oficiais: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
