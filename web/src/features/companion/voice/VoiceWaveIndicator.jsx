import React from 'react';
import { VolumeX, Mic, MicOff, Sparkles } from 'lucide-react';

/**
 * VoiceWaveIndicator
 * A tactile visual feedback strip showing audio waveforms, live state badges,
 * and an instant Mute/Cut-off button for gym lifters.
 */
export default function VoiceWaveIndicator({
  isListening,
  isSpeaking,
  isThinking,
  audioLevel = 0,
  onStopSpeaking,
  onToggleListening,
}) {
  if (!isListening && !isSpeaking && !isThinking) return null;

  return (
    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-black/40 animate-fade-in text-xs">
      <div className="flex items-center gap-2.5">
        {/* Animated Sound Wave Bars */}
        <div className="flex items-center gap-1 h-5 w-12" aria-hidden="true">
          {[0.6, 1.0, 0.4, 0.8, 0.5].map((scale, i) => {
            const h = (isSpeaking || isListening) ? Math.max(4, Math.round(20 * (audioLevel || 0.4) * scale)) : 4;
            return (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isSpeaking
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : isListening
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
            );
          })}
        </div>

        {/* State Badge & Prompt */}
        <span className="font-semibold text-zinc-200">
          {isSpeaking && 'Coach Marcus speaking...'}
          {isListening && 'Listening to you... (speak cue)'}
          {isThinking && (
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Instant Mute / Cancel button */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            title="Silence coach speech"
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] font-medium border border-white/10 active:scale-95 transition"
          >
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            Mute
          </button>
        )}

        {/* Toggle Mic button */}
        {isListening && (
          <button
            type="button"
            onClick={onToggleListening}
            title="Stop listening"
            className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center gap-1 text-[11px] font-medium border border-red-500/30 active:scale-95 transition"
          >
            <MicOff className="w-3.5 h-3.5" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

