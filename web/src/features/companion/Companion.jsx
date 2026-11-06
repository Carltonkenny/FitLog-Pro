import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Camera, MessageSquare, Mic, MicOff, Send, X, Volume2, Sparkles, Radio } from 'lucide-react';
import { WorkoutStore } from '../../lib/workoutStore';
import { EXERCISE_LIBRARY } from '../../lib/exercises.js';
import { askCoach, CoachError } from '../../lib/coachApi';
import { CHAT_SCHEMA, PLAN_SCHEMA, buildContext, buildSystem } from '../../lib/coachPrompt';
import { customExercise, parseChatReply, parsePlan, petMood, resolveExercise } from '../../lib/companionActions.js';
import { ACCEPTED_TYPES, prepareImage } from '../../lib/imageUtils';
import { addNotes, getUserData, setEquipment, toggleAvoided, toggleFavorite, updateAthleteProfile, useUserData } from '../../lib/userData.js';
import CoachPlanCard from '../app/components/history/CoachPlanCard';
import PetAvatar from './PetAvatar';
import MemoryPanel from './MemoryPanel';
import { useVoiceCoach } from './voice/useVoiceCoach';
import CoachVoiceOnboarding from './voice/CoachVoiceOnboarding';
import VoiceAgentView from './voice/VoiceAgentView';
import { voiceTelemetry, VoiceGuardrails } from '../../lib/voiceTelemetry';

const MAX_PHOTOS = 3;
const NAMES = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.id, e.name]));

const QUICK = [
  { label: 'Log set: 100kg x 5', text: 'I just did 100kg for 5 reps. Log it.' },
  { label: 'Check bench PR', text: 'What is my personal record on Bench Press?' },
  { label: 'Rest timer: 90s', text: 'Start a 90 second rest timer.' },
  { label: 'Build my plan', plan: true, text: 'Build me a weekly training plan that fits my goal, experience, equipment and recent training.' },
  { label: 'What to train today?', text: "What should I train today? Add the exercises you pick to today's workout." },
  { label: 'Rack it, finish workout', text: "We're done with today's session. Finish workout." },
];

/**
 * Coach Marcus / Companion: The athlete's gym-native live voice & text coach inside FitLog Pro.
 * Features:
 * - Two distinct tabs: 'Chatbot' (clean text & photos) & 'Voice Agent' (hands-free continuous audio loop).
 * - Automatic voice interaction upon switching to 'Voice Agent' tab.
 * - Gym-native vernacular cues & micro-turn brevity strictly under 10 seconds.
 * - Deepgram Aura neural voice integration with graceful browser speech fallback.
 * - Privacy-first: mic & camera active only when explicitly activated by user.
 */
