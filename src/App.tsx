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

const INITIAL_RESULTS: ChallengeResult[] = [
  {
    id: 'res-init-1',
    challengeType: 'stroop',
    date: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    accuracy: 94,
    meanReactionTimeMs: 420,
    score: 890,
    interferenceScoreMs: 78,
    prefrontalIndex: 91,
  },
  {
    id: 'res-init-2',
    challengeType: 'nback',
    date: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    accuracy: 88,
    meanReactionTimeMs: 540,
    score: 840,
    nBackLevel: 2,
    prefrontalIndex: 86,
  },
  {
    id: 'res-init-3',
    challengeType: 'gonogo',
    date: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    accuracy: 95,
    meanReactionTimeMs: 315,
    score: 920,
    commissionErrors: 1,
    omissionErrors: 0,
    prefrontalIndex: 93,
  },
  {
    id: 'res-init-4',
    challengeType: 'trailmaking',
    date: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    accuracy: 92,
    meanReactionTimeMs: 440,
    score: 860,
    prefrontalIndex: 85,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('training');
  const [results, setResults] = useState<ChallengeResult[]>(() => {
    const saved = localStorage.getItem('synapsync_results');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_RESULTS;
  });
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const saved = localStorage.getItem('synapsync_streak');
    return saved ? parseInt(saved, 10) : 14;
  });

  useEffect(() => {
    localStorage.setItem('synapsync_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('synapsync_streak', dailyStreak.toString());
  }, [dailyStreak]);

  const handleSaveResult = (newResult: ChallengeResult) => {
    setResults(prev => [newResult, ...prev]);
    setDailyStreak(prev => prev + 1);
  };

  const latestScore = results.length > 0 ? results[0].prefrontalIndex : 88;

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Fixed Header with mini telemetry & sound switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dailyStreak={dailyStreak}
        latestScore={latestScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'training' && (
          <BrainTrainingPortal
            onSaveResult={handleSaveResult}
            recentResults={results}
            dailyStreak={dailyStreak}
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
      </main>

      {/* Global Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090b0e] py-10 mt-16 text-xs text-zinc-500">
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
              © 2026 I THINK. Evidence-informed cognitive training. Does not claim to read or manipulate brain activity.
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
