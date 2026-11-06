import { useState, useEffect, useRef, useCallback } from 'react';
import { speakGeminiTts, stopGeminiTts, GEMINI_VOICE_MODELS } from '../../../lib/geminiTts';
import { speakDeepgram, stopDeepgram } from '../../../lib/deepgramTts';
import { voiceTelemetry } from '../../../lib/voiceTelemetry';

export const COACH_VOICES = {
  marcus: {
    id: 'marcus',
    name: 'Coach Marcus',
    gender: 'male',
    deepgramVoice: 'aura-helios-en',
    rate: 1.05,
    pitch: 0.92,
    avatar: '👨',
    role: 'Strength Coach (Baritone)',
  },
  maya: {
    id: 'maya',
    name: 'Coach Maya',
    gender: 'female',
    deepgramVoice: 'aura-athena-en',
    rate: 1.08,
    pitch: 1.05,
    avatar: '👩',
    role: 'Motivator (Athena)',
  },
};

/**
 * Enterprise Two-Way Voice Coach Hook
 * Features:
 * - Real hardware microphone stream via getUserMedia for live decibel audio metering.
 * - Safe Web Speech Recognition with interim streaming and silence auto-commit.
 * - Zero client setup: two curated enterprise voices (Marcus & Maya) pre-selected on server-side.
 * - Automatic continuous conversational loop: Coach speaks -> 400ms pause -> Mic opens hands-free.
 * - Instant tap-to-send: User can tap "Done Speaking" to immediately commit their words.
 */
