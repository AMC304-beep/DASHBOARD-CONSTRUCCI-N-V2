/**
 * IBM Construction Dashboard – Backend Proxy Server
 * ─────────────────────────────────────────────────
 * Purpose:  Proxies all Monday.com API calls so the API token is NEVER
 *           exposed in browser-side JavaScript or localStorage.
 *
 * Security controls:
 *  - Token stored exclusively in .env (server-side, never sent to client)
 *  - CORS origin allowlist (edit ALLOWED_ORIGINS in .env)
 *  - Rate limiting (100 req / 15 min per IP)
 *  - Helmet.js – sets secure HTTP headers (CSP, HSTS, X-Frame-Options, …)
 *  - Input validation on every proxy endpoint
 *  - No stack traces leaked to clients
 *  - File uploads: size capped at 50 MB, MIME-type allowlist enforced
 *  - Structured JSON logging (no sensitive data logged)
 *  - Binds to 127.0.0.1 (localhost) only – never 0.0.0.0
 */

'use strict';

const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const rateLimit     = require('express-rate-limit');
const multer        = require('multer');
const fetch         = require('node-fetch');
const FormData      = require('form-data');
const path          = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/* ── Environment validation ─────────────────────────────────────────────── */
const REQUIRED_ENV = ['MONDAY_API_TOKEN'];
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) {
    console.error(JSON.stringify({ level: 'FATAL', msg: `Missing required env var: ${key}` }));
    process.exit(1);
  }
});

const MONDAY_TOKEN    = process.env.MONDAY_API_TOKEN;
const MONDAY_API      = 'https://api.monday.com/v2';
const PORT            = parseInt(process.env.PORT || '3000', 10);
const HOST            = '127.0.0.1'; // MUST be localhost – never 0.0.0.0
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:3000,http://localhost:3000').split(',').map(s => s.trim());

/* ── App setup ───────────────────────────────────────────────────────────── */
const app = express();

/* Security headers (IBM IT policy: HSTS, no-sniff, CSP, etc.) */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://fonts.googleapis.com',
                    'https://cdn.jsdelivr.net'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],   // front-end only talks to this proxy
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

/* CORS – only allow configured origins */
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

/* Rate limiting – 100 requests per 15 minutes per IP */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
}));

app.use(express.json({ limit: '1mb' }));

/* File upload – memory storage, 50 MB cap, allowlisted MIME types */
const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword',                                                        // doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',        // xlsx
  'application/vnd.ms-excel',                                                  // xls
  'text/plain'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
});

/* Serve static frontend files from the project root */
app.use(express.static(path.join(__dirname, '..')));

/* ── Helper: call Monday API ─────────────────────────────────────────────── */
async function mondayRequest(query, variables = {}) {
  const response = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': MONDAY_TOKEN,
      'API-Version': '2024-01'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Monday API HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map(e => e.message).join('; '));
  }
  return json.data;
}

/* ── Structured logging helper ───────────────────────────────────────────── */
function log(level, msg, extra = {}) {
  // Never log tokens, passwords or PII
  const entry = { level, msg, ts: new Date().toISOString(), ...extra };
  console.log(JSON.stringify(entry));
}

/* ── Routes ──────────────────────────────────────────────────────────────── */

/**
 * Health check – no sensitive data returned
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

/**
 * POST /api/monday/query
 * Body: { query: string, variables?: object }
 * Proxies a GraphQL query/mutation to Monday.com
 */
app.post('/api/monday/query', async (req, res) => {
  const { query, variables } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid request: query is required.' });
  }
  // Block attempts to exfiltrate the token via introspection or raw mutation injection
  if (/monday_token|api_key|password|secret/i.test(query)) {
    return res.status(403).json({ error: 'Forbidden: query contains restricted keywords.' });
  }

  try {
    const data = await mondayRequest(query, variables || {});
    log('info', 'monday_query_ok', { queryPreview: query.substring(0, 60).replace(/\s+/g,' ') });
    res.json({ data });
  } catch (err) {
    log('error', 'monday_query_fail', { error: err.message });
    res.status(502).json({ error: 'Monday API error. See server logs.' });
  }
});

/**
 * POST /api/monday/upload
 * multipart/form-data: itemId, columnId, file
 * Uploads a file to a Monday.com item column
 */
app.post('/api/monday/upload', upload.single('file'), async (req, res) => {
  const { itemId, columnId } = req.body;

  if (!itemId || !columnId || !req.file) {
    return res.status(400).json({ error: 'itemId, columnId and file are required.' });
  }
  if (!/^\d+$/.test(itemId)) {
    return res.status(400).json({ error: 'Invalid itemId.' });
  }

  try {
    const form = new FormData();
    form.append('query',
      `mutation ($file: File!) {
         add_file_to_column(item_id: ${itemId}, column_id: "${columnId}", file: $file) { id }
       }`
    );
    form.append('variables[file]', req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch(MONDAY_API, {
      method:  'POST',
      headers: { 'Authorization': MONDAY_TOKEN, ...form.getHeaders() },
      body:    form
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));

    log('info', 'file_upload_ok', { itemId, columnId, filename: req.file.originalname });
    res.json({ success: true, fileId: json.data?.add_file_to_column?.id });
  } catch (err) {
    log('error', 'file_upload_fail', { error: err.message });
    res.status(502).json({ error: 'File upload failed. See server logs.' });
  }
});

/* ── Global error handler – never leak stack traces ─────────────────────── */
app.use((err, _req, res, _next) => {
  log('error', 'unhandled_error', { error: err.message });
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── Start server ────────────────────────────────────────────────────────── */
app.listen(PORT, HOST, () => {
  log('info', 'server_started', { host: HOST, port: PORT });
});

module.exports = app; // for testing
