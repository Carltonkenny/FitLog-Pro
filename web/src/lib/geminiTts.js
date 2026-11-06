/**
 * Gemini Neural Text-to-Speech Engine
 * Generates broadcast-quality human neural audio using Google Gemini models:
 * - 'Charon': Commanding, deep, athletic male baritone (Coach Marcus)
 * - 'Aoede': Sharp, energetic, motivating athletic female (Coach Maya)
 * Uses the user's existing VITE_GEMINI_API_KEY with zero client setup.
 */

/**
 * Wraps raw 16-bit linear PCM audio into a standard RIFF/WAVE container Data URL
 * so all browsers (Chrome, Edge, Safari, Firefox) can play it in HTML5 Audio nodes.
 */
function pcmToWavDataUrl(rawPcmBase64, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const binaryString = atob(rawPcmBase64);
  const pcmLength = binaryString.length;
  const headerSize = 44;
  const totalLength = headerSize + pcmLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  writeString(0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(8, 'WAVE');

  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  writeString(36, 'data');
  view.setUint32(40, pcmLength, true);

  const pcmBytes = new Uint8Array(buffer, 44);
  for (let i = 0; i < pcmLength; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

let activeAudio = null;
const ttsCache = new Map();

export const GEMINI_VOICE_MODELS = {
  marcus: 'Charon',
  maya: 'Aoede',
};

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-lite-tts',
];

export async function speakGeminiTts({
  text,
  voice = 'Charon',
  apiKey,
  onStart,
  onEnd,
  onError,
}) {
  const key =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' && window.FITLOG_GEMINI_KEY);

  if (!text) return false;

  stopGeminiTts();

  const selectedVoice =
    voice === 'maya' || voice === 'Aoede'
      ? 'Aoede'
      : voice === 'Charon' || voice === 'marcus'
      ? 'Charon'
      : voice;

  // 1. Static high-fidelity audio fast-path for coach intake greetings (0ms latency, human audio)
  if (/may I know your name|what('s| is) your name/i.test(text)) {
    const staticUrl =
      selectedVoice === 'Aoede' ? '/audio/coach/maya_greeting.wav' : '/audio/coach/marcus_greeting.wav';
    try {
      const audio = new Audio(staticUrl);
      activeAudio = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        activeAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        activeAudio = null;
        // Fall through to dynamic synthesis if file missing
      };
      await audio.play();
      return true;
    } catch {
      // Audio autoplay or network restriction, fall through
    }
  }

  // 2. In-memory LRU cache check
  const cacheKey = `${selectedVoice}::${text.trim()}`;
  if (ttsCache.has(cacheKey)) {
    try {
      const audio = new Audio(ttsCache.get(cacheKey));
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
    } catch (e) {
      console.warn('[GeminiTTS] Cache playback error:', e);
    }
  }

  if (!key) return false;

  for (const mod of TTS_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${key}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: text.trim() }],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoice,
              },
            },
          },
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        continue; // Immediately try secondary TTS model with zero artificial delay
      }

      const data = await res.json();
      const part = data?.candidates?.[0]?.content?.parts?.[0];
      if (!part?.inlineData?.data) {
        continue;
      }

      let audioUrl;
      const rawMime = part.inlineData.mimeType || '';
      if (rawMime.includes('audio/wav') && part.inlineData.data.startsWith('UklGR')) {
        // Already contains RIFF WAVE header ('RIFF' base64 starts with UklGR)
        audioUrl = `data:audio/wav;base64,${part.inlineData.data}`;
      } else {
        // Raw linear PCM from Gemini TTS: wrap with RIFF/WAVE header for standard HTML5 Audio playback
        const rateMatch = rawMime.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        audioUrl = pcmToWavDataUrl(part.inlineData.data, sampleRate);
      }
      ttsCache.set(cacheKey, audioUrl);

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
      console.warn(`[GeminiTTS] Model ${mod} error:`, err);
    }
  }

  onError?.(new Error('Gemini TTS unavailable'));
  onEnd?.();
  return false;
}

export function stopGeminiTts() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
}
