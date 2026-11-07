import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Ghost,
  Activity,
  Zap,
  Info,
  Scale,
  RefreshCw,
} from 'lucide-react';
import MuscleHeatmap from './MuscleHeatmap';
import { WorkoutStore } from '../../../../lib/workoutStore';
import {
  calculateStimulusVerdict,
  calculateMuscleBalance,
  detectJunkVolume,
  classifyMuscleVolume,
  getExerciseMuscleGroup,
} from '../../../../domain/hypertrophyVerdict';

/**
 * Physique Intel / Hypertrophy Verdict View
 * Gives lifters the unvarnished, science-backed truth about their training.
 * No sugar-coating, zero corporate fluff, maximum athletic integrity.
 */

export default function PhysiqueIntelView({ activeWorkout = null, onStartWorkout }) {
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // Retrieve user history from WorkoutStore
  const history = useMemo(() => WorkoutStore.getHistory(), []);

  // Compute 7-day weekly muscle volume from history + active session
  const weeklyMuscleSets = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const setsByGroup = {
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
    };

    // 1. Tally from completed workouts within past 7 days
    for (const w of history) {
      const workoutTime = new Date(w.timestamp || w.created_at || Date.now()).getTime();
      if (workoutTime >= oneWeekAgo) {
        for (const ex of w.exercises || []) {
          const group = getExerciseMuscleGroup(ex.name || ex.exerciseName);
          const completedCount = (ex.sets || []).filter(
            (s) => s.completed && Number(s.weight) >= 0 && Number(s.reps) > 0
          ).length;
          setsByGroup[group] = (setsByGroup[group] || 0) + completedCount;
        }
      }
    }

    // 2. Add sets from the currently active session
    if (activeWorkout && Array.isArray(activeWorkout.exercises)) {
      for (const ex of activeWorkout.exercises) {
        const group = getExerciseMuscleGroup(ex.name || ex.exerciseName);
        const completedCount = (ex.sets || []).filter(
          (s) => s.completed && Number(s.weight) >= 0 && Number(s.reps) > 0
        ).length;
        setsByGroup[group] = (setsByGroup[group] || 0) + completedCount;
      }
    }

    return setsByGroup;
  }, [history, activeWorkout]);

  // Compute unvarnished Stimulus Verdict
  const latestSessionForVerdict = activeWorkout?.exercises?.length > 0
    ? activeWorkout
    : history[0] || null;

  const verdict = useMemo(() => {
    return calculateStimulusVerdict(latestSessionForVerdict, history.slice(activeWorkout ? 0 : 1));
  }, [latestSessionForVerdict, history, activeWorkout]);

  // Compute Muscle Balance & Structural Ratios
  const balance = useMemo(() => {
    return calculateMuscleBalance(weeklyMuscleSets);
  }, [weeklyMuscleSets]);

  // Check Junk Volume in the latest session
  const junkCheck = useMemo(() => {
    return detectJunkVolume(latestSessionForVerdict);
  }, [latestSessionForVerdict]);

  // Grade color scheme
  const gradeColors = {
    S: 'from-emerald-400 to-teal-500 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
    A: 'from-emerald-500 to-green-600 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10',
    B: 'from-cyan-500 to-blue-600 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10',
    C: 'from-amber-500 to-yellow-600 text-amber-300 border-amber-500/30 shadow-amber-500/10',
    D: 'from-orange-500 to-red-600 text-orange-300 border-orange-500/30 shadow-orange-500/10',
    F: 'from-red-600 to-rose-700 text-red-300 border-red-500/30 shadow-red-500/10',
    'N/A': 'from-zinc-700 to-zinc-800 text-zinc-400 border-zinc-700 shadow-none',
  };

  const muscleGroupsList = [
    { id: 'chest', label: 'Chest', focus: 'Pectorals (Clavicular & Sternal)' },
    { id: 'back', label: 'Back', focus: 'Lats, Traps, Rhomboids, Erector Spinae' },
    { id: 'legs', label: 'Legs', focus: 'Quads, Hamstrings, Glutes, Calves' },
    { id: 'shoulders', label: 'Shoulders', focus: 'Anterior, Lateral & Posterior Delts' },
    { id: 'arms', label: 'Arms', focus: 'Biceps Brachii, Triceps, Forearms' },
    { id: 'core', label: 'Core', focus: 'Rectus Abdominis, Obliques' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-3 sm:px-6">
      {/* 1. TOP HEADER & NO-BS BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121620] via-[#0d1017] to-[#0a0c10] border border-white/[0.08] p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium">
                <Zap className="w-3.5 h-3.5" />
                PHYSIQUE INTEL &bull; NO BS
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {activeWorkout?.exercises?.length > 0 ? 'LIVE WORKOUT VERDICT' : 'LATEST COMPLETED SESSION'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hypertrophy Stimulus Score
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Real-time physiological evaluation based on the Renaissance Periodization (RP) hypertrophy model. We evaluate progressive overload, effective reps, and penalize junk volume.
            </p>
          </div>

          {/* Grade & Score Badge */}
          <div className="flex items-center gap-4 bg-zinc-900/90 border border-white/[0.08] p-4 rounded-xl shrink-0 self-stretch sm:self-auto justify-around sm:justify-start">
            <div className="text-center">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl bg-gradient-to-br border shadow-lg ${
                  gradeColors[verdict.grade] || gradeColors['N/A']
                }`}
              >
                {verdict.grade}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mt-1">
                Tier Grade
              </span>
            </div>

            <div className="h-10 w-px bg-white/[0.08]" />

            <div className="text-left space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-black text-white">{verdict.score}</span>
                <span className="text-xs font-mono text-zinc-400">/ 100</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium block">
                {verdict.ghostDefeatedCount > 0 ? `${verdict.ghostDefeatedCount} Ghosts Beaten` : 'Stimulus Tracked'}
              </span>
            </div>
          </div>
        </div>

        {/* Unvarnished Assessment Text Box */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-normal">
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px] mr-1.5">
              Physiological Verdict:
            </span>
            {verdict.unvarnishedTruth}
          </p>
        </div>
      </div>

      {/* 2. JUNK VOLUME & POSTURE WARNINGS (IF ANY) */}
      {(junkCheck.hasJunkVolume || balance.isImbalanced) && (
        <div className="space-y-3">
          {junkCheck.warnings.map((warn, i) => (
            <div
              key={`junk-${i}`}
              className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3 shadow-lg"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    Junk Volume Warning: {warn.group.toUpperCase()}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">
                    {warn.setsCount} sets
                  </span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">{warn.message}</p>
                <div className="text-xs text-red-300 font-medium pt-1">
                  <span className="underline font-bold">Action:</span> {warn.remedy}
                </div>
              </div>
            </div>
          ))}

          {balance.warnings.map((warn, i) => (
            <div
              key={`balance-${i}`}
              className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-lg"
            >
              <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {warn.title}
                </h4>
                <p className="text-xs text-amber-200/90 leading-relaxed">{warn.message}</p>
                <div className="text-xs text-amber-300 font-medium pt-1">
                  <span className="underline font-bold">Scientific Remedy:</span> {warn.remedy}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. TWO-COLUMN LAYOUT: ANATOMICAL HEATMAP + MUSCLE GROUP MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2-Sided Heatmap */}
        <div className="lg:col-span-6 xl:col-span-5">
          <MuscleHeatmap
            weeklyMuscleSets={weeklyMuscleSets}
            selectedGroup={selectedMuscle}
            onSelectGroup={setSelectedMuscle}
          />
        </div>

        {/* Right: Muscle Group Volume Matrix */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
              Weekly Volume Status (7-Day Rolling)
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Total: {Object.values(weeklyMuscleSets).reduce((a, b) => a + b, 0)} working sets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {muscleGroupsList.map((m) => {
              const sets = weeklyMuscleSets[m.id] || 0;
              const classification = classifyMuscleVolume(sets);
              const isSelected = selectedMuscle === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMuscle(isSelected ? null : m.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/60 border-white/[0.06] hover:bg-zinc-900 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                      {m.label}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: classification.bg,
                        color: classification.color,
                      }}
                    >
                      {classification.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <div className="text-xl font-mono font-black text-white">
                      {sets}{' '}
                      <span className="text-xs font-normal text-zinc-400">/ 10-20 target</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {sets >= 10 ? 'Stimulated' : `${10 - sets} sets to MAV`}
                    </span>
                  </div>

                  {/* Volume Gauge Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (sets / 20) * 100)}%`,
                        backgroundColor: classification.color,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2">
                    {classification.advice}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Overload Ghost Intel */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Ghost className="w-4 h-4 text-purple-400" />
              <span>Ghost Overload Mechanism</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every set you perform is continuously benchmarked against your previous lifetime best 1RM on that exact movement. Defeating your ghost triggers an instantaneous surge in hypertrophy stimulus points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

