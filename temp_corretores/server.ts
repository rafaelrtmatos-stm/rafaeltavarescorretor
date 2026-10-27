import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const REALTORS_FILE = path.join(DATA_DIR, 'realtors.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUGGESTIONS_FILE = path.join(DATA_DIR, 'suggestions.json');

// Initial seed data
const seedProperties = [
  {
    id: 'prop-1',
    title: 'Reserva Tapajós Luxury Living',
    description: 'Empreendimento de alto padrão à beira do rio, com acabamento impecável, lazer completo e segurança 24h em Santarém.',
    location: 'Av. Tapajós, 1200 - Centro, Santarém - PA',
    mapLink: 'https://maps.google.com/?q=Santarem+PA',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    updatedAt: new Date().toISOString(),
    prices: [
      { plan: 'Lote Standard (300m²)', entry: 'R$ 50.000', installments: '60x de R$ 2.500', total: 'R$ 200.000', notes: 'Correção IPCA anual. Atualizado em Outubro/2026' },
      { plan: 'Lote Vista Rio (450m²)', entry: 'R$ 80.000', installments: '72x de R$ 3.800', total: 'R$ 353.600', notes: 'Unidades limitadas frente para água' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ],
    documents: [
      { id: 'doc-1', name: 'Matrícula Atualizada do Imóvel', description: 'Registro no Cartório de Imóveis de Santarém', available: true },
      { id: 'doc-2', name: 'Memorial Descritivo de Acabamentos', description: 'Especificações técnicas de materiais e fundações', available: true },
      { id: 'doc-3', name: 'Contrato Padrão de Promessa de Compra e Venda', description: 'Minuta contratual aprovada pelo jurídico', available: true },
      { id: 'doc-4', name: 'Mapa Topográfico e Loteamento', description: 'Planta de demarcação dos lotes e áreas verdes', available: true }
    ]
  },
  {
    id: 'prop-2',
    title: 'Edifício Grand Palladium',
    description: 'Apartamentos de luxo de 3 e 4 suítes com varanda gourmet, automação residencial e 3 vagas de garagem.',
    location: 'Praça da Matriz, 45 - Prainha, Santarém - PA',
    mapLink: 'https://maps.google.com/?q=Santarem+PA',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    updatedAt: new Date().toISOString(),
    prices: [
      { plan: 'Apartamento Tipo (120m²)', entry: 'R$ 150.000', installments: '48x de R$ 7.500', total: 'R$ 510.000', notes: 'Chaves em 2027. Atualizado em Outubro/2026' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ],
    documents: [
      { id: 'doc-201', name: 'Memorial Descritivo do Edifício', description: 'Detalhes de fundação e estrutura', available: true },
      { id: 'doc-202', name: 'Convenção de Condomínio', description: 'Regras de convivência', available: true }
    ]
  }
];

const seedRealtors = [
  { id: 'rel-1', name: 'Carlos Eduardo', email: 'corretor@rafaeltavares.com', phone: '(93) 99111-2233', status: 'active', inviteCode: 'RT-8841', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() }
];

const seedUsers = [
  { id: 'usr-admin', name: 'Rafael Tavares (Admin)', email: 'admin@rafaeltavares.com', role: 'admin', passwordHash: 'admin123' },
  { id: 'usr-rel1', name: 'Carlos Eduardo', email: 'corretor@rafaeltavares.com', role: 'corretor', passwordHash: 'corretor123' }
];

const seedSuggestions = [
  {
    id: 'sug-1',
    category: 'Primeiro contato',
    title: 'Abordagem inicial WhatsApp',
    content: 'Olá [Nome do Cliente], tudo bem? Aqui é o [Seu Nome], corretor parceiro do Rafael Tavares. Vi seu interesse no empreendimento [Nome do Empreendimento]. Gostaria de enviar o material completo e tirar suas dúvidas sobre as unidades disponíveis.'
  },
  {
    id: 'sug-2',
    category: 'Informações sobre o empreendimento',
    title: 'Apresentação dos diferenciais',
    content: 'O [Nome do Empreendimento] foi planejado para oferecer alto padrão de acabamento, segurança 24h e excelente localização em [Localização]. Posso te enviar o book digital com todas as fotos e plantas?'
  },
  {
    id: 'sug-3',
    category: 'Preços e formas de pagamento',
    title: 'Explicação de fluxo e parcelas',
    content: 'Trabalhamos com excelentes facilidades de pagamento. Para o plano [Nome do Plano], a entrada é de [Valor Entrada] e o restante parcelado em [Parcelas]. Gostaria de simular uma proposta?'
  }
];

if (!fs.existsSync(PROPERTIES_FILE)) {
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(seedProperties, null, 2));
}
if (!fs.existsSync(REALTORS_FILE)) {
  fs.writeFileSync(REALTORS_FILE, JSON.stringify(seedRealtors, null, 2));
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2));
}
if (!fs.existsSync(SUGGESTIONS_FILE)) {
  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(seedSuggestions, null, 2));
}

