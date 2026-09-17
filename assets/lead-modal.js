/**
 * SISTEMA DE CAPTAÇÃO DE LEADS — FORMATO CONVERSA WHATSAPP
 * Rafael Tavares · CRECI 13919
 * Interface conversacional inspirada em aplicativo de mensagens com efeitos de digitação e som.
 */

(function () {
  'use strict';

  var NUMERO_RAFAEL = '5593992332012';

  // Dados coletados do lead
  var leadData = {
    empreendimento: '',
    empreendimento_slug: '',
    origem_url: window.location.href,
    nome: '',
    objetivo: '',
    planejamento_compra: '',
    forma_pagamento: '',
    quer_visitar: false,
    data_visita: null,
    data_visita_texto: '',
    periodo_visita: null,
    horario_visita: null,
    telefone: ''
  };

  // Pilha de histórico para suporte a Voltar [←]
  var stepHistory = [];
  var currentStep = 1;

  // Persistência da conversa no navegador do cliente (para não reiniciar caso ele saia e volte depois)
  var LOCAL_STORAGE_KEY = 'rt_lead_conversa_v1';
  var conversaDataInicio = null;

  // Estado do Calendário
  var calCurrentDate = new Date();

  // Nomes dos meses
  var meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // ── GERENCIADOR DE TEMPORIZADORES (PREVINE CONFLITOS DE TIMEOUT) ──
  var activeTimeouts = [];
  function limparTimeouts() {
    while (activeTimeouts.length > 0) {
      clearTimeout(activeTimeouts.pop());
    }
  }
  function agendarTimeout(fn, delay) {
    var id = setTimeout(function () {
      var idx = activeTimeouts.indexOf(id);
      if (idx > -1) activeTimeouts.splice(idx, 1);
      fn();
    }, delay);
    activeTimeouts.push(id);
    return id;
  }

  // ── MOTOR DE ÁUDIO (SOM OFICIAL DO WHATSAPP + BUFFER + FALLBACK) ──
  var audioCtx = null;
  var audioBufferRecebido = null;
  var audioHtmlElement = null;
  var somHabilitado = true;

  try {
    audioHtmlElement = new Audio('/assets/whatsapp-notification.mp3');
    audioHtmlElement.preload = 'auto';
  } catch (e) {}

  function obterAudioContext() {
    try {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      // Se ainda não carregou o buffer de áudio na memória, carrega agora
      if (audioCtx && !audioBufferRecebido) {
        carregarAudioBuffer();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function carregarAudioBuffer() {
    try {
      fetch('/assets/whatsapp-notification.mp3')
        .then(function (res) {
          if (!res.ok) throw new Error('Falha ao carregar audio');
          return res.arrayBuffer();
        })
        .then(function (arrayBuf) {
          var ctx = obterAudioContext();
          if (ctx) {
            ctx.decodeAudioData(arrayBuf, function (decoded) {
              audioBufferRecebido = decoded;
            }, function () {});
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  // Contador para alternar sons de notificação a cada mensagem
  var soundCounter = 0;

  // Tocar som de notificação para mensagens recebidas com tom dinâmico para cada mensagem
  function tocarSomRecebido(variante) {
    if (!somHabilitado) return;
    soundCounter++;
    var v = (typeof variante === 'number') ? variante : soundCounter;

    var tocouComSucesso = false;
    var ctx = obterAudioContext();

    // 1. Tentar tocar via Web Audio API pré-decodificado em memória (ajustando a afinação conforme a mensagem)
    try {
      if (ctx && audioBufferRecebido) {
        if (ctx.state === 'suspended') ctx.resume();
        var source = ctx.createBufferSource();
        var gainNode = ctx.createGain();
        source.buffer = audioBufferRecebido;

        // Variação de pitch harmônica para cada mensagem consecutiva
        var pitchRates = [1.0, 1.12, 1.05, 1.18, 0.96];
        var rate = pitchRates[(v - 1) % pitchRates.length] || 1.0;
        source.playbackRate.setValueAtTime(rate, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.95, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        tocouComSucesso = true;
      }
    } catch (e) {}

    // 2. Se não tocou pelo Buffer, tentar via elemento HTML5 Audio ou síntese
    if (!tocouComSucesso && audioHtmlElement && v % 2 === 1) {
      try {
        audioHtmlElement.currentTime = 0;
        var p = audioHtmlElement.play();
        if (p && typeof p.then === 'function') {
          p.then(function () {
            tocouComSucesso = true;
          }).catch(function () {
            sintetizarChimeRecebido(v);
          });
        } else {
          tocouComSucesso = true;
        }
      } catch (err) {
        sintetizarChimeRecebido(v);
      }
    } else if (!tocouComSucesso) {
      sintetizarChimeRecebido(v);
    }
  }

  // Síntese harmônica com modulação de notas caso o buffer não esteja pronto ou para timbres distintos
  function sintetizarChimeRecebido(variante) {
    try {
      var ctx = obterAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      var v = variante || 1;

      // Pares de frequências harmônicas agradáveis (nota 1 e nota 2)
      var escalas = [
        { f1: 659.25, f2: 1046.5, f3: 1318.5 },  // E5 -> C6 -> E6 (WhatsApp clássico)
        { f1: 783.99, f2: 1174.66, f3: 1567.98 }, // G5 -> D6 -> G6 (Segundo som, mais agudo e límpido)
        { f1: 587.33, f2: 880.0, f3: 1174.66 },   // D5 -> A5 -> D6 (Terceiro tom)
        { f1: 880.0, f2: 1318.5, f3: 1760.0 }     // A5 -> E6 -> A6 (Quarto tom cristalino)
      ];
      var escala = escalas[(v - 1) % escalas.length];

      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(escala.f1, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.085);

      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(escala.f2, now + 0.065);
      osc2.frequency.exponentialRampToValueAtTime(escala.f3, now + 0.11);
      gain2.gain.setValueAtTime(0.001, now + 0.065);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.085);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.065);
      osc2.stop(now + 0.29);
    } catch (err) {}
  }

  // Tocar som sutil de mensagem enviada pelo cliente (swoosh / pop suave)
  function tocarSomEnviado() {
    if (!somHabilitado) return;
    try {
      var ctx = obterAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.035);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch (err) {
      // Silencioso
    }
  }

  // Helper de hora atual para os balões de conversa
  function getHoraAtual() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // Identificação automática por rota ou título
  function identificarEmpreendimento() {
    var path = window.location.pathname.toLowerCase();

    if (path.indexOf('alenquer') !== -1) {
      return { nome: 'Jardim Alenquer', slug: 'alenquer' };
    }
    if (path.indexOf('bela-vista-mararu') !== -1) {
      return { nome: 'Bela Vista do Mararu', slug: 'bela-vista-mararu' };
    }
    if (path.indexOf('mararu') !== -1) {
      return { nome: 'Bairro Mararu', slug: 'mararu' };
    }
    if (path.indexOf('sao-braz') !== -1 || path.indexOf('sao-bras') !== -1) {
      return { nome: 'São Braz', slug: 'sao-braz' };
    }
    if (path.indexOf('monte-alegre') !== -1) {
      return { nome: 'Jussaramia', slug: 'monte-alegre' };
    }
    if (path.indexOf('pajucara') !== -1 || path.indexOf('pajuca') !== -1) {
      return { nome: 'Pajucará', slug: 'pajucara' };
    }
    if (path.indexOf('santa-maria') !== -1) {
      return { nome: 'Santa Maria', slug: 'santa-maria' };
    }
    if (path.indexOf('cucuruna') !== -1) {
      return { nome: 'Cucurunã', slug: 'cucuruna' };
    }
    if (path.indexOf('espirito-santo') !== -1) {
      return { nome: 'Bairro Espírito Santo', slug: 'espirito-santo' };
    }

    var rmNome = document.getElementById('rm-nome');
    var modalReg = document.getElementById('modal-regiao');
    if (modalReg && modalReg.classList.contains('ativo') && rmNome && rmNome.textContent.trim()) {
      var n = rmNome.textContent.trim();
      return { nome: n, slug: n.toLowerCase().replace(/[^a-z0-9]/g, '-') };
    }

    var t = document.title || '';
    if (t.indexOf('Mararu') !== -1) return { nome: 'Bairro Mararu', slug: 'mararu' };
    if (t.indexOf('Alenquer') !== -1) return { nome: 'Jardim Alenquer', slug: 'alenquer' };
    if (t.indexOf('São Braz') !== -1) return { nome: 'São Braz', slug: 'sao-braz' };

    return { nome: 'Geral / Portal Principal', slug: 'geral' };
  }

  // Geração da mensagem do WhatsApp (conversa real corrida, sem emojis, sem telefone, sem quebras de linha)
  function gerarMensagemWhatsApp(dados) {
    var nome = (dados.nome || '').trim();

    var empRaw = (dados.empreendimento || '').trim();
    var isGeral = (!empRaw || empRaw === 'Geral / Portal Principal' || empRaw === 'Geral');
    var empTexto = 'o empreendimento';
    if (isGeral) {
      empTexto = 'os terrenos';
    } else if (/^(o|a|os|as)\s+/i.test(empRaw)) {
      empTexto = empRaw;
    } else {
      empTexto = 'o ' + empRaw;
    }

    // Objetivo
    var objFrase = '';
    var obj = (dados.objetivo || '').toLowerCase();
    if (obj.indexOf('morar e investir') !== -1) {
      objFrase = 'Quero comprar para morar e investir';
    } else if (obj.indexOf('morar') !== -1) {
      objFrase = 'Quero comprar para morar';
    } else if (obj.indexOf('investir') !== -1) {
      objFrase = 'Quero comprar para investir';
    } else if (obj.indexOf('vender') !== -1) {
      objFrase = 'Quero construir para vender';
    } else if (obj.indexOf('lazer') !== -1 || obj.indexOf('chácara') !== -1) {
      objFrase = 'Quero comprar para lazer';
    }

    // Planejamento
    var planFrase = '';
    var plan = (dados.planejamento_compra || '').toLowerCase();
    if (plan.indexOf('agora') !== -1) {
      planFrase = 'meu planejamento é comprar agora, se eu gostar';
    } else if (plan.indexOf('semana') !== -1) {
      planFrase = 'meu planejamento é daqui a uma semana';
    } else if (plan.indexOf('mês') !== -1 || plan.indexOf('mes') !== -1) {
      planFrase = 'meu planejamento é daqui a um mês';
    } else if (plan.indexOf('frente') !== -1) {
      planFrase = 'ainda estou pensando em comprar mais pra frente';
    } else if (plan.indexOf('analisando') !== -1) {
      planFrase = 'ainda estou analisando o momento da compra';
    }

    // Forma de Pagamento
    var pagFrase = '';
    var pag = (dados.forma_pagamento || '').toLowerCase();
    if (pag.indexOf('parcelado') !== -1) {
      pagFrase = 'prefiro pagar parcelado';
    } else if (pag.indexOf('entrada') !== -1) {
      pagFrase = 'tenho o valor para a entrada';
    } else if (pag.indexOf('parte') !== -1) {
      pagFrase = 'tenho parte do valor';
    } else if (pag.indexOf('troca') !== -1) {
      pagFrase = 'pretendo negociar uma troca';
    } else if (pag.indexOf('vista') !== -1 || pag.indexOf('depend') !== -1) {
      pagFrase = 'quero negociar à vista, dependendo do valor';
    } else if (pag.indexOf('não sei') !== -1 || pag.indexOf('nao sei') !== -1) {
      pagFrase = 'ainda estou avaliando a forma de pagamento';
    }

    // Combinar preferências não nulas
    var prefs = [];
    if (objFrase) prefs.push(objFrase);
    if (planFrase) prefs.push(planFrase);
    if (pagFrase) prefs.push(pagFrase);

    var textoPrefs = '';
    if (prefs.length > 0) {
      textoPrefs = prefs.join(', ') + '. ';
    }

    // Visita com horário específico (intervalo de 30 min)
    var visitaFrase = '';
    if (dados.quer_visitar && dados.data_visita) {
      var dataCurta = dados.data_visita.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataCurta)) {
        var partes = dataCurta.split('-');
        dataCurta = partes[2] + '/' + partes[1];
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataCurta)) {
        dataCurta = dataCurta.substring(0, 5);
      }

      var hora = dados.horario_visita || dados.periodo_visita;
      if (hora && hora.indexOf(':') !== -1) {
        visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + ' às ' + hora + '.';
      } else if (hora && hora.toLowerCase().indexOf('combinar') !== -1) {
        visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + ' (horário a combinar).';
      } else if (hora) {
        visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + ' (' + hora + ').';
      } else {
        visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + '.';
      }
    } else {
      visitaFrase = 'Por enquanto, gostaria de receber mais informações sobre o empreendimento.';
    }

    var introFrase = 'Vi ' + empTexto + ' no site e tenho interesse. ';
    var encerramento = 'Gostaria de saber mais sobre os terrenos!';
    if (isGeral) {
      introFrase = 'Vi seu site e tenho interesse em conhecer os terrenos disponíveis. ';
      encerramento = 'Gostaria de receber mais informações sobre as opções disponíveis!';
    }

    return 'Olá, Corretor Rafael! Meu nome é ' + nome + '. ' + introFrase +
      textoPrefs + visitaFrase + ' ' + encerramento;
  }

  // Injeção do Container do Modal de Chat
  function injetarModalHTML() {
    if (document.getElementById('lead-modal-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'lead-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = [
      '<div id="lead-modal-box">',
      '  <!-- CABEÇALHO DA CONVERSA ESTILO WHATSAPP -->',
      '  <div class="lead-chat-header">',
      '    <div class="lead-header-info-group">',
      '      <button type="button" class="lead-chat-btn-voltar" id="lead-chat-back" title="Voltar" aria-label="Voltar">',
      '        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
      '      </button>',
      '      <div class="lead-avatar-wrap">',
      '        <img src="/imagens/rafael-foto.jpg" alt="Corretor Rafael" class="lead-chat-avatar" onerror="this.src=\'/apple-touch-icon.png\'">',
      '        <span class="lead-online-badge" title="Online agora"></span>',
      '      </div>',
      '      <div class="lead-corretor-meta">',
      '        <div class="lead-corretor-nome-row">',
      '          <span class="lead-corretor-nome">Assistente do Corretor Rafael</span>',
      '          <span class="lead-selo-verificado" title="Consultor Verificado">✓</span>',
      '        </div>',
      '        <span class="lead-corretor-sub" id="lead-header-status">',
      '          Assistente virtual · <span class="emp-tag" id="lead-header-emp">Jardim Alenquer</span>',
      '        </span>',
      '      </div>',
      '    </div>',
      '    <div class="lead-header-actions-group">',
      '      <button type="button" class="lead-chat-btn-som" id="lead-chat-sound" title="Som de mensagens" aria-label="Som">',
      '        <span id="lead-sound-icon">🔔</span>',
      '      </button>',
      '      <button type="button" class="lead-chat-btn-fechar" id="lead-chat-close" title="Fechar conversa" aria-label="Fechar">✕</button>',
      '    </div>',
      '  </div>',
      '  <!-- PROGRESSO DISCRETO -->',
      '  <div class="lead-chat-progress-wrap">',
      '    <div class="lead-chat-progress-bar" id="lead-chat-progress"></div>',
      '  </div>',
      '  <!-- CORPO COM AS MENSAGENS E INTERAÇÕES -->',
      '  <div class="lead-chat-messages" id="lead-chat-messages">',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    // Eventos de fechar, voltar e som
    document.getElementById('lead-chat-close').addEventListener('click', fecharModal);
    document.getElementById('lead-chat-back').addEventListener('click', voltarEtapa);

    var soundBtn = document.getElementById('lead-chat-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        somHabilitado = !somHabilitado;
        var iconEl = document.getElementById('lead-sound-icon');
        if (iconEl) {
          iconEl.textContent = somHabilitado ? '🔔' : '🔕';
        }
        if (somHabilitado) {
          tocarSomRecebido();
        }
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fecharModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fecharModal();
    });
  }

  // Atualizar status no cabeçalho ("digitando..." em verde ou status normal)
  function definirStatusDigitando(digitando) {
    var statusEl = document.getElementById('lead-header-status');
    if (!statusEl) return;

    if (digitando) {
      statusEl.innerHTML = '<span class="lead-status-typing">digitando...</span>';
    } else {
      var empNome = leadData.empreendimento || 'Jardim Alenquer';
      statusEl.innerHTML = 'Assistente virtual · <span class="emp-tag">' + empNome + '</span>';
    }
  }

  // Scroll suave até o final da conversa
  function rolarParaFinal() {
    var container = document.getElementById('lead-chat-messages');
    if (!container) return;
    setTimeout(function () {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }, 40);
  }

  // Criar balão do Rafael com animação de recebimento
  // ── PERSISTÊNCIA DA CONVERSA (localStorage) ──────────────────────────────

  // Estrutura padrão do leadData (usada para garantir todos os campos ao carregar dados salvos antigos)
  function criarLeadDataPadrao() {
    return {
      empreendimento: '',
      empreendimento_slug: '',
      origem_url: window.location.href,
      nome: '',
      objetivo: '',
      planejamento_compra: '',
      forma_pagamento: '',
      quer_visitar: false,
      data_visita: null,
      data_visita_texto: '',
      periodo_visita: null,
      horario_visita: null,
      telefone: ''
    };
  }

  // Salva o estado atual da conversa (dados + etapa) no navegador do cliente
  function salvarConversaLocal() {
    try {
      var payload = {
        leadData: leadData,
        currentStep: currentStep,
        stepHistory: stepHistory,
        dataInicio: conversaDataInicio || (new Date()).toISOString(),
        ultimaAtualizacao: (new Date()).toISOString()
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Armazenamento indisponível (modo privado, cota excedida etc.) — a conversa segue funcionando sem persistir
    }
  }

  // Carrega a conversa salva anteriormente, se existir
  function carregarConversaLocal() {
    try {
      var raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      var dados = JSON.parse(raw);
      if (!dados || !dados.leadData || !dados.leadData.nome) return null;

      var padrao = criarLeadDataPadrao();
      for (var chave in dados.leadData) {
        if (Object.prototype.hasOwnProperty.call(dados.leadData, chave)) {
          padrao[chave] = dados.leadData[chave];
        }
      }
      dados.leadData = padrao;
      return dados;
    } catch (e) {
      return null;
    }
  }

  // Verifica se duas datas (ISO ou Date) caem no mesmo dia do calendário
  function ehMesmoDia(dataA, dataB) {
    var a = new Date(dataA);
    var b = new Date(dataB);
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  // Formata a data de início salva como rótulo do pill ("Hoje", "Ontem" ou "dd/mm")
  function formatarDivisorData(dataIso) {
    var agora = new Date();
    var data = new Date(dataIso);

    if (ehMesmoDia(data, agora)) return 'Hoje';

    var ontem = new Date(agora);
    ontem.setDate(ontem.getDate() - 1);
    if (ehMesmoDia(data, ontem)) return 'Ontem';

    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    return dia + '/' + mes;
  }

  // Criar divisor/pill de data na conversa (ex: "Hoje", "Ontem")
  function criarDivisorData(label) {
    var div = document.createElement('div');
    div.className = 'lead-chat-date-pill';
    div.textContent = label;
    return div;
  }

  function criarBalaoRafael(texto) {
    var row = document.createElement('div');
    row.className = 'lead-msg-row';

    var bubble = document.createElement('div');
    bubble.className = 'lead-msg-rafael';
    bubble.innerHTML = texto + '<span class="lead-msg-time-rafael">' + getHoraAtual() + '</span>';

    row.appendChild(bubble);
    return row;
  }

  // SVGs oficiais do WhatsApp para os tiques de envio/entrega/leitura
  var SVG_TIQUE_1 = '<svg class="lead-check-svg" viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M11.17 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.822 9.875 1.724 6.776a.365.365 0 0 0-.516 0l-.365.365a.365.365 0 0 0 0 .516l3.35 3.35a.365.365 0 0 0 .516 0l5.83-6.93a.365.365 0 0 0-.063-.51l-.31-.252z"/></svg>';
  var SVG_TIQUE_2 = '<svg class="lead-check-svg" viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.875 5.568 6.776a.365.365 0 0 0-.516 0l-.365.365a.365.365 0 0 0 0 .516l3.35 3.35a.365.365 0 0 0 .516 0l5.83-6.93a.365.365 0 0 0-.063-.51l-.31-.252zm-3.844 0l-.478-.372a.365.365 0 0 0-.51.063L4.822 9.875 1.724 6.776a.365.365 0 0 0-.516 0l-.365.365a.365.365 0 0 0 0 .516l3.35 3.35a.365.365 0 0 0 .516 0l5.83-6.93a.365.365 0 0 0-.063-.51l-.31-.252z"/></svg>';

  // Criar balão do Cliente com animação WhatsApp: 1 tique cinza (enviado) -> 2 tiques cinza (recebido) -> 2 tiques azuis (lido)
  function criarBalaoCliente(texto, animar) {
    var row = document.createElement('div');
    row.className = 'lead-msg-row';

    var bubble = document.createElement('div');
    bubble.className = 'lead-msg-client';

    var meta = document.createElement('div');
    meta.className = 'lead-msg-meta-client';

    var timeSpan = document.createElement('span');
    timeSpan.className = 'lead-msg-time-client';
    timeSpan.textContent = getHoraAtual();

    var checksSpan = document.createElement('span');

    if (animar) {
      // 1. Enviado: um pauzinho cinza (dura pelo menos 1 segundo)
      checksSpan.className = 'lead-msg-checks status-enviado';
      checksSpan.title = 'Enviado';
      checksSpan.innerHTML = SVG_TIQUE_1;

      // 2. Recebido: dois pauzinhos cinzas (após 1000ms - pelo menos 1s de intervalo)
      agendarTimeout(function () {
        checksSpan.className = 'lead-msg-checks status-recebido';
        checksSpan.title = 'Entregue';
        checksSpan.innerHTML = SVG_TIQUE_2;
      }, 1000);

      // 3. Lido: dois pauzinhos azuis (após 2000ms - pelo menos 1s de intervalo após recebido)
      agendarTimeout(function () {
        checksSpan.className = 'lead-msg-checks status-lido';
        checksSpan.title = 'Lido';
        checksSpan.innerHTML = SVG_TIQUE_2;
      }, 2000);
    } else {
      // Histórico já lido
      checksSpan.className = 'lead-msg-checks status-lido';
      checksSpan.title = 'Lido';
      checksSpan.innerHTML = SVG_TIQUE_2;
    }

    meta.appendChild(timeSpan);
    meta.appendChild(checksSpan);

    bubble.innerHTML = texto;
    bubble.appendChild(meta);
    row.appendChild(bubble);
    return row;
  }

  // Enviar resposta do cliente: toca som de envio, mostra 1 pauzinho cinza -> 2 pauzinhos cinza -> 2 azuis (1s entre cada),
  // e em seguida inicia os 3 segundos de digitação com notificação para a próxima mensagem
  function responderCliente(textoExibicao, proximaEtapa) {
    tocarSomEnviado();

    var actionsWrap = document.getElementById('lead-active-actions');
    if (actionsWrap) actionsWrap.remove();

    var messagesBox = document.getElementById('lead-chat-messages');
    if (messagesBox) {
      messagesBox.appendChild(criarBalaoCliente(textoExibicao, true));
      rolarParaFinal();
    }

    // Aguarda a confirmação visual completa da leitura em azul (2000ms + 400ms) antes de iniciar a digitação da próxima etapa
    agendarTimeout(function () {
      irParaEtapa(proximaEtapa, false);
    }, 2400);
  }

  // Enviar nome do cliente e, em seguida (só quando o empreendimento não foi identificado pela URL,
  // ou seja, cliente entrou pela página Início/Geral), perguntar qual empreendimento despertou o interesse dele
  function responderClienteComPerguntaEmpreendimento(textoExibicao) {
    tocarSomEnviado();

    var actionsWrap = document.getElementById('lead-active-actions');
    if (actionsWrap) actionsWrap.remove();

    var messagesBox = document.getElementById('lead-chat-messages');
    if (messagesBox) {
      messagesBox.appendChild(criarBalaoCliente(textoExibicao, true));
      rolarParaFinal();
    }

    agendarTimeout(function () {
      definirStatusDigitando(true);
      var typing = criarIndicadorDigitando();
      messagesBox.appendChild(typing);
      rolarParaFinal();

      agendarTimeout(function () {
        if (typing && typing.parentNode) typing.remove();
        definirStatusDigitando(false);

        var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
        messagesBox.appendChild(criarBalaoRafael('Prazer, ' + primeiroNome + '! 😊 Antes de continuar, qual empreendimento despertou seu interesse?'));
        tocarSomRecebido();

        renderizarAcoesEmpreendimentoGeral(messagesBox);
        rolarParaFinal();
      }, 3000);
    }, 2400);
  }

  // Renderizar opções de empreendimento quando o cliente entrou pela página Início (sem empreendimento identificado)
  function renderizarAcoesEmpreendimentoGeral(container) {
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'lead-actions-container';
    actionsWrap.id = 'lead-active-actions';

    var opcoesEmp = [
      { nome: 'Jardim Alenquer', slug: 'alenquer' },
      { nome: 'Bela Vista do Mararu', slug: 'bela-vista-mararu' },
      { nome: 'Bairro Mararu', slug: 'mararu' },
      { nome: 'São Braz', slug: 'sao-braz' },
      { nome: 'Jussaramia', slug: 'monte-alegre' },
      { nome: 'Pajucará', slug: 'pajucara' },
      { nome: 'Santa Maria', slug: 'santa-maria' },
      { nome: 'Cucurunã', slug: 'cucuruna' },
      { nome: 'Bairro Espírito Santo', slug: 'espirito-santo' }
    ];

    opcoesEmp.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lead-choice-btn';
      btn.innerHTML = '<span class="lead-choice-label">' + opt.nome + '</span><span class="lead-choice-arrow">›</span>';
      btn.addEventListener('click', function () {
        leadData.empreendimento = opt.nome;
        leadData.empreendimento_slug = opt.slug;

        var headerEmp = document.getElementById('lead-header-emp');
        if (headerEmp) headerEmp.textContent = opt.nome;

        responderCliente(opt.nome, 2);
      });
      actionsWrap.appendChild(btn);
    });

    // Botão Pular
    var btnPularEmp = criarBotaoPular('Pular esta pergunta ›', function () {
      responderCliente('Ainda não sei, quero ver as opções', 2);
    });
    actionsWrap.appendChild(btnPularEmp);

    container.appendChild(actionsWrap);
  }

  // Criar indicador de digitação (três pontos pulsantes com texto)
  function criarIndicadorDigitando() {
    var div = document.createElement('div');
    div.className = 'lead-typing-bubble';
    div.id = 'lead-active-typing';
    div.innerHTML = [
      '<span>digitando...</span>',
      '<div class="lead-typing-dots">',
      '  <span class="lead-typing-dot"></span>',
      '  <span class="lead-typing-dot"></span>',
      '  <span class="lead-typing-dot"></span>',
      '</div>'
    ].join('');
    return div;
  }

  // Criar botão discreto para pular pergunta/etapa
  function criarBotaoPular(texto, callback) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lead-skip-step-btn';
    btn.innerHTML = texto;
    btn.addEventListener('click', callback);
    return btn;
  }

  // Atualizar barra discreta de progresso
  function atualizarProgresso(etapa) {
    var bar = document.getElementById('lead-chat-progress');
    if (!bar) return;
    var pct = 15;
    if (etapa === 1) pct = 15;
    else if (etapa === 2) pct = 30;
    else if (etapa === 3) pct = 48;
    else if (etapa === 4) pct = 65;
    else if (etapa === 5) pct = 78;
    else if (etapa === 6) pct = 85;
    else if (etapa === 7) pct = 92;
    else if (etapa === 8) pct = 100;
    bar.style.width = pct + '%';
  }

  // Voltar etapa na conversa
  function voltarEtapa() {
    limparTimeouts();
    definirStatusDigitando(false);
    if (stepHistory.length <= 1) {
      fecharModal();
      return;
    }
    stepHistory.pop(); // remove o atual
    var etapaAnterior = stepHistory[stepHistory.length - 1];
    irParaEtapa(etapaAnterior, true);
  }

  // Executar renderização da etapa com digitação de 3s e som oficial do WhatsApp em cada mensagem
  function irParaEtapa(etapa, isVoltar) {
    limparTimeouts();
    currentStep = etapa;
    if (!isVoltar) {
      stepHistory.push(etapa);
    }
    atualizarProgresso(etapa);
    salvarConversaLocal();

    var messagesBox = document.getElementById('lead-chat-messages');
    if (!messagesBox) return;

    // Remover container de ações atual se existir
    var oldActions = document.getElementById('lead-active-actions');
    if (oldActions) oldActions.remove();

    // Remover qualquer indicador de digitação remanescente
    var oldTyping = document.getElementById('lead-active-typing');
    if (oldTyping) oldTyping.remove();

    // Se estiver voltando, reconstrói sem atraso
    if (isVoltar) {
      definirStatusDigitando(false);
      reconstruirConversaAte(etapa);
      return;
    }

    // ── ETAPA 1 (Abertura: 1ª mensagem em 3s, 2ª mensagem em mais 3s com sons) ──
    if (etapa === 1) {
      definirStatusDigitando(true);
      var typing1 = criarIndicadorDigitando();
      messagesBox.appendChild(typing1);
      rolarParaFinal();

      agendarTimeout(function () {
        if (typing1 && typing1.parentNode) typing1.remove();

        // 1ª mensagem do Assistente Virtual do Corretor Rafael (chega aos 3s)
        messagesBox.appendChild(criarBalaoRafael('Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.'));
        tocarSomRecebido();
        rolarParaFinal();

        // Status "digitando..." por mais 3 segundos para a 2ª mensagem
        definirStatusDigitando(true);
        var typing2 = criarIndicadorDigitando();
        messagesBox.appendChild(typing2);
        rolarParaFinal();

        agendarTimeout(function () {
          if (typing2 && typing2.parentNode) typing2.remove();
          definirStatusDigitando(false);

          // 2ª mensagem (chega após mais 3s)
          messagesBox.appendChild(criarBalaoRafael('Antes de começarmos, como posso te chamar?'));
          tocarSomRecebido();

          // Renderizar o campo de entrada do nome
          renderizarAcoesNome(messagesBox);
          rolarParaFinal();
        }, 3000);
      }, 3000);
      return;
    }

    // ── ETAPA 2 (Saudação aos 3s, Pergunta aos +3s, cada uma com som e digitação) ──
    if (etapa === 2) {
      definirStatusDigitando(true);
      var typing1 = criarIndicadorDigitando();
      messagesBox.appendChild(typing1);
      rolarParaFinal();

      agendarTimeout(function () {
        if (typing1 && typing1.parentNode) typing1.remove();

        var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
        messagesBox.appendChild(criarBalaoRafael('Prazer, ' + primeiroNome + '! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.'));
        tocarSomRecebido();
        rolarParaFinal();

        // Status "digitando..." por mais 3 segundos para a 2ª mensagem
        definirStatusDigitando(true);
        var typing2 = criarIndicadorDigitando();
        messagesBox.appendChild(typing2);
        rolarParaFinal();

        agendarTimeout(function () {
          if (typing2 && typing2.parentNode) typing2.remove();
          definirStatusDigitando(false);

          messagesBox.appendChild(criarBalaoRafael('Para começar, qual é o seu objetivo com o terreno?'));
          tocarSomRecebido();

          renderizarAcoesEtapa2(messagesBox);
          rolarParaFinal();
        }, 3000);
      }, 3000);
      return;
    }

    // ── DEMAIS ETAPAS (3 a 8): SEMPRE 3 SEGUNDOS COM STATUS DIGITANDO ──
    definirStatusDigitando(true);
    var typing = criarIndicadorDigitando();
    messagesBox.appendChild(typing);
    rolarParaFinal();

    agendarTimeout(function () {
      if (typing && typing.parentNode) typing.remove();
      definirStatusDigitando(false);

      // Renderiza mensagem do assistente e botões/opções
      renderizarConteudoEtapa(etapa, messagesBox);

      // Toca som oficial de notificação
      tocarSomRecebido();

      rolarParaFinal();
    }, 3000);
  }

  // Renderizar o formulário de nome da etapa 1
  function renderizarAcoesNome(container) {
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'lead-actions-container';
    actionsWrap.id = 'lead-active-actions';

    var card = document.createElement('div');
    card.className = 'lead-input-card';
    card.innerHTML = [
      '<input type="text" id="chat-input-nome" class="lead-chat-field" placeholder="Digite seu nome completo" autocomplete="name" autocapitalize="words" value="' + (leadData.nome || '') + '">',
      '<div id="chat-error-nome" class="lead-error-msg">Por favor, informe seu nome.</div>',
      '<button type="button" id="chat-btn-nome" class="lead-btn-submit-action">',
      '  Continuar <span>→</span>',
      '</button>'
    ].join('');

    actionsWrap.appendChild(card);
    container.appendChild(actionsWrap);

    var inputNome = document.getElementById('chat-input-nome');
    var btnNome = document.getElementById('chat-btn-nome');
    var errNome = document.getElementById('chat-error-nome');

    setTimeout(function () {
      if (inputNome) inputNome.focus();
    }, 100);

    function confirmarNome() {
      var valor = (inputNome.value || '').trim();
      if (!valor || valor.length < 2) {
        errNome.style.display = 'block';
        inputNome.focus();
        return;
      }
      errNome.style.display = 'none';
      leadData.nome = valor;

      if (leadData.empreendimento_slug === 'geral') {
        responderClienteComPerguntaEmpreendimento(valor);
      } else {
        responderCliente(valor, 2);
      }
    }

    btnNome.addEventListener('click', confirmarNome);
    inputNome.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmarNome();
      }
    });
  }

  // Renderizar opções da etapa 2 (Objetivo)
  function renderizarAcoesEtapa2(container) {
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'lead-actions-container';
    actionsWrap.id = 'lead-active-actions';

    var opcoesObj = [
      { label: '🏠 Morar', val: 'Morar' },
      { label: '💰 Investir', val: 'Investir' },
      { label: '🏠💰 Morar e investir', val: 'Morar e investir' }
    ];

    opcoesObj.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lead-choice-btn';
      btn.innerHTML = '<span class="lead-choice-label">' + opt.label + '</span><span class="lead-choice-arrow">›</span>';
      btn.addEventListener('click', function () {
        leadData.objetivo = opt.val;
        responderCliente(opt.label, 3);
      });
      actionsWrap.appendChild(btn);
    });

    // Botão Pular
    var btnPular2 = criarBotaoPular('Pular esta pergunta ›', function () {
      leadData.objetivo = 'A definir';
      responderCliente('Pulei esta pergunta', 3);
    });
    actionsWrap.appendChild(btnPular2);

    container.appendChild(actionsWrap);
  }

  // Reconstruir conversa até a etapa selecionada ao clicar em Voltar
  function reconstruirConversaAte(etapaAlvo, pillInicial, inserirPillHojeAntes) {
    var messagesBox = document.getElementById('lead-chat-messages');
    messagesBox.innerHTML = '';
    messagesBox.appendChild(criarDivisorData(pillInicial || 'Hoje'));

    function renderizarEtapaAtiva(etapa) {
      if (inserirPillHojeAntes) {
        messagesBox.appendChild(criarDivisorData('Hoje'));
      }
      renderizarConteudoEtapa(etapa, messagesBox);
    }

    if (etapaAlvo === 1) {
      messagesBox.appendChild(criarBalaoRafael('Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.'));
      messagesBox.appendChild(criarBalaoRafael('Antes de começarmos, como posso te chamar?'));
      if (inserirPillHojeAntes) messagesBox.appendChild(criarDivisorData('Hoje'));
      renderizarAcoesNome(messagesBox);
      rolarParaFinal();
      return;
    }

    messagesBox.appendChild(criarBalaoRafael('Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.'));
    messagesBox.appendChild(criarBalaoRafael('Antes de começarmos, como posso te chamar?'));
    if (leadData.nome) messagesBox.appendChild(criarBalaoCliente(leadData.nome));

    if (etapaAlvo === 2) {
      renderizarEtapaAtiva(2);
      rolarParaFinal();
      return;
    }

    var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
    messagesBox.appendChild(criarBalaoRafael('Prazer, ' + primeiroNome + '! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.'));
    messagesBox.appendChild(criarBalaoRafael('Para começar, qual é o seu objetivo com o terreno?'));
    if (leadData.objetivo) messagesBox.appendChild(criarBalaoCliente(leadData.objetivo));

    if (etapaAlvo === 3) {
      renderizarEtapaAtiva(3);
      rolarParaFinal();
      return;
    }

    messagesBox.appendChild(criarBalaoRafael('E qual é o seu planejamento para essa compra?'));
    if (leadData.planejamento_compra) messagesBox.appendChild(criarBalaoCliente(leadData.planejamento_compra));

    if (etapaAlvo === 4) {
      renderizarEtapaAtiva(4);
      rolarParaFinal();
      return;
    }

    messagesBox.appendChild(criarBalaoRafael('Para entendermos melhor o que você procura, qual destas opções combina mais com o seu planejamento?'));
    if (leadData.forma_pagamento) messagesBox.appendChild(criarBalaoCliente(leadData.forma_pagamento));

    if (etapaAlvo === 5) {
      renderizarEtapaAtiva(5);
      rolarParaFinal();
      return;
    }

    messagesBox.appendChild(criarBalaoRafael('Gostaria de conhecer o empreendimento pessoalmente?'));
    if (leadData.quer_visitar) {
      messagesBox.appendChild(criarBalaoCliente('🏡 Sim, quero agendar uma visita'));
    } else {
      messagesBox.appendChild(criarBalaoCliente('💬 Prefiro receber mais informações primeiro'));
    }

    if (etapaAlvo === 6) {
      renderizarEtapaAtiva(6);
      rolarParaFinal();
      return;
    }

    if (leadData.quer_visitar) {
      messagesBox.appendChild(criarBalaoRafael('Ótimo! Qual dia fica melhor para você?'));
      if (leadData.data_visita) messagesBox.appendChild(criarBalaoCliente('📅 Dia ' + leadData.data_visita));

      if (etapaAlvo === 7) {
        renderizarEtapaAtiva(7);
        rolarParaFinal();
        return;
      }

      messagesBox.appendChild(criarBalaoRafael('Qual horário fica melhor para o agendamento da sua visita? (Intervalos de 30 minutos)'));
      if (leadData.horario_visita || leadData.periodo_visita) {
        messagesBox.appendChild(criarBalaoCliente('🕒 Horário agendado: ' + (leadData.horario_visita || leadData.periodo_visita)));
      }
    }

    if (etapaAlvo === 8) {
      renderizarEtapaAtiva(8);
      rolarParaFinal();
    }
  }

  // Renderizar o conteúdo e ações da etapa ativa
  function renderizarConteudoEtapa(etapa, container) {
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'lead-actions-container';
    actionsWrap.id = 'lead-active-actions';

    // ── ETAPA 1: NOME ──
    if (etapa === 1) {
      renderizarAcoesNome(container);
      return;
    }

    // ── ETAPA 2: OBJETIVO (Morar, Investir, Morar e investir) ──
    if (etapa === 2) {
      var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
      container.appendChild(criarBalaoRafael('Prazer, ' + primeiroNome + '! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.'));
      container.appendChild(criarBalaoRafael('Para começar, qual é o seu objetivo com o terreno?'));
      renderizarAcoesEtapa2(container);
      return;
    }

    // ── ETAPA 3: PLANEJAMENTO ──
    if (etapa === 3) {
      container.appendChild(criarBalaoRafael('E qual é o seu planejamento para essa compra?'));

      var opcoesPlan = [
        { label: '🔥 Quero comprar agora, se eu gostar', val: 'Quero comprar agora, se eu gostar' },
        { label: '📅 Daqui a uma semana', val: 'Daqui a uma semana' },
        { label: '📆 Daqui a um mês', val: 'Daqui a um mês' },
        { label: '🕐 Mais pra frente', val: 'Mais pra frente' },
        { label: '🤔 Ainda estou analisando', val: 'Ainda estou analisando' }
      ];

      opcoesPlan.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lead-choice-btn';
        btn.innerHTML = '<span class="lead-choice-label">' + opt.label + '</span><span class="lead-choice-arrow">›</span>';
        btn.addEventListener('click', function () {
          leadData.planejamento_compra = opt.val;
          responderCliente(opt.label, 4);
        });
        actionsWrap.appendChild(btn);
      });

      // Botão Pular
      var btnPular3 = criarBotaoPular('Pular esta pergunta ›', function () {
        leadData.planejamento_compra = 'A definir';
        responderCliente('Pulei esta pergunta', 4);
      });
      actionsWrap.appendChild(btnPular3);

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 4: FORMA DE PAGAMENTO (SEM "Prefiro pagar parcelado") ──
    if (etapa === 4) {
      container.appendChild(criarBalaoRafael('Para entendermos melhor o que você procura, qual destas opções combina mais com o seu planejamento?'));

      var opcoesPag = [
        { label: '💵 Tenho o valor para a entrada', val: 'Tenho o valor para a entrada' },
        { label: '💰 Tenho parte do valor', val: 'Tenho parte do valor' },
        { label: '🚗 Pretendo negociar uma troca (carro/moto)', val: 'Pretendo negociar uma troca (carro/moto)' },
        { label: '🤝 Quero negociar à vista, mas dependendo do valor', val: 'Quero negociar à vista, mas dependendo do valor' }
      ];

      opcoesPag.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lead-choice-btn';
        btn.innerHTML = '<span class="lead-choice-label">' + opt.label + '</span><span class="lead-choice-arrow">›</span>';
        btn.addEventListener('click', function () {
          leadData.forma_pagamento = opt.val;
          responderCliente(opt.label, 5);
        });
        actionsWrap.appendChild(btn);
      });

      // Botão Pular
      var btnPular4 = criarBotaoPular('Pular esta pergunta ›', function () {
        leadData.forma_pagamento = 'A definir';
        responderCliente('Pulei esta pergunta', 5);
      });
      actionsWrap.appendChild(btnPular4);

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 5: VISITA PRESENCIAL ──
    if (etapa === 5) {
      container.appendChild(criarBalaoRafael('Gostaria de conhecer o empreendimento pessoalmente?'));

      var btnSim = document.createElement('button');
      btnSim.type = 'button';
      btnSim.className = 'lead-choice-btn';
      btnSim.innerHTML = '<span class="lead-choice-label">🏡 Sim, quero agendar uma visita</span><span class="lead-choice-arrow">›</span>';
      btnSim.addEventListener('click', function () {
        leadData.quer_visitar = true;
        responderCliente('🏡 Sim, quero agendar uma visita', 6);
      });

      var btnNao = document.createElement('button');
      btnNao.type = 'button';
      btnNao.className = 'lead-choice-btn';
      btnNao.innerHTML = '<span class="lead-choice-label">💬 Prefiro receber mais informações primeiro</span><span class="lead-choice-arrow">›</span>';
      btnNao.addEventListener('click', function () {
        leadData.quer_visitar = false;
        leadData.data_visita = null;
        leadData.periodo_visita = null;
        leadData.horario_visita = null;
        responderCliente('💬 Prefiro receber mais informações primeiro', 8); // Pula calendário e vai direto para WhatsApp
      });

      actionsWrap.appendChild(btnSim);
      actionsWrap.appendChild(btnNao);
      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 6: CALENDÁRIO DA VISITA ──
    if (etapa === 6) {
      container.appendChild(criarBalaoRafael('Ótimo! Qual dia fica melhor para você?'));

      var calCard = document.createElement('div');
      calCard.className = 'lead-chat-calendar-card';

      calCard.innerHTML = [
        '<div class="lead-cal-header-row">',
        '  <button type="button" class="lead-cal-nav-btn" id="cal-nav-prev" aria-label="Mês anterior">‹</button>',
        '  <span class="lead-cal-title" id="cal-chat-title"></span>',
        '  <button type="button" class="lead-cal-nav-btn" id="cal-nav-next" aria-label="Próximo mês">›</button>',
        '</div>',
        '<div class="lead-cal-week-row">',
        '  <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>',
        '</div>',
        '<div class="lead-cal-grid-days" id="cal-chat-days"></div>'
      ].join('');

      actionsWrap.appendChild(calCard);

      // Botão Pular agendamento
      var btnPular6 = criarBotaoPular('Pular agendamento de visita ›', function () {
        leadData.quer_visitar = false;
        leadData.data_visita = null;
        leadData.periodo_visita = null;
        leadData.horario_visita = null;
        responderCliente('Prefiro receber mais informações no WhatsApp', 8);
      });
      actionsWrap.appendChild(btnPular6);

      container.appendChild(actionsWrap);

      var btnPrev = document.getElementById('cal-nav-prev');
      var btnNext = document.getElementById('cal-nav-next');
      var titleEl = document.getElementById('cal-chat-title');
      var gridEl = document.getElementById('cal-chat-days');

      function desenharCalendarioChat() {
        var ano = calCurrentDate.getFullYear();
        var mes = calCurrentDate.getMonth();
        var agoraCal = new Date();
        var expedienteFechadoHoje = agoraCal.getHours() >= 18;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        titleEl.textContent = meses[mes] + ' ' + ano;

        btnPrev.disabled = (ano === hoje.getFullYear() && mes === hoje.getMonth());
        gridEl.innerHTML = '';

        var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
        var totalDiasMes = new Date(ano, mes + 1, 0).getDate();

        for (var i = 0; i < primeiroDiaSemana; i++) {
          var empty = document.createElement('div');
          empty.className = 'lead-day-btn empty';
          gridEl.appendChild(empty);
        }

        for (var d = 1; d <= totalDiasMes; d++) {
          var dayBtn = document.createElement('button');
          dayBtn.type = 'button';
          dayBtn.className = 'lead-day-btn';
          dayBtn.textContent = d;

          var dateRef = new Date(ano, mes, d);
          dateRef.setHours(0, 0, 0, 0);

          // Depois das 18h (fim do expediente) o dia de hoje não tem mais horários disponíveis
          var ehHojeSemHorario = (dateRef.getTime() === hoje.getTime()) && expedienteFechadoHoje;

          if (dateRef < hoje || ehHojeSemHorario) {
            dayBtn.classList.add('disabled');
            dayBtn.disabled = true;
          } else {
            (function (diaNum) {
              dayBtn.addEventListener('click', function () {
                var diaFormatado = (diaNum < 10 ? '0' : '') + diaNum;
                var mesFormatado = (mes + 1 < 10 ? '0' : '') + (mes + 1);
                leadData.data_visita = diaFormatado + '/' + mesFormatado + '/' + ano;
                leadData.data_visita_texto = diaNum + ' de ' + meses[mes].toLowerCase() + ' de ' + ano;

                responderCliente('📅 Dia ' + leadData.data_visita, 7);
              });
            })(d);
          }

          gridEl.appendChild(dayBtn);
        }
      }

      btnPrev.addEventListener('click', function () {
        calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
        desenharCalendarioChat();
      });

      btnNext.addEventListener('click', function () {
        calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
        desenharCalendarioChat();
      });

      desenharCalendarioChat();
      return;
    }

    // ── ETAPA 7: HORÁRIO DA VISITA COM INTERVALOS DE 30 MINUTOS ──
    if (etapa === 7) {
      var agora = new Date();
      var horaAtual = agora.getHours();

      var diaFormatado = (agora.getDate() < 10 ? '0' : '') + agora.getDate();
      var mesFormatado = (agora.getMonth() + 1 < 10 ? '0' : '') + (agora.getMonth() + 1);
      var hojeStr = diaFormatado + '/' + mesFormatado + '/' + agora.getFullYear();
      var isHoje = (!leadData.data_visita || leadData.data_visita === hojeStr);

      // Expediente é das 08h às 18h. Se for "hoje" e já passou das 18h, não sobra
      // nenhum horário válido no dia — empurra automaticamente o agendamento
      // para amanhã em vez de oferecer horários que já ficaram no passado.
      var empurradoParaAmanha = false;
      if (isHoje && horaAtual >= 18) {
        var amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        var diaAmanha = (amanha.getDate() < 10 ? '0' : '') + amanha.getDate();
        var mesAmanha = (amanha.getMonth() + 1 < 10 ? '0' : '') + (amanha.getMonth() + 1);
        leadData.data_visita = diaAmanha + '/' + mesAmanha + '/' + amanha.getFullYear();
        leadData.data_visita_texto = amanha.getDate() + ' de ' + meses[amanha.getMonth()].toLowerCase() + ' de ' + amanha.getFullYear();
        isHoje = false;
        empurradoParaAmanha = true;
      }

      var isNoiteDepoisDas17 = isHoje && (horaAtual >= 17);

      if (empurradoParaAmanha) {
        container.appendChild(criarBalaoRafael('Nosso horário de atendimento é das 08h às 18h e já encerrou por hoje. Vamos agendar para amanhã, dia ' + leadData.data_visita + ' — qual horário fica melhor?'));
      } else if (isNoiteDepoisDas17) {
        container.appendChild(criarBalaoRafael('Qual horário fica melhor para o agendamento da sua visita? Como já passa das 17h, selecione o melhor horário a partir da tarde:'));
      } else {
        container.appendChild(criarBalaoRafael('Qual horário fica melhor para o agendamento da sua visita? (Intervalos de 30 minutos)'));
      }

      var timeWrap = document.createElement('div');
      timeWrap.className = 'lead-time-slots-container';

      function selecionarHorario(hora) {
        leadData.horario_visita = hora;
        leadData.periodo_visita = hora;
        responderCliente('🕒 Horário agendado: ' + hora, 8);
      }

      function criarGrupoHorarios(titulo, icone, listaHoras) {
        var grp = document.createElement('div');
        grp.className = 'lead-time-group';
        grp.innerHTML = '<div class="lead-time-group-title"><span>' + icone + '</span> ' + titulo + '</div>';
        var grid = document.createElement('div');
        grid.className = 'lead-time-grid';

        listaHoras.forEach(function (hora) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'lead-time-slot-btn';
          btn.textContent = hora;
          btn.addEventListener('click', function () {
            selecionarHorario(hora);
          });
          grid.appendChild(btn);
        });
        grp.appendChild(grid);
        return grp;
      }

      // Se estiver escrevendo à noite, depois das 17h: só aparece o horário a partir da tarde depois das 17h
      if (isNoiteDepoisDas17) {
        var horariosDepois17 = ['17:00', '17:30', '18:00'];
        timeWrap.appendChild(criarGrupoHorarios('Tarde / Início da Noite (a partir das 17h)', '🌆', horariosDepois17));

        // Se o agendamento for para outro dia, oferece opção para ver os demais horários caso queira
        if (!isHoje) {
          var btnOutros = document.createElement('button');
          btnOutros.type = 'button';
          btnOutros.className = 'lead-skip-step-btn';
          btnOutros.style.marginTop = '4px';
          btnOutros.textContent = '☀️ Ver horários da manhã e tarde completa para este dia';
          btnOutros.addEventListener('click', function () {
            btnOutros.remove();
            timeWrap.innerHTML = '';
            var horariosManha = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
            var horariosTarde = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
            timeWrap.appendChild(criarGrupoHorarios('Manhã', '🌅', horariosManha));
            timeWrap.appendChild(criarGrupoHorarios('Tarde', '☀️', horariosTarde));
          });
          actionsWrap.appendChild(btnOutros);
        }
      } else {
        // Se for antes das 17h:
        var horariosManha = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        var horariosTarde = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

        // Se for hoje à tarde (entre 12h e 17h), a manhã já passou
        if (isHoje && horaAtual >= 12) {
          timeWrap.appendChild(criarGrupoHorarios('Tarde', '☀️', horariosTarde));
        } else {
          timeWrap.appendChild(criarGrupoHorarios('Manhã', '🌅', horariosManha));
          timeWrap.appendChild(criarGrupoHorarios('Tarde', '☀️', horariosTarde));
        }
      }

      actionsWrap.appendChild(timeWrap);

      // Botão Pular definição de horário
      var btnPular7 = criarBotaoPular('Pular definição de horário ›', function () {
        leadData.horario_visita = 'A combinar';
        leadData.periodo_visita = 'A combinar';
        responderCliente('Horário a combinar com o Corretor Rafael', 8);
      });
      actionsWrap.appendChild(btnPular7);

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 8: WHATSAPP FINAL ──
    if (etapa === 8) {
      container.appendChild(criarBalaoRafael('Só falta seu WhatsApp para facilitar o seu atendimento com o Corretor Rafael. 😊'));

      var cardWpp = document.createElement('div');
      cardWpp.className = 'lead-input-card';
      cardWpp.innerHTML = [
        '<input type="tel" id="chat-input-tel" class="lead-chat-field" placeholder="Seu WhatsApp (ex: 93 99123-4567)" autocomplete="tel" value="' + (leadData.telefone || '') + '">',
        '<div id="chat-error-tel" class="lead-error-msg">Por favor, informe um número de WhatsApp válido com DDD.</div>',
        '<button type="button" id="chat-btn-final" class="lead-btn-submit-action">',
        '  <span>📲</span> CONVERSAR COM O CORRETOR RAFAEL NO WHATSAPP',
        '</button>',
        '<div class="lead-security-badge">',
        '  <span>🔒</span> Seus dados estão seguros e não enviamos spam.',
        '</div>'
      ].join('');

      actionsWrap.appendChild(cardWpp);
      container.appendChild(actionsWrap);

      var telInput = document.getElementById('chat-input-tel');
      var btnFinal = document.getElementById('chat-btn-final');
      var errTel = document.getElementById('chat-error-tel');

      setTimeout(function () {
        if (telInput) telInput.focus();
      }, 100);

      // Máscara dinâmica de telefone brasileiro (DDD + 9 ou 8 dígitos)
      if (telInput) {
        telInput.addEventListener('input', function (e) {
          var v = e.target.value.replace(/\D/g, '');
          if (v.length > 11) v = v.slice(0, 11);

          if (v.length > 6) {
            e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
          } else if (v.length > 2) {
            e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
          } else if (v.length > 0) {
            e.target.value = '(' + v;
          }
        });

        telInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            finalizarConversa();
          }
        });
      }

      if (btnFinal) {
        btnFinal.addEventListener('click', function (e) {
          e.preventDefault();
          finalizarConversa();
        });
      }

      async function finalizarConversa() {
        var tel = (telInput ? telInput.value : '').trim();
        var telDigitos = tel.replace(/\D/g, '');

        // Só bloqueia se o cliente DIGITOU algo e ficou incompleto.
        // Se ele não digitar nada, segue direto para o WhatsApp do Rafael com o que já foi coletado na conversa.
        if (telDigitos.length > 0 && telDigitos.length < 10) {
          if (errTel) errTel.style.display = 'block';
          if (telInput) telInput.focus();
          return;
        }
        if (errTel) errTel.style.display = 'none';

        leadData.telefone = telDigitos.length > 0 ? tel : '';
        salvarConversaLocal();

        // Feedback no botão
        btnFinal.disabled = true;
        btnFinal.innerHTML = '<span>⏳</span> Abrindo conversa com o Corretor Rafael...';

        // 1. Gerar mensagem e abrir o WhatsApp IMEDIATAMENTE (ainda no mesmo
        //    "gesto do usuário"). Se isso for adiado por um await antes,
        //    navegadores (principalmente no celular) bloqueiam o pop-up
        //    silenciosamente e o clique parece não fazer nada.
        var mensagemFinal = gerarMensagemWhatsApp(leadData);
        var wppUrl = 'https://wa.me/' + NUMERO_RAFAEL + '?text=' + encodeURIComponent(mensagemFinal);

        fecharModal();
        window.open(wppUrl, '_blank');

        btnFinal.disabled = false;
        btnFinal.innerHTML = '<span>📲</span> CONVERSAR COM O CORRETOR RAFAEL NO WHATSAPP';

        // 2. Salvar Lead no Servidor (API Local / Banco) em segundo plano,
        //    sem bloquear a abertura do WhatsApp.
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: leadData.nome,
            telefone: leadData.telefone,
            empreendimento: leadData.empreendimento,
            empreendimento_slug: leadData.empreendimento_slug,
            origem_url: leadData.origem_url,
            objetivo: leadData.objetivo,
            planejamento_compra: leadData.planejamento_compra,
            forma_pagamento: leadData.forma_pagamento,
            quer_visitar: leadData.quer_visitar,
            data_visita: leadData.data_visita,
            periodo_visita: leadData.horario_visita || leadData.periodo_visita,
            horario_visita: leadData.horario_visita,
            whatsapp_enviado: true
          })
        }).catch(function (err) {
          console.warn('Registro de lead:', err);
        });
      }

      btnFinal.addEventListener('click', finalizarConversa);
    }
  }

  // Abrir Modal de Chat
  function abrirModal(empSobrescrito) {
    injetarModalHTML();

    // Limpar temporizadores pendentes e resetar status
    limparTimeouts();
    definirStatusDigitando(false);

    // Desbloqueia contexto de áudio a partir do clique do usuário
    obterAudioContext();

    var overlay = document.getElementById('lead-modal-overlay');
    var messagesBox = document.getElementById('lead-chat-messages');
    if (!overlay || !messagesBox) return;

    var salvo = carregarConversaLocal();

    // ── RETOMAR CONVERSA JÁ EXISTENTE (cliente já conversou antes) ──
    if (salvo) {
      leadData = salvo.leadData;
      conversaDataInicio = salvo.dataInicio || (new Date()).toISOString();

      // Se a conversa salva ainda estava genérica (página Início) e agora o cliente
      // está numa página de empreendimento específico, atualiza o interesse dele
      var empDetectado = empSobrescrito || identificarEmpreendimento();
      if ((!leadData.empreendimento_slug || leadData.empreendimento_slug === 'geral') && empDetectado.slug !== 'geral') {
        leadData.empreendimento = empDetectado.nome;
        leadData.empreendimento_slug = empDetectado.slug;
      }
      leadData.origem_url = window.location.href;

      var headerEmpSalvo = document.getElementById('lead-header-emp');
      if (headerEmpSalvo) {
        headerEmpSalvo.textContent = leadData.empreendimento || empDetectado.nome;
      }

      stepHistory = (salvo.stepHistory && salvo.stepHistory.length) ? salvo.stepHistory : [salvo.currentStep || 1];
      currentStep = salvo.currentStep || 1;
      calCurrentDate = new Date();

      overlay.style.display = 'flex';
      setTimeout(function () {
        overlay.classList.add('ativo');
      }, 10);

      var pillAnterior = formatarDivisorData(conversaDataInicio);
      var mesmoDia = (pillAnterior === 'Hoje');
      reconstruirConversaAte(currentStep, pillAnterior, !mesmoDia);
      salvarConversaLocal();
      return;
    }

    // ── NOVA CONVERSA (primeira vez que o cliente fala com o Rafael) ──
    var empInfo = empSobrescrito || identificarEmpreendimento();
    leadData.empreendimento = empInfo.nome;
    leadData.empreendimento_slug = empInfo.slug;
    leadData.origem_url = window.location.href;
    conversaDataInicio = (new Date()).toISOString();

    // Atualiza subtítulo do corretor no topo do chat
    var headerEmp = document.getElementById('lead-header-emp');
    if (headerEmp) {
      headerEmp.textContent = empInfo.nome;
    }

    // Limpa e inicia a conversa
    messagesBox.innerHTML = '<div class="lead-chat-date-pill">Hoje</div>';
    stepHistory = [];
    calCurrentDate = new Date();

    overlay.style.display = 'flex';
    setTimeout(function () {
      overlay.classList.add('ativo');
    }, 10);

    irParaEtapa(1, false);
  }

  // Fechar Modal de Chat
  function fecharModal() {
    limparTimeouts();
    definirStatusDigitando(false);
    var overlay = document.getElementById('lead-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('ativo');
    setTimeout(function () {
      overlay.style.display = 'none';
    }, 240);
  }

  // Interceptar todos os botões "Falar com Rafael"
  function ehBotaoRafael(el) {
    if (!el) return false;

    var href = (el.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('chat.whatsapp.com') !== -1) return false;

    if (el.classList.contains('nav-falar-txt') ||
        el.classList.contains('nav-wpp') ||
        el.classList.contains('btn-wpp') ||
        el.classList.contains('wpp-flutuante') ||
        el.id === 'rm-wpp-final' ||
        el.id === 'rm-wpp-flutuante') {
      return true;
    }

    var texto = (el.textContent || '').trim().toLowerCase();
    if (texto.indexOf('corretor rafael') !== -1 ||
        texto.indexOf('falar com rafael') !== -1 ||
        texto.indexOf('falar no whatsapp') !== -1 ||
        texto.indexOf('tenho interesse') !== -1 ||
        texto.indexOf('fale com o corretor') !== -1) {
      return true;
    }

    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com/send') !== -1) {
      return true;
    }

    return false;
  }

  // Delegação global de eventos de clique
  document.addEventListener('click', function (e) {
    var target = e.target.closest('a, button');
    if (!target) return;

    // Nunca interceptar cliques em botões que já estão DENTRO do próprio
    // modal de conversa (ex: o botão final "...CORRETOR RAFAEL NO WHATSAPP"
    // contém o texto "corretor rafael" e seria erroneamente re-capturado
    // aqui, impedindo o clique de chegar até finalizarConversa()).
    if (target.closest('#lead-modal-overlay')) {
      return;
    }

    if (target.id === 'lead-chat-close' || target.id === 'lead-chat-back' || target.id === 'lead-chat-sound') {
      return;
    }

    if (ehBotaoRafael(target)) {
      e.preventDefault();
      e.stopPropagation();

      // Desbloqueia áudio imediatamente com o gesto do usuário
      obterAudioContext();

      var empPersonalizado = null;
      var rmNome = document.getElementById('rm-nome');
      var modalReg = document.getElementById('modal-regiao');
      if (modalReg && modalReg.classList.contains('ativo') && rmNome && rmNome.textContent.trim()) {
        empPersonalizado = {
          nome: rmNome.textContent.trim(),
          slug: rmNome.textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
        };
      }

      abrirModal(empPersonalizado);
      return false;
    }
  }, true);

  // Inicialização no DOM e pré-carregamento do áudio
  function inicializar() {
    injetarModalHTML();
    carregarAudioBuffer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

  // Pré-desbloquear AudioContext na primeira interação de toque ou clique na página
  function desbloquearAudioPrimeiraInteracao() {
    obterAudioContext();
    document.removeEventListener('click', desbloquearAudioPrimeiraInteracao);
    document.removeEventListener('touchstart', desbloquearAudioPrimeiraInteracao);
  }
  document.addEventListener('click', desbloquearAudioPrimeiraInteracao, { once: true, passive: true });
  document.addEventListener('touchstart', desbloquearAudioPrimeiraInteracao, { once: true, passive: true });

  // Expõe para chamadas manuais se necessário
  window.abrirFormularioLead = abrirModal;
  window.fecharFormularioLead = fecharModal;

})();
