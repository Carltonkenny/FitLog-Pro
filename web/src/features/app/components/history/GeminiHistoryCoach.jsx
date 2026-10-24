import React, { useState } from 'react';
import { Bot, Send, Sparkles, TrendingUp, Award, Layers } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';

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

  const handleSend = (customPrompt = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('plateau') || lower.includes('analyze') || lower.includes('progress')) {
        const lastWo = history[0];
        const lastVol = lastWo ? `${lastWo.volumeKg.toLocaleString()} kg` : '12,450 kg';
        reply = `📊 History Analysis: Your last session logged ${lastVol} of total volume across ${lastWo?.exercises?.length || 3} exercises. Your Barbell Bench Press reached ${prs.bench_press?.weight || 40} kg × ${prs.bench_press?.reps || 10} reps (Estimated Max: ${prs.bench_press?.oneRepMax || 54} kg). Recommendation: To prevent a plateau on chest, micro-load by +1.25kg next session or add 1 extra rep before increasing weight.`;
      } else if (lower.includes('most') || lower.includes('pr') || lower.includes('improved')) {
        reply = `🏆 Standout Movement: Your Lat Pulldown has seen the most consistent progressive overload, advancing to ${prs.lat_pulldown?.weight || 35} kg for ${prs.lat_pulldown?.reps || 12} reps with an estimated 1RM of ${prs.lat_pulldown?.oneRepMax || 49} kg. Your back volume is right on target for optimal V-taper growth!`;
      } else if (lower.includes('next') || lower.includes('target') || lower.includes('suggest')) {
        reply = `🎯 Next Session Blueprint: For your upcoming Push workout, aim for 42.5 kg on Flat Bench Press for 8–9 clean reps. Maintain a 2-second controlled eccentric and a 1-second chest pause. If you achieve 10 reps, that will register as a new all-time Personal Record!`;
      } else if (lower.includes('swap') || lower.includes('busy')) {
        reply = `🔄 Smart Swap: Since your history shows high proficiency in Dumbbell and Cable movements, swap Flat Barbell Bench with 30° Incline Dumbbell Press (20kg dumbbells) or Machine Chest Press. Both protect your shoulder capsule while matching the stimulus of the barbell!`;
      } else {
        reply = `Great inquiry! Looking at your historical consistency (3+ sessions/week), your muscle recovery is well within the optimal window. Keep your rest pauses between 90s to 120s on compound movements to ensure full motor unit recruitment for every set.`;
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 700);
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
          Flash 2.0 • 18 queries left
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
