/**
 * SISTEMA DE CAPTAÇÃO DE LEADS — FORMATO CONVERSA WHATSAPP
 * Rafael Tavares · CRECI 13919
 * Interface conversacional inspirada em aplicativo de mensagens com efeitos de digitação e som.
 */

(function () {
  'use strict';

  var NUMERO_RAFAEL = '5593992332012';

  // ── CONFIGURAÇÕES DINÂMICAS DO CHAT (CONFIGURÁVEIS PELO PAINEL ADM) ──
  var CONFIG_CHAT_PADRAO = {
    numero_whatsapp: '5593992332012',
    assistente_nome: 'Assistente do Corretor Rafael',
    assistente_subtitulo: 'Assistente virtual',
    assistente_avatar: '/imagens/rafael-foto.jpg',
    som_habilitado: true,
    tempo_digitando_ms: 3000,
    etapa1: {
      mensagem1: 'Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.',
      mensagem2: 'Antes de começarmos, como posso te chamar?',
      placeholder_nome: 'Digite seu nome completo'
    },
    etapa2: {
      transicao: 'Prazer, {nome}! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.',
      pergunta: 'Para começar, qual é o seu objetivo com o terreno?',
      permitir_pular: true,
      texto_pular: 'Pular esta pergunta ›',
      opcoes: [
        { label: '🏠 Morar', val: 'Morar' },
        { label: '💰 Investir', val: 'Investir' },
        { label: '🏠💰 Morar e investir', val: 'Morar e investir' }
      ]
    },
    etapa3: {
      pergunta: 'E qual é o seu planejamento para essa compra?',
      permitir_pular: true,
      texto_pular: 'Pular esta pergunta ›',
      opcoes: [
        { label: '🔥 Quero comprar agora, se eu gostar', val: 'Quero comprar agora, se eu gostar' },
        { label: '📅 Daqui a uma semana', val: 'Daqui a uma semana' },
        { label: '📆 Daqui a um mês', val: 'Daqui a um mês' },
        { label: '🕐 Mais pra frente', val: 'Mais pra frente' },
        { label: '🤔 Ainda estou analisando', val: 'Ainda estou analisando' }
      ]
    },
    etapa4: {
      pergunta: 'Para entendermos melhor o que você procura, qual destas opções combina mais com o seu planejamento?',
      permitir_pular: true,
      texto_pular: 'Pular esta pergunta ›',
      opcoes: [
        { label: '💵 Tenho o valor para a entrada', val: 'Tenho o valor para a entrada' },
        { label: '💰 Tenho parte do valor', val: 'Tenho parte do valor' },
        { label: '🚗 Pretendo negociar uma troca (carro/moto)', val: 'Pretendo negociar uma troca (carro/moto)' },
        { label: '🤝 Quero negociar à vista, mas dependendo do valor', val: 'Quero negociar à vista, mas dependendo do valor' }
      ]
    },
    etapa5_visita: {
      ativo: true,
      pergunta: 'Gostaria de conhecer o empreendimento pessoalmente?',
      opcao_sim: '🏡 Sim, quero agendar uma visita',
      opcao_nao: '💬 Prefiro receber mais informações primeiro'
    },
    etapa6_data: {
      pergunta: 'Ótimo! Qual dia fica melhor para você?',
      permitir_pular: true,
      texto_pular: 'Pular agendamento de visita ›'
    },
    etapa7_horario: {
      pergunta: 'Qual horário fica melhor para o agendamento da sua visita? (Intervalos de 30 minutos)',
      msg_expediente_fechado: 'Nosso horário de atendimento é das 08h às 18h e já encerrou por hoje. Vamos agendar para amanhã, dia {data} — qual horário fica melhor?',
      horarios_manha: '08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30',
      horarios_tarde: '14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30',
      permitir_pular: true,
      texto_pular: 'Pular definição de horário ›'
    },
    etapa8_final: {
      mensagem: 'Só falta seu WhatsApp para facilitar o seu atendimento com o Corretor Rafael. 😊',
      placeholder_tel: 'Seu WhatsApp (ex: 93 99123-4567)',
      texto_botao: 'CONVERSAR COM O CORRETOR RAFAEL NO WHATSAPP',
      texto_seguranca: '🔒 Seus dados estão seguros e não enviamos spam.',
      texto_intro_wpp: 'Vi {empreendimento} no site e tenho interesse.',
      texto_encerramento_wpp: 'Gostaria de saber mais sobre os terrenos!'
    }
  };

  var configChat = JSON.parse(JSON.stringify(CONFIG_CHAT_PADRAO));

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function aplicarConfigChat(nova) {
    if (!nova || typeof nova !== 'object') return;
    for (var k in nova) {
      if (Object.prototype.hasOwnProperty.call(nova, k)) {
        if (typeof nova[k] === 'object' && nova[k] !== null && !Array.isArray(nova[k])) {
          configChat[k] = configChat[k] || {};
          for (var sub in nova[k]) {
            if (Object.prototype.hasOwnProperty.call(nova[k], sub)) {
              configChat[k][sub] = nova[k][sub];
            }
          }
        } else {
          configChat[k] = nova[k];
        }
      }
    }
    if (typeof configChat.som_habilitado === 'boolean') {
      somHabilitado = configChat.som_habilitado;
    }
    atualizarCabecalhoModalComConfig();
  }

  function carregarConfiguracoesChat(cb) {
    if (window.SITE_DATA && window.SITE_DATA.chat_contato) {
      aplicarConfigChat(window.SITE_DATA.chat_contato);
      if (cb) cb();
      return;
    }
    try {
      fetch('/site_data.json?_=' + Date.now())
        .then(function (r) {
          if (!r.ok) throw new Error('Status ' + r.status);
          return r.json();
        })
        .then(function (d) {
          if (d && d.chat_contato) {
            aplicarConfigChat(d.chat_contato);
          }
          if (cb) cb();
        })
        .catch(function () {
          if (cb) cb();
        });
    } catch (e) {
      if (cb) cb();
    }
  }

  // Sincronização em tempo real via postMessage com o painel ADM
  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.type === 'UPDATE_DATA' && e.data.data && e.data.data.chat_contato) {
      aplicarConfigChat(e.data.data.chat_contato);
    }
    if (e.data.type === 'ABRIR_CHAT_LEAD') {
      abrirModal(e.data.empreendimento || null, null, e.data.etapa || 1);
    }
    if (e.data.type === 'FECHAR_CHAT_LEAD') {
      fecharModal();
    }
  });

  // Carregar configurações do servidor logo no início
  carregarConfiguracoesChat();

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

  // Geração da mensagem do WhatsApp com todos os dados do cliente
  function gerarMensagemWhatsApp(dados) {
    var nome = (dados.nome || '').trim() || 'Cliente';
    var empRaw = (dados.empreendimento || '').trim();
    var isGeral = (!empRaw || empRaw === 'Geral / Portal Principal' || empRaw === 'Geral');
    var empTexto = isGeral ? 'os terrenos e lançamentos' : empRaw;

    var cfgWpp = (configChat && configChat.mensagem_whatsapp) || {};
    var estilo = cfgWpp.estilo || 'organizado'; // 'organizado' (em tópicos) ou 'corrido'

    // Formatar data da visita
    var dataCurta = '';
    if (dados.data_visita) {
      dataCurta = dados.data_visita.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataCurta)) {
        var partes = dataCurta.split('-');
        dataCurta = partes[2] + '/' + partes[1];
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataCurta)) {
        dataCurta = dataCurta.substring(0, 5);
      }
    }
    var hora = (dados.horario_visita || dados.periodo_visita || '').trim();

    // FORMATO 1: ORGANIZADO EM TÓPICOS (Recomendado para leitura rápida no WhatsApp)
    if (estilo === 'organizado') {
      var linhas = [];
      var saudacao = (cfgWpp.texto_intro || 'Olá Corretor Rafael! Meu nome é *{nome}*.')
        .replace(/\{nome\}/gi, nome)
        .replace(/\{empreendimento\}/gi, empTexto);

      linhas.push(saudacao);
      linhas.push('');
      linhas.push('📌 *Interesse:* ' + empTexto);

      if (dados.objetivo && dados.objetivo !== 'A definir' && (!configChat.etapa2 || configChat.etapa2.ativo !== false)) {
        linhas.push('• *Objetivo:* ' + dados.objetivo);
      }
      if (dados.planejamento_compra && dados.planejamento_compra !== 'A definir' && (!configChat.etapa3 || configChat.etapa3.ativo !== false)) {
        linhas.push('• *Planejamento:* ' + dados.planejamento_compra);
      }
      if (dados.forma_pagamento && dados.forma_pagamento !== 'A definir' && (!configChat.etapa4 || configChat.etapa4.ativo !== false)) {
        linhas.push('• *Pagamento:* ' + dados.forma_pagamento);
      }

      // Perguntas extras / personalizadas ativas
      if (dados.respostas_extras && typeof dados.respostas_extras === 'object') {
        Object.keys(dados.respostas_extras).forEach(function (pTitulo) {
          var rVal = dados.respostas_extras[pTitulo];
          if (rVal && rVal !== 'Não informado' && rVal !== 'A definir') {
            linhas.push('• *' + pTitulo + ':* ' + rVal);
          }
        });
      }

      if (!configChat.etapa5_visita || configChat.etapa5_visita.ativo !== false) {
        if (dados.quer_visitar && dataCurta) {
          var visTxt = 'Agendada para ' + dataCurta;
          if (hora) visTxt += ' às ' + hora;
          linhas.push('• *Visita presencial:* ' + visTxt);
        } else {
          linhas.push('• *Visita:* Gostaria de receber mais detalhes antes de agendar.');
        }
      }

      var conclusao = (cfgWpp.texto_conclusao || 'Gostaria de saber mais detalhes e opções disponíveis!')
        .replace(/\{nome\}/gi, nome)
        .replace(/\{empreendimento\}/gi, empTexto);

      if (conclusao) {
        linhas.push('');
        linhas.push(conclusao);
      }

      return linhas.join('\n');
    }

    // FORMATO 2: TEXTO CORRIDO HUMANIZADO
    // Objetivo
    var objFrase = '';
    if (!configChat.etapa2 || configChat.etapa2.ativo !== false) {
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
      } else if (dados.objetivo && dados.objetivo !== 'A definir') {
        objFrase = 'Objetivo: ' + dados.objetivo;
      }
    }

    // Planejamento
    var planFrase = '';
    if (!configChat.etapa3 || configChat.etapa3.ativo !== false) {
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
      } else if (dados.planejamento_compra && dados.planejamento_compra !== 'A definir') {
        planFrase = 'Planejamento: ' + dados.planejamento_compra;
      }
    }

    // Forma de Pagamento
    var pagFrase = '';
    if (!configChat.etapa4 || configChat.etapa4.ativo !== false) {
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
      } else if (dados.forma_pagamento && dados.forma_pagamento !== 'A definir') {
        pagFrase = 'Pagamento: ' + dados.forma_pagamento;
      }
    }

    var prefs = [];
    if (objFrase) prefs.push(objFrase);
    if (planFrase) prefs.push(planFrase);
    if (pagFrase) prefs.push(pagFrase);

    if (dados.respostas_extras && typeof dados.respostas_extras === 'object') {
      Object.keys(dados.respostas_extras).forEach(function (pTitulo) {
        var rVal = dados.respostas_extras[pTitulo];
        if (rVal && rVal !== 'Não informado' && rVal !== 'A definir') {
          prefs.push(pTitulo + ': ' + rVal);
        }
      });
    }

    var textoPrefs = '';
    if (prefs.length > 0) {
      textoPrefs = prefs.join(', ') + '. ';
    }

    var visitaFrase = '';
    if (!configChat.etapa5_visita || configChat.etapa5_visita.ativo !== false) {
      if (dados.quer_visitar && dataCurta) {
        if (hora && hora.indexOf(':') !== -1) {
          visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + ' às ' + hora + '.';
        } else if (hora) {
          visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + ' (' + hora + ').';
        } else {
          visitaFrase = 'Gostaria de agendar uma visita ao empreendimento no dia ' + dataCurta + '.';
        }
      } else {
        visitaFrase = 'Por enquanto, gostaria de receber mais informações sobre as opções disponíveis.';
      }
    }

    var introCorrida = isGeral
      ? 'Vi seu site e tenho interesse em conhecer os terrenos disponíveis. '
      : 'Vi ' + empTexto + ' no site e tenho interesse. ';

    var encerramentoCorrido = cfgWpp.texto_conclusao || 'Gostaria de receber mais informações!';

    return 'Olá, Corretor Rafael! Meu nome é ' + nome + '. ' + introCorrida +
      textoPrefs + visitaFrase + ' ' + encerramentoCorrido;
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
      '        <img src="' + (configChat.assistente_avatar || '/imagens/rafael-foto.jpg') + '" alt="Corretor Rafael" class="lead-chat-avatar" id="lead-header-avatar" onerror="this.src=\'/apple-touch-icon.png\'">',
      '        <span class="lead-online-badge" title="Online agora"></span>',
      '      </div>',
      '      <div class="lead-corretor-meta">',
      '        <div class="lead-corretor-nome-row">',
      '          <span class="lead-corretor-nome" id="lead-header-nome">' + escapeHtml(configChat.assistente_nome || 'Assistente do Corretor Rafael') + '</span>',
      '          <span class="lead-selo-verificado" title="Consultor Verificado">✓</span>',
      '        </div>',
      '        <span class="lead-corretor-sub" id="lead-header-status">',
      '          ' + escapeHtml(configChat.assistente_subtitulo || 'Assistente virtual') + ' · <span class="emp-tag" id="lead-header-emp">Jardim Alenquer</span>',
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
      var sub = (configChat && configChat.assistente_subtitulo) ? configChat.assistente_subtitulo : 'Assistente virtual';
      statusEl.innerHTML = escapeHtml(sub) + ' · <span class="emp-tag" id="lead-header-emp">' + escapeHtml(empNome) + '</span>';
    }
  }

  function atualizarCabecalhoModalComConfig() {
    var nomeEl = document.getElementById('lead-header-nome');
    if (nomeEl && configChat.assistente_nome) {
      nomeEl.textContent = configChat.assistente_nome;
    }
    var avatarEl = document.getElementById('lead-header-avatar');
    if (avatarEl && configChat.assistente_avatar) {
      avatarEl.src = configChat.assistente_avatar;
    }
    var statusEl = document.getElementById('lead-header-status');
    if (statusEl && !statusEl.querySelector('.lead-status-typing')) {
      var empNome = leadData.empreendimento || 'Jardim Alenquer';
      var sub = (configChat && configChat.assistente_subtitulo) ? configChat.assistente_subtitulo : 'Assistente virtual';
      statusEl.innerHTML = escapeHtml(sub) + ' · <span class="emp-tag" id="lead-header-emp">' + escapeHtml(empNome) + '</span>';
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
      respostas_extras: {},
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

        responderCliente(opt.nome, obterProximaEtapa(1));
      });
      actionsWrap.appendChild(btn);
    });

    // Botão Pular
    var btnPularEmp = criarBotaoPular('Pular esta pergunta ›', function () {
      responderCliente('Ainda não sei, quero ver as opções', obterProximaEtapa(1));
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

  // Fila dinâmica de etapas ativas (permite encurtar ou estender o formulário)
  function obterFilaEtapas() {
    var fila = [1];
    if (!configChat.etapa2 || configChat.etapa2.ativo !== false) fila.push(2);
    if (!configChat.etapa3 || configChat.etapa3.ativo !== false) fila.push(3);
    if (!configChat.etapa4 || configChat.etapa4.ativo !== false) fila.push(4);

    if (configChat.perguntas_extras && Array.isArray(configChat.perguntas_extras)) {
      configChat.perguntas_extras.forEach(function (p, idx) {
        if (p && p.ativo !== false && (p.pergunta || '').trim()) {
          fila.push('extra_' + idx);
        }
      });
    }

    if (!configChat.etapa5_visita || configChat.etapa5_visita.ativo !== false) {
      fila.push(5);
    }
    fila.push(8);
    return fila;
  }

  function obterProximaEtapa(etapaAtual) {
    var fila = obterFilaEtapas();
    var idx = fila.indexOf(etapaAtual);
    if (idx !== -1 && idx < fila.length - 1) {
      return fila[idx + 1];
    }
    return 8;
  }

  // Atualizar barra discreta de progresso
  function atualizarProgresso(etapa) {
    var bar = document.getElementById('lead-chat-progress');
    if (!bar) return;
    if (etapa === 6) { bar.style.width = '85%'; return; }
    if (etapa === 7) { bar.style.width = '92%'; return; }
    if (etapa === 8) { bar.style.width = '100%'; return; }

    var fila = obterFilaEtapas();
    var idx = fila.indexOf(etapa);
    if (idx !== -1) {
      var pct = Math.round(((idx + 1) / (fila.length + 1)) * 100);
      bar.style.width = Math.max(15, Math.min(95, pct)) + '%';
    } else {
      bar.style.width = '50%';
    }
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

    // Verificações automáticas de etapas desativadas
    if (etapa === 2 && configChat.etapa2 && configChat.etapa2.ativo === false) {
      irParaEtapa(obterProximaEtapa(2), isVoltar);
      return;
    }
    if (etapa === 3 && configChat.etapa3 && configChat.etapa3.ativo === false) {
      irParaEtapa(obterProximaEtapa(3), isVoltar);
      return;
    }
    if (etapa === 4 && configChat.etapa4 && configChat.etapa4.ativo === false) {
      irParaEtapa(obterProximaEtapa(4), isVoltar);
      return;
    }
    if (etapa === 5 && configChat.etapa5_visita && configChat.etapa5_visita.ativo === false) {
      irParaEtapa(8, isVoltar);
      return;
    }
    if (typeof etapa === 'string' && etapa.indexOf('extra_') === 0) {
      var extraIdx = parseInt(etapa.replace('extra_', ''), 10);
      var pExtra = (configChat.perguntas_extras && configChat.perguntas_extras[extraIdx]);
      if (!pExtra || pExtra.ativo === false || !(pExtra.pergunta || '').trim()) {
        irParaEtapa(obterProximaEtapa(etapa), isVoltar);
        return;
      }
    }

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

    var delayDigitando = (configChat && configChat.tempo_digitando_ms) ? configChat.tempo_digitando_ms : 3000;

    // ── ETAPA 1 (Abertura: 1ª mensagem em delayDigitando, 2ª mensagem em mais delayDigitando com sons) ──
    if (etapa === 1) {
      definirStatusDigitando(true);
      var typing1 = criarIndicadorDigitando();
      messagesBox.appendChild(typing1);
      rolarParaFinal();

      agendarTimeout(function () {
        if (typing1 && typing1.parentNode) typing1.remove();

        // 1ª mensagem do Assistente Virtual (configurável)
        var msg1 = (configChat.etapa1 && configChat.etapa1.mensagem1) || 'Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.';
        messagesBox.appendChild(criarBalaoRafael(msg1));
        tocarSomRecebido();
        rolarParaFinal();

        // Status "digitando..." por mais delayDigitando para a 2ª mensagem
        definirStatusDigitando(true);
        var typing2 = criarIndicadorDigitando();
        messagesBox.appendChild(typing2);
        rolarParaFinal();

        agendarTimeout(function () {
          if (typing2 && typing2.parentNode) typing2.remove();
          definirStatusDigitando(false);

          // 2ª mensagem (configurável)
          var msg2 = (configChat.etapa1 && configChat.etapa1.mensagem2) || 'Antes de começarmos, como posso te chamar?';
          messagesBox.appendChild(criarBalaoRafael(msg2));
          tocarSomRecebido();

          // Renderizar o campo de entrada do nome
          renderizarAcoesNome(messagesBox);
          rolarParaFinal();
        }, delayDigitando);
      }, delayDigitando);
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
        var modeloTrans = (configChat.etapa2 && configChat.etapa2.transicao) || 'Prazer, {nome}! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.';
        messagesBox.appendChild(criarBalaoRafael(modeloTrans.replace(/\{nome\}/gi, primeiroNome)));
        tocarSomRecebido();
        rolarParaFinal();

        // Status "digitando..." por mais delayDigitando para a 2ª mensagem
        definirStatusDigitando(true);
        var typing2 = criarIndicadorDigitando();
        messagesBox.appendChild(typing2);
        rolarParaFinal();

        agendarTimeout(function () {
          if (typing2 && typing2.parentNode) typing2.remove();
          definirStatusDigitando(false);

          var msgPerg = (configChat.etapa2 && configChat.etapa2.pergunta) || 'Para começar, qual é o seu objetivo com o terreno?';
          messagesBox.appendChild(criarBalaoRafael(msgPerg));
          tocarSomRecebido();

          renderizarAcoesEtapa2(messagesBox);
          rolarParaFinal();
        }, delayDigitando);
      }, delayDigitando);
      return;
    }

    // Se etapa 5 (visita) estiver desativada pelo administrador, pula direto para a etapa 8 (WhatsApp)
    if (etapa === 5 && configChat.etapa5_visita && configChat.etapa5_visita.ativo === false) {
      irParaEtapa(8, false);
      return;
    }

    // ── DEMAIS ETAPAS (3 a 8): TEMPO DIGITANDO CONFIGURÁVEL ──
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
    }, delayDigitando);
  }

  // Renderizar o formulário de nome da etapa 1
  function renderizarAcoesNome(container) {
    var actionsWrap = document.createElement('div');
    actionsWrap.className = 'lead-actions-container';
    actionsWrap.id = 'lead-active-actions';

    var placeholderNome = (configChat.etapa1 && configChat.etapa1.placeholder_nome) || 'Digite seu nome completo';
    var card = document.createElement('div');
    card.className = 'lead-input-card';
    card.innerHTML = [
      '<input type="text" id="chat-input-nome" class="lead-chat-field" placeholder="' + escapeHtml(placeholderNome) + '" autocomplete="name" autocapitalize="words" value="' + (leadData.nome || '') + '">',
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
        responderCliente(valor, obterProximaEtapa(1));
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

    var opcoesObj = (configChat.etapa2 && configChat.etapa2.opcoes && configChat.etapa2.opcoes.length)
      ? configChat.etapa2.opcoes
      : [
        { label: '🏠 Morar', val: 'Morar' },
        { label: '💰 Investir', val: 'Investir' },
        { label: '🏠💰 Morar e investir', val: 'Morar e investir' }
      ];

    opcoesObj.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lead-choice-btn';
      btn.innerHTML = '<span class="lead-choice-label">' + escapeHtml(opt.label) + '</span><span class="lead-choice-arrow">›</span>';
      btn.addEventListener('click', function () {
        leadData.objetivo = opt.val || opt.label;
        responderCliente(opt.label, obterProximaEtapa(2));
      });
      actionsWrap.appendChild(btn);
    });

    // Botão Pular
    if (!configChat.etapa2 || configChat.etapa2.permitir_pular !== false) {
      var textoPular = (configChat.etapa2 && configChat.etapa2.texto_pular) || 'Pular esta pergunta ›';
      var btnPular2 = criarBotaoPular(escapeHtml(textoPular), function () {
        leadData.objetivo = 'A definir';
        responderCliente('Pulei esta pergunta', obterProximaEtapa(2));
      });
      actionsWrap.appendChild(btnPular2);
    }

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

    var msg1_e1 = (configChat.etapa1 && configChat.etapa1.mensagem1) || 'Olá! 👋 Sou o assistente virtual do Corretor Rafael. Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar o seu atendimento com ele.';
    var msg2_e1 = (configChat.etapa1 && configChat.etapa1.mensagem2) || 'Antes de começarmos, como posso te chamar?';

    if (etapaAlvo === 1) {
      messagesBox.appendChild(criarBalaoRafael(msg1_e1));
      messagesBox.appendChild(criarBalaoRafael(msg2_e1));
      if (inserirPillHojeAntes) messagesBox.appendChild(criarDivisorData('Hoje'));
      renderizarAcoesNome(messagesBox);
      rolarParaFinal();
      return;
    }

    messagesBox.appendChild(criarBalaoRafael(msg1_e1));
    messagesBox.appendChild(criarBalaoRafael(msg2_e1));
    if (leadData.nome) messagesBox.appendChild(criarBalaoCliente(leadData.nome));

    if (etapaAlvo === 2) {
      renderizarEtapaAtiva(2);
      rolarParaFinal();
      return;
    }

    if (!configChat.etapa2 || configChat.etapa2.ativo !== false) {
      var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
      var trans_e2 = (configChat.etapa2 && configChat.etapa2.transicao) || 'Prazer, {nome}! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.';
      var perg_e2 = (configChat.etapa2 && configChat.etapa2.pergunta) || 'Para começar, qual é o seu objetivo com o terreno?';
      messagesBox.appendChild(criarBalaoRafael(trans_e2.replace(/\{nome\}/gi, primeiroNome)));
      messagesBox.appendChild(criarBalaoRafael(perg_e2));
      if (leadData.objetivo) messagesBox.appendChild(criarBalaoCliente(leadData.objetivo));
    }

    if (etapaAlvo === 3) {
      renderizarEtapaAtiva(3);
      rolarParaFinal();
      return;
    }

    if (!configChat.etapa3 || configChat.etapa3.ativo !== false) {
      var perg_e3 = (configChat.etapa3 && configChat.etapa3.pergunta) || 'E qual é o seu planejamento para essa compra?';
      messagesBox.appendChild(criarBalaoRafael(perg_e3));
      if (leadData.planejamento_compra) messagesBox.appendChild(criarBalaoCliente(leadData.planejamento_compra));
    }

    if (etapaAlvo === 4) {
      renderizarEtapaAtiva(4);
      rolarParaFinal();
      return;
    }

    if (!configChat.etapa4 || configChat.etapa4.ativo !== false) {
      var perg_e4 = (configChat.etapa4 && configChat.etapa4.pergunta) || 'Para entendermos melhor o que você procura, qual destas opções combina mais com o seu planejamento?';
      messagesBox.appendChild(criarBalaoRafael(perg_e4));
      if (leadData.forma_pagamento) messagesBox.appendChild(criarBalaoCliente(leadData.forma_pagamento));
    }

    // Perguntas extras / personalizadas no histórico
    if (configChat.perguntas_extras && Array.isArray(configChat.perguntas_extras)) {
      for (var k = 0; k < configChat.perguntas_extras.length; k++) {
        var pExtra = configChat.perguntas_extras[k];
        if (pExtra && pExtra.ativo !== false && (pExtra.pergunta || '').trim()) {
          var keyExtra = 'extra_' + k;
          if (etapaAlvo === keyExtra) {
            renderizarEtapaAtiva(keyExtra);
            rolarParaFinal();
            return;
          }
          messagesBox.appendChild(criarBalaoRafael(pExtra.pergunta));
          if (leadData.respostas_extras && leadData.respostas_extras[pExtra.pergunta]) {
            messagesBox.appendChild(criarBalaoCliente(leadData.respostas_extras[pExtra.pergunta]));
          }
        }
      }
    }

    if (etapaAlvo === 5) {
      renderizarEtapaAtiva(5);
      rolarParaFinal();
      return;
    }

    if (!configChat.etapa5_visita || configChat.etapa5_visita.ativo !== false) {
      var perg_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.pergunta) || 'Gostaria de conhecer o empreendimento pessoalmente?';
      var lblSim_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.opcao_sim) || '🏡 Sim, quero agendar uma visita';
      var lblNao_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.opcao_nao) || '💬 Prefiro receber mais informações primeiro';
      messagesBox.appendChild(criarBalaoRafael(perg_e5));
      if (leadData.quer_visitar) {
        messagesBox.appendChild(criarBalaoCliente(lblSim_e5));
      } else {
        messagesBox.appendChild(criarBalaoCliente(lblNao_e5));
      }
    }

    if (etapaAlvo === 6) {
      renderizarEtapaAtiva(6);
      rolarParaFinal();
      return;
    }

    if (leadData.quer_visitar) {
      var perg_e6 = (configChat.etapa6_calendario && configChat.etapa6_calendario.pergunta) || 'Ótimo! Qual dia fica melhor para você?';
      messagesBox.appendChild(criarBalaoRafael(perg_e6));
      if (leadData.data_visita) messagesBox.appendChild(criarBalaoCliente('📅 Dia ' + leadData.data_visita));

      if (etapaAlvo === 7) {
        renderizarEtapaAtiva(7);
        rolarParaFinal();
        return;
      }

      var perg_e7 = (configChat.etapa7_horario && configChat.etapa7_horario.pergunta) || 'Qual horário fica melhor para o agendamento da sua visita? (Intervalos de 30 minutos)';
      messagesBox.appendChild(criarBalaoRafael(perg_e7));
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

    // ── ETAPA 2: OBJETIVO ──
    if (etapa === 2) {
      var primeiroNome = (leadData.nome || '').trim().split(' ')[0] || 'você';
      var trans_e2 = (configChat.etapa2 && configChat.etapa2.transicao) || 'Prazer, {nome}! 😊 Vou fazer algumas perguntas rápidas para entender o que você procura e facilitar seu atendimento com o Corretor Rafael.';
      var perg_e2 = (configChat.etapa2 && configChat.etapa2.pergunta) || 'Para começar, qual é o seu objetivo com o terreno?';
      container.appendChild(criarBalaoRafael(trans_e2.replace(/\{nome\}/gi, primeiroNome)));
      container.appendChild(criarBalaoRafael(perg_e2));
      renderizarAcoesEtapa2(container);
      return;
    }

    // ── ETAPA 3: PLANEJAMENTO ──
    if (etapa === 3) {
      var perg_e3 = (configChat.etapa3 && configChat.etapa3.pergunta) || 'E qual é o seu planejamento para essa compra?';
      container.appendChild(criarBalaoRafael(perg_e3));

      var opcoesPlan = (configChat.etapa3 && configChat.etapa3.opcoes && configChat.etapa3.opcoes.length)
        ? configChat.etapa3.opcoes
        : [
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
        btn.innerHTML = '<span class="lead-choice-label">' + escapeHtml(opt.label) + '</span><span class="lead-choice-arrow">›</span>';
        btn.addEventListener('click', function () {
          leadData.planejamento_compra = opt.val || opt.label;
          responderCliente(opt.label, obterProximaEtapa(3));
        });
        actionsWrap.appendChild(btn);
      });

      // Botão Pular
      if (!configChat.etapa3 || configChat.etapa3.permitir_pular !== false) {
        var textoPular3 = (configChat.etapa3 && configChat.etapa3.texto_pular) || 'Pular esta pergunta ›';
        var btnPular3 = criarBotaoPular(escapeHtml(textoPular3), function () {
          leadData.planejamento_compra = 'A definir';
          responderCliente('Pulei esta pergunta', obterProximaEtapa(3));
        });
        actionsWrap.appendChild(btnPular3);
      }

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 4: FORMA DE PAGAMENTO ──
    if (etapa === 4) {
      var perg_e4 = (configChat.etapa4 && configChat.etapa4.pergunta) || 'Para entendermos melhor o que você procura, qual destas opções combina mais com o seu planejamento?';
      container.appendChild(criarBalaoRafael(perg_e4));

      var opcoesPag = (configChat.etapa4 && configChat.etapa4.opcoes && configChat.etapa4.opcoes.length)
        ? configChat.etapa4.opcoes
        : [
          { label: '💵 Tenho o valor para a entrada', val: 'Tenho o valor para a entrada' },
          { label: '💰 Tenho parte do valor', val: 'Tenho parte do valor' },
          { label: '🚗 Pretendo negociar uma troca (carro/moto)', val: 'Pretendo negociar uma troca (carro/moto)' },
          { label: '🤝 Quero negociar à vista, mas dependendo do valor', val: 'Quero negociar à vista, mas dependendo do valor' }
        ];

      opcoesPag.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lead-choice-btn';
        btn.innerHTML = '<span class="lead-choice-label">' + escapeHtml(opt.label) + '</span><span class="lead-choice-arrow">›</span>';
        btn.addEventListener('click', function () {
          leadData.forma_pagamento = opt.val || opt.label;
          responderCliente(opt.label, obterProximaEtapa(4));
        });
        actionsWrap.appendChild(btn);
      });

      // Botão Pular
      if (!configChat.etapa4 || configChat.etapa4.permitir_pular !== false) {
        var textoPular4 = (configChat.etapa4 && configChat.etapa4.texto_pular) || 'Pular esta pergunta ›';
        var btnPular4 = criarBotaoPular(escapeHtml(textoPular4), function () {
          leadData.forma_pagamento = 'A definir';
          responderCliente('Pulei esta pergunta', obterProximaEtapa(4));
        });
        actionsWrap.appendChild(btnPular4);
      }

      container.appendChild(actionsWrap);
      return;
    }

    // ── PERGUNTAS EXTRAS / PERSONALIZADAS ADICIONADAS PELO USUÁRIO ──
    if (typeof etapa === 'string' && etapa.indexOf('extra_') === 0) {
      var extraIdx = parseInt(etapa.replace('extra_', ''), 10);
      var pExtra = (configChat.perguntas_extras && configChat.perguntas_extras[extraIdx]);
      if (!pExtra || pExtra.ativo === false || !(pExtra.pergunta || '').trim()) {
        irParaEtapa(obterProximaEtapa(etapa), false);
        return;
      }

      container.appendChild(criarBalaoRafael(pExtra.pergunta));

      if (pExtra.tipo === 'texto_livre') {
        var cardInputExtra = document.createElement('div');
        cardInputExtra.className = 'lead-input-card';
        cardInputExtra.innerHTML = [
          '<input type="text" id="chat-input-extra-' + extraIdx + '" class="lead-chat-field" placeholder="' + escapeHtml(pExtra.placeholder || 'Digite sua resposta...') + '">',
          '<button type="button" id="chat-btn-extra-' + extraIdx + '" class="lead-btn-submit-action">',
          '  Continuar <span>→</span>',
          '</button>'
        ].join('');
        actionsWrap.appendChild(cardInputExtra);

        setTimeout(function () {
          var inEl = document.getElementById('chat-input-extra-' + extraIdx);
          var btEl = document.getElementById('chat-btn-extra-' + extraIdx);
          if (!inEl) return;
          inEl.focus();

          function submeterExtraTexto() {
            var respVal = (inEl.value || '').trim();
            if (!respVal && pExtra.permitir_pular === false) {
              inEl.focus();
              return;
            }
            if (!leadData.respostas_extras) leadData.respostas_extras = {};
            leadData.respostas_extras[pExtra.pergunta] = respVal || 'Não informado';
            responderCliente(respVal || 'Pulei esta pergunta', obterProximaEtapa(etapa));
          }

          if (btEl) btEl.addEventListener('click', submeterExtraTexto);
          inEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              submeterExtraTexto();
            }
          });
        }, 80);
      } else {
        // Opções de botões
        var opcoesExtra = Array.isArray(pExtra.opcoes) ? pExtra.opcoes : [];
        opcoesExtra.forEach(function (optItem) {
          var labelOpt = typeof optItem === 'object' ? (optItem.label || optItem.val) : String(optItem);
          var valOpt = typeof optItem === 'object' ? (optItem.val || optItem.label) : String(optItem);
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'lead-choice-btn';
          btn.innerHTML = '<span class="lead-choice-label">' + escapeHtml(labelOpt) + '</span><span class="lead-choice-arrow">›</span>';
          btn.addEventListener('click', function () {
            if (!leadData.respostas_extras) leadData.respostas_extras = {};
            leadData.respostas_extras[pExtra.pergunta] = valOpt;
            responderCliente(labelOpt, obterProximaEtapa(etapa));
          });
          actionsWrap.appendChild(btn);
        });
      }

      // Botão Pular Pergunta Extra
      if (pExtra.permitir_pular !== false) {
        var textoPularExtra = pExtra.texto_pular || 'Pular esta pergunta ›';
        var btnPularEx = criarBotaoPular(escapeHtml(textoPularExtra), function () {
          if (!leadData.respostas_extras) leadData.respostas_extras = {};
          leadData.respostas_extras[pExtra.pergunta] = 'Não informado';
          responderCliente('Pulei esta pergunta', obterProximaEtapa(etapa));
        });
        actionsWrap.appendChild(btnPularEx);
      }

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 5: VISITA PRESENCIAL ──
    if (etapa === 5) {
      var perg_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.pergunta) || 'Gostaria de conhecer o empreendimento pessoalmente?';
      var lblSim_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.opcao_sim) || '🏡 Sim, quero agendar uma visita';
      var lblNao_e5 = (configChat.etapa5_visita && configChat.etapa5_visita.opcao_nao) || '💬 Prefiro receber mais informações primeiro';

      container.appendChild(criarBalaoRafael(perg_e5));

      var btnSim = document.createElement('button');
      btnSim.type = 'button';
      btnSim.className = 'lead-choice-btn';
      btnSim.innerHTML = '<span class="lead-choice-label">' + escapeHtml(lblSim_e5) + '</span><span class="lead-choice-arrow">›</span>';
      btnSim.addEventListener('click', function () {
        leadData.quer_visitar = true;
        responderCliente(lblSim_e5, 6);
      });

      var btnNao = document.createElement('button');
      btnNao.type = 'button';
      btnNao.className = 'lead-choice-btn';
      btnNao.innerHTML = '<span class="lead-choice-label">' + escapeHtml(lblNao_e5) + '</span><span class="lead-choice-arrow">›</span>';
      btnNao.addEventListener('click', function () {
        leadData.quer_visitar = false;
        leadData.data_visita = null;
        leadData.periodo_visita = null;
        leadData.horario_visita = null;
        responderCliente(lblNao_e5, 8); // Pula calendário e vai direto para WhatsApp
      });

      actionsWrap.appendChild(btnSim);
      actionsWrap.appendChild(btnNao);
      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 6: CALENDÁRIO DA VISITA ──
    if (etapa === 6) {
      var perg_e6 = (configChat.etapa6_calendario && configChat.etapa6_calendario.pergunta) || 'Ótimo! Qual dia fica melhor para você?';
      container.appendChild(criarBalaoRafael(perg_e6));

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
      var textoPular6 = (configChat.etapa6_calendario && configChat.etapa6_calendario.texto_pular) || 'Pular agendamento de visita ›';
      var btnPular6 = criarBotaoPular(escapeHtml(textoPular6), function () {
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

      var perg_e7 = (configChat.etapa7_horario && configChat.etapa7_horario.pergunta) || 'Qual horário fica melhor para o agendamento da sua visita? (Intervalos de 30 minutos)';

      if (empurradoParaAmanha) {
        container.appendChild(criarBalaoRafael('Nosso horário de atendimento é das 08h às 18h e já encerrou por hoje. Vamos agendar para amanhã, dia ' + leadData.data_visita + ' — qual horário fica melhor?'));
      } else if (isNoiteDepoisDas17) {
        container.appendChild(criarBalaoRafael('Qual horário fica melhor para o agendamento da sua visita? Como já passa das 17h, selecione o melhor horário a partir da tarde:'));
      } else {
        container.appendChild(criarBalaoRafael(perg_e7));
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
      if (!configChat.etapa7_horario || configChat.etapa7_horario.permitir_pular !== false) {
        var textoPular7 = (configChat.etapa7_horario && configChat.etapa7_horario.texto_pular) || 'Pular definição de horário ›';
        var btnPular7 = criarBotaoPular(escapeHtml(textoPular7), function () {
          leadData.horario_visita = 'A combinar';
          leadData.periodo_visita = 'A combinar';
          responderCliente('Horário a combinar com o Corretor Rafael', 8);
        });
        actionsWrap.appendChild(btnPular7);
      }

      container.appendChild(actionsWrap);
      return;
    }

    // ── ETAPA 8: WHATSAPP FINAL ──
    if (etapa === 8) {
      var msgWpp = (configChat.etapa8_final && configChat.etapa8_final.mensagem) || 'Só falta seu WhatsApp para facilitar o seu atendimento com o Corretor Rafael. 😊';
      var placeholderTel = (configChat.etapa8_final && configChat.etapa8_final.placeholder_tel) || 'Seu WhatsApp (ex: 93 99123-4567)';
      var btnTextoWpp = (configChat.etapa8_final && configChat.etapa8_final.texto_botao) || 'CONVERSAR COM O CORRETOR RAFAEL NO WHATSAPP';
      var seloSeg = (configChat.etapa8_final && configChat.etapa8_final.selo_seguranca) || 'Seus dados estão seguros e não enviamos spam.';

      container.appendChild(criarBalaoRafael(msgWpp));

      var cardWpp = document.createElement('div');
      cardWpp.className = 'lead-input-card';
      cardWpp.innerHTML = [
        '<input type="tel" id="chat-input-tel" name="tel" class="lead-chat-field" placeholder="' + escapeHtml(placeholderTel) + '" autocomplete="tel" inputmode="numeric" required value="' + (leadData.telefone || '') + '">',
        '<div id="chat-error-tel" class="lead-error-msg">Por favor, informe um número de WhatsApp válido com DDD.</div>',
        '<button type="button" id="chat-btn-final" class="lead-btn-submit-action">',
        '  <span>📲</span> ' + escapeHtml(btnTextoWpp),
        '</button>',
        '<div class="lead-security-badge">',
        '  <span>🔒</span> ' + escapeHtml(seloSeg),
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

      // Função robusta para gravar lead na API e no banco com garantia de entrega
      function enviarLeadParaServidor(dados) {
        try {
          var payload = {
            nome: (dados.nome || '').trim() || 'Cliente Interessado',
            telefone: (dados.telefone || '').trim(),
            empreendimento: dados.empreendimento || 'Geral / Portal Principal',
            empreendimento_slug: dados.empreendimento_slug || 'geral',
            origem_url: dados.origem_url || window.location.href,
            objetivo: dados.objetivo || '',
            planejamento_compra: dados.planejamento_compra || '',
            forma_pagamento: dados.forma_pagamento || '',
            quer_visitar: Boolean(dados.quer_visitar),
            data_visita: dados.data_visita || null,
            periodo_visita: dados.horario_visita || dados.periodo_visita || null,
            horario_visita: dados.horario_visita || null,
            respostas_extras: dados.respostas_extras || null,
            whatsapp_enviado: true
          };

          var payloadStr = JSON.stringify(payload);

          // Salva backup imediato no localStorage para nunca perder o lead
          try {
            var backup = JSON.parse(localStorage.getItem('rt_leads_backup') || '[]');
            payload.backup_at = new Date().toISOString();
            backup.unshift(payload);
            localStorage.setItem('rt_leads_backup', JSON.stringify(backup.slice(0, 50)));
          } catch (eBkp) {}

          // 1. sendBeacon (garante envio mesmo se a aba fechar ou mudar de foco para o app do WhatsApp)
          if (navigator.sendBeacon) {
            try {
              var blob = new Blob([payloadStr], { type: 'application/json' });
              navigator.sendBeacon('/api/leads', blob);
            } catch (eBeacon) {}
          }

          // 2. Fetch com keepalive: true (padrão W3C para garantir finalização da requisição)
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payloadStr,
            keepalive: true
          }).catch(function (err) {
            console.warn('Registro de lead via fetch:', err);
          });
        } catch (eGeral) {
          console.warn('Erro ao disparar envio do lead:', eGeral);
        }
      }
      window.enviarLeadParaServidor = enviarLeadParaServidor;

      async function finalizarConversa() {
        var tel = (telInput ? telInput.value : '').trim();
        var telDigitos = tel.replace(/\D/g, '');

        // Telefone é obrigatório: bloqueia se estiver vazio OU incompleto.
        if (telDigitos.length < 10) {
          if (errTel) errTel.style.display = 'block';
          if (telInput) telInput.focus();
          return;
        }
        if (errTel) errTel.style.display = 'none';

        leadData.telefone = tel;
        salvarConversaLocal();

        // Feedback no botão
        btnFinal.disabled = true;
        btnFinal.innerHTML = '<span>⏳</span> Abrindo conversa com o Corretor Rafael...';

        // 1. DISPARAR GRAVAÇÃO DO LEAD NO SERVIDOR IMEDIATAMENTE (ANTES de abrir o WhatsApp)
        // Isso garante que os dados já foram enviados para o servidor sem ser cancelados pela troca de app
        enviarLeadParaServidor(leadData);

        // 2. Gerar mensagem e abrir o WhatsApp IMEDIATAMENTE no mesmo gesto do usuário
        var mensagemFinal = gerarMensagemWhatsApp(leadData);
        var numDestino = (configChat.numero_whatsapp || NUMERO_RAFAEL).replace(/\D/g, '');
        var wppUrl = 'https://wa.me/' + numDestino + '?text=' + encodeURIComponent(mensagemFinal);

        fecharModal();
        window.open(wppUrl, '_blank');

        btnFinal.disabled = false;
        btnFinal.innerHTML = '<span>📲</span> ' + escapeHtml(btnTextoWpp);
      }
    }
  }

  // Abrir Modal de Chat
  function abrirModal(empSobrescrito) {
    injetarModalHTML();
    carregarConfiguracoesChat();

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
  window.aplicarConfigChat = aplicarConfigChat;
  window.recarregarConfigChat = carregarConfiguracoesChat;
  window.obterConfigChat = function () { return JSON.parse(JSON.stringify(configChat)); };

  // ── ABERTURA AUTOMÁTICA VIA LINK (?form=1) ──
  // Permite copiar o link do botão "Falar com Rafael" (segurando/long-press ou
  // clique direito → copiar link) e, ao abrir esse link em qualquer página do
  // site, o formulário/chat abre automaticamente, sem precisar de um botão
  // separado de "copiar link".
  function abrirFormularioSeSolicitado() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('form') === '1') {
        abrirModal();
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', abrirFormularioSeSolicitado);
  } else {
    abrirFormularioSeSolicitado();
  }

})();
