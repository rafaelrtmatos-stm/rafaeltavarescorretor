const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const ROOT = path.resolve(__dirname);

app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['text/plain', 'text/*', 'application/json'], limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Redirects from vercel.json
app.use((req, res, next) => {
  const url = req.path;
  if (url === '/pajuca' || url.startsWith('/pajuca/')) {
    const rest = url.replace(/^\/pajuca\/?/, '');
    return res.redirect(301, '/pajucara/' + (rest ? rest : ''));
  }
  if (url === '/sao-bras' || url.startsWith('/sao-bras/')) {
    const rest = url.replace(/^\/sao-bras\/?/, '');
    return res.redirect(301, '/sao-braz/' + (rest ? rest : ''));
  }
  next();
});

// Admin save endpoint helper (saves to local site_data.json if needed)
app.post('/api/save-site-data', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(path.join(ROOT, 'site_data.json'), JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LEADS DATABASE & API ──
const DATA_DIR = path.join(ROOT, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uftxcwcryqpkfdfxzlno.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdHhjd2NyeXFwa2ZkZnh6bG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzU2NjcsImV4cCI6MjA5NDI1MTY2N30.Jrxm0Clp5P2KamDKsDSmwB5GLsuP2rbySeWuHEIuqyI';

function ensureLeadsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLeads() {
  ensureLeadsFile();
  try {
    const content = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    return [];
  }
}

function writeLeads(leads) {
  ensureLeadsFile();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

// POST /api/leads - Cadastrar novo lead
app.post('/api/leads', async (req, res) => {
  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // fallback regex se o corpo for urlencoded ou texto solto
        body = {};
      }
    }

    const rawNome = (body.nome || body.name || '').trim();
    const rawTelefone = (body.telefone || body.tel || body.whatsapp || body.tel1 || '').trim();

    if (!rawTelefone && !rawNome) {
      return res.status(400).json({ error: 'Telefone ou identificação é obrigatório.' });
    }

    const nome = rawNome || 'Cliente Interessado';
    const telefone = rawTelefone || '(Não informado)';

    const agora = new Date();
    const novoLead = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: agora.toISOString(),
      nome,
      telefone,
      email: (body.email || '').trim(),
      empreendimento: body.empreendimento || 'Geral / Portal Principal',
      empreendimento_slug: body.empreendimento_slug || 'geral',
      origem_url: body.origem_url || '/',
      objetivo: body.objetivo || '',
      planejamento_compra: body.planejamento_compra || '',
      forma_pagamento: body.forma_pagamento || '',
      quer_visitar: Boolean(body.quer_visitar),
      data_visita: body.data_visita || null,
      periodo_visita: body.horario_visita || body.periodo_visita || null,
      horario_visita: body.horario_visita || null,
      status: 'Novo',
      observacao: body.observacao || '',
      whatsapp_enviado: Boolean(body.whatsapp_enviado !== false)
    };

    // Salvar localmente
    const leads = readLeads();

    // Evitar duplicações idênticas no intervalo de 15 segundos (ex: clique duplo ou sendBeacon + fetch)
    const telDigitos = telefone.replace(/\D/g, '');
    const duplicadoRecente = leads.find(l => {
      const lDig = (l.telefone || '').replace(/\D/g, '');
      if (telDigitos && lDig && telDigitos === lDig) {
        const diffMs = agora.getTime() - new Date(l.created_at).getTime();
        return diffMs < 20000; // 20s
      }
      return false;
    });

    if (duplicadoRecente) {
      // Atualiza os dados do lead recente se tiver mais detalhes
      if (novoLead.objetivo && !duplicadoRecente.objetivo) duplicadoRecente.objetivo = novoLead.objetivo;
      if (novoLead.planejamento_compra && !duplicadoRecente.planejamento_compra) duplicadoRecente.planejamento_compra = novoLead.planejamento_compra;
      if (novoLead.data_visita && !duplicadoRecente.data_visita) duplicadoRecente.data_visita = novoLead.data_visita;
      if (novoLead.observacao && !duplicadoRecente.observacao) duplicadoRecente.observacao = novoLead.observacao;
      writeLeads(leads);
      return res.status(200).json({ success: true, lead: duplicadoRecente, duplicate_merged: true });
    }

    leads.unshift(novoLead);
    writeLeads(leads);

    // Tentar sincronizar com Supabase se a tabela existir
    try {
      fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(novoLead)
      }).catch(err => {});
    } catch (sbErr) {}

    return res.status(201).json({ success: true, lead: novoLead });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return res.status(500).json({ error: 'Erro interno ao salvar lead.' });
  }
});

