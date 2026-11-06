import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Video, VideoOff, Camera, Activity, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import PetAvatar from '../PetAvatar';
import { COACH_VOICES } from './useVoiceCoach';
import CoachVoiceOnboarding from './CoachVoiceOnboarding';
import { voiceTelemetry } from '../../../lib/voiceTelemetry';
import { deepgramRateLimiter } from '../../../lib/deepgramTts';

/**
 * VoiceAgentView: Enterprise Two-Way Voice Coach Interface
 * Zero client configuration required.
 * Two pre-selected server-side voices: Marcus (Male Baritone) & Maya (Female Motivator).
 */
export default function VoiceAgentView({
  voice,
  busy,
  mood,
  petName,
  lastLifterText,
  lastMarcusReply,
  onQuickSpoken,
  onCaptureSnapshot,
  videoElemRef,
  showTour,
  onStartVoiceTour,
  onDismissTour,
}) {
  const isListening = voice.isListening;
  const isSpeaking = voice.isSpeaking;

  const [telemetry, setTelemetry] = useState(() => voiceTelemetry.getSnapshot());
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    return voiceTelemetry.subscribe(setTelemetry);
  }, []);

  const lastTurn = telemetry.lastTurn || telemetry.currentTurn;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#101218] to-[#0a0c10] select-none overflow-y-auto">
      {/* 2-Slide Visual Walkthrough / Intake Doc for First-Time Users */}
      {showTour && (
        <div className="mb-3 shrink-0">
          <CoachVoiceOnboarding onStartVoice={onStartVoiceTour} onDismiss={onDismissTour} />
        </div>
      )}

      {/* Top Bar: Status + Enterprise 2-Voice Switcher */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isListening ? 'bg-red-400' : isSpeaking ? 'bg-emerald-400' : busy ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isListening ? 'bg-red-500' : isSpeaking ? 'bg-emerald-500' : busy ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="font-semibold text-zinc-300">
            {isListening
              ? 'Listening to you...'
              : isSpeaking
              ? `${COACH_VOICES[voice.activeVoice]?.name || petName} speaking...`
              : busy
              ? 'Thinking...'
              : 'Two-Way Live'}
          </span>
        </div>

        {/* Curated 2-Voice Switcher: Marcus & Maya */}
        <div className="flex items-center bg-zinc-900 border border-white/[0.08] rounded-xl p-0.5">
          {Object.values(COACH_VOICES).map((v) => {
            const isSelected = voice.activeVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => voice.setActiveVoice(v.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{v.avatar}</span>
                <span>{v.id === 'marcus' ? 'Marcus' : 'Maya'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Observability & Telemetry HUD Strip */}
      <div className="mt-2 shrink-0">
        <button
          type="button"
          onClick={() => setShowMetrics((prev) => !prev)}
          className="w-full flex items-center justify-between px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.05] text-[10px] text-zinc-400 transition"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="font-mono text-zinc-300">
              {lastTurn?.engine ? (
                <>
                  <span className="text-emerald-400 font-semibold">{lastTurn.engine}</span>
                  {lastTurn.totalLatencyMs ? ` • ${lastTurn.totalLatencyMs}ms RTT` : ''}
                </>
              ) : (
                'Deepgram Engine Live • Guardrails Active'
              )}
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200">
            <span className="font-medium text-[9px] uppercase tracking-wider">Metrics</span>
            {showMetrics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </button>

        {showMetrics && (
          <div className="mt-1.5 p-2.5 rounded-xl bg-zinc-950/90 border border-emerald-500/20 text-[10px] font-mono space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-zinc-300 border-b border-white/[0.06] pb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" /> Observability & Guardrails
              </span>
              <span className="text-[9px] text-zinc-400">
                Turns: {telemetry.metrics.successfulTurns}/{telemetry.metrics.totalTurns}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
              <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-white/[0.04]">
                <div className="text-[9px] text-zinc-400">LLM Infer</div>
                <div className="font-bold text-zinc-200">{lastTurn?.llmLatencyMs || telemetry.metrics.avgLlmLatencyMs || 0}ms</div>
              </div>
              <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-white/[0.04]">
                <div className="text-[9px] text-zinc-400">TTS Audio</div>
                <div className="font-bold text-zinc-200">{lastTurn?.ttsLatencyMs || telemetry.metrics.avgTtsLatencyMs || 0}ms</div>
              </div>
              <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-white/[0.04]">
                <div className="text-[9px] text-zinc-400">Total RTT</div>
                <div className="font-bold text-emerald-400">{lastTurn?.totalLatencyMs || telemetry.metrics.avgTotalRoundtripMs || 0}ms</div>
              </div>
            </div>
            <div className="text-[9px] text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span>Active Voice: {voice.activeVoice === 'marcus' ? 'aura-helios-en (Marcus)' : 'aura-athena-en (Maya)'}</span>
              <span className="text-zinc-300">Rate Limit: {deepgramRateLimiter.getStatus().recentRequests}/{deepgramRateLimiter.getStatus().maxRpm} rpm</span>
              <span className="text-emerald-400">Safety Clamps: ON</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Live Viewfinder (If Active) */}
      {voice.cameraActive && (
        <div className="my-2 rounded-2xl overflow-hidden border border-emerald-500/30 bg-black aspect-video relative shrink-0">
          <video
            ref={(el) => {
              if (videoElemRef) videoElemRef.current = el;
              voice.attachVideo(el);
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE FORM STREAM
          </div>
          <button
            type="button"
            onClick={onCaptureSnapshot}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" /> Check Form
          </button>
        </div>
      )}

      {/* Central Pulsing Audio Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 relative min-h-[140px]">
        <div className="relative flex items-center justify-center">
          {/* Outer glow rings */}
          <div
            className={`absolute w-36 h-36 rounded-full transition-all duration-300 blur-xl ${
              isListening
                ? 'bg-red-500/30 scale-110'
                : isSpeaking
                ? 'bg-emerald-500/30 scale-125'
                : busy
                ? 'bg-amber-500/20 scale-100'
                : 'bg-zinc-700/10 scale-90'
            }`}
          />

          {/* Avatar core */}
          <div
            className={`relative w-28 h-28 rounded-full bg-zinc-900 border-2 flex items-center justify-center transition-all duration-200 shadow-2xl ${
              isListening
                ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-105'
                : isSpeaking
                ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105'
                : busy
                ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'border-white/[0.12]'
            }`}
          >
            <PetAvatar mood={mood} size={72} />
          </div>
        </div>

        {/* Dynamic Soundwave Bars */}
        <div className="flex items-center gap-1.5 mt-4 h-7">
          {[0.4, 0.7, 1.0, 0.6, 0.8, 1.2, 0.5, 0.9, 0.7, 0.4].map((scale, i) => {
            const h =
              isSpeaking || isListening ? Math.max(6, Math.min(28, voice.audioLevel * 28 * scale)) : 4;
            return (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isListening ? 'bg-red-400' : isSpeaking ? 'bg-emerald-400' : 'bg-zinc-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Live Dialogue Transcript Bubble */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] shadow-lg mb-2.5 min-h-[4.5rem] flex flex-col justify-center shrink-0">
        {voice.transcript ? (
          <p className="text-zinc-200 text-xs leading-relaxed">
            <span className="text-red-400 font-bold mr-1.5 animate-pulse">● Listening:</span>
            <span className="text-white font-medium italic">"{voice.transcript}"</span>
          </p>
        ) : busy ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <p className="text-zinc-200 text-xs font-medium truncate">
              {lastLifterText ? (
                <>
                  <span className="text-amber-400 font-bold mr-1">Heard:</span>
                  <span className="italic text-zinc-100">"{lastLifterText}"</span>
                </>
              ) : (
                'Thinking...'
              )}
            </p>
          </div>
        ) : lastMarcusReply ? (
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">
              {COACH_VOICES[voice.activeVoice]?.name || petName}
            </span>
            <p className="text-zinc-100 text-xs font-medium leading-relaxed">
              "{lastMarcusReply}"
            </p>
          </div>
        ) : lastLifterText ? (
          <p className="text-zinc-400 text-xs">
            Last heard: "<span className="text-zinc-200">{lastLifterText}</span>"
          </p>
        ) : (
          <p className="text-zinc-400 text-xs text-center">
            Tap the button below or say your cue hands-free...
          </p>
        )}
      </div>

      {/* Quick Spoken Chips for Rapid Gym Use */}
      <div className="flex flex-wrap gap-1.5 mb-2.5 justify-center shrink-0">
        {[
          'Logged 100 for 5 on bench',
          'Start 90s timer',
          "What's my bench PR?",
          'Rack it, workout done',
        ].map((cue) => (
          <button
            key={cue}
            type="button"
            disabled={busy}
            onClick={() => onQuickSpoken(cue)}
            className="px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-white/[0.06] transition active:scale-95"
          >
            "{cue}"
          </button>
        ))}
      </div>

      {/* Bottom Thumb Controls */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.08] shrink-0">
        {/* Camera Toggle */}
        <button
          type="button"
          onClick={() => {
            if (voice.cameraActive) {
              voice.stopCamera();
            } else {
              voice.startCamera();
            }
          }}
          aria-label="Toggle camera form-check"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition active:scale-95 border ${
            voice.cameraActive
              ? 'bg-red-500 text-white border-red-400'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/[0.08]'
          }`}
        >
          {voice.cameraActive ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Primary Tactile Mic Pill */}
        <button
          type="button"
          onClick={voice.toggleListening}
          className={`flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-xl ${
            isListening
              ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse'
              : isSpeaking
              ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" /> Done Speaking (Send)
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="w-5 h-5" /> Speaking... Tap to Silence
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" /> Tap to Speak
            </>
          )}
        </button>
      </div>
    </div>
  );
}
