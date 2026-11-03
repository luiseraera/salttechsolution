# Site da SALT Tech Solution

Site institucional da SALT: lojas Nuvemshop e Shopify, landing pages, leads + mini CRM, tráfego pago e sistemas sob medida.

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
