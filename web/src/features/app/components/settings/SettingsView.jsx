import React from 'react';
import { ShieldCheck, User, Database, Download, LogOut, CloudOff } from 'lucide-react';
import { isCloudConfigured } from '../../../../lib/supabaseClient';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { REST_OPTIONS, setSettings, useSettings } from '../../../../lib/settings';
import { isIos, isStandalone, promptInstall, useCanInstall } from '../../../../lib/pwaInstall';

const GOAL_LABELS = { strength: 'Raw strength', muscle_growth: 'Muscle growth' };

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <span id={`${label}-lbl`} className="text-zinc-200 font-medium">{label}</span>
        <p className="text-zinc-400 text-[11px]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${label}-lbl`}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${
          checked ? 'bg-emerald-500 justify-end' : 'bg-zinc-700 justify-start'
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-white shadow-md" />
      </button>
    </div>
  );
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    workouts: WorkoutStore.getHistory(),
    personalRecords: WorkoutStore.getPersonalRecords(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitlog-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsView({ blueprint, session, syncStatus, onSignOut }) {
  const settings = useSettings();
  const email = session?.user?.email;
  const canInstall = useCanInstall();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400">
          Your units, rest timer and account. Changes save automatically on this device.
        </p>
      </div>

      {/* Profile */}
      <section aria-label="Profile" className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{email || 'Guest on this device'}</h3>
            <p className="text-xs text-zinc-400">
              Goal:{' '}
              <strong className="text-emerald-400">
                {GOAL_LABELS[blueprint?.goal] || blueprint?.fitness_goal || 'Not set'}
              </strong>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/[0.05]">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
            <span className="text-zinc-400">Training split</span>
            <div className="text-zinc-200 font-medium mt-0.5">{blueprint?.split_preference || 'Not set'}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
            <span className="text-zinc-400">Experience</span>
            <div className="text-zinc-200 font-medium mt-0.5">{blueprint?.experience_level || 'Not set'}</div>
          </div>
        </div>
      </section>

      {/* Install */}
      {!isStandalone() && (canInstall || isIos()) && (
        <section aria-label="Install the app" className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-2">
          <h3 className="text-sm font-bold text-white">Install on your phone</h3>
          {canInstall ? (
            <>
              <p className="text-xs text-zinc-400">Add FitLog Pro to your home screen. It opens full screen and works offline.</p>
              <button type="button" onClick={promptInstall} className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm">
                Install app
              </button>
            </>
          ) : (
            <p className="text-xs text-zinc-400">
              In Safari, tap the Share button, then <strong className="text-zinc-200">Add to Home Screen</strong>.
            </p>
          )}
        </section>
      )}

      {/* Preferences */}
      <section aria-label="Lifting preferences" className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white">Lifting preferences</h3>
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span id="unit-lbl" className="text-zinc-200 font-medium">Weight unit</span>
              <p className="text-zinc-400 text-[11px]">Shown in set inputs, totals and history. Stored in kg.</p>
            </div>
            <div role="radiogroup" aria-labelledby="unit-lbl" className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/[0.06]">
              {[
                { id: 'kg', label: 'kg' },
                { id: 'lb', label: 'lb' },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="radio"
                  aria-checked={settings.unit === u.id}
                  onClick={() => setSettings({ unit: u.id })}
                  className={`min-w-14 h-10 px-4 rounded-lg text-xs font-semibold transition ${
                    settings.unit === u.id ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor="rest-select" className="text-zinc-200 font-medium">Rest between sets</label>
              <p className="text-zinc-400 text-[11px]">The timer starts when you complete a set.</p>
            </div>
            <select
              id="rest-select"
              value={settings.restSeconds}
              onChange={(e) => setSettings({ restSeconds: Number(e.target.value) })}
              className="h-10 px-3 rounded-xl bg-zinc-950 border border-white/[0.08] text-zinc-200 text-xs font-mono focus:border-emerald-500"
            >
              {REST_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min` : `${s} sec`}
                </option>
              ))}
            </select>
          </div>

          <Toggle
            label="Rest timer chime"
            description="Plays a short tone when the rest interval ends."
            checked={settings.sound}
            onChange={(v) => setSettings({ sound: v })}
          />
          <Toggle
            label="Vibration"
            description="A short buzz when you complete a set (phones that support it)."
            checked={settings.haptics}
            onChange={(v) => setSettings({ haptics: v })}
          />
        </div>
      </section>

      {/* Data and account */}
      <section aria-label="Data and account" className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Your data</span>
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.04] flex items-center justify-between gap-3">
            <div>
              <span className="text-zinc-200 font-medium">Cloud sync</span>
              <p className="text-zinc-400 text-[11px]">{syncStatus?.statusLabel}</p>
            </div>
            {isCloudConfigured && session ? (
              <span className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-1.5 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Signed in</span>
              </span>
            ) : (
              <span className="shrink-0 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1.5">
                <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>This device only</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={exportData}
            className="w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export my data (JSON)
          </button>

          {session && (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full h-11 rounded-xl border border-white/[0.1] hover:bg-white/[0.05] text-zinc-200 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign out
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
