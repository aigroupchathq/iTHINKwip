import React, { useState } from 'react';
import { 
  Zap, 
  Brain, 
  ShieldAlert, 
  Shuffle, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BarChart2,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  Timer,
  Target,
  Layers
} from 'lucide-react';
import { CognitiveChallengeType, ChallengeResult } from '../../types/neuro';
import { StroopTask } from './StroopTask';
import { DualNBackTask } from './DualNBackTask';
import { GoNoGoTask } from './GoNoGoTask';
import { TrailMakingTask } from './TrailMakingTask';
import { InteractiveBrainConnectome } from '../InteractiveBrainConnectome';
import { CognitiveBenchmarks } from '../CognitiveBenchmarks/CognitiveBenchmarks';
import { useTheme } from '../../context/ThemeContext';

interface BrainTrainingPortalProps {
  onSaveResult: (result: ChallengeResult) => void;
  recentResults: ChallengeResult[];
  dailyStreak: number;
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
    domain: 'Executive Filter · Dorsal ACC',
    tagline: 'Filter out competing semantic noise',
    howToPlay: 'Tap the ink color, ignoring the written word.',
    timeEstimate: '60 sec',
    badgeColor: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/50',
    icon: Zap,
  },
  {
    id: 'nback',
    indexNum: '02',
    title: 'Memory Match',
    domain: 'Working Memory · Prefrontal DLPFC',
    tagline: 'Hold multiple items in conscious buffer',
    howToPlay: 'Tap when the grid square or spoken sound matches 2 turns back.',
    timeEstimate: '90 sec',
    badgeColor: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/50',
    icon: Brain,
  },
  {
    id: 'gonogo',
    indexNum: '03',
    title: 'Reflex Pause',
    domain: 'Motor Brake · Subthalamic Nucleus',
    tagline: 'Halt automatic impulses on surprise cues',
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
    domain: 'Cognitive Agility · Frontoparietal',
    tagline: 'Smoothly alternate between distinct rules',
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
  dailyStreak,
}) => {
  const [activeChallenge, setActiveChallenge] = useState<CognitiveChallengeType | null>(null);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);
  const [showScienceDrawer, setShowScienceDrawer] = useState<boolean>(false);
  const { config } = useTheme();

  const handleTaskComplete = (result: ChallengeResult) => {
    onSaveResult(result);
    setActiveChallenge(null);
    setCompletionNotice(`Saved! Your score: ${result.score.toLocaleString()} points.`);
    setTimeout(() => setCompletionNotice(null), 5000);
  };

  // Calculate live telemetry snapshot from actual user attempts (Dribbble UX)
  const totalSessions = recentResults.length;
  const avgReactionTime = totalSessions > 0
    ? Math.round(recentResults.reduce((sum, r) => sum + r.meanReactionTimeMs, 0) / totalSessions)
    : 440;
  const avgAccuracy = totalSessions > 0
    ? Math.round(recentResults.reduce((sum, r) => sum + r.accuracy, 0) / totalSessions)
    : 92;
  const bestScore = totalSessions > 0
    ? Math.max(...recentResults.map(r => r.score))
    : 0;

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

      {/* 1. Iconic Hero Section (Bold Editorial Typography, Clean Math) */}
      <div className="bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-7 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden bg-grid-pattern">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Real Session Metric Header */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-zinc-300 font-medium">
                {totalSessions > 0 
                  ? `${totalSessions} Completed Session${totalSessions > 1 ? 's' : ''}`
                  : 'Session 01 · Baseline Calibration'
                }
              </span>
              <span>·</span>
              <span>Self-Observation Protocol</span>
            </div>

            {/* Massive Iconic Title */}
            <div>
              <span className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-white block leading-none">
                iTHINK
              </span>
              <h1 className="text-xl sm:text-3xl font-display font-bold text-zinc-200 tracking-tight mt-3">
                Understand your mind. Train your thinking.
              </h1>
            </div>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Short cognitive exercises, focused-work experiments, and neuroscience-backed learning tools designed to help you observe how you perform and improve.
            </p>

            {/* Primary Interaction Philosophy */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-white font-bold px-2 py-0.5 rounded bg-white/10">iTHINK</span>
              <span className="text-zinc-600">→</span>
              <span className="text-cyan-300 font-semibold">I TEST</span>
              <span className="text-zinc-600">→</span>
              <span className="text-emerald-300 font-semibold">I OBSERVE</span>
              <span className="text-zinc-600">→</span>
              <span className="text-amber-300 font-semibold">I LEARN</span>
              <span className="text-zinc-600">→</span>
              <span className="text-purple-300 font-semibold">I ADAPT</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => setActiveChallenge('stroop')}
              className="py-4 px-8 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display font-black text-base flex items-center justify-center gap-3 transition shadow-xl shadow-cyan-500/10 cursor-pointer active:scale-98"
            >
              <Play className="w-5 h-5 fill-current text-zinc-950" />
              <span>Begin Practice Now</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-500 text-center">
              Takes ~60 seconds · Zero pressure
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dribbble-Style At-A-Glance Cognitive Readiness Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0e1117] border border-white/[0.08] p-4 rounded-xl">
        <div className="p-3 bg-zinc-900/40 rounded-lg border border-white/[0.04] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>REACTION SPEED</span>
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white tracking-tight">
            {avgReactionTime} <span className="text-xs text-zinc-500 font-normal">ms</span>
          </div>
          <span className="text-[10px] text-zinc-500 block font-mono">
            {totalSessions > 0 ? 'Empirical average' : 'Awaiting trial'}
          </span>
        </div>

        <div className="p-3 bg-zinc-900/40 rounded-lg border border-white/[0.04] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>ACCURACY RATE</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 tracking-tight">
            {avgAccuracy}%
          </div>
          <span className="text-[10px] text-zinc-500 block font-mono">
            {totalSessions > 0 ? 'Decision precision' : 'Normative baseline'}
          </span>
        </div>

        <div className="p-3 bg-zinc-900/40 rounded-lg border border-white/[0.04] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>HIGH SCORE</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-300 tracking-tight">
            {bestScore > 0 ? bestScore.toLocaleString() : '—'}
          </div>
          <span className="text-[10px] text-zinc-500 block font-mono">
            {bestScore > 0 ? 'Session personal best' : 'First record ready'}
          </span>
        </div>

        <div className="p-3 bg-zinc-900/40 rounded-lg border border-white/[0.04] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>LOGGED SESSIONS</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white tracking-tight">
            {totalSessions} <span className="text-xs text-zinc-500 font-normal">runs</span>
          </div>
          <span className="text-[10px] text-zinc-500 block font-mono">
            {totalSessions > 0 ? 'Cumulative tests' : 'No data recorded yet'}
          </span>
        </div>
      </div>

      {/* 3. Dribbble-Inspired Exercise Cards (Editorial Grids, Unboxed Metadata) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Cognitive Test Suite
            </h2>
            <span className="text-xs text-zinc-400">
              Standardized neuropsychological paradigms adapted for self-observation
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
            4 Calibrated Tasks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHALLENGES.map(card => {
            const IconComponent = card.icon;
            const recentAttempt = recentResults.find(r => r.challengeType === card.id);

            return (
              <div
                key={card.id}
                onClick={() => setActiveChallenge(card.id)}
                className={`bg-[#0e1117] border border-white/[0.08] ${card.borderHover} hover:bg-zinc-900/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer group shadow-sm relative overflow-hidden`}
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
                      : 'Not yet attempted today'
                    }
                  </span>

                  <span className="text-white font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Launch Exercise</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Neural Activity Visualizer (Showing the Brain Actively Working) */}
      <InteractiveBrainConnectome
        onSelectRegion={reg => {
          if (reg.id === 'acc') setActiveChallenge('stroop');
          if (reg.id === 'dlpfc') setActiveChallenge('nback');
          if (reg.id === 'basalganglia') setActiveChallenge('gonogo');
          if (reg.id === 'parietal') setActiveChallenge('trailmaking');
        }}
      />

      {/* 5. Clean Scientific Norms Drawer (Zero Clutter, Available On Demand) */}
      <div className="border border-white/[0.08] rounded-xl bg-[#0b0d12] overflow-hidden">
        <button
          onClick={() => setShowScienceDrawer(!showScienceDrawer)}
          className="w-full p-4 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <span className="flex items-center gap-2 font-medium">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Explore Clinical Population Norms & Meta-Analytic Benchmarks</span>
          </span>
          {showScienceDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showScienceDrawer && (
          <div className="p-6 border-t border-white/[0.06] space-y-6 animate-in fade-in duration-200">
            <CognitiveBenchmarks />
            
            <div className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
              <strong className="text-zinc-200 block mb-1">Empirical Neuroplasticity & Pacing:</strong>
              Data reflects standardized reference cohorts across working memory, motor inhibition, and cognitive switching paradigms. Consistent short sessions prevent cognitive fatigue while stimulating prefrontal synaptic consolidation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