export function useVoiceCoach({ onTranscript, autoSpeak = true, continuous = false } = {}) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [continuousLoop, setContinuousLoop] = useState(continuous);
  const [activeVoice, setActiveVoice] = useState(() => {
    try {
      return localStorage.getItem('fitlog_coach_voice') || 'marcus';
    } catch {
      return 'marcus';
    }
  });
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Refs for stable lifecycle management
  const onTranscriptRef = useRef(onTranscript);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const continuousRef = useRef(continuous);
  const activeVoiceRef = useRef(activeVoice);
  const currentTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const speechWatchdogRef = useRef(null);

  // State machine lifecycle flags to prevent InvalidStateError on consecutive turns
  const engineActiveRef = useRef(false);
  const isStoppingRef = useRef(false);
  const pendingStartRef = useRef(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Keep refs synchronized without re-running effects
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  useEffect(() => {
    continuousRef.current = continuousLoop;
  }, [continuousLoop]);

  useEffect(() => {
    activeVoiceRef.current = activeVoice;
    try {
      localStorage.setItem('fitlog_coach_voice', activeVoice);
    } catch {}
  }, [activeVoice]);

  // Audio level meter loop using Web Audio API AnalyserNode
  const startAudioMeter = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!isListeningRef.current && !isSpeakingRef.current) {
          setAudioLevel(0);
          return;
        }

        if (isListeningRef.current && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const level = Math.min(1.0, Math.max(0.1, avg / 45));
          setAudioLevel(level);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.warn('[CoachVoice] Audio meter setup warning:', err);
    }
  }, []);

  // Initialize Speech Capabilities ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSynth = 'speechSynthesis' in window;
    setIsSupported(Boolean(SpeechRec || hasSynth));

    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        engineActiveRef.current = true;
        isStoppingRef.current = false;
        pendingStartRef.current = false;
        setIsListening(true);
        isListeningRef.current = true;
      };

      rec.onresult = (event) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript;
        }
        const text = full.trim();
        if (text) {
          currentTranscriptRef.current = text;
          setTranscript(text);

          // Clear existing silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // Natural conversational pause detection:
          // Wait 2000ms of true silence before committing so sentences are never cut off in the middle
          silenceTimerRef.current = setTimeout(() => {
            if (currentTranscriptRef.current && currentTranscriptRef.current.trim().length > 1) {
              commitTranscript(currentTranscriptRef.current);
            }
          }, 2000);
        }
      };

      rec.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[CoachVoice] Speech recognition error:', e.error);
        }
        if (e.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
          pendingStartRef.current = false;
        }
      };

      rec.onend = () => {
        engineActiveRef.current = false;
        isStoppingRef.current = false;

        // Auto-cycle: if start was queued or continuous listening is active and coach is not speaking
        if ((pendingStartRef.current || isListeningRef.current) && !isSpeakingRef.current) {
          pendingStartRef.current = false;
          try {
            rec.start();
          } catch {
            setTimeout(() => {
              if (isListeningRef.current && !isSpeakingRef.current && !engineActiveRef.current) {
                try {
                  rec.start();
                } catch {}
              }
            }, 150);
          }
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognitionRef.current = rec;
    }

    if (hasSynth) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
      stopGeminiTts();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      stopCamera();
    };
  }, []);

  // Commit what was heard and deliver to onTranscript
  const commitTranscript = useCallback((textToCommit) => {
    const text = (textToCommit || currentTranscriptRef.current || '').trim();
    if (!text) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    currentTranscriptRef.current = '';
    setTranscript('');
    setIsListening(false);
    isListeningRef.current = false;

    if (recognitionRef.current && engineActiveRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    onTranscriptRef.current?.(text);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (speechWatchdogRef.current) {
      clearTimeout(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }
    stopGeminiTts();
    stopDeepgram();
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setAudioLevel(0);
  }, []);

  // Start listening with mic stream using safe state machine
  const startListening = useCallback(async () => {
    stopSpeaking();
    isListeningRef.current = true;
    setIsListening(true);

    // 1. Acquire audio hardware stream
    try {
      if (!audioStreamRef.current || !audioStreamRef.current.active) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        startAudioMeter(stream);
      }
    } catch (err) {
      console.warn('[CoachVoice] getUserMedia prompt note:', err.message);
    }

    // 2. Start speech recognition safely using state machine
    if (recognitionRef.current) {
      if (engineActiveRef.current) {
        // Already actively listening!
        return;
      }
      if (isStoppingRef.current) {
        // Queue it up to launch cleanly as soon as onend fires
        pendingStartRef.current = true;
        return;
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        // If engine was still unwinding, queue start
        pendingStartRef.current = true;
      }
    }
  }, [startAudioMeter, stopSpeaking]);

  // Stop listening cleanly
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    pendingStartRef.current = false;
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current && engineActiveRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setAudioLevel(0);
  }, []);

  // When coach finishes speaking, auto-cycle back to mic if continuous
  const handleSpeechEnd = useCallback(() => {
    if (speechWatchdogRef.current) {
      clearTimeout(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setAudioLevel(0);

    if (continuousRef.current) {
      setTimeout(() => {
        startListening();
      }, 400);
    }
  }, [startListening]);

  // Two-way coach speech output
  const speak = useCallback(
    async (text) => {
      if (!autoSpeak || !text) return;
      stopListening();
      stopGeminiTts();
      stopDeepgram();
      if (synthRef.current) synthRef.current.cancel();

      setIsSpeaking(true);
      isSpeakingRef.current = true;

      if (speechWatchdogRef.current) clearTimeout(speechWatchdogRef.current);
      // Failsafe watchdog: auto-release speaking state after 15s if audio events stall
      speechWatchdogRef.current = setTimeout(() => {
        if (isSpeakingRef.current) {
          console.warn('[CoachVoice] Speech watchdog fired: releasing speech state');
          handleSpeechEnd();
        }
      }, 15000);

      const vConfig = COACH_VOICES[activeVoiceRef.current] || COACH_VOICES.marcus;

      try {
        voiceTelemetry.markTtsStart('deepgram');
        // 1. Try Deepgram Aura TTS (Ultra-low latency ~150ms, human studio quality: Athena & Helios/Neptune)
        const usedDeepgram = await speakDeepgram({
          text,
          voice: vConfig.deepgramVoice || (vConfig.gender === 'female' ? 'aura-athena-en' : 'aura-helios-en'),
          onStart: () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            voiceTelemetry.markTtsReady('deepgram');
          },
          onEnd: handleSpeechEnd,
          onError: (err) => {
            console.warn('[CoachVoice] Deepgram error, switching to fallback:', err?.message || err);
            voiceTelemetry.recordError('tts_deepgram', err);
          },
        });

        if (usedDeepgram) return;

        voiceTelemetry.markTtsStart('gemini');
        // 2. Try Gemini Neural TTS Fallback
        const usedGemini = await speakGeminiTts({
          text,
          voice: GEMINI_VOICE_MODELS[activeVoiceRef.current] || 'Charon',
          onStart: () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            voiceTelemetry.markTtsReady('gemini');
          },
          onEnd: handleSpeechEnd,
          onError: (err) => {
            voiceTelemetry.recordError('tts_gemini', err);
          },
        });

        if (usedGemini) return;

        // 3. Web Speech Synthesis Fallback
        if (!synthRef.current) {
          handleSpeechEnd();
          return;
        }

        voiceTelemetry.markTtsStart('speechSynthesis');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = vConfig.rate;
        utterance.pitch = vConfig.pitch;
        utterance.volume = 1.0;

        const voices = synthRef.current.getVoices();
        let matched = null;
        if (vConfig.gender === 'female') {
          matched = voices.find(
            (v) => /samantha|victoria|karen|zira|female|natural.*female/i.test(v.name) && v.lang.startsWith('en')
          );
        } else {
          matched = voices.find(
            (v) => /daniel|aaron|arthur|david|george|male|natural.*male/i.test(v.name) && v.lang.startsWith('en')
          );
        }
        if (!matched) {
          matched =
            voices.find((v) => /natural|google/i.test(v.name) && v.lang.startsWith('en')) ||
            voices.find((v) => v.lang.startsWith('en'));
        }
        if (matched) utterance.voice = matched;

        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          voiceTelemetry.markTtsReady('speechSynthesis');
        };
        utterance.onend = handleSpeechEnd;
        utterance.onerror = () => {
          handleSpeechEnd();
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn('[CoachVoice] Speech output catch:', err);
        handleSpeechEnd();
      }
    },
    [autoSpeak, handleSpeechEnd, stopListening]
  );

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      // If currently listening, tap commits what was spoken immediately
      if (currentTranscriptRef.current) {
        commitTranscript(currentTranscriptRef.current);
      } else {
        stopListening();
      }
    } else {
      startListening();
    }
  }, [commitTranscript, startListening, stopListening]);

  // Camera video form-check
  const startCamera = async (videoElement) => {
    setCameraError('');
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoRef.current = videoElement;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('[CoachVoice] Camera start error:', err);
      setCameraError('Camera access denied or unavailable.');
      setCameraActive(false);
    }
  };

  const attachVideo = (el) => {
    videoRef.current = el;
    if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
      el.srcObject = cameraStreamRef.current;
      el.play().catch(() => {});
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const b64 = dataUrl.split(',')[1];
      return { mimeType: 'image/jpeg', data: b64, preview: dataUrl };
    } catch {
      return null;
    }
  };

  return {
    isSupported,
    isListening,
    isSpeaking,
    isThinking,
    setIsThinking,
    continuousLoop,
    setContinuousLoop,
    activeVoice,
    setActiveVoice,
    transcript,
    audioLevel,
    startListening,
    stopListening,
    toggleListening,
    commitTranscript,
    speak,
    stopSpeaking,
    cameraActive,
    cameraError,
    startCamera,
    attachVideo,
    stopCamera,
    captureFrame,
  };
}
