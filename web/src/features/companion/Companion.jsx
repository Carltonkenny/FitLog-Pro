import React, { useEffect, useRef, useState } from 'react';
import { Brain, Camera, Send, X } from 'lucide-react';
import { WorkoutStore } from '../../lib/workoutStore';
import { EXERCISE_LIBRARY } from '../../lib/exercises.js';
import { askCoach, CoachError } from '../../lib/coachApi';
import { CHAT_SCHEMA, PLAN_SCHEMA, buildContext, buildSystem } from '../../lib/coachPrompt';
import { customExercise, parseChatReply, parsePlan, petMood, resolveExercise } from '../../lib/companionActions.js';
import { ACCEPTED_TYPES, prepareImage } from '../../lib/imageUtils';
import { addNotes, getUserData, setEquipment, toggleAvoided, toggleFavorite, useUserData } from '../../lib/userData.js';
import CoachPlanCard from '../app/components/history/CoachPlanCard';
import PetAvatar from './PetAvatar';
import MemoryPanel from './MemoryPanel';

const MAX_PHOTOS = 3;
const NAMES = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.id, e.name]));

const QUICK = [
  { label: 'Build my plan', plan: true, text: 'Build me a weekly training plan that fits my goal, experience, equipment and recent training.' },
  { label: 'What should I train today?', text: "What should I train today? Add the exercises you pick to today's workout." },
  { label: 'Review my progress', text: 'Review my recent progress. Point out what is improving and what has stalled.' },
];

/**
 * The companion: a chat panel on every screen. It knows the user's history, goal and remembered
 * preferences, and can act on requests (add exercises, record likes and dislikes, open screens).
 * It stays mounted while closed so the conversation is kept for the session.
 */
