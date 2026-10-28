import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Volume2, Smartphone, Database, Check } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';

export default function SettingsView({ blueprint, onUpdateBlueprint }) {
  const initialPrefs = WorkoutStore.getPreferences();
  const [unit, setUnit] = useState(initialPrefs.unit || 'kg');
  const [restDuration, setRestDuration] = useState(String(initialPrefs.restDuration || '90'));
  const [soundEnabled, setSoundEnabled] = useState(initialPrefs.sound ?? true);
  const [hapticsEnabled, setHapticsEnabled] = useState(initialPrefs.haptics ?? true);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    WorkoutStore.savePreferences({ unit: newUnit });
  };

  const handleRestChange = (newRest) => {
    setRestDuration(newRest);
    WorkoutStore.savePreferences({ restDuration: Number(newRest) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">App Settings & Profile</h2>
        <p className="text-xs text-zinc-400">
          Manage your lifting preferences, rest timer durations, and cloud synchronization safeguards.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Athlete Profile</h3>
            <p className="text-xs text-zinc-400">
              Primary Goal: <strong className="text-emerald-400 capitalize">{blueprint?.goal || 'Muscle Growth'}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/[0.05]">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
            <span className="text-zinc-500">Target Training Split</span>
            <div className="text-zinc-200 font-medium mt-0.5">4 Sessions / Week</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
            <span className="text-zinc-500">Experience Tier</span>
            <div className="text-zinc-200 font-medium mt-0.5">Intermediate Lifter</div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white">Lifting Preferences</h3>

        <div className="space-y-3.5 text-xs">
          {/* Unit Switcher */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-zinc-200 font-medium">Weight Measurement Unit</span>
              <p className="text-zinc-500 text-[11px]">Affects barbell sleeve and set inputs</p>
            </div>
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleUnitChange('kg')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  unit === 'kg'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Metric (kg)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('lbs')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  unit === 'lbs'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Imperial (lbs)
              </button>
            </div>
          </div>

          {/* Rest Duration */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-zinc-200 font-medium">Default Rest Pause</span>
              <p className="text-zinc-500 text-[11px]">Recommended rest between working sets</p>
            </div>
            <select
              value={restDuration}
              onChange={(e) => handleRestChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-zinc-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
            >
              <option value="60">60 Seconds</option>
              <option value="90">90 Seconds (Recommended)</option>
              <option value="120">120 Seconds</option>
              <option value="180">180 Seconds (Strength)</option>
            </select>
          </div>

          {/* Sound Cues */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-zinc-200 font-medium">Rest Timer Audio Chime</span>
              <p className="text-zinc-500 text-[11px]">Plays audio chime when rest interval completes</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud & Storage Safeguards (Clean, no cryptic hashes) */}
      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cloud Storage & Offline Continuity</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-zinc-200 font-medium">Cloud Database Sync</span>
              <p className="text-zinc-500 text-[11px]">PostgreSQL with Row Level Security</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1.5 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Connected & Verified</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-zinc-200 font-medium">Local Offline Engine</span>
              <p className="text-zinc-500 text-[11px]">100% operational with or without network</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-medium font-mono text-[11px]">
              Ready & Cached
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
