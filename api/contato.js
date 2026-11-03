// Recebe o formulário do site, salva o contato no Supabase (projeto SaltSite)
// e envia um aviso por e-mail para contato@salttechsolution.com.br.
// A senha de app do Google fica só no servidor, na variável de ambiente SMTP_PASS da Vercel.
// Sem SMTP_PASS configurada, responde 503 e o site volta a abrir o e-mail como antes.

const nodemailer = require('nodemailer');

const SUPABASE_URL = 'https://mvkbcxbmzhnzrfnhxdjj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_U1SugfBse4bBU5boEsqUBg_v3m7q6CR'; // chave pública: só grava contatos
const SMTP_USER = process.env.SMTP_USER || 'contato@salttechsolution.com.br';
const DESTINO = process.env.CONTATO_DESTINO || 'contato@salttechsolution.com.br';

const SERVICOS = ['Loja Nuvemshop', 'Loja Shopify', 'Landing page', 'Captura de leads + mini CRM', 'Tráfego pago', 'Infraestrutura de TI', 'Sistema sob medida'];
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const porIp = new Map(); // limite simples: até 5 envios por IP a cada 10 min

function responder(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
const txt = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const parte of req) { raw += parte; if (raw.length > 20000) throw new Error('grande'); }
  return JSON.parse(raw || '{}');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Use POST.' });
  if (!process.env.SMTP_PASS) return responder(res, 503, { erro: 'Envio por e-mail ainda não configurado.' });

  let b;
  try { b = await lerCorpo(req); } catch { return responder(res, 400, { erro: 'Dados inválidos.' }); }

  // Robôs: campo escondido preenchido ou formulário enviado rápido demais.
  if (b.x_conf || (Number(b.t) && Number(b.t) < 1500)) {
    console.warn('Descartado como robô', { honeypot: !!b.x_conf, t: b.t });
    return responder(res, 200, { ok: true });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const agora = Date.now(), reg = porIp.get(ip);
  if (reg && agora - reg.ts < 600000 && reg.n >= 5) return responder(res, 429, { erro: 'Muitos envios. Tente de novo em alguns minutos.' });
  porIp.set(ip, reg && agora - reg.ts < 600000 ? { n: reg.n + 1, ts: reg.ts } : { n: 1, ts: agora });

  let whatsapp = String(b.whatsapp || '').replace(/\D/g, '');
  if (whatsapp.length === 10 || whatsapp.length === 11) whatsapp = '55' + whatsapp;
  const dados = {
    nome: txt(b.nome, 120),
    whatsapp: /^[0-9]{12,15}$/.test(whatsapp) ? whatsapp : null,
    email: txt(b.email, 200),
    rede_social: txt(b.rede_social, 200),
    negocio: txt(b.negocio, 160),
    servicos: Array.isArray(b.servicos) ? b.servicos.filter(s => SERVICOS.includes(s)) : [],
    mensagem: txt(b.mensagem, 2000),
    canal: 'email',
    fbclid: txt(b.fbclid, 500)
  };
  UTM.forEach(k => { dados[k] = txt(b[k], 200); });
  if (dados.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dados.email)) dados.email = null;
  if (!dados.nome || !dados.whatsapp) return responder(res, 400, { erro: 'Preencha seu nome e WhatsApp com DDD.' });

  // 1) Salva no Supabase (se falhar, ainda manda o e-mail para o contato não se perder).
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/contatos`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(dados)
    });
    if (!r.ok) console.error('Supabase', r.status, await r.text());
  } catch (e) { console.error('Supabase', e); }

  // 2) Avisa por e-mail.
  const w = dados.whatsapp;
  const wFmt = w.length >= 12 ? `(${w.slice(2, 4)}) ${w.slice(4, -4)}-${w.slice(-4)}` : w;
  const linhas = [
    ['Nome', dados.nome],
    ['WhatsApp', wFmt],
    ['E-mail', dados.email],
    ['Instagram/site', dados.rede_social],
    ['Trabalha com', dados.negocio],
    ['Serviços', dados.servicos.join(', ')],
    ['Mensagem', dados.mensagem],
    ['Origem', [dados.utm_source, dados.utm_campaign, dados.utm_content].filter(Boolean).join(' / ')]
  ].filter(l => l[1]);

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#061033;font-size:14px;line-height:1.5">
<p style="font-size:16px;margin:0 0 12px"><b>Novo contato pelo site da SALT</b></p>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">${linhas.map(([k, v]) =>
    `<tr><td style="color:#5B6785;vertical-align:top;padding-right:14px">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>
<p style="margin:16px 0 0"><a href="https://wa.me/${w}" style="background:#0068FF;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block;font-weight:bold">Responder no WhatsApp</a></p>
</div>`;
  const texto = linhas.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nResponder no WhatsApp: https://wa.me/${w}`;

  try {
    const smtp = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: SMTP_USER, pass: process.env.SMTP_PASS } });
    await smtp.sendMail({
      from: `"Site SALT" <${SMTP_USER}>`,
      to: DESTINO,
      replyTo: dados.email ? `"${dados.nome.replace(/"/g, '')}" <${dados.email}>` : undefined,
      subject: `Novo contato pelo site: ${dados.nome}${dados.servicos.length ? ' (' + dados.servicos.join(', ') + ')' : ''}`,
      text: texto,
      html
    });
  } catch (e) {
    console.error('SMTP', e && e.message);
    return responder(res, 502, { erro: 'Não foi possível enviar agora.' });
  }
  return responder(res, 200, { ok: true });
};
