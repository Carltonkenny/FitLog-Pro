/**
 * Deepgram Aura Text-to-Speech Engine with Enterprise Rate Limiting & Quota Guard
 * Provides ultra-fast (~120ms), human-grade neural voice output with zero robotic tone.
 * Recommended models for strength coach:
 * - 'aura-helios-en': Confident, athletic, commanding baritone (Marcus/Neptune).
 * - 'aura-athena-en': Warm, energetic motivator (Maya).
 */

let activeAudio = null;
let activeAbortController = null;
const deepgramCache = new Map();

/**
 * Enterprise Rate Limiter & Quota Protector
 * Prevents API credit depletion, accidental infinite loops, and rapid burst traffic.
 * Standard tier limits: 15 requests / minute, 4,000 characters / minute.
 */
class DeepgramRateLimiter {
  constructor(maxRequestsPerMinute = 15, maxCharsPerMinute = 4000) {
    this.maxRpm = maxRequestsPerMinute;
    this.maxCpm = maxCharsPerMinute;
    this.requestTimestamps = [];
    this.charHistory = [];
  }

  canConsume(charCount) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Prune events older than 60s
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo);
    this.charHistory = this.charHistory.filter((item) => item.ts > oneMinuteAgo);

    const currentRpm = this.requestTimestamps.length;
    const currentCpm = this.charHistory.reduce((sum, item) => sum + item.chars, 0);

    if (currentRpm >= this.maxRpm) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${currentRpm}/${this.maxRpm} requests per minute`,
        retryAfterMs: Math.max(500, 60000 - (now - this.requestTimestamps[0])),
      };
    }

    if (currentCpm + charCount > this.maxCpm) {
      return {
        allowed: false,
        reason: `Character quota exceeded: ${currentCpm}/${this.maxCpm} chars per minute`,
        retryAfterMs: Math.max(500, 60000 - (now - this.charHistory[0].ts)),
      };
    }

    return { allowed: true, currentRpm, currentCpm };
  }

  recordConsumption(charCount) {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.charHistory.push({ ts: now, chars: charCount });
  }

  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo).length;
    const recentChars = this.charHistory
      .filter((item) => item.ts > oneMinuteAgo)
      .reduce((sum, item) => sum + item.chars, 0);

    return {
      recentRequests,
      maxRpm: this.maxRpm,
      recentChars,
      maxCpm: this.maxCpm,
      utilizationPct: Math.round((recentRequests / this.maxRpm) * 100),
    };
  }
}

export const deepgramRateLimiter = new DeepgramRateLimiter(15, 4000);

export const DEEPGRAM_VOICES = [
  { id: 'aura-athena-en', name: 'Athena (Energetic Female Coach)', gender: 'female' },
  { id: 'aura-helios-en', name: 'Helios (Athletic Male Baritone)', default: true, gender: 'male' },
  { id: 'aura-zeus-en', name: 'Zeus (Deep Authoritative Male)', gender: 'male' },
  { id: 'aura-asteria-en', name: 'Asteria (Warm Female Coach)', gender: 'female' },
];

export async function speakDeepgram({
  text,
  apiKey,
  voice = 'aura-helios-en',
  onStart,
  onEnd,
  onError,
}) {
  const key =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEEPGRAM_API_KEY) ||
    (typeof process !== 'undefined' && (process.env?.VITE_DEEPGRAM_API_KEY || process.env?.DEEPGRAM_API_KEY)) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('fitlog_deepgram_api_key')) ||
    '';

  if (!key || !text) {
    return false; // Signal to use fallback
  }

  // Safety payload clamping (limit spoken text to 350 chars to preserve credits and conversational pace)
  const cleanText = text.trim().slice(0, 350);

  // Check rate limiter before making network calls
  const rateCheck = deepgramRateLimiter.canConsume(cleanText.length);
  if (!rateCheck.allowed) {
    console.warn(`[DeepgramTTS RateLimit] ${rateCheck.reason}. Falling back gracefully.`);
    onError?.(new Error(rateCheck.reason));
    return false; // Triggers instant graceful fallback to Gemini TTS / WebSpeech
  }

  // Normalize voice model aliases (map Neptune request to Helios athletic baritone)
  let modelName = voice;
  if (/neptune/i.test(voice)) modelName = 'aura-helios-en';
  if (/athena/i.test(voice)) modelName = 'aura-athena-en';
  if (/maya/i.test(voice)) modelName = 'aura-athena-en';
  if (/marcus/i.test(voice)) modelName = 'aura-helios-en';

  // Abort any in-flight requests and silence previous audio
  stopDeepgram();
  activeAbortController = new AbortController();

  const cacheKey = `${modelName}::${cleanText}`;
  if (deepgramCache.has(cacheKey)) {
    try {
      const audioUrl = deepgramCache.get(cacheKey);
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        activeAudio = null;
        onEnd?.();
      };
      audio.onerror = (e) => {
        activeAudio = null;
        onError?.(e);
        onEnd?.();
      };
      await audio.play();
      return true;
    } catch {
      // Audio autoplay restriction, fall through to network fetch
    }
  }

  try {
    const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(modelName)}&encoding=mp3`;
    const res = await fetch(url, {
      method: 'POST',
      signal: activeAbortController.signal,
      headers: {
        'Authorization': `Token ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: cleanText }),
    });

    if (!res.ok) {
      console.warn(`[DeepgramTTS] HTTP ${res.status}: ${res.statusText}`);
      onError?.(new Error(`Deepgram error ${res.status}`));
      return false;
    }

    // Record successful consumption into rate limiter
    deepgramRateLimiter.recordConsumption(cleanText.length);

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    deepgramCache.set(cacheKey, audioUrl);

    const audio = new Audio(audioUrl);
    activeAudio = audio;

    audio.onplay = () => onStart?.();
    audio.onended = () => {
      activeAudio = null;
      onEnd?.();
    };
    audio.onerror = (e) => {
      activeAudio = null;
      onError?.(e);
      onEnd?.();
    };

    await audio.play();
    return true;
  } catch (err) {
    if (err.name === 'AbortError') {
      return false; // Clean cancellation due to new utterance
    }
    console.warn('[DeepgramTTS] Playback error:', err);
    onError?.(err);
    onEnd?.();
    return false;
  } finally {
    activeAbortController = null;
  }
}

export function stopDeepgram() {
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {}
    activeAbortController = null;
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
}

export function isDeepgramConfigured() {
  const hasEnv = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEEPGRAM_API_KEY);
  const hasProcess = Boolean(typeof process !== 'undefined' && (process.env?.VITE_DEEPGRAM_API_KEY || process.env?.DEEPGRAM_API_KEY));
  const hasStorage = Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('fitlog_deepgram_api_key'));
  return hasEnv || hasProcess || hasStorage;
}
