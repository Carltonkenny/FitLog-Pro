import { ApiError, api, isCloudConfigured } from './neonClient';

/** Error whose message is already safe and plain enough to show to the user. */
export class CoachError extends Error {}

const FRIENDLY = {
  busy: 'The AI coach is busy right now. Try again in a minute.',
  'rate-limited': 'You have reached the hourly limit for coach requests. Try again later.',
  'too-large': 'That request is too large. Try fewer or smaller photos.',
  'request too large': 'That request is too large. Try fewer or smaller photos.',
  'bad-image': 'One of the photos could not be used. Use a JPEG, PNG or WebP image.',
  unauthorized: 'Sign in to use the AI coach.',
  'not-configured': 'The AI coach needs a Gemini API key. Add GEMINI_API_KEY in your backend settings or Google AI Studio to chat live.',
  truncated: 'The answer was cut off. Try again.',
};

const localKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof window !== 'undefined' && window.FITLOG_GEMINI_KEY);
const localModel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || 'gemini-3.1-flash-lite';

async function callDirectGemini(body) {
  const models = Array.from(new Set([localModel, 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest'].filter(Boolean)));
  let lastErr = null;

  for (const mod of models) {
    try {
      const payload = {
        contents: body.contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: body.maxOutputTokens || 2048,
        },
      };
      if (body.system) {
        payload.systemInstruction = { parts: [{ text: body.system }] };
      }
      if (body.responseSchema) {
        payload.generationConfig.responseMimeType = 'application/json';
        payload.generationConfig.responseSchema = body.responseSchema;
      }
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': localKey,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 429 || res.status === 503) {
        // Fallback to secondary model if rate-limited on free tier
        continue;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new CoachError(errData?.error?.message || 'Gemini service unreachable');
      }
      const data = await res.json();
      let text = (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
      if (data?.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new CoachError(FRIENDLY.truncated);
      // Guard against LLM constrained grammar floating-point runaways (e.g. 105.000000000...)
      if (body.responseSchema && text) {
        text = text.replace(/(\d+)\.0{4,}\d*/g, '$1');
      }
      return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new CoachError(FRIENDLY.busy);
}

/**
 * Sends a prompt to the coach and resolves with the model's text.
 * body: { system, contents: [{ role, parts: [{ text } | { inlineData: { mimeType, data } }] }],
 *         responseSchema?, maxOutputTokens? }
 * The request goes to direct Gemini API when a local key is present, or to POST /coach on the FitLog API.
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
  if (localKey) {
    return callDirectGemini(body);
  }
  if (!isCloudConfigured) throw new CoachError('Connect the app to its backend to use the AI coach.');

  let data;
  try {
    data = await api('/coach', { method: 'POST', body });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) throw new CoachError('The AI coach is not deployed yet.');
      throw new CoachError(FRIENDLY[err.code] || 'The AI coach is unavailable right now. Your workouts are not affected.');
    }
    throw new CoachError('Cannot reach the AI coach. Check your connection.');
  }
  if (data?.truncated) throw new CoachError(FRIENDLY.truncated);
  return data?.text || '';
}
