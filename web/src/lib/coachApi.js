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
  'not-configured': 'The AI coach is not set up yet.',
  truncated: 'The answer was cut off. Try again.',
};

/**
 * Sends a prompt to the coach and resolves with the model's text.
 * body: { system, contents: [{ role, parts: [{ text } | { inlineData: { mimeType, data } }] }],
 *         responseSchema?, maxOutputTokens? }
 * The request goes to POST /coach on the FitLog API, which holds the Gemini key. It is never in the browser.
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
