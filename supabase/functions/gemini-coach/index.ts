// Supabase Edge Function: authenticated proxy to the Gemini API.
//
// Why: the Gemini key must never ship in browser JavaScript. The browser sends a prompt here with
// the user's Supabase session; this function checks limits and forwards it using a server-side secret.
//
// Deploy:  supabase functions deploy gemini-coach        (JWT verification stays ON)
// Secret:  supabase secrets set GEMINI_API_KEY=<your key>
// Optional secrets: GEMINI_MODEL (default below), ALLOWED_ORIGIN (default "*")

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.6-flash';
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const MAX_BODY_BYTES = 6_000_000;
const MAX_TEXT_CHARS = 20_000;
const MAX_IMAGES = 3;
const MAX_IMAGE_B64_CHARS = 2_000_000;
const MAX_OUTPUT_TOKENS = 4096;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Best-effort per-user rate limit (resets when the function instance recycles).
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function userIdFromJwt(req: Request): string | null {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function limited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

// deno-lint-ignore no-explicit-any
function sanitize(body: any) {
  if (typeof body?.system !== 'string' || !Array.isArray(body?.contents)) throw new Error('bad-request');
  let textChars = body.system.length;
  let images = 0;
  // deno-lint-ignore no-explicit-any
  const contents = body.contents.slice(-12).map((turn: any) => {
    const role = turn?.role === 'model' ? 'model' : 'user';
    // deno-lint-ignore no-explicit-any
    const parts = (Array.isArray(turn?.parts) ? turn.parts : []).map((p: any) => {
      if (typeof p?.text === 'string') {
        textChars += p.text.length;
        return { text: p.text };
      }
      if (p?.inlineData) {
        const { mimeType, data } = p.inlineData;
        if (!ALLOWED_MIME.has(mimeType) || typeof data !== 'string' || data.length > MAX_IMAGE_B64_CHARS) {
          throw new Error('bad-image');
        }
        images += 1;
        return { inlineData: { mimeType, data } };
      }
      throw new Error('bad-request');
    });
    return { role, parts };
  });
  if (textChars > MAX_TEXT_CHARS || images > MAX_IMAGES) throw new Error('too-large');

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: Math.min(Number(body.maxOutputTokens) || 1024, MAX_OUTPUT_TOKENS),
    temperature: 0.6,
  };
  if (body.responseSchema && typeof body.responseSchema === 'object') {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = body.responseSchema;
  }
  return { systemInstruction: { parts: [{ text: body.system }] }, contents, generationConfig };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);
  if (!GEMINI_API_KEY) return json({ error: 'not-configured' }, 500);

  const userId = userIdFromJwt(req);
  if (!userId) return json({ error: 'unauthorized' }, 401);
  if (limited(userId)) return json({ error: 'rate-limited' }, 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'too-large' }, 413);

  let payload;
  try {
    payload = sanitize(JSON.parse(raw));
  } catch (e) {
    const code = e instanceof Error ? e.message : 'bad-request';
    return json({ error: ['bad-image', 'too-large'].includes(code) ? code : 'bad-request' }, 400);
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(100_000),
  }).catch(() => null);

  if (!res) return json({ error: 'upstream-unreachable' }, 502);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: res.status === 429 || res.status === 503 ? 'busy' : 'upstream-error' }, 502);

  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  return json({ text });
});
