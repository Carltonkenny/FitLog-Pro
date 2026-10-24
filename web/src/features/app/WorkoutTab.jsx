import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Minus, CheckCircle2, Flame, Sparkles, Clock, Check, ChevronDown, Award } from 'lucide-react';

export default function WorkoutTab({ blueprint, onWorkoutFinished }) {
  // Active exercises in Push routine
  const [exercises, setExercises] = useState([
    {
      id: 'bench',
      name: 'Barbell Bench Press',
      target: 'Pectoralis Major • Sternal Head',
      equipment: 'Barbell',
      sets: [
        { id: 1, prev: '80.0 × 8', weight: 82.5, reps: 8, completed: true, isPr: true },
        { id: 2, prev: '80.0 × 8', weight: 82.5, reps: 8, completed: true, isPr: false },
        { id: 3, prev: '80.0 × 7', weight: 82.5, reps: 7, completed: false, isPr: false },
        { id: 4, prev: '77.5 × 8', weight: 80.0, reps: 8, completed: false, isPr: false },
      ],
    },
    {
      id: 'incline_db',
      name: 'Incline Dumbbell Press',
      target: 'Clavicular Head (Upper Chest)',
      equipment: 'Dumbbell',
      sets: [
        { id: 1, prev: '28.0 × 10', weight: 30.0, reps: 10, completed: false, isPr: false },
        { id: 2, prev: '28.0 × 10', weight: 30.0, reps: 10, completed: false, isPr: false },
        { id: 3, prev: '28.0 × 9', weight: 30.0, reps: 9, completed: false, isPr: false },
      ],
    },
    {
      id: 'cable_fly',
      name: 'Low-to-High Cable Fly',
      target: 'Pectoralis Major Adduction',
      equipment: 'Cable',
      sets: [
        { id: 1, prev: '15.0 × 12', weight: 15.0, reps: 12, completed: false, isPr: false },
        { id: 2, prev: '15.0 × 12', weight: 15.0, reps: 12, completed: false, isPr: false },
      ],
    },
    {
      id: 'triceps',
      name: 'Triceps Rope Pushdown',
      target: 'Lateral & Medial Triceps Heads',
      equipment: 'Cable',
      sets: [
        { id: 1, prev: '27.5 × 12', weight: 30.0, reps: 12, completed: false, isPr: false },
        { id: 2, prev: '27.5 × 11', weight: 30.0, reps: 11, completed: false, isPr: false },
      ],
    },
  ]);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(2538); // 42 min
  const [restSeconds, setRestSeconds] = useState(72);
  const [restRunning, setRestRunning] = useState(true);

  // Timers
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (restRunning && restSeconds > 0) {
        setRestSeconds((r) => r - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [restRunning, restSeconds]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[activeExerciseIndex];

  // Toggle set completion
  const toggleSet = (setId) => {
    setExercises((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== activeExerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const nextDone = !s.completed;
            if (nextDone) {
              setRestSeconds(90); // trigger rest timer on set completion
            }
            return { ...s, completed: nextDone };
          }),
        };
      })
    );
  };

  // Adjust weight on the last uncompleted set
  const adjustCurrentSetWeight = (delta) => {
    setExercises((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== activeExerciseIndex) return ex;
        const updatedSets = [...ex.sets];
        const targetSetIndex = updatedSets.findIndex((s) => !s.completed);
        const idx = targetSetIndex !== -1 ? targetSetIndex : updatedSets.length - 1;
        if (idx >= 0) {
          updatedSets[idx] = {
            ...updatedSets[idx],
            weight: Math.max(0, Math.round((updatedSets[idx].weight + delta) * 10) / 10),
          };
        }
        return { ...ex, sets: updatedSets };
      })
    );
  };

  const addSet = () => {
    setExercises((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== activeExerciseIndex) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: ex.sets.length + 1,
              prev: `${last.weight} × ${last.reps}`,
              weight: last.weight,
              reps: last.reps,
              completed: false,
              isPr: false,
            },
          ],
        };
      })
    );
  };

  const totalCompletedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Active Workout Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#12141A] border border-[#242836] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              Push Day • Chest & Delts
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span>Elapsed: <strong className="text-white">{formatTime(elapsedSeconds)}</strong></span>
            <span>•</span>
            <span>Sets: <strong className="text-[#00F59B]">{totalCompletedSets}/{totalSets} done</strong></span>
          </div>
        </div>

        {/* Rest Timer Widget */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#181B26] border border-[#282E40]">
          <Clock className="w-4 h-4 text-[#00D4FF]" />
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-400 block">Rest Timer</span>
            <span className="text-base font-bold font-mono text-[#00D4FF] tabular-nums leading-none">
              {formatTime(restSeconds)}
            </span>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <button
              onClick={() => setRestSeconds((r) => r + 30)}
              className="px-1.5 py-0.5 rounded bg-[#202535] hover:bg-[#2B3248] text-[9px] font-mono text-slate-300"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSeconds((r) => Math.max(0, r - 15))}
              className="px-1.5 py-0.5 rounded bg-[#202535] hover:bg-[#2B3248] text-[9px] font-mono text-slate-300"
            >
              -15s
            </button>
          </div>
        </div>
      </div>

      {/* Gemini 2.5 Live Coach Callout */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#171B26] to-[#12141C] border border-[#00D4FF]/35 flex items-start gap-3 shadow-lg">
        <Sparkles className="w-4 h-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-[#00D4FF] font-mono font-bold mr-1.5">Gemini Coach Live:</strong>
          <span className="text-slate-300">
            "Targeting {blueprint?.fitness_goal || 'Hypertrophy'}. Set 1 hit a new Epley PR (104.5 kg). On set 3, pause 1 second at chest to eliminate elastic bounce and maximize mechanical tension."
          </span>
        </div>
      </div>

      {/* Exercise Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {exercises.map((ex, idx) => (
          <button
            key={ex.id}
            onClick={() => setActiveExerciseIndex(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeExerciseIndex === idx
                ? 'bg-[#00F59B] text-black border-[#00F59B] shadow-md shadow-[#00F59B]/20'
                : 'bg-[#14161E] text-slate-300 border-[#242836] hover:bg-[#1D212E]'
            }`}
          >
            <span>{ex.name}</span>
            <span className="ml-1.5 opacity-70 text-[10px] font-mono">
              ({ex.sets.filter((s) => s.completed).length}/{ex.sets.length})
            </span>
          </button>
        ))}
      </div>

      {/* Active Exercise Detail Card */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222736] pb-3">
          <div>
            <h3 className="text-xl font-black text-white font-['Outfit']">{currentExercise.name}</h3>
            <span className="text-xs text-slate-400 font-mono">{currentExercise.target}</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1A1D26] text-[#00D4FF] border border-[#2C3246]">
            {currentExercise.equipment}
          </span>
        </div>

        {/* Sets Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-500 px-3">
            <span className="col-span-2">Set</span>
            <span className="col-span-4">Previous</span>
            <span className="col-span-4">Weight × Reps</span>
            <span className="col-span-2 text-right">Log</span>
          </div>

          {currentExercise.sets.map((s) => (
            <div
              key={s.id}
              onClick={() => toggleSet(s.id)}
              className={`grid grid-cols-12 items-center px-3.5 py-3 rounded-xl border cursor-pointer transition-all ${
                s.completed
                  ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-white'
                  : 'bg-[#161822] border-[#222736] text-slate-300 hover:border-[#333A4F]'
              }`}
            >
              <span className="col-span-2 font-mono font-bold text-xs">{s.id}</span>
              <span className="col-span-4 font-mono text-xs text-slate-400">{s.prev}</span>
              <div className="col-span-4 flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-[#00D4FF]">{s.weight} kg</span>
                <span className="text-slate-500 text-xs">×</span>
                <span className="font-mono text-xs font-bold text-white">{s.reps}</span>
                {s.isPr && (
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-[#FFD026]/10 text-[#FFD026] border border-[#FFD026]/30 flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    <span>PR</span>
                  </span>
                )}
              </div>
              <div className="col-span-2 flex justify-end">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    s.completed
                      ? 'bg-[#00F59B] text-black shadow-md shadow-[#00F59B]/25'
                      : 'border border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {s.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stepper Bar (Thumb Zone) */}
        <div className="pt-3 border-t border-[#222736] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400 mr-1">Quick Weight:</span>
            {[-5, -2.5, -1.25, 1.25, 2.5, 5].map((delta) => (
              <button
                key={delta}
                onClick={() => adjustCurrentSetWeight(delta)}
                className="px-2 py-1 rounded-lg bg-[#1C202B] hover:bg-[#252A38] border border-[#282D3D] text-[11px] font-mono text-slate-300 transition-colors"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>

          <button
            onClick={addSet}
            className="px-3 py-1.5 rounded-lg bg-[#1C202B] hover:bg-[#262C3D] border border-[#2E354A] text-xs font-mono font-semibold text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#00F59B]" />
            <span>Add Set</span>
          </button>
        </div>
      </div>

      {/* Finish Workout CTA */}
      <button
        id="workout-finish-btn"
        onClick={() => onWorkoutFinished({ totalSets: totalCompletedSets, duration: elapsedSeconds })}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D485] hover:opacity-95 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#00F59B]/20 transition-all"
      >
        <CheckCircle2 className="w-5 h-5 text-black" />
        <span>Complete & Sync Workout to Cloud</span>
      </button>

    </div>
  );
}
