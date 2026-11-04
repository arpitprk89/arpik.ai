// ARPIK.AI 0.2 — secure Vercel serverless proxy for Google Gemini.
// Secrets are read only from Vercel Environment Variables; never from the browser.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const MAX_MESSAGES = 12;
const MAX_CHARS_PER_MESSAGE = 3500;
const MAX_TOTAL_CHARS = 14000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 24;
const buckets = new Map(); // Best-effort per-instance rate limit; not a distributed quota.

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || 'https://arpitprk89.github.io')
    .split(',').map(x => x.trim()).filter(Boolean);
}
function isAllowedOrigin(req, origin) {
  if (!origin) return true;
  try {
    const requestHost = String(req.headers.host || '').toLowerCase();
    if (requestHost && new URL(origin).host.toLowerCase() === requestHost) return true; // same-origin Vercel deploy
  } catch (_) {}
  return allowedOrigins().includes('*') || allowedOrigins().includes(origin);
}
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}
function rateAllowed(ip) {
  const now = Date.now();
  const old = buckets.get(ip);
  if (!old || now - old.start >= WINDOW_MS) { buckets.set(ip, { start: now, count: 1 }); return true; }
  old.count += 1;
  return old.count <= MAX_PER_WINDOW;
}
function cleanMessages(input) {
  if (!Array.isArray(input)) return [];
  let total = 0;
  return input.slice(-MAX_MESSAGES).flatMap(item => {
    if (!item || !['user', 'assistant', 'model'].includes(item.role) || typeof item.content !== 'string') return [];
    const content = item.content.trim().slice(0, MAX_CHARS_PER_MESSAGE);
    if (!content || total + content.length > MAX_TOTAL_CHARS) return [];
    total += content.length;
    return [{ role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user', parts: [{ text: content }] }];
  });
}
module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = isAllowedOrigin(req, origin);
  if (origin && allowed && !origin.includes(String(req.headers.host || ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!allowed) return send(res, 403, { error: 'This website origin is not allowed to use the ARPIK AI endpoint.' });
  if (!process.env.GEMINI_API_KEY) return send(res, 503, { error: 'Gemini is not configured on the server yet. Add GEMINI_API_KEY in Vercel Environment Variables.' });
  if (!rateAllowed(getIp(req))) return send(res, 429, { error: 'You are sending messages too quickly. Please try again in a minute.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { return send(res, 400, { error: 'Invalid JSON body' }); } }
  const contents = cleanMessages(body && body.messages);
  if (!contents.length || contents[contents.length - 1].role !== 'user') return send(res, 400, { error: 'Send a text message to continue.' });
  const system = typeof body.system === 'string' ? body.system.slice(0, 5000) : '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const payload = { contents, generationConfig: { maxOutputTokens: 2200, temperature: 0.55 } };
    if (system) payload.systemInstruction = { parts: [{ text: system }] };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify(payload), signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const status = response.status === 429 ? 429 : (response.status >= 500 ? 502 : 400);
      return send(res, status, { error: response.status === 429 ? 'Gemini free-tier limit reached. Wait a little and retry.' : 'Gemini could not complete this request. Check the server key, model availability and quota.' });
    }
    const text = (result?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) return send(res, 502, { error: 'Gemini returned an empty reply. Please try again.' });
    return send(res, 200, { text, model: MODEL });
  } catch (error) {
    return send(res, 502, { error: error && error.name === 'AbortError' ? 'Gemini took too long. Please try again.' : 'Could not connect to Gemini. Please try again.' });
  } finally { clearTimeout(timer); }
};
