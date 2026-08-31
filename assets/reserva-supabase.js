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

  window.buscarEmpreendimentosAoVivo = buscarEmpreendimentosAoVivo;
})();
