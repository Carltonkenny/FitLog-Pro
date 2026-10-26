import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
} from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function GeminiHistoryCoach() {
  const history = WorkoutStore.getHistory();
  const prs = WorkoutStore.getPersonalRecords();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I'm your Gemini Biomechanics & History Coach. I have direct access to your ${history.length} logged workouts and personal records. Ask me to analyze your progress, detect plateaus, or suggest next week's overload targets!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (customPrompt = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    // Build context summary from real workout history
    const recentSessions = history.slice(0, 5).map((w) => ({
      date: w.timestamp ? new Date(w.timestamp).toISOString().slice(0, 10) : w.date,
      title: w.title,
      volumeKg: w.volumeKg,
      completedSets: (w.exercises || []).reduce(
        (n, ex) => n + (ex.sets || []).filter((x) => x.completed).length,
        0
      ),
    }));
    const prSummary = Object.entries(prs)
      .map(([ex, pr]) => `${ex}: ${pr.weight}kg × ${pr.reps} reps (1RM ~${pr.oneRepMax}kg)`)
      .join('; ');

    const systemContext = `You are FitLog Pro's Gemini Biomechanics & History Coach.
You have access to the athlete's real workout data:
- Recent sessions (newest first): ${JSON.stringify(recentSessions)}
- Personal Records: ${prSummary || 'No PRs yet'}
Answer in 2–4 sentences max. Be specific, direct, and use plain English (no medical jargon).
Always tie recommendations to actual numbers from their history.`;

    try {
      if (GEMINI_API_KEY) {
        const res = await fetch(GEMINI_URL, {
          signal: AbortSignal.timeout(60000),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemContext + '\n\nAthlete asks: ' + textToSend }] },
            ],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const reason =
            res.status === 503 || res.status === 429
              ? 'The AI coach is busy right now. Try again in a minute.'
              : 'The AI coach is unavailable right now. Your workouts are not affected.';
          console.error('Gemini request failed:', res.status, data?.error?.message);
          throw new Error(reason);
        }
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'The coach returned an empty answer. Try rephrasing.';
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
      } else {
        // Fallback if API key is not configured
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: '⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file to enable AI coaching.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: err.name === 'TimeoutError' ? 'The AI coach took too long to answer. Try again in a minute.' : err.message.startsWith('The ') ? err.message : 'Cannot reach the AI coach. Check your connection and try again.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-emerald-500/30 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-cyan-950/40 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Gemini History Coach</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected to Logs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Analyzes your actual workout history, volume trends, and PRs in real time
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[10px] text-zinc-500 font-mono">
          {GEMINI_API_KEY ? 'Gemini • Live' : 'API Key Required'}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="p-4 space-y-3 h-64 overflow-y-auto text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-zinc-950 font-medium'
                  : 'bg-zinc-800 text-zinc-200 border border-white/[0.06]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Gemini is analyzing your history...</span>
          </div>
        )}
      </div>

      {/* Suggested History Queries */}
      <div className="px-4 py-2.5 bg-zinc-950/60 border-t border-white/[0.04] flex flex-wrap gap-1.5">
        {[
          'Analyze my recent progress & plateaus',
          'Which exercise improved the most?',
          'Suggest overload target for next session',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-emerald-300 transition border border-white/[0.04]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-zinc-950/80 border-t border-white/[0.08] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Gemini to analyze your historical logs, PRs, or volume..."
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
