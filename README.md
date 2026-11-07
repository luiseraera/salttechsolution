# Site da SALT Tech Solution

Site institucional da SALT: lojas Nuvemshop e Shopify, landing pages, leads + mini CRM, tráfego pago, infraestrutura de TI e sistemas sob medida.

- Publicado na Vercel (projeto `salttechsolution`): https://salttechsolution.com.br (DNS no Registro.br; também em salttechsolution.vercel.app)
- E-mail oficial: contato@salttechsolution.com.br (Google Workspace)
- Cada envio para a branch `main` publica automaticamente em produção.

## Estrutura
- `index.html`: página completa (HTML, CSS e JavaScript).
- `img/`: logo oficial da SALT (`logo-salt-original.png` em alta, `logo-salt.png` para o site), o "S" em degradê (`s-gradiente.png`) e o favicon.
- `fonts/`: Saira Condensed (títulos) e Lato (textos), com licenças.

## Identidade visual
Azul-marinho `#061033`, azul SALT `#0068FF`, turquesa `#2EDDD8`, claro `#EDF1F8`.

## Contato no site
O número do WhatsApp fica na constante `WHATSAPP`, no fim do `index.html`.

## Como alterar
Edite os arquivos e envie para a `main`; a Vercel publica em cerca de 1 minuto.

Repositório ligado à Vercel: publicação automática a cada envio para a `main`.

## Contatos do formulário (Supabase)
Cada clique em "Enviar no WhatsApp", "Enviar por e-mail" ou "Copiar mensagem" grava o contato (nome e WhatsApp obrigatórios; e-mail e Instagram/site opcionais) na tabela `contatos` do projeto **SaltSite** no Supabase, junto com a origem do anúncio (`utm_*` e `fbclid`, quando vierem no link).
- O site só tem permissão de **gravar**: ninguém consegue ler os contatos pelo site.
- Para ver: Supabase > SaltSite > Table Editor > `contatos`. A coluna `status` (novo, em conversa, proposta enviada, fechado, perdido) e `observacoes` servem de mini CRM.

## Envio direto por e-mail (`api/contato.js`)
O botão "Enviar por e-mail" manda a mensagem direto para contato@salttechsolution.com.br, sem abrir o e-mail da pessoa, e salva o contato no Supabase.
- Usa o SMTP do Google Workspace com uma **senha de app** da conta contato@, guardada na variável de ambiente `SMTP_PASS` da Vercel (projeto `salttechsolution`).
- Sem `SMTP_PASS`, o botão volta ao comportamento antigo (abre o e-mail com a mensagem pronta).
- Proteções: campo escondido contra robôs, tempo mínimo de preenchimento e limite de 5 envios por IP a cada 10 minutos.

## Privacidade, cookies e Google Analytics
- `privacidade.html`: Política de Privacidade do site (link no rodapé e embaixo do formulário).
- `cookies.js`: banner de cookies com "Aceitar" e "Recusar" do mesmo peso. O Google Analytics só carrega depois do "Aceitar". A escolha vale 12 meses e pode ser mudada em "Preferências de cookies" (rodapé).
- O ID do Google Analytics fica na constante `GA_ID`, no início do `cookies.js`. Vazio = sem banner e sem Analytics.
- Eventos enviados ao Analytics: `generate_lead` (method: whatsapp ou email) quando alguém envia o formulário.

## Página de links (`links/index.html`)
Página para a bio do Instagram: **salttechsolution.com.br/links/?utm_source=instagram&utm_medium=bio** (atalho para a bio: **salttechsolution.com.br/ig**, configurado no `vercel.json`).
- O WhatsApp fica na constante `WHATSAPP` dentro de `links/index.html` (troque junto com a do `index.html`).
- A mensagem do WhatsApp e o assunto do e-mail levam a origem e um código curto, ex.: "Vim pelo Instagram… (ref: IG-BIO)". O código vem dos parâmetros `utm_*` do link (ex.: `?utm_source=meta&utm_medium=ads&utm_campaign=blackfriday` → `META-ADS-BLACKFRIDAY`).
- Os botões que levam ao site repassam os `utm_*`, então o formulário do site grava a origem no contato.
- Cada clique é gravado na tabela `cliques` do Supabase SaltSite (botão, origem, código, celular/computador). O site só grava; para ver: Supabase > SaltSite > Table Editor > `cliques`.