export default function Companion({ open, setOpen, blueprint, onUseDay, onAddExercise, onOpenTab }) {
  const { memory } = useUserData();
  const [showMemory, setShowMemory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const history = WorkoutStore.getHistory();
  const mood = busy ? 'thinking' : petMood(history);

  useEffect(() => {
    if (!open) return undefined;
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
    if (a.type === 'open_tab') {
      onOpenTab(a.tab);
      return null;
    }
    if (a.type === 'set_equipment') {
      setEquipment(a.equipment);
      return `Set your equipment to ${a.equipment.join(', ')}`;
    }
    if (a.type === 'add_exercise') {
      const item = match || customExercise(a.name);
      onAddExercise(item, { sets: a.sets, reps: a.reps });
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

  const send = async (text, wantsPlan = false) => {
    const question = (text || '').trim();
    if (!question || busy) return;
    const attached = photos;
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: question, images: attached.map((p) => p.preview) }]);
    setInput('');
    setPhotos([]);
    setBusy(true);

    const context = buildContext({ history: WorkoutStore.getHistory(), prs: WorkoutStore.getPersonalRecords(), blueprint });
    const earlier = messages
      .filter((m) => m.text && !m.plan && !m.error)
      .slice(-6)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
    const lastTurn = {
      role: 'user',
      parts: [{ text: `${context}\n\nATHLETE REQUEST: ${question}` }, ...attached.map((p) => ({ inlineData: { mimeType: p.mimeType, data: p.data } }))],
    };

    try {
      const mem = getUserData().memory;
      const raw = await askCoach({
        system: buildSystem({ withPhotos: attached.length > 0, wantsPlan, petName: mem.petName, memory: mem, names: NAMES }),
        contents: [...earlier, lastTurn],
        // Gemini counts hidden thinking tokens against this limit, so leave generous room.
        maxOutputTokens: wantsPlan ? 8000 : 4000,
        responseSchema: wantsPlan ? PLAN_SCHEMA : CHAT_SCHEMA,
      });
      let next;
      if (wantsPlan) {
        const plan = parsePlan(raw);
        next = plan ? { plan } : { error: true, text: 'The plan came back unusable. Try again.' };
      } else {
        const parsed = parseChatReply(raw);
        if (parsed.broken || !parsed.reply) throw new CoachError('The answer came back garbled. Try again.');
        const learned = addNotes(parsed.remember);
        const applied = parsed.actions.map(runAction).filter(Boolean);
        next = { text: parsed.reply || 'Done.', applied, learned };
      }
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', ...next }]);
    } catch (err) {
      const text = err instanceof CoachError ? err.message : 'The companion is unavailable right now.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', error: true, text }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} ${memory.petName}, your training companion`}
        className="fixed z-[54] right-4 bottom-20 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-zinc-900 border border-emerald-500/40 shadow-lg shadow-black/50 flex items-center justify-center hover:border-emerald-400"
      >
        <PetAvatar mood={mood} size={38} />
      </button>

      <section
        hidden={!open}
        role="dialog"
        aria-label={`${memory.petName}, your training companion`}
        className="fixed z-[55] inset-x-0 bottom-0 h-[85dvh] sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[26rem] sm:h-[36rem] sm:max-h-[calc(100dvh-8rem)] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#101218] border border-white/[0.1] shadow-2xl animate-popIn"
      >
        <header className="flex items-center gap-3 p-3 border-b border-white/[0.08]">
          <PetAvatar mood={mood} size={40} />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate">{memory.petName}</h2>
            <p className="text-[11px] text-zinc-400">Knows your history and preferences</p>
          </div>
          <button
            type="button"
            onClick={() => setShowMemory((v) => !v)}
            aria-pressed={showMemory}
            className={`h-10 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 ${showMemory ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
          >
            <Brain className="w-4 h-4" aria-hidden="true" />
            Memory
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {showMemory ? (
          <MemoryPanel />
        ) : (
          <>
            <div role="log" aria-live="polite" aria-label="Conversation" className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {messages.length === 0 && (
                <p className="text-zinc-300 leading-relaxed">
                  Hi, I'm {memory.petName}. I know your workouts, records and goal. Tell me about your gear or schedule and I'll
                  remember it. Ask me what to train, or ask me to add an exercise to today's workout.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === 'user' ? 'bg-emerald-500 text-zinc-950 font-medium' : m.error ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200' : 'bg-zinc-800/80 text-zinc-100'
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
                      <p key={a} className="mt-1.5 text-[11px] text-emerald-300">✓ {a}</p>
                    ))}
                    {m.learned?.length > 0 && <p className="mt-1.5 text-[11px] text-cyan-300">Remembered: {m.learned.join('; ')}</p>}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5 bg-zinc-800/80 w-44 space-y-1.5" aria-label={`${memory.petName} is thinking`}>
                    <div className="skeleton h-2.5 w-full" />
                    <div className="skeleton h-2.5 w-3/4" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button key={q.label} type="button" disabled={busy} onClick={() => send(q.text, !!q.plan)} className="h-9 px-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/[0.06]">
                  {q.label}
                </button>
              ))}
            </div>

            {photos.length > 0 && (
              <div className="px-3 pb-2 flex gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p.preview} alt={`Photo ${i + 1} to send`} className="w-12 h-12 rounded-lg object-cover border border-white/[0.1]" />
                    <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos((prev) => prev.filter((_, k) => k !== i))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-950 border border-white/[0.2] text-zinc-200 flex items-center justify-center">
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photoError && <p role="alert" className="px-3 pb-2 text-xs text-amber-300">{photoError}</p>}

            <form
              className="p-3 border-t border-white/[0.08] flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input, /\bplan\b/i.test(input));
              }}
            >
              <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple hidden onChange={(e) => addPhotos(e.target.files)} />
              <button type="button" aria-label="Attach a photo" disabled={busy || photos.length >= MAX_PHOTOS} onClick={() => fileRef.current?.click()} className="shrink-0 w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center">
                <Camera className="w-5 h-5" aria-hidden="true" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label={`Message ${memory.petName}`}
                maxLength={500}
                placeholder={`Ask ${memory.petName} anything`}
                className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-zinc-950 border border-white/[0.1] text-sm text-white placeholder:text-zinc-400 focus:border-emerald-500"
              />
              <button type="submit" aria-label="Send" disabled={busy || !input.trim()} className="shrink-0 w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center">
                <Send className="w-5 h-5" aria-hidden="true" />
              </button>
            </form>
            <p className="px-3 pb-3 text-[10px] text-zinc-400">
              Photos are resized, stripped of location data and sent to Google Gemini to answer you. FitLog does not store them.
              General guidance, not medical advice.
            </p>
          </>
        )}
      </section>
    </>
  );
}
