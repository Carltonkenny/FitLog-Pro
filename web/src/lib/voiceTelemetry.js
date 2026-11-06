/**
 * Voice Agent Observability, Telemetry & Guardrail System
 * Tracks real-time turn latency, audio pipeline health, error rates, and engine fallbacks.
 */

class VoiceTelemetryService {
  constructor() {
    this.sessionStartTime = Date.now();
    this.turns = [];
    this.currentTurn = null;
    this.listeners = new Set();
    this.metrics = {
      totalTurns: 0,
      successfulTurns: 0,
      failedTurns: 0,
      avgLlmLatencyMs: 0,
      avgTtsLatencyMs: 0,
      avgTotalRoundtripMs: 0,
      deepgramCount: 0,
      geminiCount: 0,
      webSpeechCount: 0,
    };

    if (typeof window !== 'undefined') {
      window.__FITLOG_VOICE_METRICS__ = this;
    }
  }

  startTurn(userUtterance) {
    this.currentTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userUtterance: (userUtterance || '').slice(0, 500),
      startTime: performance.now(),
      sttCommittedAt: performance.now(),
      llmStartedAt: null,
      llmFinishedAt: null,
      llmLatencyMs: 0,
      ttsStartedAt: null,
      ttsReadyAt: null,
      ttsLatencyMs: 0,
      totalLatencyMs: 0,
      engine: 'unknown',
      actions: [],
      error: null,
      status: 'processing',
    };
    this.notify();
    return this.currentTurn.id;
  }

  markLlmStart() {
    if (this.currentTurn) {
      this.currentTurn.llmStartedAt = performance.now();
      this.notify();
    }
  }

  markLlmEnd(replyText, actions = []) {
    if (this.currentTurn && this.currentTurn.llmStartedAt) {
      this.currentTurn.llmFinishedAt = performance.now();
      this.currentTurn.llmLatencyMs = Math.round(this.currentTurn.llmFinishedAt - this.currentTurn.llmStartedAt);
      this.currentTurn.replyText = (replyText || '').slice(0, 300);
      this.currentTurn.actions = actions || [];
      this.notify();
    }
  }

  markTtsStart(engineName) {
    if (this.currentTurn) {
      this.currentTurn.ttsStartedAt = performance.now();
      this.currentTurn.engine = engineName;
      this.notify();
    }
  }

  markTtsReady(engineName) {
    if (this.currentTurn && this.currentTurn.ttsStartedAt) {
      this.currentTurn.ttsReadyAt = performance.now();
      this.currentTurn.ttsLatencyMs = Math.round(this.currentTurn.ttsReadyAt - this.currentTurn.ttsStartedAt);
      this.currentTurn.totalLatencyMs = Math.round(this.currentTurn.ttsReadyAt - this.currentTurn.startTime);
      this.currentTurn.engine = engineName || this.currentTurn.engine;
      this.currentTurn.status = 'playing';
      this.completeTurn();
    }
  }

  recordError(errorStage, err) {
    if (this.currentTurn) {
      this.currentTurn.error = {
        stage: errorStage,
        message: err?.message || String(err),
      };
      this.currentTurn.status = 'error';
      this.metrics.failedTurns++;
      this.turns.push({ ...this.currentTurn });
      this.notify();
    }
  }

  completeTurn() {
    if (!this.currentTurn) return;
    this.metrics.totalTurns++;
    this.metrics.successfulTurns++;

    if (this.currentTurn.engine?.includes('deepgram')) this.metrics.deepgramCount++;
    else if (this.currentTurn.engine?.includes('gemini')) this.metrics.geminiCount++;
    else if (this.currentTurn.engine?.includes('speechSynthesis')) this.metrics.webSpeechCount++;

    // Compute moving averages
    const validLlm = this.turns.filter((t) => t.llmLatencyMs > 0).map((t) => t.llmLatencyMs);
    validLlm.push(this.currentTurn.llmLatencyMs);
    this.metrics.avgLlmLatencyMs = Math.round(validLlm.reduce((a, b) => a + b, 0) / validLlm.length);

    const validTts = this.turns.filter((t) => t.ttsLatencyMs > 0).map((t) => t.ttsLatencyMs);
    validTts.push(this.currentTurn.ttsLatencyMs);
    this.metrics.avgTtsLatencyMs = Math.round(validTts.reduce((a, b) => a + b, 0) / validTts.length);

    const validTotal = this.turns.filter((t) => t.totalLatencyMs > 0).map((t) => t.totalLatencyMs);
    validTotal.push(this.currentTurn.totalLatencyMs);
    this.metrics.avgTotalRoundtripMs = Math.round(validTotal.reduce((a, b) => a + b, 0) / validTotal.length);

    this.turns.push({ ...this.currentTurn });
    if (this.turns.length > 50) this.turns.shift(); // Keep last 50 turns in memory

    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch {}
    });
  }

  getSnapshot() {
    return {
      metrics: { ...this.metrics },
      currentTurn: this.currentTurn ? { ...this.currentTurn } : null,
      lastTurn: this.turns[this.turns.length - 1] || null,
      historyCount: this.turns.length,
    };
  }
}

export const voiceTelemetry = new VoiceTelemetryService();

/**
 * Voice Agent Guardrail Suite
 */
export const VoiceGuardrails = {
  // Input Sanitization Guardrail
  sanitizeInput(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;
    const trimmed = rawText.trim();
    // Filter noise / single-character phantom syllables
    if (trimmed.length < 2) return null;
    // Strip common background hallucination patterns
    if (/^(um|uh|ah|er|mmm|shh)$/i.test(trimmed)) return null;
    // Clamp excessive runaway inputs (protect prompt context)
    return trimmed.slice(0, 500);
  },

  // Action Parameter Guardrail
  validateAction(action) {
    if (!action || !action.type) return null;

    // Weight clamping guardrail (1kg to 450kg)
    if (action.weight !== undefined) {
      const num = Number(action.weight);
      if (isNaN(num) || num < 0 || num > 450) {
        console.warn('[Guardrail] Blocked unrealistic weight:', action.weight);
        action.weight = Math.min(450, Math.max(0, num || 0));
      }
    }

    // Reps clamping guardrail (1 to 100)
    if (action.reps !== undefined) {
      const reps = Number(action.reps);
      if (isNaN(reps) || reps < 1 || reps > 100) {
        action.reps = Math.min(100, Math.max(1, reps || 10));
      }
    }

    // Timer clamping guardrail (5s to 600s)
    if (action.seconds !== undefined) {
      const s = Number(action.seconds);
      action.seconds = Math.min(600, Math.max(5, s || 90));
    }

    return action;
  },

  // Acute Pain Safety Interceptor
  checkSafety(userText) {
    if (!userText) return null;
    const severeInjuries = /\b(torn|dislocated|popped|snapped|severe pain|sharp pain|can'?t move|numbness|pinched nerve)\b/i;
    if (severeInjuries.test(userText)) {
      return {
        flagged: true,
        reason: 'Acute injury or severe joint distress detected',
        safeAdvice: "That sounds like acute distress. Please rack the weight immediately and do not continue this exercise. Consult a medical professional or physical therapist before lifting again.",
      };
    }
    return null;
  },
};

