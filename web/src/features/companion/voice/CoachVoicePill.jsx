import React from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';

/**
 * CoachVoicePill
 * Fast one-tap microphone access for active workouts.
 * Fits into the thumb zone so sweaty-handed lifters don't have to fiddle with keyboards.
 */
export default function CoachVoicePill({
  isListening,
  isSpeaking,
  isThinking,
  onActivate,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={
        isListening
          ? 'Listening to your lifting cue'
          : isSpeaking
          ? 'Coach Marcus speaking'
          : 'Tap to speak to Coach Marcus'
      }
      className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium text-xs transition-all active:scale-95 shadow-md ${
        isListening
          ? 'bg-red-500/20 border border-red-500 text-red-300 animate-pulse'
          : isSpeaking
          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
          : isThinking
          ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
          : 'bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400 text-zinc-200'
      } ${className}`}
    >
      {/* Pulsing indicator ring */}
      {(isListening || isSpeaking) && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      )}

      {isListening ? (
        <>
          <Mic className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span>Listening...</span>
        </>
      ) : isSpeaking ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Coach Marcus</span>
        </>
      ) : isThinking ? (
        <>
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>Thinking...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
          <span>Voice Coach</span>
        </>
      )}
    </button>
  );
}