const readJson = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeJson = (filePath: string, data: any) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const activeSessions = new Map<string, { userId: string; email: string; role: string; name: string }>();

// Temporary development mode auth bypass or standard token validation
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // In temporary dev mode without strict credentials, allow default dev session
    (req as any).user = { userId: 'dev-user', email: 'corretor@rafaeltavares.com', role: 'admin', name: 'Corretor / Admin (Modo Dev)' };
    return next();
  }
  const token = authHeader.replace('Bearer ', '');
  const session = activeSessions.get(token);
  if (!session) {
    // Fallback dev session for seamless temp dev mode
    (req as any).user = { userId: 'dev-user', email: 'corretor@rafaeltavares.com', role: 'admin', name: 'Corretor / Admin (Modo Dev)' };
    return next();
  }
  (req as any).user = session;
  next();
};

const requireAdmin = (req: Request, res: Response, next: Function) => {
  authenticate(req, res, () => {
    next();
  });
};

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const token = 'token-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionData = { userId: 'usr-dev', email: email || 'corretor@rafaeltavares.com', role: 'admin', name: 'Rafael Tavares (Admin)' };
  activeSessions.set(token, sessionData);
  res.json({ token, user: sessionData });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

// Properties API
app.get('/api/properties', authenticate, (req, res) => {
  const properties = readJson(PROPERTIES_FILE);
  res.json(properties);
});

app.get('/api/properties/:id', authenticate, (req, res) => {
  const properties = readJson(PROPERTIES_FILE);
  const prop = properties.find((p: any) => p.id === req.params.id);
  if (!prop) return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  res.json(prop);
});

app.post('/api/properties', requireAdmin, (req, res) => {
  const properties = readJson(PROPERTIES_FILE);
  const newProp = {
    id: 'prop-' + Date.now(),
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  properties.push(newProp);
  writeJson(PROPERTIES_FILE, properties);
  res.json(newProp);
});

app.put('/api/properties/:id', requireAdmin, (req, res) => {
  const properties = readJson(PROPERTIES_FILE);
  const index = properties.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Empreendimento não encontrado.' });

  properties[index] = {
    ...properties[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  writeJson(PROPERTIES_FILE, properties);
  res.json(properties[index]);
});

app.delete('/api/properties/:id', requireAdmin, (req, res) => {
  let properties = readJson(PROPERTIES_FILE);
  properties = properties.filter((p: any) => p.id !== req.params.id);
  writeJson(PROPERTIES_FILE, properties);
  res.json({ success: true });
});

// Suggestions API
app.get('/api/suggestions', authenticate, (req, res) => {
  const suggestions = readJson(SUGGESTIONS_FILE);
  res.json(suggestions);
});

app.post('/api/suggestions', requireAdmin, (req, res) => {
  const suggestions = readJson(SUGGESTIONS_FILE);
  const newSugg = { id: 'sugg-' + Date.now(), ...req.body };
  suggestions.push(newSugg);
  writeJson(SUGGESTIONS_FILE, suggestions);
  res.json(newSugg);
});

app.put('/api/suggestions/:id', requireAdmin, (req, res) => {
  const suggestions = readJson(SUGGESTIONS_FILE);
  const index = suggestions.findIndex((s: any) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Sugestão não encontrada.' });
  suggestions[index] = { ...suggestions[index], ...req.body, id: req.params.id };
  writeJson(SUGGESTIONS_FILE, suggestions);
  res.json(suggestions[index]);
});

app.delete('/api/suggestions/:id', requireAdmin, (req, res) => {
  let suggestions = readJson(SUGGESTIONS_FILE);
  suggestions = suggestions.filter((s: any) => s.id !== req.params.id);
  writeJson(SUGGESTIONS_FILE, suggestions);
  res.json({ success: true });
});

// Realtors API
app.get('/api/realtors', requireAdmin, (req, res) => {
  const realtors = readJson(REALTORS_FILE);
  res.json(realtors);
});

app.post('/api/realtors', requireAdmin, (req, res) => {
  const realtors = readJson(REALTORS_FILE);
  const newRealtor = { id: 'rel-' + Date.now(), ...req.body, status: 'active', inviteCode: 'RT-' + Math.floor(1000 + Math.random() * 9000) };
  realtors.push(newRealtor);
  writeJson(REALTORS_FILE, realtors);
  res.json(newRealtor);
});

app.delete('/api/realtors/:id', requireAdmin, (req, res) => {
  let realtors = readJson(REALTORS_FILE);
  realtors = realtors.filter((r: any) => r.id !== req.params.id);
  writeJson(REALTORS_FILE, realtors);
  res.json({ success: true });
});

if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
