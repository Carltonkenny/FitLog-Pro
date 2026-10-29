import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Activity,
  Cpu,
  Check,
} from 'lucide-react';

export default function ScienceAcademy() {
  const [selectedMuscle, setSelectedMuscle] = useState('Chest');

  const muscleData = {
    Chest: {
      scientific: 'Upper & Lower Chest (Collarbone & Mid-Pecs)',
      rationale: 'Best stimulated through a controlled deep stretch at the bottom and a powerful squeeze at the top.',
      exercises: ['Incline Dumbbell Press', 'Low-to-High Cable Fly', 'Parallel Bar Chest Dip'],
      hypertrophyTier: 'Top Tier — Exceptional growth with low joint strain',
    },
    Back: {
      scientific: 'Lats & Upper Back (V-Taper Width & Thickness)',
      rationale: 'Drive elbows down into your back pockets and squeeze shoulder blades for a wide, athletic V-taper.',
      exercises: ['Chest-Supported T-Bar Row', 'Neutral Grip Lat Pulldown', 'Single-Arm Cable Row'],
      hypertrophyTier: 'Top Tier — Builds wide back with zero lower back strain',
    },
    Legs: {
      scientific: 'Front Thighs, Back Thighs & Glutes',
      rationale: 'Squatting deep below parallel and controlled leg curls build powerful legs and shield your knees from injury.',
      exercises: ['45° Incline Leg Press', 'Seated Hamstring Leg Curl', 'Romanian Deadlift'],
      hypertrophyTier: 'Top Tier — Maximum full-body power and calorie burn',
    },
    Shoulders: {
      scientific: 'Side & Rear Shoulders (3D Rounded Shape)',
      rationale: 'Frequent, controlled lateral raises widen your upper body profile and create a narrow-waist illusion.',
      exercises: ['Cross-Body Cable Lateral Raise', 'Reverse Pec Deck Fly', 'Standing Overhead Press'],
      hypertrophyTier: 'Top Tier — Fast recovery and capped 3D shape',
    },
    Arms: {
      scientific: 'Biceps & Triceps (Front & Back of Arms)',
      rationale: 'Triceps drive 65% of upper arm size and pressing strength, while biceps give the classic arm peak.',
      exercises: ['Overhead Cable Triceps Extension', 'Incline Bench Dumbbell Curl', 'Rope Hammer Curl'],
      hypertrophyTier: 'Top Tier — High frequency tolerance and direct arm size',
    },
  };

  return (
    <section id="science" className="py-20 border-t border-white/[0.08] bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EXERCISE BIOMECHANICS ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built on Real Muscle Growth Science, Not Guesswork
          </h2>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base leading-relaxed">
            Every exercise in FitLog Pro is mapped to length-tension curves, joint safety, and recovery fatigue scores.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Mechanical Tension First</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tracking random volume is useless if sets are too far from muscular limit. FitLog Pro tracks the true high-yield working sets (0–3 reps left in the tank) that trigger real muscle synthesis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Growth vs. Fatigue Score</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We rank every movement by how much muscle growth it creates compared to joint wear and spinal tiredness. Train harder without feeling beaten up the next day.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">AI Biomechanics Guidance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Powered by Google Gemini Flash. Receive real-time plain-English cues on lowering speed, elbow paths, and wrist angles directly while logging each set.
            </p>
          </div>

        </div>

        {/* Realistic Biomechanics Showcase */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/[0.08] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Interactive Anatomy Explorer</h3>
              <p className="text-xs text-zinc-400">Select a muscle group to view plain-English mechanics & Top-Rated movements</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.keys(muscleData).map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`min-h-11 px-4 rounded-xl text-xs font-semibold transition active:scale-95 border ${
                    selectedMuscle === muscle
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-950 text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {selectedMuscle} Target Anatomy
                </span>
                <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {muscleData[selectedMuscle].scientific}
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.05] text-xs text-zinc-300 leading-relaxed">
                <strong className="text-emerald-400 block mb-1">Optimal Lifting Strategy:</strong>
                {muscleData[selectedMuscle].rationale}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block">
                  Top-Rated Science-Backed Movements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {muscleData[selectedMuscle].exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.05] text-xs font-medium text-zinc-200 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Efficiency Classification</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    VERIFIED
                  </span>
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  {muscleData[selectedMuscle].hypertrophyTier}
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-[94%] rounded-full" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  FitLog Pro automatically prioritizes movements that stimulate maximum muscle recruitment with minimal joint wear.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
