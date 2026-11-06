/**
 * Gemini Multimodal Live API Client (WebSockets)
 * Provides bidirectional real-time audio and visual streaming directly with Google Gemini.
 * Uses native neural voices (Fenrir / Charon / Puck) with low-latency PCM playback.
 */

export class GeminiLiveClient {
  constructor({ apiKey, voice = 'Fenrir', onAudioChunk, onTranscript, onError, onClose }) {
    this.apiKey = apiKey;
    this.voice = voice;
    this.onAudioChunk = onAudioChunk;
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.onClose = onClose;

    this.ws = null;
    this.audioContext = null;
    this.nextPlayTime = 0;
    this.isConnected = false;
    this.isSetupComplete = false;
  }

  async connect(systemInstruction = '') {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const host = 'generativelanguage.googleapis.com';
    const path = '/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
    const url = `wss://${host}${path}?key=${this.apiKey}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        return reject(err);
      }

      this.ws.onopen = () => {
        this.isConnected = true;
        this.sendSetup(systemInstruction);
        resolve();
      };

      this.ws.onmessage = async (event) => {
        try {
          let data;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            data = JSON.parse(text);
          } else {
            data = JSON.parse(event.data);
          }
          this.handleServerMessage(data);
        } catch (err) {
          console.warn('[GeminiLive] Parse message error:', err);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('[GeminiLive] WebSocket error:', e);
        this.onError?.(e);
        reject(e);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isSetupComplete = false;
        this.onClose?.();
      };
    });
  }

  sendSetup(systemText) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupMsg = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.voice, // 'Fenrir' (athletic baritone), 'Charon' (deep authority)
              },
            },
          },
        },
      },
    };

    if (systemText) {
      setupMsg.setup.systemInstruction = {
        parts: [{ text: systemText }],
      };
    }

    this.ws.send(JSON.stringify(setupMsg));
    this.isSetupComplete = true;
  }

  handleServerMessage(msg) {
    if (msg.setupComplete) {
      this.isSetupComplete = true;
      return;
    }

    const parts = msg?.serverContent?.modelTurn?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const pcmBase64 = part.inlineData.data;
        this.playPcmChunk(pcmBase64);
        this.onAudioChunk?.(pcmBase64);
      }
      if (part.text) {
        this.onTranscript?.(part.text);
      }
    }
  }

  /** Send 16kHz 1-channel PCM audio from microphone */
  sendAudioChunk(pcmBase64) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetupComplete) return;
    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: pcmBase64,
          },
        ],
      },
    };
    this.ws.send(JSON.stringify(msg));
  }

  /** Send JPEG camera frame for live form check */
  sendVideoFrame(jpegBase64) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetupComplete) return;
    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'image/jpeg',
            data: jpegBase64,
          },
        ],
      },
    };
    this.ws.send(JSON.stringify(msg));
  }

  /** Play incoming 24kHz PCM audio chunks with Web Audio API */
  async playPcmChunk(pcmBase64) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx({ sampleRate: 24000 });
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const binary = atob(pcmBase64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const numSamples = Math.floor(len / 2);
      const float32 = new Float32Array(numSamples);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
      }

      const audioBuffer = this.audioContext.createBuffer(1, numSamples, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      const startTime = Math.max(now, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;
    } catch (err) {
      console.warn('[GeminiLive] PCM playback error:', err);
    }
  }

  stopAudio() {
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
      this.nextPlayTime = 0;
    }
  }

  disconnect() {
    this.stopAudio();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.isSetupComplete = false;
  }
}

