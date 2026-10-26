import React, { useEffect, useRef, useState } from 'react';
import { Bot, Camera, Send, Sparkles, X } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { askCoach, CoachError } from '../../../../lib/coachApi';
import { PLAN_SCHEMA, buildContext, buildSystem } from '../../../../lib/coachPrompt';
import { ACCEPTED_TYPES, prepareImage } from '../../../../lib/imageUtils';
import CoachPlanCard from './CoachPlanCard';

const MAX_PHOTOS = 3;

const QUICK_ACTIONS = [
  { id: 'plan', label: 'Build my plan' },
  { id: 'progress', label: 'Review my progress' },
  { id: 'next', label: 'What should I lift next?' },
];

const PROMPTS = {
  plan: 'Build me a weekly training plan that fits my goal, experience and recent training.',
  progress: 'Review my recent progress. Point out what is improving and what has stalled.',
  next: 'Based on my last sessions, what should I lift next time and at what weights?',
};

function parsePlan(text) {
  try {
    const plan = JSON.parse(text);
    if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) return null;
    const days = plan.days
      .filter((d) => d && typeof d.name === 'string' && Array.isArray(d.exercises))
      .map((d) => ({
        name: d.name,
        focus: typeof d.focus === 'string' ? d.focus : '',
        exercises: d.exercises
          .filter((e) => e && typeof e.name === 'string')
          .map((e) => ({
            name: e.name,
            sets: Math.min(10, Math.max(1, Number(e.sets) || 3)),
            reps: String(e.reps ?? '8-12'),
            restSeconds: Number(e.restSeconds) || 0,
            note: typeof e.note === 'string' ? e.note : '',
          })),
      }))
      .filter((d) => d.exercises.length > 0);
    if (days.length === 0) return null;
    return {
      summary: String(plan.summary || ''),
      photoObservations: typeof plan.photoObservations === 'string' ? plan.photoObservations : '',
      notes: Array.isArray(plan.notes) ? plan.notes.filter((n) => typeof n === 'string') : [],
      days,
    };
  } catch {
    return null;
  }
}

export default function GeminiHistoryCoach({ blueprint, onUseDay }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [messages, busy]);

  const addPhotos = async (fileList) => {
    setPhotoError('');
    const room = MAX_PHOTOS - photos.length;
    const files = [...fileList].slice(0, room);
    try {
      const prepared = await Promise.all(files.map(prepareImage));
      setPhotos((prev) => [...prev, ...prepared]);
    } catch (err) {
      setPhotoError(err.message);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const send = async (kind, text) => {
    const question = (text || '').trim();
    if (!question || busy) return;
    const attached = photos;
    const wantsPlan = kind === 'plan';

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: question, images: attached.map((p) => p.preview) }]);
    setInput('');
    setPhotos([]);
    setBusy(true);

    const context = buildContext({
      history: WorkoutStore.getHistory(),
      prs: WorkoutStore.getPersonalRecords(),
      blueprint,
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
      const reply = await askCoach({
        system: buildSystem({ withPhotos: attached.length > 0, wantsPlan }),
        contents: [...earlier, lastTurn],
        maxOutputTokens: wantsPlan ? 3000 : 700,
        ...(wantsPlan ? { responseSchema: PLAN_SCHEMA } : {}),
      });
      if (wantsPlan) {
        const plan = parsePlan(reply);
        setMessages((prev) => [
          ...prev,
          plan
            ? { id: Date.now() + 1, sender: 'ai', plan }
            : { id: Date.now() + 1, sender: 'ai', error: true, text: 'The coach could not build a plan from that. Try again.' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: reply || 'The coach returned an empty answer. Try rephrasing.' },
        ]);
      }
    } catch (err) {
      const text = err instanceof CoachError ? err.message : 'The AI coach is unavailable right now.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', error: true, text }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="AI coach" className="rounded-2xl bg-zinc-900/90 border border-emerald-500/30 overflow-hidden shadow-xl">
      <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-cyan-950/40 border-b border-white/[0.08] flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Bot className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI coach</h3>
          <p className="text-[11px] text-zinc-400">
            Reads your workout history and goals. Add a photo of your physique, your form or your gym for a tailored plan.
          </p>
        </div>
      </div>

      <div role="log" aria-live="polite" aria-label="Conversation" className="p-4 space-y-3 max-h-[28rem] min-h-40 overflow-y-auto text-xs">
        {messages.length === 0 && (
          <div className="text-zinc-400 space-y-2">
            <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Ask anything about your training, or start with one of these:
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
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
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2.5 bg-zinc-800/80 w-48 space-y-1.5" aria-label="The coach is thinking">
              <div className="skeleton h-2.5 w-full" />
              <div className="skeleton h-2.5 w-3/4" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={busy}
            onClick={() => send(a.id === 'plan' ? 'plan' : 'chat', PROMPTS[a.id])}
            className="h-9 px-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/[0.06]"
          >
            {a.label}
          </button>
        ))}
      </div>

      {photos.length > 0 && (
        <div className="px-4 pb-2 flex gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p.preview} alt={`Photo ${i + 1} to send`} className="w-14 h-14 rounded-lg object-cover border border-white/[0.1]" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((prev) => prev.filter((_, k) => k !== i))}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-950 border border-white/[0.2] text-zinc-200 flex items-center justify-center"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photoError && (
        <p role="alert" className="px-4 pb-2 text-xs text-amber-300">
          {photoError}
        </p>
      )}

      <form
        className="p-3 border-t border-white/[0.08] flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(/\bplan\b/i.test(input) ? 'plan' : 'chat', input);
        }}
      >
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple hidden onChange={(e) => addPhotos(e.target.files)} />
        <button
          type="button"
          aria-label="Attach a photo"
          disabled={busy || photos.length >= MAX_PHOTOS}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center"
        >
          <Camera className="w-5 h-5" aria-hidden="true" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message the coach"
          maxLength={500}
          placeholder="Ask about your training, or say “build my plan”"
          className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-zinc-950 border border-white/[0.1] text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={busy || !input.trim()}
          className="shrink-0 w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center"
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
      <p className="px-4 pb-3 text-[10px] text-zinc-400">
        Photos are resized, stripped of location data and sent to Google Gemini to answer your request. FitLog does not
        store them. Coaching is general guidance, not medical advice.
      </p>
    </section>
  );
}
