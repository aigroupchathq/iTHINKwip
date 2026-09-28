import React, { useState, useEffect } from 'react';
import { ActiveTab, ChallengeResult } from './types/neuro';
import { Navbar } from './components/Navbar';
import { BrainTrainingPortal } from './components/BrainTrainingPortal/BrainTrainingPortal';
import { FlowStateLab } from './components/FlowStateLab/FlowStateLab';
import { NeuroAudioStudio } from './components/NeuroAudioStudio';
import { ProgressTracker } from './components/ProgressTracker/ProgressTracker';
import { EducationalHub } from './components/EducationalHub/EducationalHub';
import { RehabDirectory } from './components/RehabDirectory/RehabDirectory';
import { ResourceLibrary } from './components/ResourceLibrary/ResourceLibrary';
import { CommunityForum } from './components/CommunityForum/CommunityForum';
import { PlatformBlueprint } from './components/PlatformBlueprint/PlatformBlueprint';
import { AmbientThoughtCurrents } from './components/AmbientThoughtCurrents';
import { ExperienceLayout } from './components/ExperienceLayout';

const DEMO_RESULT_IDS = new Set(['res-init-1', 'res-init-2', 'res-init-3', 'res-init-4']);

function isChallengeResult(value: unknown): value is ChallengeResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Record<string, unknown>;

  return (
    typeof result.id === 'string' &&
    typeof result.date === 'string' &&
    !Number.isNaN(Date.parse(result.date)) &&
    ['stroop', 'nback', 'gonogo', 'trailmaking'].includes(String(result.challengeType)) &&
    typeof result.accuracy === 'number' &&
    Number.isFinite(result.accuracy) &&
    typeof result.meanReactionTimeMs === 'number' &&
    Number.isFinite(result.meanReactionTimeMs) &&
    typeof result.score === 'number' &&
    Number.isFinite(result.score) &&
    typeof result.prefrontalIndex === 'number' &&
    Number.isFinite(result.prefrontalIndex)
  );
}

function countConsecutiveSessionDays(results: ChallengeResult[]) {
  const days = [...new Set(
    results
      .map(result => new Date(result.date))
      .filter(date => !Number.isNaN(date.getTime()))
      .map(date => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000))
  )].sort((a, b) => b - a);

  if (days.length === 0) return 0;

  const today = new Date();
  const todayNumber = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000);
  if (days[0] > todayNumber || todayNumber - days[0] > 1) return 0;

  let streak = 0;
  while (days[streak] === days[0] - streak) streak += 1;
  return streak;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('training');
  const [savedResultData] = useState(() => {
    try {
      const saved = localStorage.getItem('synapsync_results');
      if (!saved) return { results: [] as ChallengeResult[], error: null as string | null };

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isChallengeResult)) {
        return {
          results: [] as ChallengeResult[],
          error: 'Saved practice history could not be read, so it has been left unchanged. Clear this site’s local storage only if you want to remove that data.',
        };
      }

      return {
        results: parsed.filter(result => !DEMO_RESULT_IDS.has(result.id)),
        error: null as string | null,
      };
    } catch {
      return {
        results: [] as ChallengeResult[],
        error: 'Saved practice history could not be accessed. It has been left unchanged.',
      };
    }
  });
  const [results, setResults] = useState<ChallengeResult[]>(savedResultData.results);
  const [storageError, setStorageError] = useState<string | null>(savedResultData.error);
  const dailyStreak = countConsecutiveSessionDays(results);

  useEffect(() => {
    if (storageError) return;
    try {
      localStorage.setItem('synapsync_results', JSON.stringify(results));
    } catch {
      setStorageError('Your practice history could not be saved in this browser. New results will remain available only until you leave this page.');
    }
  }, [results, storageError]);

  const handleSaveResult = (newResult: ChallengeResult) => {
    setResults(prev => [newResult, ...prev]);
  };

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-slate-100">
      <AmbientThoughtCurrents activeTab={activeTab} />
      {/* Top Fixed Header with mini telemetry & sound switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ExperienceLayout activeTab={activeTab}>
        {storageError && (
          <p role="alert" className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            {storageError}
          </p>
        )}
        {activeTab === 'training' && (
          <BrainTrainingPortal
            onSaveResult={handleSaveResult}
            recentResults={results}
            onOpenFlowLab={() => setActiveTab('flow')}
            onOpenEducation={() => setActiveTab('education')}
          />
        )}
        {activeTab === 'flow' && <FlowStateLab />}
        {activeTab === 'soundscape' && <NeuroAudioStudio />}
        {activeTab === 'tracker' && (
          <ProgressTracker results={results} dailyStreak={dailyStreak} />
        )}
        {activeTab === 'education' && <EducationalHub />}
        {activeTab === 'rehab' && <RehabDirectory />}
        {activeTab === 'library' && <ResourceLibrary />}
        {activeTab === 'community' && <CommunityForum />}
        {activeTab === 'blueprint' && <PlatformBlueprint />}
      </ExperienceLayout>

      {/* Global Footer */}
      <footer className="app-footer mt-16 border-t border-white/[0.08] bg-[#090d17]/78 py-10 text-xs text-zinc-500 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-white text-base tracking-tight">
                iTHINK
              </span>
              <span className="text-zinc-600 font-mono text-[11px]">·</span>
              <span className="text-zinc-400 text-xs">
                Cognitive Training & Self-Observation Platform
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-zinc-400">
              <button 
                onClick={() => setActiveTab('training')} 
                className="hover:text-white transition cursor-pointer"
              >
                Exercises
              </button>
              <button 
                onClick={() => setActiveTab('flow')} 
                className="hover:text-white transition cursor-pointer"
              >
                Flow State Lab
              </button>
              <button 
                onClick={() => setActiveTab('education')} 
                className="hover:text-white transition cursor-pointer"
              >
                Neuroscience Atlas
              </button>
              <button 
                onClick={() => setActiveTab('soundscape')} 
                className="hover:text-white transition cursor-pointer"
              >
                Audio Studio
              </button>
              <button 
                onClick={() => setActiveTab('tracker')} 
                className="hover:text-white transition cursor-pointer"
              >
                Milestones
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span>
              © 2026 iTHINK. Evidence-informed self-observation and practice tools. Does not claim to read or manipulate brain activity.
            </span>
            <span>
              Observe measurable performance · Experiment with conditions · Learn neuroscience limits
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
