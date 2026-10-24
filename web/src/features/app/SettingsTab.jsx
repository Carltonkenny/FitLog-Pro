import React, { useState } from 'react';
import { Settings, User, Smartphone, QrCode, ShieldCheck, Sparkles, Save, Check, ExternalLink } from 'lucide-react';
import { AuthService } from '../../lib/supabaseClient';

export default function SettingsTab({ blueprint, session, onSaveBlueprint }) {
  const [goal, setGoal] = useState(blueprint?.fitness_goal || 'Hypertrophy');
  const [split, setSplit] = useState(blueprint?.split_preference || 'PPL');
  const [bodyWeight, setBodyWeight] = useState(blueprint?.body_weight_kg || 76.5);
  const [targetWeight, setTargetWeight] = useState(blueprint?.target_weight_kg || 80.0);
  const [bench1RM, setBench1RM] = useState(blueprint?.bench_1rm_kg || 85.0);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = {
      ...blueprint,
      fitness_goal: goal,
      split_preference: split,
      body_weight_kg: parseFloat(bodyWeight),
      target_weight_kg: parseFloat(targetWeight),
      bench_1rm_kg: parseFloat(bench1RM),
    };
    const userId = session?.user?.id || 'usr_carlton_kenny';
    await AuthService.saveOnboardingProfile(userId, updated);
    onSaveBlueprint(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const deepLink = `fitlogpro://auth/callback?token=${session?.access_token || 'fitlog_session'}&userId=${session?.user?.id || 'usr_carlton_kenny'}`;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836]">
        <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
          Athlete Blueprint & App Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Update your targets anytime. Changes sync instantly across the web application and native mobile phone.
        </p>
      </div>

      {/* Blueprint Editor Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#12141A] border border-[#242836] space-y-6">
        <div className="flex items-center justify-between border-b border-[#222736] pb-3">
          <span className="text-sm font-bold text-white font-['Outfit']">Physiological Blueprint</span>
          {saved && (
            <span className="text-xs font-mono text-[#00F59B] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved & Synced!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Primary Objective</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs outline-none focus:border-[#00F59B]"
            >
              <option value="Hypertrophy">Pure Hypertrophy (Muscle Size)</option>
              <option value="Strength">Powerlifting & 1RM Strength</option>
              <option value="Recomp">Body Recomposition</option>
              <option value="Conditioning">Athletic Conditioning</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Weekly Training Split</label>
            <select
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs outline-none focus:border-[#00F59B]"
            >
              <option value="PPL">Push / Pull / Legs (6-Day)</option>
              <option value="UpperLower">Upper / Lower (4-Day)</option>
              <option value="FullBody">Full Body Compound (3-Day)</option>
              <option value="Arnold">Arnold Split (6-Day)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Current Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs font-mono outline-none focus:border-[#00F59B]"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Target Goal Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs font-mono outline-none focus:border-[#00F59B]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Estimated Bench Press 1RM (kg)</label>
            <input
              type="number"
              step="2.5"
              value={bench1RM}
              onChange={(e) => setBench1RM(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs font-mono outline-none focus:border-[#00F59B]"
            />
          </div>
        </div>

        <button
          id="settings-save-blueprint-btn"
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#00F59B]/20"
        >
          <Save className="w-4 h-4 text-black" />
          <span>Save Changes to Cloud</span>
        </button>
      </form>

      {/* Mobile Device Pairing & Deep Link Card */}
      <div className="p-6 rounded-2xl bg-[#12141A] border border-[#242836] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#222736] pb-3">
          <Smartphone className="w-5 h-5 text-[#00F59B]" />
          <span className="text-sm font-bold text-white font-['Outfit']">Pair & Sync with Native Mobile Phone</span>
        </div>

        <p className="text-xs text-slate-400">
          Want to log workouts in the gym on your Android phone? Scan the QR code or tap the deep link to restore this account in the Flutter native app.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          <div className="space-y-3">
            <a
              href={deepLink}
              className="w-full py-3 px-4 rounded-xl bg-[#1C202B] hover:bg-[#252A38] border border-[#2E354A] text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Launch App (fitlogpro://)</span>
              <ExternalLink className="w-4 h-4 text-[#00F59B]" />
            </a>

            <div className="text-[11px] font-mono text-slate-500">
              Session User ID: <code className="text-[#00D4FF]">{session?.user?.id || 'usr_carlton_kenny'}</code>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#181B26] border border-[#262C3D]">
            <div className="p-2 rounded-lg bg-white mb-2">
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="28" height="28" fill="black" />
                <rect x="14" y="14" width="20" height="20" fill="white" />
                <rect x="18" y="18" width="12" height="12" fill="black" />
                <rect x="62" y="10" width="28" height="28" fill="black" />
                <rect x="66" y="14" width="20" height="20" fill="white" />
                <rect x="70" y="18" width="12" height="12" fill="black" />
                <rect x="10" y="62" width="28" height="28" fill="black" />
                <rect x="14" y="66" width="20" height="20" fill="white" />
                <rect x="18" y="70" width="12" height="12" fill="black" />
                <rect x="44" y="24" width="12" height="12" fill="black" />
                <rect x="44" y="44" width="14" height="14" fill="black" />
                <rect x="68" y="68" width="16" height="16" fill="black" />
              </svg>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Scan with Phone Camera</span>
          </div>
        </div>
      </div>

      {/* Cloud Brain Status */}
      <div className="p-5 rounded-2xl bg-[#0D0E13] border border-[#202432] flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500 block uppercase">Supabase Cloud Database</span>
          <span className="text-white font-bold">fczhckzsynzfomytkgym.supabase.co</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B]" />
          <span>CONNECTED</span>
        </span>
      </div>
    </div>
  );
}
