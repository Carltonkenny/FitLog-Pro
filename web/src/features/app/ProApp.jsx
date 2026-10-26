import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CloudSync } from '../../lib/cloudSync';
import { pullUserData, startUserDataSync } from '../../lib/userDataSync';
import Companion from '../companion/Companion';
import { WorkoutStore } from '../../lib/workoutStore';
import { resolveExercise } from '../../lib/companionActions.js';
import { toPlanItems } from './components/workout/RoutinesBar';

// Custom Hooks
import { useSessionControls } from './hooks/useSessionControls';
import { useWorkoutLogger } from './hooks/useWorkoutLogger';

// Layout Components
import SessionHeader from './components/layout/SessionHeader';
import StudioSidebar from './components/layout/StudioSidebar';
import StudioVisualizer from './components/layout/StudioVisualizer';
import MobileDrawer from './components/layout/MobileDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Feature Views
import ActiveWorkoutView from './components/workout/ActiveWorkoutView';
import CascadingExplorerView from './components/explorer/CascadingExplorerView';
import AnalyticsView from './components/analytics/AnalyticsView';
import HistoryView from './components/history/HistoryView';
import SettingsView from './components/settings/SettingsView';

// Modals
import FinishModal from './components/modals/FinishModal';
import RestartModal from './components/modals/RestartModal';
import ExercisePickerModal from './components/modals/ExercisePickerModal';

