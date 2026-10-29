// Gemini proxy helpers: the browser sends a prompt, this validates it and forwards it with the server-side key.
import { ValidationError } from './validate.ts';

const MAX_TEXT_CHARS = 30_000;
const MAX_IMAGES = 3;
const MAX_IMAGE_B64_CHARS = 2_000_000;
const MAX_OUTPUT_TOKENS = 8192;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
export type GeminiPayload = {
  systemInstruction: { parts: Array<{ text: string }> };
  contents: Array<{ role: 'user' | 'model'; parts: Part[] }>;
  generationConfig: Record<string, unknown>;
};

/** Validates and rebuilds the request so only allowed fields reach Gemini. */
export function sanitizeCoachRequest(body: any): GeminiPayload {
  if (typeof body?.system !== 'string' || !Array.isArray(body?.contents)) throw new ValidationError('bad request');
  let chars = body.system.length;
  let images = 0;

  const contents = body.contents.slice(-12).map((turn: any) => {
    const parts: Part[] = (Array.isArray(turn?.parts) ? turn.parts : []).map((p: any): Part => {
      if (typeof p?.text === 'string') {
        chars += p.text.length;
        return { text: p.text };
      }
      if (p?.inlineData) {
        const { mimeType, data } = p.inlineData;
        if (!ALLOWED_MIME.has(mimeType) || typeof data !== 'string' || data.length > MAX_IMAGE_B64_CHARS) {
          throw new ValidationError('bad image');
        }
        images += 1;
        return { inlineData: { mimeType, data } };
      }
      throw new ValidationError('bad request');
    });
    return { role: turn?.role === 'model' ? ('model' as const) : ('user' as const), parts };
  });
  if (chars > MAX_TEXT_CHARS || images > MAX_IMAGES) throw new ValidationError('too large');

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

type GeminiResult = { text: string; truncated: boolean } | { error: 'busy' | 'upstream-error' | 'upstream-unreachable' };

async function callModel(payload: GeminiPayload, apiKey: string, model: string, timeoutMs: number, doFetch: typeof fetch): Promise<GeminiResult> {
  const res = await doFetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(() => null);
  if (!res) return { error: 'upstream-unreachable' };
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) return { error: res.status === 429 || res.status === 503 ? 'busy' : 'upstream-error' };
  const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
  return { text, truncated: data?.candidates?.[0]?.finishReason === 'MAX_TOKENS' };
}

/**
 * Calls Gemini on the main model. If it is rate limited (429), overloaded (503), too slow or unreachable, tries
 * `fallbackModel` once, so a busy spell on one model does not stop the coach. Returns { text, truncated } or
 * { error } with a stable code the browser maps to a message.
 */
export async function callGemini(
  payload: GeminiPayload,
  opts: { apiKey: string; model: string; fallbackModel?: string; fetchImpl?: typeof fetch },
): Promise<GeminiResult> {
  const doFetch = opts.fetchImpl ?? fetch;
  const hasFallback = Boolean(opts.fallbackModel && opts.fallbackModel !== opts.model);
  const first = await callModel(payload, opts.apiKey, opts.model, hasFallback ? 50_000 : 100_000, doFetch);
  if (!('error' in first) || !hasFallback || first.error === 'upstream-error') return first;
  return callModel(payload, opts.apiKey, opts.fallbackModel as string, 50_000, doFetch);
}

/** Best-effort per-user hourly limit. It resets when the function instance restarts. */
export function makeRateLimiter(limit: number, windowMs = 3_600_000) {
  const hits = new Map<string, number[]>();
  const limited = (userId: string, now = Date.now()): boolean => {
    // Drop users who have gone quiet, so the map cannot grow with every user who ever called.
    if (hits.size > 5000) for (const [id, times] of hits) if (now - times[times.length - 1] >= windowMs) hits.delete(id);
    const recent = (hits.get(userId) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(userId, recent);
      return true;
    }
    recent.push(now);
    hits.set(userId, recent);
    return false;
  };
  /** Seconds until the oldest request in the window ages out, so a blocked caller is told the real wait. */
  limited.retryAfter = (userId: string, now = Date.now()) => {
    const oldest = hits.get(userId)?.[0];
    return oldest === undefined ? 1 : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
  };
  return limited;
}
