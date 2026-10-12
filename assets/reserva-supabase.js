// ── DADOS AO VIVO DE EMPREENDIMENTOS/LOTES (Supabase) ──────────────
// Lê a tabela "empreendimentos" do gerenciador (mesmo banco usado pelo
// sistema de vendas/contratos) e adapta para o formato que a página de
// reserva já espera: { cidades: [{ id, nome, empreendimentos: [...] }] }
(function () {
  var SUPABASE_URL = 'https://uftxcwcryqpkfdfxzlno.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_8Nj_F2sAuA871CEwIam75Q_2J1wuNuH';

  function normalizarNome(n) {
    return (n || '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function inferirCidade(nomeNorm) {
    if (nomeNorm.indexOf('ALENQUER') !== -1) return { id: 'alenquer', nome: 'Alenquer' };
    if (nomeNorm.indexOf('JUSSARAMIA') !== -1) return { id: 'monte-alegre', nome: 'Monte Alegre' };
    return { id: 'santarem', nome: 'Santarém' };
  }

  async function buscarEmpreendimentosAoVivo() {
    var url = SUPABASE_URL + '/rest/v1/empreendimentos?select=id,data,created_at';
    var res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY
      }
    });
    if (!res.ok) throw new Error('Erro ao buscar empreendimentos no Supabase: ' + res.status);
    var rows = await res.json();

    // Dedup por nome normalizado — mantém o registro mais recente de cada
    var porNome = new Map();
    rows.forEach(function (r) {
      var d = r.data || {};
      var nomeNorm = normalizarNome(d.nome);
      if (!nomeNorm) return;
      var atual = porNome.get(nomeNorm);
      if (!atual || new Date(r.created_at) > new Date(atual.created_at)) {
        porNome.set(nomeNorm, { created_at: r.created_at, data: d, id: r.id });
      }
    });

    var cidadesMap = new Map();

    porNome.forEach(function (item) {
      var d = item.data;
      var nomeNorm = normalizarNome(d.nome);
      var cidadeInfo = inferirCidade(nomeNorm);

      if (!cidadesMap.has(cidadeInfo.id)) {
        cidadesMap.set(cidadeInfo.id, { id: cidadeInfo.id, nome: cidadeInfo.nome, empreendimentos: [] });
      }

      // Deriva quadras e maior número de lote a partir de lotesInfo (fonte real)
      var lotesInfo = d.lotesInfo || {};
      var quadrasSet = new Set();
      var maiorLote = 0;
      Object.keys(lotesInfo).forEach(function (chave) {
        var partes = chave.split('-');
        if (partes.length >= 2) {
          quadrasSet.add(partes[0]);
          var n = parseInt(partes[1], 10);
          if (!isNaN(n) && n > maiorLote) maiorLote = n;
        }
      });

      var quadras = Array.from(quadrasSet).sort(function (a, b) {
        var na = parseInt(a, 10), nb = parseInt(b, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });

      if (quadras.length === 0) {
        // Fallback: usa a contagem de quadras salva, se não houver lotesInfo
        var qtd = parseInt(d.quadras, 10);
        quadras = !isNaN(qtd) && qtd > 0
          ? Array.from({ length: qtd }, function (_, i) { return String(i + 1); })
          : ['1'];
      }
      if (maiorLote === 0) maiorLote = 80; // fallback padrão

      cidadesMap.get(cidadeInfo.id).empreendimentos.push({
        id: item.id,
        nome: d.nome,
        quadras: quadras,
        lotes_padrao: maiorLote,
        valor_total_padrao: '',
        entrada_padrao: '',
        parcelas_padrao: '',
        valor_parcela_padrao: ''
      });
    });

    var cidades = Array.from(cidadesMap.values());
    cidades.forEach(function (c) {
      c.empreendimentos.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
    });

    var ordem = ['santarem', 'alenquer', 'monte-alegre'];
    cidades.sort(function (a, b) {
      var ia = ordem.indexOf(a.id), ib = ordem.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return { cidades: cidades };
  }

  // ── CONFIGURAÇÃO SALVA PELO ADM (tabela site_config, chave "reserva_dados") ──
  // O gerenciador (modal ADM da página de reserva) grava aqui as quadras, o
  // número de lotes e os valores de cada empreendimento. Isso tem prioridade
  // sobre o que é derivado da tabela "empreendimentos".
  var CHAVE_CONFIG = 'reserva_dados';

  function headersSb(extra) {
    var h = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }

  async function buscarConfigReservaSupabase() {
    var res = await fetch(
      SUPABASE_URL + '/rest/v1/site_config?chave=eq.' + CHAVE_CONFIG + '&select=valor',
      { cache: 'no-store', headers: headersSb() }
    );
    if (!res.ok) throw new Error('Erro ao ler site_config: ' + res.status);
    var rows = await res.json();
    var v = rows && rows[0] && rows[0].valor;
    return (v && typeof v === 'object' && Array.isArray(v.cidades)) ? v : null;
  }

  // Grava no Supabase via RPC (a senha é conferida no servidor).
  // Retorna { ok, senhaErrada, motivo }
  async function salvarConfigReservaSupabase(dados, senha) {
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/salvar_site_config', {
        method: 'POST',
        headers: headersSb({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ p_senha: senha, p_chave: CHAVE_CONFIG, p_valor: dados })
      });
      if (res.ok) return { ok: true };
      var txt = '';
      try { txt = await res.text(); } catch (e) {}
      if (res.status === 403 || txt.indexOf('senha_invalida') !== -1) {
        return { ok: false, senhaErrada: true, motivo: 'senha do Admin incorreta' };
      }
      return { ok: false, motivo: 'erro ' + res.status + (txt ? ' — ' + txt.slice(0, 160) : '') };
    } catch (e) {
      return { ok: false, motivo: 'sem conexão com o Supabase' };
    }
  }

  function todosEmpreendimentos(dados) {
    var lista = [];
    ((dados && dados.cidades) || []).forEach(function (c) {
      (c.empreendimentos || []).forEach(function (e) { lista.push({ cidade: c, emp: e }); });
    });
    return lista;
  }

  // Aplica a config do ADM por cima dos empreendimentos ao vivo.
  // Casa por id e, se não achar, pelo nome normalizado.
  function mesclarConfigReserva(vivo, cfg) {
    if (!cfg) return vivo;
    if (!vivo || !vivo.cidades || !vivo.cidades.length) return cfg;

    var excluidos = new Set((cfg.excluidos || []).map(String));
    var resultado = { cidades: [], excluidos: Array.from(excluidos) };

    vivo.cidades.forEach(function (c) {
      resultado.cidades.push({
        id: c.id,
        nome: c.nome,
        empreendimentos: c.empreendimentos.filter(function (e) { return !excluidos.has(String(e.id)); })
      });
    });

    var vivosFlat = todosEmpreendimentos(resultado);
    function achar(emp) {
      for (var i = 0; i < vivosFlat.length; i++) {
        if (String(vivosFlat[i].emp.id) === String(emp.id)) return vivosFlat[i];
      }
      var n = normalizarNome(emp.nome);
      for (var j = 0; j < vivosFlat.length; j++) {
        if (normalizarNome(vivosFlat[j].emp.nome) === n) return vivosFlat[j];
      }
      return null;
    }

    (cfg.cidades || []).forEach(function (cCfg) {
      (cCfg.empreendimentos || []).forEach(function (eCfg) {
        if (excluidos.has(String(eCfg.id))) return;
        var alvo = achar(eCfg);
        if (alvo) {
          var e = alvo.emp;
          if (eCfg.nome) e.nome = eCfg.nome;
          if (Array.isArray(eCfg.quadras) && eCfg.quadras.length) e.quadras = eCfg.quadras;
          if (eCfg.lotes_padrao) e.lotes_padrao = eCfg.lotes_padrao;
          ['valor_total_padrao', 'entrada_padrao', 'parcelas_padrao', 'valor_parcela_padrao'].forEach(function (k) {
            if (eCfg[k] !== undefined && eCfg[k] !== null) e[k] = eCfg[k];
          });
        } else {
          // Empreendimento criado só no ADM (não existe na tabela "empreendimentos")
          var cidade = resultado.cidades.find(function (c) { return c.id === cCfg.id; });
          if (!cidade) {
            cidade = { id: cCfg.id, nome: cCfg.nome, empreendimentos: [] };
            resultado.cidades.push(cidade);
          }
          cidade.empreendimentos.push(eCfg);
        }
      });
    });

    resultado.cidades.forEach(function (c) {
      c.empreendimentos.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
    });
    return resultado;
  }

  // Ponto de entrada da página de reserva: ao vivo + config do ADM.
  // Retorna null se nenhuma das duas fontes respondeu.
  async function carregarReservaDados() {
    var vivo = null, cfg = null;
    try { vivo = await buscarEmpreendimentosAoVivo(); }
    catch (e) { console.warn('Empreendimentos ao vivo indisponíveis:', e); }
    try { cfg = await buscarConfigReservaSupabase(); }
    catch (e) { console.warn('Config de reserva (site_config) indisponível:', e); }
    var final = mesclarConfigReserva(vivo, cfg);
    return (final && final.cidades && final.cidades.length) ? final : null;
  }

  window.buscarEmpreendimentosAoVivo = buscarEmpreendimentosAoVivo;
  window.carregarReservaDados = carregarReservaDados;
  window.salvarConfigReservaSupabase = salvarConfigReservaSupabase;
})();
