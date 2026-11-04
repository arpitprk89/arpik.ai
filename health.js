// Public, non-secret configuration check. Never returns environment values.
module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.statusCode = 405; return res.end(JSON.stringify({ ok: false, error: 'Method not allowed' })); }
  const configured = Boolean(process.env.GEMINI_API_KEY);
  res.statusCode = configured ? 200 : 503;
  return res.end(JSON.stringify({ app: 'ARPIK.AI', version: '0.2', provider: 'Google Gemini', configured, model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite' }));
};
