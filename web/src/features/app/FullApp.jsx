import React, { useState } from 'react';
import { LayoutDashboard, Dumbbell, Library, History, Settings, Flame, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import DashboardTab from './DashboardTab';
import WorkoutTab from './WorkoutTab';
import ExercisesTab from './ExercisesTab';
import HistoryTab from './HistoryTab';
import SettingsTab from './SettingsTab';

export default function FullApp({ blueprint, session, onUpdateBlueprint, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('workout'); // 'dashboard', 'workout', 'exercises', 'history', 'settings'
  const [toastMessage, setToastMessage] = useState('Welcome to FitLog Pro! Blueprint loaded.');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col font-['Inter'] selection:bg-[#00F59B] selection:text-black pb-20 md:pb-0">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#1E222E] bg-[#0A0B0E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1D26] transition-colors flex items-center gap-1 text-xs font-mono"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>
            <div className="h-4 w-px bg-[#242836]" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base font-['Outfit'] text-white">
                FitLog<span className="text-[#00F59B]">.Pro</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161822] text-[#00D4FF] border border-[#2B3040]">
                {blueprint?.split_preference || 'PPL'}
              </span>
            </div>
          </div>

          {/* Sync indicator & user profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12141A] border border-[#242836] text-[11px] font-mono text-[#00F59B]">
              <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
              <span>CLOUD SYNC</span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs text-slate-400 hover:text-white font-mono hidden sm:inline"
            >
              {session?.user?.email || 'alex.athlete@gmail.com'}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'workout', label: 'Active Workout', icon: Dumbbell, badge: 'LIVE' },
            { id: 'exercises', label: 'Exercise Library', icon: Library, sub: '333+' },
            { id: 'history', label: 'History & Heatmap', icon: History },
            { id: 'settings', label: 'Blueprint & Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`app-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all ${
                  active
                    ? 'bg-[#181B26] text-[#00F59B] border border-[#00F59B]/30 font-semibold shadow-md shadow-[#00F59B]/5'
                    : 'text-slate-400 hover:text-white hover:bg-[#12141C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#00F59B]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00F59B] text-black">
                    {item.badge}
                  </span>
                )}
                {item.sub && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.sub}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Blueprint Card */}
          <div className="mt-6 p-4 rounded-xl bg-[#12141A] border border-[#242836] space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Current Target</div>
            <div className="text-sm font-bold text-white font-['Outfit']">{blueprint?.fitness_goal || 'Hypertrophy'}</div>
            <div className="text-xs text-[#00D4FF] font-mono">
              Target: {blueprint?.target_weight_kg || 80} kg • 1RM: {blueprint?.bench_1rm_kg || 85} kg
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] text-[#00F59B] hover:underline block pt-1 font-mono"
            >
              Edit in Settings →
            </button>
          </div>
        </aside>

        {/* Dynamic Tab Body */}
        <main className="flex-1 w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab
              blueprint={blueprint}
              onStartWorkout={() => setActiveTab('workout')}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutTab
              blueprint={blueprint}
              onWorkoutFinished={(summary) => {
                showToast('Workout successfully saved to Cloud Brain!');
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'exercises' && <ExercisesTab />}

          {activeTab === 'history' && <HistoryTab />}

          {activeTab === 'settings' && (
            <SettingsTab
              blueprint={blueprint}
              session={session}
              onSaveBlueprint={(newBp) => {
                onUpdateBlueprint(newBp);
                showToast('Athlete Blueprint updated & synced!');
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Bar (Thumb-Zone Ergonomics per AGENTS.md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#242836] bg-[#0E1015]/95 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'workout', label: 'Workout', icon: Dumbbell, live: true },
          { id: 'exercises', label: 'Library', icon: Library },
          { id: 'history', label: 'History', icon: History },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
                active ? 'text-[#00F59B]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.live && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B26] border border-[#00F59B]/50 text-white text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#00F59B]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
