import React from 'react';
import { CalendarDays, ListPlus } from 'lucide-react';

/** Renders a structured plan returned by the coach. All text is rendered as plain text. */
export default function CoachPlanCard({ plan, onUseDay }) {
  return (
    <div className="space-y-3 w-full">
      <p className="text-zinc-200 leading-relaxed">{plan.summary}</p>

      {plan.photoObservations && (
        <p className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5">
          <strong className="font-semibold">From your photo: </strong>
          {plan.photoObservations}
        </p>
      )}

      {plan.days.map((day, i) => (
        <section key={i} aria-label={day.name} className="rounded-xl bg-zinc-950/70 border border-white/[0.08] overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.06]">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{day.name}</span>
              </h4>
              {day.focus && <p className="text-[11px] text-zinc-400 truncate">{day.focus}</p>}
            </div>
            {onUseDay && (
              <button
                type="button"
                onClick={() => onUseDay(day)}
                className="shrink-0 h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5"
              >
                <ListPlus className="w-4 h-4" aria-hidden="true" />
                Use today
              </button>
            )}
          </header>
          <ul className="divide-y divide-white/[0.05]">
            {day.exercises.map((ex, j) => (
              <li key={j} className="px-3 py-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-100">{ex.name}</div>
                  {ex.note && <div className="text-[11px] text-zinc-400 mt-0.5">{ex.note}</div>}
                </div>
                <div className="shrink-0 text-right text-xs font-mono text-emerald-300 tabular-nums">
                  {ex.sets} × {ex.reps}
                  {ex.restSeconds ? <div className="text-[10px] text-zinc-400">rest {ex.restSeconds}s</div> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {plan.notes?.length > 0 && (
        <ul className="text-[11px] text-zinc-400 list-disc pl-4 space-y-0.5">
          {plan.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
