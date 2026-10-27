/**
 * Login do painel /admin (e do acesso secreto da página /reserva) — validado NO SERVIDOR.
 *
 * Antes, a senha ficava escrita dentro do HTML (qualquer visitante via no "código-fonte").
 * Agora ela só existe na variável de ambiente da Vercel:
 *
 *   ADMIN_PANEL_PASSWORD   senha do painel /admin (obrigatória)
 *   SESSION_SECRET         segredo que assina a sessão (já usado pela Central de Materiais)
 *
 * POST  /api/admin-login   { senha }                → { ok: true, token }
 * GET   /api/admin-login   (Authorization: Bearer)  → { ok: true }  (confere se a sessão vale)
 *
 * A gravação de dados continua protegida onde já era: Supabase (hash da senha) e GitHub (token).
 */
const crypto = require('crypto');

const PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const TTL_MS = 12 * 60 * 60 * 1000; // 12 horas
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

// Limite de tentativas por IP (em memória: freia robôs simples dentro de cada instância)
const attempts = new Map();
const tooMany = (ip) => {
  const a = attempts.get(ip);
  return !!a && a.resetAt > Date.now() && a.count >= MAX_ATTEMPTS;
};
const fail = (ip) => {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else a.count += 1;
};

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const sign = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
};

const verify = (token) => {
  if (!SESSION_SECRET || typeof token !== 'string' || !token.includes('.')) return false;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    return p.role === 'panel' && p.exp > Date.now();
  } catch (e) {
    return false;
  }
};

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (!PANEL_PASSWORD || !SESSION_SECRET) {
    console.error('[admin-login] Defina ADMIN_PANEL_PASSWORD e SESSION_SECRET nas variáveis de ambiente.');
    return res.status(500).json({ ok: false, error: 'Servidor não configurado.' });
  }

  if (req.method === 'GET') {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    return verify(token) ? res.status(200).json({ ok: true }) : res.status(401).json({ ok: false });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ ok: false, error: 'Muitas tentativas. Aguarde 15 minutos.' });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  const senha = String((body && body.senha) || '');

  if (!senha || !safeEqual(senha, PANEL_PASSWORD)) {
    fail(ip);
    return res.status(401).json({ ok: false, error: 'Senha incorreta.' });
  }

  attempts.delete(ip);
  return res.status(200).json({ ok: true, token: sign({ role: 'panel', exp: Date.now() + TTL_MS }) });
};
