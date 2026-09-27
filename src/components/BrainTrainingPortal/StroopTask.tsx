import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Award, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Zap, 
  Timer, 
  Trophy,
  ArrowRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeResult } from '../../types/neuro';
import { taskAudio } from '../../utils/taskAudio';

interface StroopTaskProps {
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

type ColorKey = 'red' | 'blue' | 'green' | 'yellow';

interface ColorDefinition {
  id: ColorKey;
  name: string;
  cssColor: string;
  keyNumber: string;
  badgeBg: string;
  borderClass: string;
  glowClass: string;
}

const COLORS: ColorDefinition[] = [
  { id: 'red', name: 'RED', cssColor: 'text-rose-400', keyNumber: '1', badgeBg: 'bg-rose-500/20', borderClass: 'border-rose-500/40 hover:border-rose-400', glowClass: 'shadow-rose-500/30' },
  { id: 'blue', name: 'BLUE', cssColor: 'text-cyan-400', keyNumber: '2', badgeBg: 'bg-cyan-500/20', borderClass: 'border-cyan-500/40 hover:border-cyan-400', glowClass: 'shadow-cyan-500/30' },
  { id: 'green', name: 'GREEN', cssColor: 'text-emerald-400', keyNumber: '3', badgeBg: 'bg-emerald-500/20', borderClass: 'border-emerald-500/40 hover:border-emerald-400', glowClass: 'shadow-emerald-500/30' },
  { id: 'yellow', name: 'YELLOW', cssColor: 'text-amber-300', keyNumber: '4', badgeBg: 'bg-amber-500/20', borderClass: 'border-amber-500/40 hover:border-amber-400', glowClass: 'shadow-amber-500/30' },
];

const EMOTIONAL_WORDS = ['PANIC', 'CALM', 'URGENT', 'PEACE', 'WORRY', 'SERENE', 'HASTE', 'FOCUS'];

interface Trial {
  wordText: string;
  colorIndex: number;
  isCongruent: boolean;
  category: 'color' | 'emotional';
}

interface FloatingPoints {
  id: number;
  text: string;
  color: string;
}

export const StroopTask: React.FC<StroopTaskProps> = ({ onComplete, onCancel }) => {
  const [taskMode, setTaskMode] = useState<'classic' | 'emotional'>('classic');
  const [trialCountOption, setTrialCountOption] = useState<16 | 24>(16);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);

  // Game flow states
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'running' | 'finished'>('intro');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [stimulusVisible, setStimulusVisible] = useState(false);

  // Gamification Metrics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastRating, setLastRating] = useState<string | null>(null);
  const [lastPointsGained, setLastPointsGained] = useState<number | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingPoints[]>([]);
  const [screenFlash, setScreenFlash] = useState<'green' | 'red' | null>(null);

  // Performance telemetry
  const [congruentTimes, setCongruentTimes] = useState<number[]>([]);
  const [incongruentTimes, setIncongruentTimes] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  // Pacing Timer Bar
  const [trialTimeRemaining, setTrialTimeRemaining] = useState<number>(100);

  const trialStartTimeRef = useRef<number>(0);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeBarIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const STIMULUS_LIMIT_MS = 2200; // time window per prompt

  useEffect(() => {
    taskAudio.setSoundEnabled(audioFeedbackEnabled);
  }, [audioFeedbackEnabled]);

  const generateTrials = (): Trial[] => {
    const total = trialCountOption;
    const generated: Trial[] = [];

    for (let i = 0; i < total; i++) {
      if (taskMode === 'classic') {
        const isCongruent = i % 2 === 0;
        const wordIdx = Math.floor(Math.random() * COLORS.length);
        let colorIdx = wordIdx;
        if (!isCongruent) {
          const otherIndices = [0, 1, 2, 3].filter(idx => idx !== wordIdx);
          colorIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
        }
        generated.push({
          wordText: COLORS[wordIdx].name,
          colorIndex: colorIdx,
          isCongruent,
          category: 'color'
        });
      } else {
        const emotionalWord = EMOTIONAL_WORDS[i % EMOTIONAL_WORDS.length];
        const colorIdx = Math.floor(Math.random() * COLORS.length);
        const isCalmWord = ['CALM', 'PEACE', 'SERENE', 'FOCUS'].includes(emotionalWord);
        generated.push({
          wordText: emotionalWord,
          colorIndex: colorIdx,
          isCongruent: isCalmWord,
          category: 'emotional'
        });
      }
    }
    return generated.sort(() => Math.random() - 0.5);
  };

  // Launch countdown then game
  const triggerStart = () => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setCurrentTrialIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLastRating(null);
    setLastPointsGained(null);
    setFloatingScores([]);
    setCongruentTimes([]);
    setIncongruentTimes([]);
    setCorrectCount(0);

