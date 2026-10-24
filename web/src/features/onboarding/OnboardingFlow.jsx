import React, { useState } from 'react';
import { Target, Dumbbell, Calendar, Activity, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { AuthService } from '../../lib/supabaseClient';

export default function OnboardingFlow({ session, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Onboarding State (Plain English First)
  const [goal, setGoal] = useState('Muscle Growth');
  const [experience, setExperience] = useState('Intermediate');
  const [split, setSplit] = useState('PPL');
  const [bodyWeight, setBodyWeight] = useState(76.5);
  const [targetWeight, setTargetWeight] = useState(80.0);
  const [benchEstimate, setBenchEstimate] = useState(85.0);

  const totalSteps = 4;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Finalize and save to Supabase
      setLoading(true);
      const blueprint = {
        fitness_goal: goal,
        goal: goal === 'Raw Strength' ? 'strength' : 'muscle_growth',
        experience_level: experience,
        split_preference: split,
        body_weight_kg: parseFloat(bodyWeight),
        target_weight_kg: parseFloat(targetWeight),
        bench_1rm_kg: parseFloat(benchEstimate),
        daily_calorie_target: goal === 'Muscle Growth' ? 2850 : 2500,
        weekly_volume_target_sets: experience === 'Advanced' ? 18 : 14,
      };

      const userId = session?.user?.id || 'usr_carlton_kenny';
      await AuthService.saveOnboardingProfile(userId, blueprint);
      setLoading(false);
      onComplete(blueprint);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-xl rounded-2xl bg-[#0f1117] border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <span className="tracking-wider">STEP 0{step} OF 0{totalSteps}</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {Math.round((step / totalSteps) * 100)}% COMPLETE
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Primary Target (Plain English) */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>PRIMARY GOAL</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What is your main fitness goal?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                We'll tailor your routine, exercise selection, and weekly set targets around this objective.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: 'Muscle Growth',
                  title: 'Muscle Growth (Size & Tone)',
                  desc: 'Build visible muscle, aesthetic shape, and full-body definition',
                },
                {
                  id: 'Raw Strength',
                  title: 'Raw Strength & Power',
                  desc: 'Lift heavier weights on main compound movements like squat, bench, deadlift',
                },
                {
                  id: 'Lean & Toned',
                  title: 'Lean & Toned (Recomposition)',
                  desc: 'Burn body fat while preserving and building lean muscle',
                },
                {
                  id: 'Endurance',
                  title: 'Athletic Endurance & Fitness',
                  desc: 'Boost overall stamina, conditioning, and workout energy',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  id={`goal-option-${item.id.toLowerCase().replace(/[^a-z]/g, '')}`}
                  onClick={() => setGoal(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                    goal === item.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-zinc-900/60 border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm tracking-tight">{item.title}</span>
                    {goal === item.id && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Experience Level */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>TRAINING EXPERIENCE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How long have you been lifting?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Used to calibrate recovery intervals and recommend weekly weight progression jumps.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'Novice',
                  title: 'Beginner (Under 1 Year)',
                  desc: 'Learning proper form and making rapid early strength improvements (+1–2.5 kg/week)',
                },
                {
                  id: 'Intermediate',
                  title: 'Intermediate (1 to 3 Years)',
                  desc: 'Consistent lifter ready for structured progressive overload and periodic deloads',
                },
                {
                  id: 'Advanced',
                  title: 'Advanced (3+ Years)',
                  desc: 'Experienced lifter optimizing high volume, fatigue management, and biomechanics',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  id={`exp-option-${item.id.toLowerCase()}`}
                  onClick={() => setExperience(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between active:scale-[0.98] ${
                    experience === item.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-zinc-900/60 border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm tracking-tight block">{item.title}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                  {experience === item.id && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Training Split */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>WORKOUT SCHEDULE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Choose your weekly training cadence
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                We'll pre-populate your routine with balanced muscle recovery intervals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: 'PPL', title: 'Push / Pull / Legs', days: '4 to 6 Days/Wk', tag: 'Most Popular' },
                { id: 'UpperLower', title: 'Upper / Lower Split', days: '4 Days/Wk', tag: 'High Recovery' },
                { id: 'FullBody', title: 'Full Body Compound', days: '3 Days/Wk', tag: 'Time Efficient' },
                { id: 'Arnold', title: 'Arnold Split', days: '5 to 6 Days/Wk', tag: 'High Volume' },
              ].map((item) => (
                <div
                  key={item.id}
                  id={`split-option-${item.id.toLowerCase()}`}
                  onClick={() => setSplit(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                    split === item.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/60 border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm tracking-tight">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {item.days}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Body Metrics & Benchmark */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
                <Activity className="w-3.5 h-3.5" />
                <span>BASELINE BENCHMARK</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Current metrics & starting strength
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Used to calculate realistic starting weights, warmup sets, and estimated 1-rep maximums.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Current Body Weight (kg)
                </label>
                <input
                  id="onboarding-weight-input"
                  type="number"
                  step="0.1"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] focus:border-emerald-500 text-white text-sm font-mono outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Target Weight Goal (kg)
                </label>
                <input
                  id="onboarding-target-input"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] focus:border-emerald-500 text-white text-sm font-mono outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Estimated Bench Press Max Lift (kg)
                </label>
                <input
                  id="onboarding-bench-input"
                  type="number"
                  step="2.5"
                  value={benchEstimate}
                  onChange={(e) => setBenchEstimate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] focus:border-emerald-500 text-white text-sm font-mono outline-none tabular-nums"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Approximate 1-rep maximum; this configures starting warmup weight.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06] mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.05] transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 transition"
            >
              Skip Onboarding
            </button>
          )}

          <button
            id="onboarding-next-btn"
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition active:scale-95 shadow-md shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Configuring Cloud Blueprint...</span>
              </>
            ) : step < totalSteps ? (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Generate My Blueprint & Enter App</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