export default function Companion({
  open,
  setOpen,
  blueprint,
  onUseDay,
  onAddExercise,
  onOpenTab,
  activeWorkout,
  onLogSet,
  onSetTimer,
  onFinishWorkout,
  onDiscardWorkout,
}) {
  const { memory } = useUserData();
  const [companionTab, setCompanionTab] = useState('chat'); // 'chat' | 'voice'
  const [showMemory, setShowMemory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [usedVoiceLast, setUsedVoiceLast] = useState(false);
  const [showVoiceTour, setShowVoiceTour] = useState(() => {
    try {
      const p = getUserData().memory?.athleteProfile;
      return !p?.name && localStorage.getItem('fitlog_voice_tour_dismissed') !== 'true';
    } catch {
      return false;
    }
  });

  const fileRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const videoElemRef = useRef(null);

  const history = WorkoutStore.getHistory();
  const mood = busy ? 'thinking' : petMood(history);

  // Send message implementation
  const send = useCallback(
    async (text, wantsPlan = false, fromVoice = false) => {
      const sanitized = VoiceGuardrails.sanitizeInput(text);
      if (!sanitized || busy) return;

      if (fromVoice) {
        voiceTelemetry.startTurn(sanitized);
      }

      // Acute Medical Safety Guardrail Interceptor
      const safetyIssue = VoiceGuardrails.checkSafety(sanitized);
      if (safetyIssue?.flagged) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), sender: 'user', text: sanitized, isVoice: fromVoice },
          { id: Date.now() + 1, sender: 'ai', text: safetyIssue.safeAdvice, error: false },
        ]);
        if (fromVoice || companionTab === 'voice') {
          voice.speak(safetyIssue.safeAdvice);
        }
        return;
      }

      const question = sanitized;
      const attached = photos;
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: question, images: attached.map((p) => p.preview), isVoice: fromVoice },
      ]);
      setInput('');
      setPhotos([]);
      setBusy(true);
      if (fromVoice) setUsedVoiceLast(true);

      const context = buildContext({
        history: WorkoutStore.getHistory(),
        prs: WorkoutStore.getPersonalRecords(),
        blueprint,
        activeWorkout,
        athleteProfile: getUserData().memory?.athleteProfile,
      });

      const earlier = messages
        .filter((m) => m.text && !m.plan && !m.error)
        .slice(-6)
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));

      const lastTurn = {
        role: 'user',
        parts: [
          { text: `${context}\n\nATHLETE REQUEST: ${question}` },
          ...attached.map((p) => ({ inlineData: { mimeType: p.mimeType, data: p.data } })),
        ],
      };

      try {
        voiceTelemetry.markLlmStart();
        const mem = getUserData().memory;
        const petName = mem.petName || 'Coach Marcus';
        const raw = await askCoach({
          system: buildSystem({
            withPhotos: attached.length > 0,
            wantsPlan,
            petName,
            memory: mem,
            names: NAMES,
          }),
          contents: [...earlier, lastTurn],
          maxOutputTokens: wantsPlan ? 8000 : 2048,
          responseSchema: wantsPlan ? PLAN_SCHEMA : CHAT_SCHEMA,
        });

        let next;
        if (wantsPlan) {
          const plan = parsePlan(raw);
          next = plan ? { plan } : { error: true, text: 'The plan came back unusable. Try again.' };
        } else {
          const parsed = parseChatReply(raw);
          if (parsed.broken || !parsed.reply) throw new CoachError('The answer came back garbled. Try again.');
          const validatedActions = (parsed.actions || []).map(VoiceGuardrails.validateAction).filter(Boolean);
          voiceTelemetry.markLlmEnd(parsed.reply, validatedActions);
          const learned = addNotes(parsed.remember);
          const applied = validatedActions.map(runAction).filter(Boolean);
          next = { text: parsed.reply || 'Done.', applied, learned };

          // Voice feedback if user spoke or voice mode is on or in voice agent tab
          if (fromVoice || voice.voiceMode || companionTab === 'voice') {
            voice.speak(parsed.reply);
          }
        }
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', ...next }]);
      } catch (err) {
        voiceTelemetry.recordError('llm_or_dispatch', err);
        const text = err instanceof CoachError ? err.message : 'The companion is unavailable right now.';
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', error: true, text }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, photos, messages, blueprint, activeWorkout, companionTab]
  );

  // Hook up Voice Coach
  const voice = useVoiceCoach({
    onTranscript: (spoken) => {
      send(spoken, /\bplan\b/i.test(spoken), true);
    },
    autoSpeak: true,
    continuous: companionTab === 'voice',
  });

  // Switch tabs and handle auto-voice activation
  const handleTabSwitch = (tab) => {
    setCompanionTab(tab);
    if (tab === 'voice') {
      voice.setContinuousLoop(true);
      // Auto-start interaction on switching to Voice Agent tab
      if (messages.length === 0) {
        const hasName = Boolean(memory.athleteProfile?.name);
        const greeting = hasName
          ? `Welcome back, ${memory.athleteProfile.name}! Ready to lift? What are we hitting today?`
          : `Hey there! I'm ${memory.petName || 'Coach Marcus'}. To get dialed in, may I know your name and your main gym goal?`;
        setMessages([{ id: Date.now(), sender: 'ai', text: greeting }]);
        voice.speak(greeting);
      } else {
        voice.startListening();
      }
    } else {
      voice.stopListening();
      voice.stopSpeaking();
      voice.setContinuousLoop(false);
    }
  };

  const handleStartVoiceOnboarding = () => {
    try {
      localStorage.setItem('fitlog_voice_tour_dismissed', 'true');
    } catch {}
    setShowVoiceTour(false);
    setCompanionTab('voice');
    voice.setContinuousLoop(true);
    const greeting = `Hey there! I'm ${memory.petName || 'Coach Marcus'}. To get dialed in, may I know your name and your main gym goal?`;
    setMessages([{ id: Date.now(), sender: 'ai', text: greeting }]);
    voice.speak(greeting);
  };

  const handleDismissVoiceTour = () => {
    try {
      localStorage.setItem('fitlog_voice_tour_dismissed', 'true');
    } catch {}
    setShowVoiceTour(false);
  };

  useEffect(() => {
    if (!open) {
      voice.stopListening();
      voice.stopSpeaking();
      voice.stopCamera();
      voice.setContinuousLoop(false);
      return undefined;
    }
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [messages, busy]);

  const addPhotos = async (fileList) => {
    setPhotoError('');
    try {
      const prepared = await Promise.all([...fileList].slice(0, MAX_PHOTOS - photos.length).map(prepareImage));
      setPhotos((prev) => [...prev, ...prepared]);
    } catch (err) {
      setPhotoError(err.message);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  /** Runs one model-requested action. Returns a short confirmation, or null if nothing happened. */
  const runAction = (a) => {
    const match = a.name ? resolveExercise(a.name) : null;
    const mem = getUserData().memory;

    if (a.type === 'log_set') {
      if (onLogSet) {
        onLogSet({ name: a.name, weight: a.weight, reps: a.reps });
      }
      return `Logged ${a.weight !== undefined ? `${a.weight}kg x ` : ''}${a.reps || 10} reps${a.name ? ` on ${a.name}` : ''}`;
    }
    if (a.type === 'set_timer') {
      if (onSetTimer) {
        onSetTimer(a.seconds || 90);
      }
      return `Started ${a.seconds || 90}s rest timer`;
    }
    if (a.type === 'finish_workout') {
      if (onFinishWorkout) {
        onFinishWorkout();
      }
      return `Finished active workout session`;
    }
    if (a.type === 'discard_workout') {
      if (onDiscardWorkout) {
        onDiscardWorkout();
      }
      return `Cleared current workout`;
    }
    if (a.type === 'update_profile') {
      const updated = updateAthleteProfile({
        name: a.athleteName || a.name,
        age: a.age,
        occupation: a.occupation,
        goal: a.goal,
        experience: a.experience,
        limitations: a.limitations,
      });
      const parts = [];
      if (updated.name) parts.push(`Name: ${updated.name}`);
      if (updated.goal) parts.push(`Goal: ${updated.goal}`);
      if (updated.experience) parts.push(`Exp: ${updated.experience}`);
      if (updated.limitations) parts.push(`Protect: ${updated.limitations}`);
      return `Locked into memory (${parts.join(', ') || 'Profile saved'})`;
    }
    if (a.type === 'open_tab') {
      onOpenTab?.(a.tab);
      return null;
    }
    if (a.type === 'set_equipment') {
      setEquipment(a.equipment);
      return `Set your equipment to ${a.equipment.join(', ')}`;
    }
    if (a.type === 'add_exercise') {
      const item = match || customExercise(a.name);
      onAddExercise?.(item, { sets: a.sets, reps: a.reps });
      return `Added ${item.name} to today's workout`;
    }
    if (!match) return null;
    if (a.type === 'favorite_exercise' && !mem.favorites.includes(match.id)) {
      toggleFavorite(match.id);
      return `Marked ${match.name} as a favorite`;
    }
    if (a.type === 'avoid_exercise' && !mem.avoided.includes(match.id)) {
      toggleAvoided(match.id);
      return `Will avoid ${match.name}`;
    }
    return null;
  };

  const handleCaptureFormSnapshot = () => {
    const frame = voice.captureFrame();
    if (frame) {
      setPhotos((prev) => [...prev, frame].slice(0, MAX_PHOTOS));
      voice.stopCamera();
    }
  };

  const lastLifterText = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
  const lastMarcusReply = [...messages].reverse().find((m) => m.sender === 'ai' && !m.error)?.text || '';

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} ${memory.petName || 'Coach Marcus'}, your training companion`}
        className="fixed z-[54] right-4 bottom-20 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-zinc-900 border border-emerald-500/40 shadow-lg shadow-black/50 flex items-center justify-center hover:border-emerald-400 group transition active:scale-95"
      >
        <PetAvatar mood={mood} size={38} />
        {voice.isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </span>
        )}
      </button>

      {/* Drawer Section */}
      <section
        hidden={!open}
        role="dialog"
        aria-label={`${memory.petName || 'Coach Marcus'}, your training companion`}
        className="fixed z-[55] inset-x-0 bottom-0 h-[85dvh] sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[27rem] sm:h-[38rem] sm:max-h-[calc(100dvh-8rem)] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#101218] border border-white/[0.1] shadow-2xl animate-popIn overflow-hidden"
      >
        {/* Header */}
        <header className="flex items-center gap-3 p-3 border-b border-white/[0.08] bg-[#12141c] shrink-0">
          <PetAvatar mood={mood} size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white truncate">{memory.petName || 'Coach Marcus'}</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {voice.isSpeaking ? 'Speaking...' : voice.isListening ? 'Listening...' : companionTab === 'voice' ? 'Voice Agent Active' : 'Text & Form Chat'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMemory((v) => !v)}
            aria-pressed={showMemory}
            title="Athlete Memory & Profile"
            className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showMemory ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" aria-hidden="true" />
            Memory
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Distinct 2-Tab Navigation Bar */}
        <div className="flex border-b border-white/[0.08] bg-[#0c0e14] p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleTabSwitch('chat')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              companionTab === 'chat' && !showMemory
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chatbot
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('voice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              companionTab === 'voice' && !showMemory
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse text-current" />
            Voice Agent
          </button>
        </div>

        {/* Content Body */}
        {showMemory ? (
          <div className="flex-1 overflow-y-auto">
            <MemoryPanel />
          </div>
        ) : companionTab === 'voice' ? (
          /* Dedicated High-Signal Voice Agent Tab */
          <VoiceAgentView
            voice={voice}
            busy={busy}
            mood={mood}
            petName={memory.petName || 'Coach Marcus'}
            lastLifterText={lastLifterText}
            lastMarcusReply={lastMarcusReply}
            onQuickSpoken={(cue) => send(cue, false, true)}
            onCaptureSnapshot={handleCaptureFormSnapshot}
            videoElemRef={videoElemRef}
            showTour={showVoiceTour}
            onStartVoiceTour={handleStartVoiceOnboarding}
            onDismissTour={handleDismissVoiceTour}
          />
        ) : (
          /* Simplified, Focused Chatbot Tab */
          <>
            <div role="log" aria-live="polite" aria-label="Conversation" className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {showVoiceTour && messages.length === 0 ? (
                <CoachVoiceOnboarding
                  onStartVoice={handleStartVoiceOnboarding}
                  onDismiss={handleDismissVoiceTour}
                />
              ) : messages.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
                  <p className="text-zinc-200 font-medium leading-relaxed">
                    {memory.athleteProfile?.name
                      ? `"Welcome back, ${memory.athleteProfile.name}. Lock it in. Type below or switch to the Voice Agent tab for hands-free training."`
                      : `"Lock it in. I'm ${memory.petName || 'Coach Marcus'}. Type to ask questions, plan workouts, or switch to the Voice Agent tab to talk hands-free."`}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <Sparkles className="w-3 h-3" /> Gym-Native AI
                    </span>
                    <span>•</span>
                    <span>Micro-turn responses (&lt;10s)</span>
                  </div>
                </div>
              ) : null}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-500 text-zinc-950 font-medium'
                        : m.error
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                        : 'bg-zinc-800/80 text-zinc-100'
                    }`}
                  >
                    {m.images?.length > 0 && (
                      <div className="flex gap-1.5 mb-1.5">
                        {m.images.map((src, i) => (
                          <img key={i} src={src} alt={`Attached photo ${i + 1}`} className="w-14 h-14 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                    {m.plan ? <CoachPlanCard plan={m.plan} onUseDay={onUseDay} /> : <p className="whitespace-pre-wrap">{m.text}</p>}
                    {m.applied?.map((a) => (
                      <p key={a} className="mt-1.5 text-[11px] text-emerald-300 font-medium">✓ {a}</p>
                    ))}
                    {m.learned?.length > 0 && <p className="mt-1.5 text-[11px] text-cyan-300">Remembered: {m.learned.join('; ')}</p>}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5 bg-zinc-800/80 w-44 space-y-1.5" aria-label="Coach is thinking">
                    <div className="skeleton h-2.5 w-full" />
                    <div className="skeleton h-2.5 w-3/4" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={busy}
                  onClick={() => send(q.text, !!q.plan)}
                  className="h-7 px-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-white/[0.06] active:scale-95 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Attached Photos */}
            {photos.length > 0 && (
              <div className="px-3 pb-2 flex gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p.preview} alt={`Photo ${i + 1} to send`} className="w-12 h-12 rounded-lg object-cover border border-white/[0.1]" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => setPhotos((prev) => prev.filter((_, k) => k !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-950 border border-white/[0.2] text-zinc-200 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photoError && <p role="alert" className="px-3 pb-2 text-xs text-amber-300">{photoError}</p>}

            {/* Simplified Input Bar */}
            <form
              className="p-3 border-t border-white/[0.08] flex items-center gap-2 bg-[#0d0f15]"
              onSubmit={(e) => {
                e.preventDefault();
                send(input, /\bplan\b/i.test(input));
              }}
            >
              {/* Photo file picker */}
              <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple hidden onChange={(e) => addPhotos(e.target.files)} />
              <button
                type="button"
                aria-label="Attach a photo"
                disabled={busy || photos.length >= MAX_PHOTOS}
                onClick={() => fileRef.current?.click()}
                className="shrink-0 w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition active:scale-95"
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label={`Message ${memory.petName || 'Coach Marcus'}`}
                maxLength={500}
                placeholder="Ask coach, log sets, or plan..."
                className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 outline-none"
              />

              {/* Quick Dictate */}
              {voice.isSupported && (
                <button
                  type="button"
                  aria-label={voice.isListening ? 'Stop recording voice' : 'Dictate with voice'}
                  onClick={voice.toggleListening}
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-95 ${
                    voice.isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400'
                  }`}
                >
                  {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                aria-label="Send"
                disabled={busy || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 flex items-center justify-center transition active:scale-95 font-bold"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </section>
    </>
  );
}
