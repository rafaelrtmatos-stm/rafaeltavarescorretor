/* ============================================================
   MODAL "COMO CHEGAR" — aviso antes de abrir o Google Maps
   Compartilhado por todas as páginas de empreendimentos.
   Uso no botão/link:
     <a href="URL_DO_MAPA" target="_blank" rel="noopener"
        onclick="return comoChegarClick(event, 'URL_DO_MAPA')">
       Como chegar
     </a>
   ============================================================ */
(function () {
  'use strict';

  var pendingUrl = null;
  var overlayEl = null;
  var lastFocusedEl = null;

  function injectStyles() {
    if (document.getElementById('cc-modal-styles')) return;
    var css =
      '.cc-modal-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);' +
      'display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;' +
      '-webkit-tap-highlight-color:transparent}' +
      '.cc-modal-overlay.cc-open{display:flex}' +
      '.cc-modal-box{background:var(--bg2,#111);border:1.5px solid var(--gold,#C9A84C);' +
      'border-radius:16px;max-width:440px;width:100%;padding:30px 26px 26px;' +
      'box-shadow:0 24px 70px rgba(0,0,0,0.65);text-align:left;position:relative;' +
      'box-sizing:border-box;font-family:"Inter",sans-serif;' +
      'animation:cc-modal-in .22s ease-out}' +
      '@keyframes cc-modal-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}' +
      '.cc-modal-icon{width:42px;height:42px;border-radius:50%;background:rgba(201,168,76,0.15);' +
      'border:1.5px solid var(--gold,#C9A84C);display:flex;align-items:center;justify-content:center;' +
      'margin-bottom:16px;font-size:20px}' +
      '.cc-modal-title{font-size:15.5px;font-weight:700;color:var(--gold,#C9A84C);' +
      'margin-bottom:14px;line-height:1.4}' +
      '.cc-modal-text{font-size:13.5px;color:var(--text,#F2EDE4);line-height:1.7;margin-bottom:12px}' +
      '.cc-modal-text:last-of-type{margin-bottom:0}' +
      '.cc-modal-text b{color:var(--gold,#C9A84C)}' +
      '.cc-modal-btn{display:flex;align-items:center;justify-content:center;width:100%;' +
      'margin-top:22px;background:linear-gradient(135deg,#B8902A,#E8C96A,#B8902A);' +
      'background-size:200% 100%;background-position:left;color:#000;border:none;' +
      'padding:15px 20px;border-radius:100px;font-size:12.5px;font-weight:700;' +
      'letter-spacing:1.2px;text-transform:uppercase;cursor:pointer;transition:all .3s;' +
      'font-family:"Inter",sans-serif;box-shadow:0 4px 20px rgba(201,168,76,0.3)}' +
      '.cc-modal-btn:hover{background-position:right}' +
      '.cc-modal-btn-secundario{display:flex;align-items:center;justify-content:center;width:100%;' +
      'margin-top:12px;background:transparent;color:#25D366;border:1.5px solid rgba(37,211,102,0.5);' +
      'padding:14px 20px;border-radius:100px;font-size:12.5px;font-weight:700;' +
      'letter-spacing:1.2px;text-transform:uppercase;cursor:pointer;transition:all .3s;' +
      'font-family:"Inter",sans-serif}' +
      '.cc-modal-btn-secundario:hover{background:rgba(37,211,102,0.1);border-color:#25D366}' +
      '.cc-modal-close{position:absolute;top:12px;right:14px;background:transparent;border:none;' +
      'color:var(--text3,rgba(242,237,228,0.45));font-size:22px;line-height:1;cursor:pointer;' +
      'padding:6px;border-radius:50%;transition:color .2s}' +
      '.cc-modal-close:hover{color:var(--gold,#C9A84C)}' +
      '@media(max-width:480px){.cc-modal-box{padding:26px 20px 22px}}';
    var style = document.createElement('style');
    style.id = 'cc-modal-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildModal() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.className = 'cc-modal-overlay';
    overlayEl.id = 'cc-modal-overlay';
    overlayEl.innerHTML =
      '<div class="cc-modal-box" role="dialog" aria-modal="true" aria-labelledby="cc-modal-title">' +
      '<button type="button" class="cc-modal-close" aria-label="Fechar">×</button>' +
      '<div class="cc-modal-icon">📍</div>' +
      '<div class="cc-modal-title" id="cc-modal-title">Antes de acessar a localização, uma informação importante:</div>' +
      '<p class="cc-modal-text">O empreendimento possui atendimento de outros corretores no local. Para garantir a continuidade do seu atendimento e evitar qualquer desencontro, caso você seja abordado por outro corretor, informe que já está sendo atendido pelo <b>Corretor Rafael</b>.</p>' +
      '<p class="cc-modal-text">A visita deve ser previamente agendada para que eu possa acompanhá-lo pessoalmente.</p>' +
      '<p class="cc-modal-text">Após clicar em "OK, ENTENDI", você poderá acessar a localização e traçar sua rota.</p>' +
      '<button type="button" class="cc-modal-btn" id="cc-modal-confirm-btn">OK, ENTENDI</button>' +
      '<button type="button" class="cc-modal-btn-secundario" id="cc-modal-wpp-btn">📲 Falar com o Corretor Rafael</button>' +
      '</div>';
    document.body.appendChild(overlayEl);

    overlayEl.querySelector('.cc-modal-close').addEventListener('click', fechar);
    overlayEl.querySelector('#cc-modal-confirm-btn').addEventListener('click', confirmar);
    overlayEl.querySelector('#cc-modal-wpp-btn').addEventListener('click', falarComRafael);

    // Fecha ao clicar fora da caixa (no fundo escurecido)
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) fechar();
    });

    // Fecha com ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayEl.classList.contains('cc-open')) fechar();
    });

    return overlayEl;
  }

  function abrir(url) {
    injectStyles();
    buildModal();
    pendingUrl = url;
    lastFocusedEl = document.activeElement;
    overlayEl.classList.add('cc-open');
    document.body.style.overflow = 'hidden';
    var btn = document.getElementById('cc-modal-confirm-btn');
    if (btn) btn.focus();
  }

  function fechar() {
    if (!overlayEl) return;
    overlayEl.classList.remove('cc-open');
    document.body.style.overflow = '';
    pendingUrl = null;
    if (lastFocusedEl && lastFocusedEl.focus) {
      try { lastFocusedEl.focus(); } catch (e) {}
    }
  }

  function confirmar() {
    var url = pendingUrl;
    fechar();
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }

  // Fecha este modal e abre o chat de captação de leads (lead-modal.js),
  // caso ele esteja carregado na página.
  function falarComRafael() {
    fechar();
    if (typeof window.abrirFormularioLead === 'function') {
      window.abrirFormularioLead();
    }
  }

  // Chamado pelo onclick do link/botão "Como chegar".
  // Impede a navegação padrão e abre o modal; o link só é aberto
  // depois que o usuário clicar em "OK, ENTENDI".
  window.comoChegarClick = function (event, url) {
    if (event && event.preventDefault) event.preventDefault();
    abrir(url);
    return false;
  };
})();