export default function ProApp({ blueprint, session, onBack, onUpdateBlueprint, onSignOut }) {
  // Navigation tabs: 'workout', 'library', 'analytics', 'history', 'settings'
  const [activeTab, setActiveTab] = useState('workout');

  // Display Mode: 'laptop' (3-column master-detail) vs 'mobile' (thumb-zone)
  const [layoutMode, setLayoutMode] = useState('laptop');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);

  // Auto-detect screen size
  useEffect(() => {
    const handleResize = () => {
      setLayoutMode(window.innerWidth < 1024 ? 'mobile' : 'laptop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Universal session controls hook
  const sessionControls = useSessionControls();

  // Active workout state & calculation hook
  const logger = useWorkoutLogger(blueprint?.goal);

  // Modals state
  const [isFinishedModalOpen, setIsFinishedModalOpen] = useState(false);
  const [lastFinishedWorkout, setLastFinishedWorkout] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Cloud sync status hook
  const [syncStatus, setSyncStatus] = useState(WorkoutStore.getSyncStatus());
  useEffect(() => {
    const refresh = () => setSyncStatus(WorkoutStore.getSyncStatus());
    const handleOnline = () => {
      WorkoutStore.flushSyncQueue().finally(refresh);
      refresh();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', refresh);
    window.addEventListener('fitlog:sync', refresh);
    WorkoutStore.flushSyncQueue().then(() => CloudSync.pull()).finally(refresh);
    startUserDataSync();
    pullUserData();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('fitlog:sync', refresh);
    };
  }, []);

  // Replace today's workout with a plan (coach day, routine or the last workout).
  const replaceWorkout = (title, items) => {
    if (
      logger.stats.completedSetsCount > 0 &&
      !window.confirm('This replaces your current workout, including sets you already completed. Continue?')
    ) {
      return;
    }
    logger.loadPlan(title, items);
    setActiveTab('workout');
  };

  // Turn one day of a coach plan into today's workout.
  const handleUseCoachDay = (day) =>
    replaceWorkout(
      day.name,
      toPlanItems(
        day.exercises.map((ex) => {
          const lib = resolveExercise(ex.name);
          return {
            exerciseId: lib?.id || `custom_${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60)}`,
            exerciseName: lib?.name || ex.name,
            sets: ex.sets,
            reps: parseInt(ex.reps, 10) || 10,
          };
        })
      )
    );

  // Finish workout handler
  const handleFinishWorkout = () => {
    if (logger.stats.completedSetsCount === 0) return;
    const durationSeconds = sessionControls.getElapsedSeconds();
    sessionControls.pauseSession();
    const result = WorkoutStore.saveWorkout({
      title: logger.workoutTitle,
      volumeKg: logger.stats.volume,
      durationSeconds,
      exercises: logger.exercises,
    });
    // Ready for the next session; the Finish button stays disabled until a set is completed.
    logger.startFreshWorkout();
    sessionControls.resetSession();
    setSyncStatus(WorkoutStore.getSyncStatus());
    setLastFinishedWorkout(result.savedRecord);
    setIsFinishedModalOpen(true);
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-500 focus:text-zinc-950 focus:font-bold"
      >
        Skip to main content
      </a>

      {/* 1. UNIVERSAL TOP HEADER */}
      <SessionHeader
        onBack={onBack}
        sessionState={sessionControls.sessionState}
        sessionSeconds={sessionControls.sessionSeconds}
        formatTimer={sessionControls.formatTimer}
        onStart={sessionControls.startSession}
        onPause={sessionControls.pauseSession}
        onRestartClick={() => sessionControls.setIsRestartConfirmOpen(true)}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        onFinishWorkout={handleFinishWorkout}
        finishDisabled={logger.stats.completedSetsCount === 0}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div
        className={`flex-1 flex w-full max-w-7xl mx-auto ${
          layoutMode === 'laptop' ? 'flex-row' : 'flex-col max-w-lg'
        }`}
      >
        {/* LEFT COLUMN: Navigation & Blueprint (Laptop) */}
        {layoutMode === 'laptop' && (
          <StudioSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            workoutStats={logger.stats}
            blueprint={blueprint}
            syncStatus={syncStatus}
          />
        )}

        {/* CENTER COLUMN: Tab Views */}
        <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto focus:outline-none">
          <h1 className="sr-only">FitLog Pro</h1>
          {activeTab === 'workout' && (
            <ActiveWorkoutView
              workoutTitle={logger.workoutTitle}
              setWorkoutTitle={logger.setWorkoutTitle}
              sessionSeconds={sessionControls.sessionSeconds}
              formatTimer={sessionControls.formatTimer}
              volume={logger.stats.volume}
              showAiSuggestion={showAiSuggestion}
              setShowAiSuggestion={setShowAiSuggestion}
              exercises={logger.exercises}
              activeExerciseIndex={logger.activeExerciseIndex}
              setActiveExerciseIndex={logger.setActiveExerciseIndex}
              layoutMode={layoutMode}
              setMobileDrawerOpen={setMobileDrawerOpen}
              isRestActive={logger.isRestActive}
              restSeconds={logger.restSeconds}
              setRestSeconds={logger.setRestSeconds}
              setIsRestActive={logger.setIsRestActive}
              onRemoveExercise={logger.removeExercise}
              onAddSet={logger.addSet}
              onRemoveSet={logger.removeSet}
              onUpdateSet={logger.updateSet}
              onToggleSet={(exIdx, setIdx) =>
                logger.toggleSet(exIdx, setIdx, sessionControls.startSession)
              }
              onOpenPicker={() => setIsPickerOpen(true)}
              onLoadRoutine={replaceWorkout}
              onOpenCoach={() => setCompanionOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <CascadingExplorerView onAddExercise={logger.addExercise} />
          )}

          {activeTab === 'analytics' && <AnalyticsView onStartWorkout={() => setActiveTab('workout')} />}

          {/* Gemini History-Aware Coach is cleanly embedded inside HistoryView */}
          {activeTab === 'history' && <HistoryView onOpenCompanion={() => setCompanionOpen(true)} />}

          {activeTab === 'settings' && (
            <SettingsView
              blueprint={blueprint}
              session={session}
              syncStatus={syncStatus}
              onSignOut={onSignOut}
            />
          )}
        </main>

        {/* RIGHT COLUMN: Live 1RM Curve & Barbell Sleeve (Laptop) */}
        {layoutMode === 'laptop' && (
          <StudioVisualizer currentFocusedExercise={logger.currentFocusedExercise} />
        )}
      </div>

      {/* 3. MOBILE BOTTOM THUMB-ZONE NAVIGATION */}
      {layoutMode === 'mobile' && (
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* 4. MOBILE SLIDE-UP DRAWER */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentFocusedExercise={logger.currentFocusedExercise}
      />

      {/* 5. MODALS */}
      <RestartModal
        isOpen={sessionControls.isRestartConfirmOpen}
        onClose={() => sessionControls.setIsRestartConfirmOpen(false)}
        onConfirm={() => sessionControls.confirmRestart(logger.resetAllSets)}
      />

      <FinishModal
        isOpen={isFinishedModalOpen}
        workout={lastFinishedWorkout}
        formatTimer={sessionControls.formatTimer}
        onClose={() => {
          setIsFinishedModalOpen(false);
          setActiveTab('history');
        }}
      />

      <Companion
        open={companionOpen}
        setOpen={setCompanionOpen}
        blueprint={blueprint}
        onUseDay={(day) => {
          handleUseCoachDay(day);
          setCompanionOpen(false);
        }}
        onAddExercise={logger.addExercise}
        onOpenTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'workout') setCompanionOpen(false);
        }}
      />

      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={(ex) => logger.addExercise(ex)}
        blueprint={blueprint}
        currentIds={logger.exercises.map((e) => e.exerciseId)}
      />
    </div>
  );
}
