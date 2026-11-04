/* Banner de cookies e Google Analytics do site da SALT.
   - O Google Analytics só é carregado DEPOIS que a pessoa clica em "Aceitar".
   - "Aceitar" e "Recusar" têm o mesmo peso visual (orientação da ANPD).
   - A escolha fica salva no navegador por 12 meses; depois o banner aparece de novo.
   - Para reabrir: qualquer link com data-cookies="abrir" (ex.: "Preferências de cookies" no rodapé).
   - Enquanto GA_ID estiver vazio, não há cookies opcionais e o banner não aparece. */
(function () {
  var GA_ID = 'G-K1LGJRSK7P'; // ID de medição do Google Analytics 4, ex.: 'G-ABC123XYZ'
  var CHAVE = 'salt_cookies';
  var VERSAO = 1;
  var VALIDADE = 365 * 24 * 60 * 60 * 1000;

  function ler() {
    try {
      var c = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (c && c.v === VERSAO && Date.now() - c.ts < VALIDADE) return c;
    } catch (e) {}
    return null;
  }
  function salvar(aceito) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ v: VERSAO, analytics: aceito, ts: Date.now() })); } catch (e) {}
  }

  var gaCarregado = false;
  function carregarGA() {
    if (!GA_ID || gaCarregado) return;
    gaCarregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }
  function apagarCookiesGA() {
    document.cookie.split(';').forEach(function (c) {
      var nome = c.split('=')[0].trim();
      if (/^_ga/.test(nome)) {
        var dominio = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + dominio, '; domain=.' + dominio].forEach(function (d) {
          document.cookie = nome + '=; Max-Age=0; path=/' + d;
        });
      }
    });
  }

  // Eventos para o Analytics (só funcionam se a pessoa aceitou).
  window.saltTrack = function (evento, params) {
    if (gaCarregado && window.gtag) window.gtag('event', evento, params || {});
  };

  var css = '\
#cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:50;max-width:560px;margin:0 auto;background:#0F1B45;color:#EEF2FA;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:20px 20px 18px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:400 15px/1.55 Lato,system-ui,-apple-system,"Segoe UI",sans-serif}\
#cookie-banner p{margin:0 0 14px;color:#C9D2EA}\
#cookie-banner a{color:#2EDDD8}\
#cookie-banner .cb-acoes{display:grid;grid-template-columns:1fr 1fr;gap:10px}\
#cookie-banner button{font:700 15px/1 Lato,system-ui,sans-serif;padding:13px 10px;border-radius:10px;cursor:pointer;background:transparent;color:#EEF2FA;border:1.5px solid rgba(255,255,255,.4)}\
#cookie-banner button:hover{border-color:#2EDDD8;color:#2EDDD8}\
#cookie-banner button:focus-visible{outline:2px solid #2EDDD8;outline-offset:2px}';

  function mostrarBanner() {
    if (!GA_ID || document.getElementById('cookie-banner')) return;
    if (!document.getElementById('cookie-css')) {
      var st = document.createElement('style'); st.id = 'cookie-css'; st.textContent = css; document.head.appendChild(st);
    }
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Preferências de cookies');
    b.innerHTML = '<p>Usamos cookies do Google Analytics para entender como o site é usado e melhorar nossos anúncios. ' +
      'Eles só são ativados se você aceitar. Saiba mais na <a href="/privacidade.html#cookies">Política de Privacidade</a>.</p>' +
      '<div class="cb-acoes"><button type="button" data-escolha="recusar">Recusar</button>' +
      '<button type="button" data-escolha="aceitar">Aceitar</button></div>';
    b.addEventListener('click', function (e) {
      var esc = e.target.getAttribute && e.target.getAttribute('data-escolha');
      if (!esc) return;
      var aceito = esc === 'aceitar';
      salvar(aceito);
      b.remove();
      if (aceito) carregarGA();
      else { apagarCookiesGA(); if (gaCarregado) location.reload(); }
    });
    document.body.appendChild(b);
  }

  function iniciar() {
    var c = ler();
    if (c && c.analytics) carregarGA();
    else if (!c) mostrarBanner();
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-cookies="abrir"]');
      if (!a) return;
      e.preventDefault();
      mostrarBanner();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
