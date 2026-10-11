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

      // Ajustes feitos no Admin da reserva ficam em data.reserva_admin (nao mexem em lotesInfo do gerenciador)
      var ov = d.reserva_admin || {};
      var lotesAdmin = parseInt(ov.lotes_padrao, 10);

      cidadesMap.get(cidadeInfo.id).empreendimentos.push({
        id: item.id,
        nome: ov.nome ? String(ov.nome) : d.nome,
        quadras: (Array.isArray(ov.quadras) && ov.quadras.length) ? ov.quadras.map(String) : quadras,
        lotes_padrao: lotesAdmin > 0 ? lotesAdmin : maiorLote,
        valor_total_padrao: ov.valor_total_padrao || '',
        entrada_padrao: ov.entrada_padrao || '',
        parcelas_padrao: ov.parcelas_padrao || '',
        valor_parcela_padrao: ov.valor_parcela_padrao || ''
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

  // Grava no Supabase os ajustes do Admin (nome, quadras, lotes e valores) de UM empreendimento.
  // Le a linha atual, acrescenta data.reserva_admin e grava de volta. Falha de verdade (com mensagem) se
  // o Supabase recusar ou se a permissao (RLS) impedir a alteracao — nunca finge que salvou.
  async function salvarReservaAdminAoVivo(emp) {
    var base = SUPABASE_URL + '/rest/v1/empreendimentos';
    var headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' };
    var alvo = base + '?id=eq.' + encodeURIComponent(emp.id);

    var rGet = await fetch(alvo + '&select=id,data', { headers: headers });
    if (!rGet.ok) throw new Error('não consegui ler o empreendimento (erro ' + rGet.status + ')');
    var rows = await rGet.json();
    if (!rows.length) throw new Error('empreendimento não encontrado no Supabase');

    var data = rows[0].data || {};
    data.reserva_admin = {
      nome: emp.nome,
      quadras: emp.quadras,
      lotes_padrao: emp.lotes_padrao,
      valor_total_padrao: emp.valor_total_padrao || '',
      entrada_padrao: emp.entrada_padrao || '',
      parcelas_padrao: emp.parcelas_padrao || '',
      valor_parcela_padrao: emp.valor_parcela_padrao || ''
    };

    var rPatch = await fetch(alvo, {
      method: 'PATCH',
      headers: Object.assign({}, headers, { Prefer: 'return=representation' }),
      body: JSON.stringify({ data: data })
    });
    if (!rPatch.ok) {
      var detalhe = '';
      try { detalhe = (await rPatch.text()).slice(0, 160); } catch (e) {}
      throw new Error('o Supabase recusou a gravação (erro ' + rPatch.status + ') ' + detalhe);
    }
    var saida = await rPatch.json();
    if (!Array.isArray(saida) || saida.length === 0) {
      throw new Error('o Supabase não aplicou a alteração (provável falta de permissão de escrita)');
    }
    return true;
  }

  window.buscarEmpreendimentosAoVivo = buscarEmpreendimentosAoVivo;
  window.salvarReservaAdminAoVivo = salvarReservaAdminAoVivo;
})();
