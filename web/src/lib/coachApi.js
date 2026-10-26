import { supabase, isCloudConfigured } from './supabaseClient';

const DEV_KEY = import.meta.env.DEV ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
const DEV_MODEL = 'gemini-3.6-flash';
const TIMEOUT_MS = 100_000;

/** Error whose message is already safe and plain enough to show to the user. */
export class CoachError extends Error {}

const FRIENDLY = {
  busy: 'The AI coach is busy right now. Try again in a minute.',
  'rate-limited': 'You have reached the hourly limit for coach requests. Try again later.',
  'too-large': 'That request is too large. Try fewer or smaller photos.',
  'bad-image': 'One of the photos could not be used. Use a JPEG, PNG or WebP image.',
  unauthorized: 'Sign in to use the AI coach.',
  'not-configured': 'The AI coach is not set up yet.',
  truncated: 'The answer was cut off. Try again.',
};

/**
 * Sends a prompt to the coach and resolves with the model's text.
 * body: { system, contents: [{ role, parts: [{ text } | { inlineData: { mimeType, data } }] }],
 *         responseSchema?, maxOutputTokens? }
 *
 * Production path: the `gemini-coach` Supabase Edge Function (the key stays on the server).
 * Local dev only: if VITE_GEMINI_API_KEY is set and the app runs under `npm run dev`, calls Gemini
 * directly so the coach can be tried before the function is deployed.
 */
export async function askCoach(body) {
  try {
    return await askOnce(body);
  } catch (err) {
    // Gemini has short busy spells. One quiet retry hides most of them from the user.
    if (err instanceof CoachError && err.message === FRIENDLY.busy) {
      await new Promise((r) => setTimeout(r, 2500));
      return askOnce(body);
    }
    throw err;
  }
}

async function askOnce(body) {
  if (DEV_KEY) return askDirect(body);
  if (!isCloudConfigured) throw new CoachError('Connect the app to Supabase to use the AI coach.');

  const { data, error } = await supabase.functions.invoke('gemini-coach', { body });
  if (error) {
    let code = 'upstream-error';
    try {
      code = (await error.context.json()).error || code;
    } catch {
      if (error.name === 'FunctionsFetchError') throw new CoachError('Cannot reach the AI coach. Check your connection.');
    }
    if (error.context?.status === 404) throw new CoachError('The AI coach is not deployed yet.');
    throw new CoachError(FRIENDLY[code] || 'The AI coach is unavailable right now. Your workouts are not affected.');
  }
  if (data?.truncated) throw new CoachError(FRIENDLY.truncated);
  return data?.text || '';
}

async function askDirect(body) {
  const generationConfig = { maxOutputTokens: body.maxOutputTokens || 1024, temperature: 0.6 };
  if (body.responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = body.responseSchema;
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEV_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': DEV_KEY },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: body.system }] },
        contents: body.contents,
        generationConfig,
      }),
    }
  ).catch((err) => {
    if (err.name === 'TimeoutError') throw new CoachError('The AI coach took too long to answer. Try again.');
    throw new CoachError('Cannot reach the AI coach. Check your connection.');
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Gemini dev call failed:', res.status, data?.error?.message);
    throw new CoachError(res.status === 429 || res.status === 503 ? FRIENDLY.busy : 'The AI coach is unavailable right now.');
  }
  if (data?.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new CoachError(FRIENDLY.truncated);
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}
