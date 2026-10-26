/**
 * API da Central de Materiais (Vercel serverless) → /corretores/api/*
 *
 * O vercel.json reescreve  /corretores/api/:path*  →  /api/corretores?route=:path*
 * Os dados ficam no Supabase (tabelas corretores_*), acessadas só por aqui,
 * com a chave de serviço. Nada é gravado em arquivo.
 *
 * Variáveis de ambiente (Vercel → Settings → Environment Variables):
 *   ADMIN_PASSWORD             senha do administrador (obrigatória)
 *   SESSION_SECRET             segredo para assinar as sessões (obrigatória)
 *   SUPABASE_SERVICE_ROLE_KEY  chave "service_role" do Supabase (obrigatória)
 *   SUPABASE_URL               (opcional) padrão: projeto RafaelTavaresCorretor
 *   ADMIN_EMAIL                (opcional) padrão: admin@rafaeltavarescorretor.com.br
 */
const crypto = require('crypto');

const SB_URL = (process.env.SUPABASE_URL || 'https://uftxcwcryqpkfdfxzlno.supabase.co').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@rafaeltavarescorretor.com.br').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';

const ADMIN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas
const CORRETOR_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

// ── Supabase (PostgREST) ─────────────────────────────────────────────────────
async function sb(method, table, { query = '', body, prefer } = {}) {
  const headers = {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${SB_URL}/rest/v1/${table}${query ? '?' + query : ''}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${method} ${table} → ${r.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}
const eq = (v) => 'eq.' + encodeURIComponent(v);

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
  if (!SESSION_SECRET || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// ── Limite de tentativas de login (guardado no banco: vale entre instâncias) ─
const hashKey = (k) => crypto.createHash('sha256').update(k).digest('hex');

async function tooManyAttempts(keys) {
  const hashed = keys.map(hashKey);
  const rows = await sb('GET', 'corretores_login_attempts', { query: `key=in.(${hashed.join(',')})` });
  const now = Date.now();
  return (rows || []).some((a) => new Date(a.reset_at).getTime() > now && a.count >= MAX_ATTEMPTS);
}

async function registerFailure(keys) {
  const now = Date.now();
  for (const k of keys) {
    const key = hashKey(k);
    const rows = await sb('GET', 'corretores_login_attempts', { query: `key=${eq(key)}` });
    const row = rows && rows[0];
    if (!row || new Date(row.reset_at).getTime() <= now) {
      await sb('POST', 'corretores_login_attempts', {
        body: { key, count: 1, reset_at: new Date(now + WINDOW_MS).toISOString() },
        prefer: 'resolution=merge-duplicates',
      });
    } else {
      await sb('PATCH', 'corretores_login_attempts', { query: `key=${eq(key)}`, body: { count: row.count + 1 } });
    }
  }
}

async function clearAttempts(keys) {
  for (const k of keys) await sb('DELETE', 'corretores_login_attempts', { query: `key=${eq(hashKey(k))}` });
}

// ── Autenticação ─────────────────────────────────────────────────────────────
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function authenticate(req, { admin = false } = {}) {
  const header = req.headers.authorization || '';
  const payload = readToken(header.replace(/^Bearer\s+/i, ''));
  if (!payload) throw new HttpError(401, 'Sessão inválida ou expirada. Faça login novamente.');

  let user;
  if (payload.role === 'admin') {
    if (!ADMIN_PASSWORD) throw new HttpError(401, 'Acesso de administrador desativado.');
    user = { userId: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Rafael Tavares (Admin)' };
  } else {
    // Corretor: confirma a cada requisição que o cadastro ainda existe e está ativo
    const rows = await sb('GET', 'corretores_users', { query: `id=${eq(payload.sub)}` });
    const u = rows && rows[0];
    if (!u || u.status !== 'active') throw new HttpError(401, 'Acesso removido ou desativado.');
    user = { userId: u.id, email: u.email, role: 'corretor', name: u.name };
  }
  if (admin && user.role !== 'admin') throw new HttpError(403, 'Apenas o administrador pode fazer isso.');
  return user;
}

// ── Helpers de dados ─────────────────────────────────────────────────────────
const PROPERTY_FIELDS = ['title', 'description', 'location', 'mapLink', 'coverImage', 'status', 'prices', 'photos', 'videos', 'documents'];
const SUGGESTION_FIELDS = ['category', 'title', 'content'];

const pick = (obj, fields) => {
  const out = {};
  fields.forEach((f) => {
    if (obj && obj[f] !== undefined) out[f] = obj[f];
  });
  return out;
};

const toProperty = (row) => ({ ...row.data, id: row.id, status: row.status, updatedAt: row.updated_at });
const toSuggestion = (r) => ({ id: r.id, category: r.category, title: r.title, content: r.content });
const toRealtor = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  status: u.status,
  createdAt: u.created_at,
  lastLogin: u.last_login,
});

function readBody(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// ── Rotas ────────────────────────────────────────────────────────────────────
async function route(req, res) {
  const method = req.method;
  const parts = String((req.query && req.query.route) || '')
    .split('/')
    .filter(Boolean);
  const [a, b, c] = parts;
  const body = readBody(req);

  if (!SB_KEY || !SESSION_SECRET) {
    console.error('[corretores] Faltam SUPABASE_SERVICE_ROLE_KEY e/ou SESSION_SECRET nas variáveis de ambiente.');
    throw new HttpError(500, 'Servidor não configurado. Avise o administrador.');
  }

  // Login (admin ou corretor)
  if (a === 'auth' && b === 'login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const keys = [`ip:${ip}`, `email:${email}`];

    if (await tooManyAttempts(keys)) {
      throw new HttpError(429, 'Muitas tentativas. Aguarde 15 minutos e tente novamente.');
    }
    const fail = async () => {
      await registerFailure(keys);
      throw new HttpError(401, 'E-mail ou senha incorretos.');
    };
    if (!email || !password) return fail();

    if (email === ADMIN_EMAIL) {
      if (!ADMIN_PASSWORD || !safeEqual(password, ADMIN_PASSWORD)) return fail();
      await clearAttempts(keys);
      const token = signToken({ role: 'admin', exp: Date.now() + ADMIN_TTL_MS });
      return res.status(200).json({
        token,
        user: { userId: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Rafael Tavares (Admin)' },
      });
    }

    const rows = await sb('GET', 'corretores_users', { query: `email=${eq(email)}` });
    const user = rows && rows[0];
    // Faz o hash mesmo se o usuário não existir (não revela quais e-mails existem pelo tempo de resposta)
    const ok = verifyPassword(password, user ? user.password_hash : 'scrypt$00$00');
    if (!user || !ok || user.status !== 'active') return fail();

    await clearAttempts(keys);
    await sb('PATCH', 'corretores_users', { query: `id=${eq(user.id)}`, body: { last_login: new Date().toISOString() } });
    const token = signToken({ role: 'corretor', sub: user.id, exp: Date.now() + CORRETOR_TTL_MS });
    return res.status(200).json({
      token,
      user: { userId: user.id, email: user.email, role: 'corretor', name: user.name },
    });
  }

  if (a === 'auth' && b === 'logout' && method === 'POST') return res.status(200).json({ success: true });

  if (a === 'auth' && b === 'me' && method === 'GET') {
    return res.status(200).json({ user: await authenticate(req) });
  }

  // Empreendimentos: corretor vê só os publicados; admin vê todos
  if (a === 'properties') {
    if (!b && method === 'GET') {
      const user = await authenticate(req);
      const filter = user.role === 'admin' ? '' : `status=${eq('published')}&`;
      const rows = await sb('GET', 'corretores_properties', { query: `${filter}order=updated_at.desc` });
      return res.status(200).json((rows || []).map(toProperty));
    }
    if (b && method === 'GET') {
      const user = await authenticate(req);
      const rows = await sb('GET', 'corretores_properties', { query: `id=${eq(b)}` });
      const row = rows && rows[0];
      if (!row || (user.role !== 'admin' && row.status !== 'published')) {
        throw new HttpError(404, 'Empreendimento não encontrado.');
      }
      return res.status(200).json(toProperty(row));
    }
    if (!b && method === 'POST') {
      await authenticate(req, { admin: true });
      const fields = pick(body, PROPERTY_FIELDS);
      const { status = 'draft', ...data } = fields;
      const row = {
        id: 'prop-' + Date.now(),
        status,
        data: { prices: [], photos: [], videos: [], documents: [], ...data },
        updated_at: new Date().toISOString(),
      };
      const created = await sb('POST', 'corretores_properties', { body: row, prefer: 'return=representation' });
      return res.status(200).json(toProperty(created[0]));
    }
    if (b && method === 'PUT') {
      await authenticate(req, { admin: true });
      const rows = await sb('GET', 'corretores_properties', { query: `id=${eq(b)}` });
      const current = rows && rows[0];
      if (!current) throw new HttpError(404, 'Empreendimento não encontrado.');
      const { status = current.status, ...data } = pick(body, PROPERTY_FIELDS);
      const updated = await sb('PATCH', 'corretores_properties', {
        query: `id=${eq(b)}`,
        body: { status, data: { ...current.data, ...data }, updated_at: new Date().toISOString() },
        prefer: 'return=representation',
      });
      return res.status(200).json(toProperty(updated[0]));
    }
    if (b && method === 'DELETE') {
      await authenticate(req, { admin: true });
      await sb('DELETE', 'corretores_properties', { query: `id=${eq(b)}` });
      return res.status(200).json({ success: true });
    }
  }

  // Sugestões de resposta: todos leem, só admin altera
  if (a === 'suggestions') {
    if (!b && method === 'GET') {
      await authenticate(req);
      const rows = await sb('GET', 'corretores_suggestions', { query: 'order=created_at.asc' });
      return res.status(200).json((rows || []).map(toSuggestion));
    }
    if (!b && method === 'POST') {
      await authenticate(req, { admin: true });
      const created = await sb('POST', 'corretores_suggestions', {
        body: { id: 'sugg-' + Date.now(), ...pick(body, SUGGESTION_FIELDS) },
        prefer: 'return=representation',
      });
      return res.status(200).json(toSuggestion(created[0]));
    }
    if (b && method === 'PUT') {
      await authenticate(req, { admin: true });
      const updated = await sb('PATCH', 'corretores_suggestions', {
        query: `id=${eq(b)}`,
        body: pick(body, SUGGESTION_FIELDS),
        prefer: 'return=representation',
      });
      if (!updated || !updated[0]) throw new HttpError(404, 'Sugestão não encontrada.');
      return res.status(200).json(toSuggestion(updated[0]));
    }
    if (b && method === 'DELETE') {
      await authenticate(req, { admin: true });
      await sb('DELETE', 'corretores_suggestions', { query: `id=${eq(b)}` });
      return res.status(200).json({ success: true });
    }
  }

  // Corretores (somente admin). A senha nunca volta para o navegador.
  if (a === 'realtors') {
    if (!b && method === 'GET') {
      await authenticate(req, { admin: true });
      const rows = await sb('GET', 'corretores_users', { query: 'order=created_at.desc' });
      return res.status(200).json((rows || []).map(toRealtor));
    }
    if (!b && method === 'POST') {
      await authenticate(req, { admin: true });
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '');

      if (!name || !email) throw new HttpError(400, 'Informe nome e e-mail.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'E-mail inválido.');
      if (password.length < 8) throw new HttpError(400, 'A senha precisa ter pelo menos 8 caracteres.');
      if (email === ADMIN_EMAIL) throw new HttpError(400, 'Este e-mail é reservado.');

      const exists = await sb('GET', 'corretores_users', { query: `email=${eq(email)}&select=id` });
      if (exists && exists.length) throw new HttpError(409, 'Já existe um corretor com este e-mail.');

      const created = await sb('POST', 'corretores_users', {
        body: { id: 'rel-' + Date.now(), name, email, phone, status: 'active', password_hash: hashPassword(password) },
        prefer: 'return=representation',
      });
      return res.status(200).json(toRealtor(created[0]));
    }
    if (b && method === 'DELETE') {
      await authenticate(req, { admin: true });
      await sb('DELETE', 'corretores_users', { query: `id=${eq(b)}` });
      return res.status(200).json({ success: true });
    }
  }

  throw new HttpError(404, 'Rota não encontrada.');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await route(req, res);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error('[corretores]', err);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
};
