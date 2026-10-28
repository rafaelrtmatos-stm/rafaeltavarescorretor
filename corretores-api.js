/**
 * Backend da Central de Materiais  →  rafaeltavarescorretor.com.br/corretores
 *
 * Montado no server.js em:  app.use('/corretores', require('./corretores-api'))
 *
 * Acesso:
 *  - ADMIN (você): e-mail + senha definidos nas variáveis de ambiente
 *      ADMIN_EMAIL     (padrão: admin@rafaeltavarescorretor.com.br)
 *      ADMIN_PASSWORD  (obrigatória; sem ela o login de admin fica desativado)
 *    Pode criar, editar e apagar tudo, e cadastrar corretores.
 *  - CORRETORES (cadastrados por você no painel): só visualizam e baixam.
 *
 * Outras variáveis opcionais:
 *      SESSION_SECRET        segredo para assinar as sessões (se faltar, sessões
 *                            são zeradas a cada reinício do servidor)
 *      CORRETORES_DATA_DIR   pasta onde os dados são gravados
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// ── Configuração ─────────────────────────────────────────────────────────────
const DATA_DIR = process.env.CORRETORES_DATA_DIR || path.join(__dirname, 'corretores-data');
const CLIENT_DIR = path.join(__dirname, 'corretores'); // build do front
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@rafaeltavarescorretor.com.br').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;          // 12 horas
const CORRETOR_TTL_MS = 7 * 24 * 60 * 60 * 1000;   // 7 dias

if (!ADMIN_PASSWORD) {
  console.warn('[corretores] ADMIN_PASSWORD não definida: login de administrador DESATIVADO.');
}
if (!process.env.SESSION_SECRET) {
  console.warn('[corretores] SESSION_SECRET não definida: as sessões serão encerradas a cada reinício.');
}

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Armazenamento em JSON ────────────────────────────────────────────────────
const FILES = {
  properties: path.join(DATA_DIR, 'properties.json'),
  users: path.join(DATA_DIR, 'users.json'),
  suggestions: path.join(DATA_DIR, 'suggestions.json'),
};

const seedSuggestions = [
  {
    id: 'sug-1',
    category: 'Primeiro contato',
    title: 'Abordagem inicial WhatsApp',
    content: 'Olá [Nome do Cliente], tudo bem? Aqui é o [Seu Nome], corretor parceiro do Rafael Tavares. Vi seu interesse no empreendimento [Nome do Empreendimento]. Gostaria de enviar o material completo e tirar suas dúvidas sobre as unidades disponíveis.',
  },
  {
    id: 'sug-2',
    category: 'Informações sobre o empreendimento',
    title: 'Apresentação dos diferenciais',
    content: 'O [Nome do Empreendimento] foi planejado para oferecer alto padrão de acabamento, segurança 24h e excelente localização em [Localização]. Posso te enviar o book digital com todas as fotos e plantas?',
  },
  {
    id: 'sug-3',
    category: 'Preços e formas de pagamento',
    title: 'Explicação de fluxo e parcelas',
    content: 'Trabalhamos com excelentes facilidades de pagamento. Para o plano [Nome do Plano], a entrada é de [Valor Entrada] e o restante parcelado em [Parcelas]. Gostaria de simular uma proposta?',
  },
];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file); // gravação atômica
}

if (!fs.existsSync(FILES.properties)) writeJson(FILES.properties, []);
if (!fs.existsSync(FILES.users)) writeJson(FILES.users, []);
if (!fs.existsSync(FILES.suggestions)) writeJson(FILES.suggestions, seedSuggestions);

// ── Senhas e sessões ─────────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const test = crypto.scryptSync(password, salt, 64);
    const real = Buffer.from(hash, 'hex');
    return test.length === real.length && crypto.timingSafeEqual(test, real);
  } catch (e) {
    return false;
  }
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function signToken(payload) {
  const body = b64(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function readToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Limite de tentativas de login (por IP e por e-mail): 10 a cada 15 min
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(keys) {
  const now = Date.now();
  return keys.some((k) => {
    const a = attempts.get(k);
    return a && a.resetAt > now && a.count >= MAX_ATTEMPTS;
  });
}
function registerFailure(keys) {
  const now = Date.now();
  keys.forEach((k) => {
    const a = attempts.get(k);
    if (!a || a.resetAt <= now) attempts.set(k, { count: 1, resetAt: now + WINDOW_MS });
    else a.count += 1;
  });
}
function clearAttempts(keys) {
  keys.forEach((k) => attempts.delete(k));
}
setInterval(() => {
  const now = Date.now();
  for (const [k, a] of attempts) if (a.resetAt <= now) attempts.delete(k);
}, WINDOW_MS).unref();

// ── Middlewares de autenticação ──────────────────────────────────────────────
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const payload = readToken(header.replace(/^Bearer\s+/i, ''));
  if (!payload) return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });

  if (payload.role === 'admin') {
    if (!ADMIN_PASSWORD) return res.status(401).json({ error: 'Acesso de administrador desativado.' });
    req.user = { userId: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Rafael Tavares (Admin)' };
    return next();
  }

  // Corretor: confirma que o cadastro ainda existe e está ativo
  const user = readJson(FILES.users, []).find((u) => u.id === payload.sub);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Acesso removido ou desativado.' });
  }
  req.user = { userId: user.id, email: user.email, role: 'corretor', name: user.name };
  next();
}

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas o administrador pode fazer isso.' });
    next();
  });
}

// ── API ──────────────────────────────────────────────────────────────────────
router.use('/api', express.json({ limit: '10mb' }));
router.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Login (admin ou corretor)
router.post('/api/auth/login', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const password = String((req.body && req.body.password) || '');
  const keys = [`ip:${req.ip}`, `email:${email}`];

  if (tooManyAttempts(keys)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
  }
  const fail = () => {
    registerFailure(keys);
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  };
  if (!email || !password) return fail();

  // Administrador
  if (email === ADMIN_EMAIL) {
    if (!ADMIN_PASSWORD || !safeEqual(password, ADMIN_PASSWORD)) return fail();
    clearAttempts(keys);
    const token = signToken({ role: 'admin', exp: Date.now() + ADMIN_TTL_MS });
    return res.json({
      token,
      user: { userId: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Rafael Tavares (Admin)' },
    });
  }

  // Corretor
  const users = readJson(FILES.users, []);
  const user = users.find((u) => u.email === email);
  // Faz o hash mesmo se o usuário não existir (evita revelar quais e-mails existem pelo tempo de resposta)
  const ok = verifyPassword(password, user ? user.passwordHash : 'scrypt$00$00');
  if (!user || !ok || user.status !== 'active') return fail();

  clearAttempts(keys);
  user.lastLogin = new Date().toISOString();
  writeJson(FILES.users, users);
  const token = signToken({ role: 'corretor', sub: user.id, exp: Date.now() + CORRETOR_TTL_MS });
  res.json({
    token,
    user: { userId: user.id, email: user.email, role: 'corretor', name: user.name },
  });
});

router.post('/api/auth/logout', (req, res) => res.json({ success: true }));

router.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));

// Empreendimentos: corretor vê só os publicados; admin vê todos
const PROPERTY_FIELDS = ['title', 'description', 'location', 'mapLink', 'coverImage', 'status', 'prices', 'photos', 'videos', 'documents', 'answers'];
const pick = (obj, fields) => {
  const out = {};
  fields.forEach((f) => {
    if (obj && obj[f] !== undefined) out[f] = obj[f];
  });
  return out;
};

router.get('/api/properties', authenticate, (req, res) => {
  const all = readJson(FILES.properties, []);
  res.json(req.user.role === 'admin' ? all : all.filter((p) => p.status === 'published'));
});

router.get('/api/properties/:id', authenticate, (req, res) => {
  const prop = readJson(FILES.properties, []).find((p) => p.id === req.params.id);
  if (!prop || (req.user.role !== 'admin' && prop.status !== 'published')) {
    return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  }
  res.json(prop);
});

router.post('/api/properties', requireAdmin, (req, res) => {
  const properties = readJson(FILES.properties, []);
  const created = {
    id: 'prop-' + Date.now(),
    status: 'draft',
    prices: [],
    photos: [],
    videos: [],
    documents: [],
    ...pick(req.body, PROPERTY_FIELDS),
    updatedAt: new Date().toISOString(),
  };
  properties.push(created);
  writeJson(FILES.properties, properties);
  res.json(created);
});

router.put('/api/properties/:id', requireAdmin, (req, res) => {
  const properties = readJson(FILES.properties, []);
  const i = properties.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Empreendimento não encontrado.' });
  properties[i] = {
    ...properties[i],
    ...pick(req.body, PROPERTY_FIELDS),
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };
  writeJson(FILES.properties, properties);
  res.json(properties[i]);
});

router.delete('/api/properties/:id', requireAdmin, (req, res) => {
  writeJson(FILES.properties, readJson(FILES.properties, []).filter((p) => p.id !== req.params.id));
  res.json({ success: true });
});

// Sugestões de resposta: todos leem, só admin altera
const SUGGESTION_FIELDS = ['category', 'title', 'content'];

router.get('/api/suggestions', authenticate, (req, res) => res.json(readJson(FILES.suggestions, [])));

router.post('/api/suggestions', requireAdmin, (req, res) => {
  const list = readJson(FILES.suggestions, []);
  const created = { id: 'sugg-' + Date.now(), ...pick(req.body, SUGGESTION_FIELDS) };
  list.push(created);
  writeJson(FILES.suggestions, list);
  res.json(created);
});

router.put('/api/suggestions/:id', requireAdmin, (req, res) => {
  const list = readJson(FILES.suggestions, []);
  const i = list.findIndex((s) => s.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Sugestão não encontrada.' });
  list[i] = { ...list[i], ...pick(req.body, SUGGESTION_FIELDS), id: req.params.id };
  writeJson(FILES.suggestions, list);
  res.json(list[i]);
});

router.delete('/api/suggestions/:id', requireAdmin, (req, res) => {
  writeJson(FILES.suggestions, readJson(FILES.suggestions, []).filter((s) => s.id !== req.params.id));
  res.json({ success: true });
});

// Corretores (somente admin). A senha nunca volta para o navegador.
const publicUser = ({ passwordHash, ...rest }) => rest;

router.get('/api/realtors', requireAdmin, (req, res) => {
  res.json(readJson(FILES.users, []).map(publicUser));
});

router.post('/api/realtors', requireAdmin, (req, res) => {
  const name = String((req.body && req.body.name) || '').trim();
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const phone = String((req.body && req.body.phone) || '').trim();
  const password = String((req.body && req.body.password) || '');

  if (!name || !email) return res.status(400).json({ error: 'Informe nome e e-mail.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
  if (password.length < 8) return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });
  if (email === ADMIN_EMAIL) return res.status(400).json({ error: 'Este e-mail é reservado.' });

  const users = readJson(FILES.users, []);
  if (users.some((u) => u.email === email)) return res.status(409).json({ error: 'Já existe um corretor com este e-mail.' });

  const created = {
    id: 'rel-' + Date.now(),
    name,
    email,
    phone,
    status: 'active',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  users.push(created);
  writeJson(FILES.users, users);
  res.json(publicUser(created));
});

router.delete('/api/realtors/:id', requireAdmin, (req, res) => {
  writeJson(FILES.users, readJson(FILES.users, []).filter((u) => u.id !== req.params.id));
  res.json({ success: true });
});

router.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// ── Front (build do React) ───────────────────────────────────────────────────
router.use(
  express.static(CLIENT_DIR, {
    index: false,
    setHeaders: (res, filePath) => {
      // arquivos com hash no nome podem ser cacheados; o resto não
      if (!filePath.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'no-cache');
    },
  })
);

router.get('*', (req, res) => {
  const indexFile = path.join(CLIENT_DIR, 'index.html');
  if (!fs.existsSync(indexFile)) return res.status(404).send('Central de Materiais ainda não foi compilada.');
  res.set('Cache-Control', 'no-cache');
  res.sendFile(indexFile);
});

module.exports = router;