    // Start 3, 2, 1 countdown
    setGameState('countdown');
    setCountdownNum(3);
    taskAudio.playTone(440, 0.08);

    const cInterval = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(cInterval);
          taskAudio.playTone(880, 0.18);
          setGameState('running');
          startNextTrial(0, newTrials);
          return 0;
        }
        taskAudio.playTone(prev === 2 ? 550 : 660, 0.08);
        return prev - 1;
      });
    }, 600);
  };

  const startNextTrial = (trialIdx: number, trialList: Trial[]) => {
    if (trialIdx >= trialList.length) {
      finishGame();
      return;
    }

    setStimulusVisible(false);
    setTrialTimeRemaining(100);

    // Small jitter gap between trials (280ms)
    timerTimeoutRef.current = setTimeout(() => {
      setStimulusVisible(true);
      trialStartTimeRef.current = performance.now();

      // Start urgent pacing countdown bar
      if (timeBarIntervalRef.current) clearInterval(timeBarIntervalRef.current);
      const intervalMs = 25;
      timeBarIntervalRef.current = setInterval(() => {
        const elapsed = performance.now() - trialStartTimeRef.current;
        const pct = Math.max(0, 100 - (elapsed / STIMULUS_LIMIT_MS) * 100);
        setTrialTimeRemaining(pct);

        if (pct <= 0) {
          // Timeout = missed trial
          handleTimeout(trialIdx, trialList);
        }
      }, intervalMs);
    }, 280);
  };

  const handleTimeout = (trialIdx: number, trialList: Trial[]) => {
    if (timeBarIntervalRef.current) clearInterval(timeBarIntervalRef.current);
    taskAudio.playSlip();
    setCombo(0);
    setLastRating('TIMEOUT');
    setScreenFlash('red');
    setTimeout(() => setScreenFlash(null), 180);

    advanceToNextTrial(trialIdx, trialList);
  };

  const handleColorSelection = (selectedColorIndex: number) => {
    if (!stimulusVisible || gameState !== 'running') return;
    if (timeBarIntervalRef.current) clearInterval(timeBarIntervalRef.current);

    const reactionTime = Math.round(performance.now() - trialStartTimeRef.current);
    const currentTrial = trials[currentTrialIndex];
    const isCorrect = selectedColorIndex === currentTrial.colorIndex;

    if (isCorrect) {
      taskAudio.playSuccess();
      setScreenFlash('green');
      setTimeout(() => setScreenFlash(null), 150);

      // Gamification: Calculate Points & Multiplier
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      const multiplier = newCombo >= 10 ? 3.0 : newCombo >= 6 ? 2.0 : newCombo >= 3 ? 1.5 : 1.0;
      const speedBonus = Math.max(0, Math.round((750 - reactionTime) * 0.4));
      const gained = Math.round((100 + speedBonus) * multiplier);

      setScore(prev => prev + gained);
      setLastPointsGained(gained);

      // Speed Rating
      let rating = 'GOOD';
      if (reactionTime < 380) rating = '⚡ LIGHTNING!';
      else if (reactionTime < 500) rating = '🔥 SHARP!';
      else if (reactionTime < 650) rating = '🎯 SOLID';
      setLastRating(`${rating} (+${gained} PTS)`);

      // Add floating score popup
      const newFloatId = Date.now();
      setFloatingScores(prev => [...prev.slice(-3), { id: newFloatId, text: `+${gained}`, color: '#22d3ee' }]);
      setTimeout(() => {
        setFloatingScores(prev => prev.filter(f => f.id !== newFloatId));
      }, 700);

      setCorrectCount(prev => prev + 1);
      if (currentTrial.isCongruent) {
        setCongruentTimes(prev => [...prev, reactionTime]);
      } else {
        setIncongruentTimes(prev => [...prev, reactionTime]);
      }
    } else {
      taskAudio.playSlip();
      setScreenFlash('red');
      setTimeout(() => setScreenFlash(null), 200);

      setCombo(0);
      setLastRating('STUMBLE (-0)');
    }

    advanceToNextTrial(currentTrialIndex, trials);
  };

  const advanceToNextTrial = (trialIdx: number, trialList: Trial[]) => {
    setStimulusVisible(false);
    const nextIdx = trialIdx + 1;
    setCurrentTrialIndex(nextIdx);

    if (nextIdx < trialList.length) {
      startNextTrial(nextIdx, trialList);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    if (timeBarIntervalRef.current) clearInterval(timeBarIntervalRef.current);
    taskAudio.playCompletion();
    setGameState('finished');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  // Keyboard navigation support: keys 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'running') return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        handleColorSelection(index);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      if (timeBarIntervalRef.current) clearInterval(timeBarIntervalRef.current);
    };
  }, [gameState, stimulusVisible, currentTrialIndex, trials, combo]);

  const currentTrial = trials[currentTrialIndex];

  // Calculated Metrics
  const avgCongruent = congruentTimes.length
    ? Math.round(congruentTimes.reduce((a, b) => a + b, 0) / congruentTimes.length)
    : 420;
  const avgIncongruent = incongruentTimes.length
    ? Math.round(incongruentTimes.reduce((a, b) => a + b, 0) / incongruentTimes.length)
    : 540;
  const interferenceCost = Math.max(0, avgIncongruent - avgCongruent);
  const accuracy = trials.length > 0 ? Math.round((correctCount / trials.length) * 100) : 100;
  const overallMeanRt = Math.round((avgCongruent + avgIncongruent) / 2);
  const prefrontalScore = Math.min(
    100,
    Math.max(20, Math.round(accuracy * 0.6 + Math.max(0, 100 - interferenceCost / 2.5) * 0.4))
  );

  // Performance Tier
  let performanceTier = 'A-TIER FOCUS SPECIALIST';
  let tierColor = 'text-cyan-400';
  if (score >= 3200 && accuracy >= 90) {
    performanceTier = 'S-TIER NEURO-MASTER';
    tierColor = 'text-amber-400';
  } else if (score < 1800) {
    performanceTier = 'B-TIER ACTIVE PRACTITIONER';
    tierColor = 'text-indigo-400';
  }

  const handleFinishAndSave = () => {
    const result: ChallengeResult = {
      id: `res-stroop-${Date.now()}`,
      challengeType: 'stroop',
      date: new Date().toISOString(),
      accuracy,
      meanReactionTimeMs: overallMeanRt,
      score,
      interferenceScoreMs: interferenceCost,
      prefrontalIndex: prefrontalScore,
    };
    onComplete(result);
  };

  return (
    <div className={`relative bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden transition-all duration-150 ${
      screenFlash === 'green' ? 'ring-2 ring-emerald-500/50 bg-emerald-950/20' : screenFlash === 'red' ? 'ring-2 ring-rose-500/50 bg-rose-950/20' : ''
    }`}>
      {/* Top Bar Contract */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Color Contrast Speed Focus
            </h2>
            <span className="text-xs text-zinc-400 block">Prefrontal Inhibition Arcade</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              audioFeedbackEnabled
                ? 'bg-zinc-800 border-cyan-500/40 text-cyan-300'
                : 'bg-zinc-900 border-white/[0.06] text-zinc-500'
            }`}
            title="Audio toggle"
          >
            {audioFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-zinc-900 transition"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 1. INTRO / INSTANT START VIEW */}
      {gameState === 'intro' && (
        <div className="space-y-6">
          {/* Visual Interactive Teaser Rule */}
          <div className="bg-[#0e1117] border border-white/[0.08] p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">The Core Rule:</span>
              <span>Speed + Inhibitory Control</span>
            </div>

            <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Look at this ink color:</span>
              <span className="text-4xl font-display font-black text-rose-500 tracking-wider">
                "BLUE"
              </span>
              <span className="text-xs text-zinc-300 font-medium pt-1">
                Word says "BLUE", but ink is <strong className="text-rose-400">RED</strong> ➔ Tap <strong className="text-rose-400">RED</strong>!
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.04]">
                <strong className="text-amber-400 block font-mono">Streak Combos:</strong>
                <span>Consecutive hits boost score multiplier up to <strong>3.0x</strong>!</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.04]">
                <strong className="text-cyan-400 block font-mono">Speed Bonus:</strong>
                <span>Faster reaction under 450ms earns maximum point score.</span>
              </div>
            </div>
          </div>

          {/* Mode Selectors */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setTaskMode('classic')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                taskMode === 'classic'
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-white font-bold'
                  : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block font-bold">Classic Colors</span>
              <span className="text-[10px] text-zinc-500">Stroop standard</span>
            </button>
            <button
              onClick={() => setTaskMode('emotional')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                taskMode === 'emotional'
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-white font-bold'
                  : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block font-bold">Emotional Words</span>
              <span className="text-[10px] text-zinc-500">Stress & affective filtering</span>
            </button>
          </div>

          {/* Big High-Energy Instant Launch CTA */}
          <button
            onClick={triggerStart}
            className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 transition shadow-xl shadow-cyan-500/10 cursor-pointer active:scale-98"
          >
            <Play className="w-5 h-5 fill-current text-zinc-950" />
            <span>START CHALLENGE NOW (GO!)</span>
          </button>
        </div>
      )}

      {/* 2. THREE-SECOND ARCADE COUNTDOWN */}
      {gameState === 'countdown' && (
        <div className="h-72 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
            Get Ready... Filter The Word!
          </span>
          <span className="text-8xl font-display font-black text-white animate-in zoom-in-50 duration-200">
            {countdownNum}
          </span>
          <span className="text-xs text-zinc-500">Press keys 1, 2, 3, 4 or tap colors below</span>
        </div>
      )}

      {/* 3. ACTIVE LIVE GAMIFIED CHALLENGE */}
      {gameState === 'running' && (
        <div className="space-y-5">
          {/* Live Game Scoreboard & Combo Meter */}
          <div className="bg-[#0e1117] border border-white/[0.08] px-4 py-3 rounded-xl flex items-center justify-between">
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">SCORE</span>
                <span className="text-lg font-mono font-bold text-white tracking-wider">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Live Combo Multiplier */}
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${combo >= 6 ? 'text-amber-400 animate-bounce' : 'text-zinc-600'}`} />
              <div className="text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">COMBO</span>
                <span className={`text-base font-mono font-bold ${
                  combo >= 10 ? 'text-amber-400 animate-pulse' : combo >= 4 ? 'text-cyan-400' : 'text-zinc-300'
                }`}>
                  {combo}x {combo >= 10 ? '🔥 HYPER!' : combo >= 4 ? '⚡' : ''}
                </span>
              </div>
            </div>

            {/* Trial count */}
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">ROUND</span>
              <span className="text-sm font-mono font-bold text-zinc-300">
                {currentTrialIndex + 1} / {trials.length}
              </span>
            </div>
          </div>

          {/* Time Pacing Urgent Bar */}
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                trialTimeRemaining > 40 ? 'bg-cyan-400' : trialTimeRemaining > 20 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${trialTimeRemaining}%` }}
            />
          </div>

          {/* Stimulus Presentation Arena with Floating Score Animations */}
          <div className="h-48 bg-[#07080b] border border-white/[0.08] rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {/* Last rating banner */}
            {lastRating && (
              <div className="absolute top-2.5 text-xs font-mono font-semibold text-cyan-300 animate-in fade-in zoom-in-95 duration-100">
                {lastRating}
              </div>
            )}

            {/* Floating Score Particles */}
            {floatingScores.map(f => (
              <div
                key={f.id}
                className="absolute text-lg font-mono font-black text-cyan-300 animate-out fade-out slide-out-to-top duration-500"
                style={{ top: '35%' }}
              >
                {f.text}
              </div>
            ))}

            {stimulusVisible && currentTrial ? (
              <div
                className={`text-5xl sm:text-6xl font-display font-black tracking-widest transition-transform select-none ${
                  COLORS[currentTrial.colorIndex].cssColor
                }`}
              >
                {currentTrial.wordText}
              </div>
            ) : (
              <div className="text-zinc-600 font-mono text-3xl select-none">+</div>
            )}

            <span className="absolute bottom-2 text-[10px] font-mono text-zinc-500">
              Tap the color of the INK
            </span>
          </div>

          {/* Response Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLORS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleColorSelection(idx)}
                className={`py-3.5 px-4 rounded-xl bg-zinc-900 border ${c.borderClass} ${c.glowClass} active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shadow-lg`}
              >
                <span className={`text-base font-display font-black ${c.cssColor}`}>
                  {c.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  [{c.keyNumber}]
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. GAME OVER SCOREBOARD & VICTORY STATS */}
      {gameState === 'finished' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className={`text-xs font-mono font-bold tracking-widest uppercase block ${tierColor}`}>
              {performanceTier}
            </span>
            <h3 className="text-3xl font-display font-extrabold text-white">
              Challenge Complete!
            </h3>
            <span className="text-4xl font-mono font-black text-cyan-400 block pt-1">
              {score.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">POINTS</span>
            </span>
          </div>

          {/* Gamified Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Accuracy</span>
              <span className="text-xl font-mono font-bold text-white">{accuracy}%</span>
              <span className="text-[10px] text-zinc-500 block">{correctCount}/{trials.length} correct</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Streak</span>
              <span className="text-xl font-mono font-bold text-amber-400">{maxCombo}x</span>
              <span className="text-[10px] text-zinc-500 block">Consecutive hits</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Match RT</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{avgCongruent}ms</span>
              <span className="text-[10px] text-zinc-500 block">Direct pathway</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Filter Gap</span>
              <span className="text-xl font-mono font-bold text-cyan-400">+{interferenceCost}ms</span>
              <span className="text-[10px] text-zinc-500 block">Stroop cost</span>
            </div>
          </div>

          {/* Scientific Interpretation */}
          <div className="bg-[#0e1117] border border-white/[0.08] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 font-display">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Executive Gating Analysis
              </span>
              <span className="font-mono text-zinc-400">
                Index: {prefrontalScore}/100
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your millisecond interference cost was {interferenceCost}ms. In cognitive psychology, lower costs reflect stronger prefrontal suppression of competing automatic stimuli.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={triggerStart}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/[0.08] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={handleFinishAndSave}
              className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              Save Result to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
