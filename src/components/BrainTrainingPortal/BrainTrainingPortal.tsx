import React, { useState } from 'react';
import { 
  Zap, 
  Brain, 
  ShieldAlert, 
  Shuffle, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Activity,
  BookOpen,
} from 'lucide-react';
import { CognitiveChallengeType, ChallengeResult } from '../../types/neuro';
import { NeuralJourney } from './NeuralJourney';
import { StroopTask } from './StroopTask';
import { DualNBackTask } from './DualNBackTask';
import { GoNoGoTask } from './GoNoGoTask';
import { TrailMakingTask } from './TrailMakingTask';

interface BrainTrainingPortalProps {
  onSaveResult: (result: ChallengeResult) => void;
  recentResults: ChallengeResult[];
  onOpenFlowLab: () => void;
  onOpenEducation: () => void;
}

interface ChallengeCard {
  id: CognitiveChallengeType;
  indexNum: string;
  title: string;
  domain: string;
  tagline: string;
  howToPlay: string;
  timeEstimate: string;
  badgeColor: string;
  borderHover: string;
  icon: React.ElementType;
}

const CHALLENGES: ChallengeCard[] = [
  {
    id: 'stroop',
    indexNum: '01',
    title: 'Color Focus',
    domain: 'Selective attention',
    tagline: 'Notice how you handle competing cues',
    howToPlay: 'Choose the ink color while ignoring the written word.',
    timeEstimate: '60 sec',
    badgeColor: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/50',
    icon: Zap,
  },
  {
    id: 'nback',
    indexNum: '02',
    title: 'Memory Match',
    domain: 'Working memory',
    tagline: 'Practice holding recent information in mind',
    howToPlay: 'Respond when the current item matches one from two turns ago.',
    timeEstimate: '90 sec',
    badgeColor: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/50',
    icon: Brain,
  },
  {
    id: 'gonogo',
    indexNum: '03',
    title: 'Reflex Pause',
    domain: 'Response inhibition',
    tagline: 'Notice when to respond and when to pause',
    howToPlay: 'Tap rapidly on Green, hold steady on Red.',
    timeEstimate: '45 sec',
    badgeColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/50',
    icon: ShieldAlert,
  },
  {
    id: 'trailmaking',
    indexNum: '04',
    title: 'Mind Switch',
    domain: 'Task switching',
    tagline: 'Practice alternating between two simple rules',
    howToPlay: 'Connect bubbles in alternating sequence: 1 ➔ A ➔ 2 ➔ B.',
    timeEstimate: '60 sec',
    badgeColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/50',
    icon: Shuffle,
  },
];

export const BrainTrainingPortal: React.FC<BrainTrainingPortalProps> = ({
  onSaveResult,
  recentResults,
  onOpenFlowLab,
  onOpenEducation,
}) => {
  const [activeChallenge, setActiveChallenge] = useState<CognitiveChallengeType | null>(null);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const handleTaskComplete = (result: ChallengeResult) => {
    onSaveResult(result);
    setActiveChallenge(null);
    setCompletionNotice(`Saved! Your score: ${result.score.toLocaleString()} points.`);
    setTimeout(() => setCompletionNotice(null), 5000);
  };

  // Calculate live telemetry snapshot from actual user attempts (Dribbble UX)
  const totalSessions = recentResults.length;

  // Render active fullscreen exercise
  if (activeChallenge === 'stroop') {
    return <StroopTask onComplete={handleTaskComplete} onCancel={() => setActiveChallenge(null)} />;
  }
  if (activeChallenge === 'nback') {
    return <DualNBackTask onComplete={handleTaskComplete} onCancel={() => setActiveChallenge(null)} />;
  }
  if (activeChallenge === 'gonogo') {
    return <GoNoGoTask onComplete={handleTaskComplete} onCancel={() => setActiveChallenge(null)} />;
  }
  if (activeChallenge === 'trailmaking') {
    return <TrailMakingTask onComplete={handleTaskComplete} onCancel={() => setActiveChallenge(null)} />;
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {completionNotice && (
        <div className="bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{completionNotice}</span>
        </div>
      )}

      <NeuralJourney
        onOpenFlowLab={onOpenFlowLab}
        onStartExercise={() => setActiveChallenge('stroop')}
      />

      {/* Short cognitive exercises */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Short exercises
            </h2>
            <span className="text-xs text-zinc-400">
              Practice tasks that help you notice how you respond in the moment.
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            {totalSessions > 0 ? `${totalSessions} exercise sessions recorded` : 'Optional · about one minute each'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHALLENGES.map(card => {
            const IconComponent = card.icon;
            const recentAttempt = recentResults.find(r => r.challengeType === card.id);

            return (
              <button
                key={card.id}
                onClick={() => setActiveChallenge(card.id)}
                className={`w-full text-left bg-[#0e1117] border border-white/[0.08] ${card.borderHover} hover:bg-zinc-900/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer group shadow-sm relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {/* Index Numeral Backdrop (Dribbble subtle watermark) */}
                <span className="absolute top-3 right-4 text-4xl font-display font-black text-white/[0.03] select-none pointer-events-none group-hover:text-white/[0.06] transition-colors">
                  {card.indexNum}
                </span>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-white shrink-0 group-hover:border-white/[0.2] transition-colors">
                        <IconComponent className={`w-5 h-5 ${card.badgeColor}`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                          {card.domain}
                        </span>
                        <h3 className="text-lg font-display font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">{card.tagline}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-white/[0.04]">
                      <Clock className="w-3 h-3" /> {card.timeEstimate}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-white/[0.04]">
                    {card.howToPlay}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs border-t border-white/[0.04] mt-4 relative z-10">
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {recentAttempt 
                      ? `Latest: ${recentAttempt.score.toLocaleString()} pts (${recentAttempt.accuracy}%)` 
                      : 'No attempts yet'
                    }
                  </span>

                  <span className="text-white font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Launch Exercise</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/[0.08] bg-[#0b0d12] p-5 sm:grid-cols-2 sm:p-7">
        <button
          type="button"
          onClick={onOpenEducation}
          className="group flex items-start gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              Learn about the mind
              <ArrowRight className="h-3.5 w-3.5 text-cyan-300 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="mt-1 block text-xs leading-5 text-zinc-400">Explore accessible neuroscience explanations, including what current tools can and cannot tell us.</span>
          </span>
        </button>
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <h2 className="text-sm font-semibold text-white">Use results as observations</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">Exercise scores describe performance on that task. They are not a diagnosis or direct measure of intelligence, consciousness, or brain activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