// POST /api/leads/sync-batch - Sincronizar lote de leads do backup local
app.post('/api/leads/sync-batch', (req, res) => {
  try {
    const batch = Array.isArray(req.body) ? req.body : (req.body && req.body.leads) ? req.body.leads : [];
    if (!batch.length) {
      return res.json({ success: true, added: 0 });
    }
    const leads = readLeads();
    let adicionados = 0;
    batch.forEach(item => {
      const telDig = (item.telefone || '').replace(/\D/g, '');
      if (!telDig && !item.nome) return;
      const jaExiste = leads.some(l => {
        const lDig = (l.telefone || '').replace(/\D/g, '');
        return (lDig && telDig && lDig === telDig) || (item.id && l.id === item.id);
      });
      if (!jaExiste) {
        leads.push({
          id: item.id || ('lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
          created_at: item.created_at || new Date().toISOString(),
          nome: (item.nome || '').trim() || 'Cliente Interessado',
          telefone: item.telefone || '',
          email: item.email || '',
          empreendimento: item.empreendimento || 'Geral / Portal Principal',
          empreendimento_slug: item.empreendimento_slug || 'geral',
          origem_url: item.origem_url || '/',
          objetivo: item.objetivo || '',
          planejamento_compra: item.planejamento_compra || '',
          forma_pagamento: item.forma_pagamento || '',
          quer_visitar: Boolean(item.quer_visitar),
          data_visita: item.data_visita || null,
          periodo_visita: item.horario_visita || item.periodo_visita || null,
          status: item.status || 'Novo',
          observacao: item.observacao || '',
          whatsapp_enviado: Boolean(item.whatsapp_enviado !== false)
        });
        adicionados++;
      }
    });
    if (adicionados > 0) {
      writeLeads(leads);
    }
    return res.json({ success: true, added: adicionados, total: leads.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/leads - Listar leads cadastrados
app.get('/api/leads', (req, res) => {
  try {
    const leads = readLeads();
    return res.json({ success: true, total: leads.length, leads });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar leads.' });
  }
});

// PATCH /api/leads/:id - Atualizar status ou observações de um lead
app.patch('/api/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacao } = req.body;
    const leads = readLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }
    if (status !== undefined) leads[idx].status = status;
    if (observacao !== undefined) leads[idx].observacao = observacao;
    leads[idx].updated_at = new Date().toISOString();
    writeLeads(leads);
    return res.json({ success: true, lead: leads[idx] });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar lead.' });
  }
});

// DELETE /api/leads/:id - Remover lead
app.delete('/api/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    let leads = readLeads();
    leads = leads.filter(l => l.id !== id);
    writeLeads(leads);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir lead.' });
  }
});

function sendHtmlWithLeadModal(filePath, res) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (filePath.includes('/admin/')) {
      return res.type('html').send(content);
    }
    if (!content.includes('lead-modal.js')) {
      const tags = `
<!-- Lead Capture Modal — Rafael Tavares -->
<link rel="stylesheet" href="/assets/lead-modal.css">
<script src="/assets/lead-modal.js" defer></script>
</body>`;
      if (content.includes('</body>')) {
        content = content.replace('</body>', tags);
      } else {
        content += tags;
      }
    }
    return res.type('html').send(content);
  } catch (e) {
    return res.sendFile(filePath);
  }
}

// Fallback and dynamic serving for HTML files
app.get('*', (req, res, next) => {
  const safePath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  const requestedPath = path.join(ROOT, safePath);

  if (!requestedPath.startsWith(ROOT)) {
    return res.status(403).send('Forbidden');
  }

  if (fs.existsSync(requestedPath)) {
    if (fs.statSync(requestedPath).isDirectory()) {
      const indexPath = path.join(requestedPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return sendHtmlWithLeadModal(indexPath, res);
      }
    }
  }

  const htmlPath = requestedPath + '.html';
  if (fs.existsSync(htmlPath)) {
    return sendHtmlWithLeadModal(htmlPath, res);
  }

  if (path.extname(req.path)) {
    return next();
  }

  const rootIndex = path.join(ROOT, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return sendHtmlWithLeadModal(rootIndex, res);
  }

  next();
});

// Serve static assets (images, css, js, etc.)
app.use(express.static(ROOT, {
  extensions: ['html', 'htm'],
  index: 'index.html',
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
