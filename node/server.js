require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { RateLimit } = require('express-rate-limit');
const Redis = require('ioredis');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Segurança básica
app.disable('x-powered-by');

// Body & cookies
app.use(express.urlencoded({ extended: true })); // suporta POST de formulário
app.use(express.json());
app.use(cookieParser());

// Redis (sessões)
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h
const SESSION_COOKIE = 'k7_sid';

// Postgres
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'k7',
});

// Rate limit: login
const loginLimiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Utils sessão
async function createSession(data) {
  const sid = crypto.randomUUID();
  await redis.setex(`sess:${sid}`, SESSION_TTL_SECONDS, JSON.stringify(data));
  return sid;
}
async function getSession(sid) {
  if (!sid) return null;
  const raw = await redis.get(`sess:${sid}`);
  return raw ? JSON.parse(raw) : null;
}
async function destroySession(sid) {
  if (!sid) return;
  await redis.del(`sess:${sid}`);
}

function setSessionCookie(res, sid) {
  const isProd = (process.env.NODE_ENV === 'production');
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: isProd, // exige HTTPS em produção
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

function clearSessionCookie(res) {
  const isProd = (process.env.NODE_ENV === 'production');
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}

// Middleware de autenticação (para rotas protegidas da API)
async function authMiddleware(req, res, next) {
  const sid = req.cookies[SESSION_COOKIE];
  const sess = await getSession(sid);
  if (!sess) return res.status(401).json({ error: 'unauthorized' });
  req.user = sess;
  return next();
}

// Rotas Auth
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.redirect('/index.php?err=' + encodeURIComponent('Preencha e-mail e senha.'));
    }
    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, role, is_active FROM public.users WHERE lower(email)=lower($1) LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.redirect('/index.php?err=' + encodeURIComponent('Credenciais inválidas.'));
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.redirect('/index.php?err=' + encodeURIComponent('Credenciais inválidas.'));
    }
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const sid = await createSession(payload);
    setSessionCookie(res, sid);
    return res.redirect('/painel.php');
  } catch (e) {
    console.error('login error', e);
    return res.redirect('/index.php?err=' + encodeURIComponent('Erro no login.'));
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const sid = req.cookies[SESSION_COOKIE];
    const sess = await getSession(sid);
    if (!sess) return res.status(401).json({ error: 'unauthorized' });
    return res.json({ ok: true, user: sess });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const sid = req.cookies[SESSION_COOKIE];
    await destroySession(sid);
    clearSessionCookie(res);
    return res.redirect('/');
  } catch (e) {
    return res.redirect('/');
  }
});

// Saúde
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API K7 rodando na porta ${PORT}`));