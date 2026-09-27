import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Award, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Flame, 
  Trophy, 
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeResult } from '../../types/neuro';
import { taskAudio } from '../../utils/taskAudio';

interface DualNBackTaskProps {
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface StepData {
  position: number; // 0 to 8 (3x3 grid)
  letter: string;   // e.g. 'C', 'H', 'K', 'L', 'Q', 'R', 'T', 'X'
  posMatch: boolean;
  letterMatch: boolean;
  userClaimedPos?: boolean;
  userClaimedLetter?: boolean;
}

const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'T', 'X'];

export const DualNBackTask: React.FC<DualNBackTaskProps> = ({ onComplete, onCancel }) => {
  const [nLevel, setNLevel] = useState<1 | 2 | 3>(2);
  const [speedSetting, setSpeedSetting] = useState<'relaxed' | 'standard' | 'brisk'>('standard');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const TOTAL_STEPS = 18;
  const stepDurationMs = speedSetting === 'relaxed' ? 2800 : speedSetting === 'brisk' ? 1700 : 2200;

  // Game flow states
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'running' | 'finished'>('intro');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sequence, setSequence] = useState<StepData[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Gamification
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // User responses for current step
  const [posClaimed, setPosClaimed] = useState(false);
  const [letterClaimed, setLetterClaimed] = useState(false);

  // Metrics
  const [posHits, setPosHits] = useState(0);
  const [posMisses, setPosMisses] = useState(0);
  const [posFalseAlarms, setPosFalseAlarms] = useState(0);
  const [letterHits, setLetterHits] = useState(0);
  const [letterMisses, setLetterMisses] = useState(0);
  const [letterFalseAlarms, setLetterFalseAlarms] = useState(0);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartTimestamp = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);

  useEffect(() => {
    taskAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const generateSequence = (n: number): StepData[] => {
    const steps: StepData[] = [];
    for (let i = 0; i < TOTAL_STEPS; i++) {
      let position = Math.floor(Math.random() * 9);
      let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      let posMatch = false;
      let letterMatch = false;

      if (i >= n) {
        if (Math.random() < 0.40) {
          position = steps[i - n].position;
          posMatch = true;
        }
        if (Math.random() < 0.40) {
          letter = steps[i - n].letter;
          letterMatch = true;
        }
      }

      steps.push({ position, letter, posMatch, letterMatch });
    }
    return steps;
  };

  const triggerStart = () => {
    const newSeq = generateSequence(nLevel);
    setSequence(newSeq);
    setCurrentStepIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLastFeedback(null);
    setPosHits(0);
    setPosMisses(0);
    setPosFalseAlarms(0);
    setLetterHits(0);
    setLetterMisses(0);
    setLetterFalseAlarms(0);
    reactionTimes.current = [];

    // Countdown
    setGameState('countdown');
    setCountdownNum(3);
    taskAudio.playTone(440, 0.08);

    const cInterval = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(cInterval);
          taskAudio.playTone(880, 0.18);
          setGameState('running');
          executeStep(0, newSeq);
          return 0;
        }
        taskAudio.playTone(prev === 2 ? 550 : 660, 0.08);
        return prev - 1;
      });
    }, 600);
  };

  const executeStep = (stepIdx: number, seq: StepData[]) => {
    if (stepIdx >= TOTAL_STEPS) {
      finishTask();
      return;
    }

    const currentStep = seq[stepIdx];
    setCurrentStepIndex(stepIdx);
    setPosClaimed(false);
    setLetterClaimed(false);
    stepStartTimestamp.current = performance.now();

    setActiveCell(currentStep.position);
    setActiveLetter(currentStep.letter);
    taskAudio.speakLetter(currentStep.letter);

    // Flash duration
    const stimulusFlashDuration = Math.round(stepDurationMs * 0.45);
    setTimeout(() => {
      setActiveCell(null);
      setActiveLetter(null);
    }, stimulusFlashDuration);

    stepTimerRef.current = setTimeout(() => {
      if (stepIdx >= nLevel) {
        if (currentStep.posMatch && !seq[stepIdx].userClaimedPos) {
          setPosMisses(m => m + 1);
          setCombo(0);
        }
        if (currentStep.letterMatch && !seq[stepIdx].userClaimedLetter) {
          setLetterMisses(m => m + 1);
          setCombo(0);
        }
      }

      executeStep(stepIdx + 1, seq);
    }, stepDurationMs);
  };

  const handleClaimPosition = () => {
    if (posClaimed || gameState !== 'running') return;
    setPosClaimed(true);
    const rt = Math.round(performance.now() - stepStartTimestamp.current);
    reactionTimes.current.push(rt);

    if (sequence[currentStepIndex]) {
      sequence[currentStepIndex].userClaimedPos = true;
    }

    if (currentStepIndex >= nLevel && sequence[currentStepIndex].posMatch) {
      taskAudio.playSuccess();
      setPosHits(h => h + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const mult = newCombo >= 6 ? 2.5 : newCombo >= 3 ? 1.5 : 1.0;
      const pts = Math.round(150 * mult);
      setScore(s => s + pts);
      setLastFeedback(`GRID MATCH! (+${pts} PTS)`);
    } else {
      taskAudio.playSlip();
      setPosFalseAlarms(fa => fa + 1);
      setCombo(0);
      setLastFeedback('MISSED GRID');
    }
  };

  const handleClaimLetter = () => {
    if (letterClaimed || gameState !== 'running') return;
    setLetterClaimed(true);
    const rt = Math.round(performance.now() - stepStartTimestamp.current);
    reactionTimes.current.push(rt);

    if (sequence[currentStepIndex]) {
      sequence[currentStepIndex].userClaimedLetter = true;
    }

    if (currentStepIndex >= nLevel && sequence[currentStepIndex].letterMatch) {
      taskAudio.playSuccess();
      setLetterHits(h => h + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const mult = newCombo >= 6 ? 2.5 : newCombo >= 3 ? 1.5 : 1.0;
      const pts = Math.round(150 * mult);
      setScore(s => s + pts);
      setLastFeedback(`AUDIO MATCH! (+${pts} PTS)`);
    } else {
      taskAudio.playSlip();
      setLetterFalseAlarms(fa => fa + 1);
      setCombo(0);
      setLastFeedback('MISSED AUDIO');
    }
  };

  const finishTask = () => {
    taskAudio.playCompletion();
    setGameState('finished');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'running') return;
      if (e.key.toLowerCase() === 'a') {
        handleClaimPosition();
      } else if (e.key.toLowerCase() === 'l') {
        handleClaimLetter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [gameState, currentStepIndex, sequence, posClaimed, letterClaimed, combo]);

  const totalCorrect = posHits + letterHits;
  const totalErrors = posMisses + posFalseAlarms + letterMisses + letterFalseAlarms;
  const accuracy = Math.max(15, Math.min(100, Math.round((totalCorrect / (totalCorrect + totalErrors + 0.1)) * 100)));
  const meanRt = reactionTimes.current.length > 0
    ? Math.round(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length)
    : 520;

  const totalEligiblePos = sequence.slice(nLevel).filter(s => s.posMatch).length || 1;
  const totalEligibleLet = sequence.slice(nLevel).filter(s => s.letterMatch).length || 1;
  const hitRate = Math.min(1, (posHits + letterHits) / (totalEligiblePos + totalEligibleLet));
  const faRate = Math.min(1, (posFalseAlarms + letterFalseAlarms) / Math.max(1, (TOTAL_STEPS - nLevel) * 2));
  const dPrimeEstimate = Math.max(0, Math.round((hitRate - faRate) * 100));

  const workingMemoryScore = Math.round(
    Math.min(100, Math.max(25, (accuracy * 0.5) + (nLevel * 15) + (dPrimeEstimate * 0.2)))
  );

  const handleSaveResult = () => {
    const result: ChallengeResult = {
      id: `res-nback-${Date.now()}`,
      challengeType: 'nback',
      date: new Date().toISOString(),
      accuracy,
      meanReactionTimeMs: meanRt,
      score,
      nBackLevel: nLevel,
      prefrontalIndex: workingMemoryScore,
    };
    onComplete(result);
  };

  return (
    <div className="relative bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Dual {nLevel}-Back Memory Arcade
            </h2>
            <span className="text-xs text-zinc-400 block">Multisensory Fluid Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              soundEnabled
                ? 'bg-zinc-800 border-indigo-500/40 text-indigo-300'
                : 'bg-zinc-900 border-white/[0.06] text-zinc-500'
            }`}
            title="Speech Audio toggle"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-zinc-900 transition"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 1. INTRO / SETTINGS */}
      {gameState === 'intro' && (
        <div className="space-y-6">
          <div className="bg-[#0e1117] border border-white/[0.08] p-5 rounded-xl space-y-4">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block font-bold">
              The Dual Stream Rule:
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Hold the past in mind while processing the present. Tap <strong>GRID MATCH [A]</strong> if the visual square matches {nLevel} step{nLevel > 1 ? 's' : ''} ago. Tap <strong>LETTER MATCH [L]</strong> if the spoken sound matches {nLevel} step{nLevel > 1 ? 's' : ''} ago!
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-indigo-500/20">
                <span className="font-mono text-indigo-400 font-bold block">[A] Spatial Grid</span>
                <span className="text-zinc-400">Position 2 turns ago</span>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-cyan-500/20">
                <span className="font-mono text-cyan-400 font-bold block">[L] Spoken Sound</span>
                <span className="text-zinc-400">Letter 2 turns ago</span>
              </div>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            {([1, 2, 3] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setNLevel(lvl)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  nLevel === lvl
                    ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold'
                    : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <span className="block font-bold">N = {lvl}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {lvl === 1 ? 'Starter' : lvl === 2 ? 'Jaeggi Standard' : 'Athlete'}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={triggerStart}
            className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 transition shadow-xl shadow-indigo-500/10 cursor-pointer active:scale-98"
          >
            <Play className="w-5 h-5 fill-current text-zinc-950" />
            <span>START DUAL {nLevel}-BACK NOW</span>
          </button>
        </div>
      )}

      {/* 2. COUNTDOWN */}
      {gameState === 'countdown' && (
        <div className="h-72 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest animate-pulse">
            Ready Working Memory...
          </span>
          <span className="text-8xl font-display font-black text-white animate-in zoom-in-50 duration-200">
            {countdownNum}
          </span>
          <span className="text-xs text-zinc-500">Keys [A] = Grid, [L] = Sound</span>
        </div>
      )}

      {/* 3. RUNNING GAME */}
      {gameState === 'running' && (
        <div className="space-y-5">
          {/* Scoreboard */}
          <div className="bg-[#0e1117] border border-white/[0.08] px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">SCORE</span>
                <span className="text-lg font-mono font-bold text-white tracking-wider">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${combo >= 4 ? 'text-amber-400 animate-bounce' : 'text-zinc-600'}`} />
              <div className="text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">COMBO</span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {combo}x
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">STEP</span>
              <span className="text-sm font-mono font-bold text-zinc-300">
                {currentStepIndex + 1} / {TOTAL_STEPS}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {lastFeedback && (
            <div className="text-center text-xs font-mono font-bold text-indigo-300 animate-in fade-in duration-100">
              {lastFeedback}
            </div>
          )}

          {/* 3x3 Spatial Grid */}
          <div className="flex flex-col items-center justify-center gap-4 py-2">
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#07080b] border border-white/[0.08] rounded-2xl w-60 h-60 shadow-inner">
              {Array.from({ length: 9 }).map((_, cellIdx) => {
                const isActive = activeCell === cellIdx;
                return (
                  <div
                    key={cellIdx}
                    className={`rounded-xl border transition-all duration-100 flex items-center justify-center ${
                      isActive
                        ? 'bg-indigo-500 border-indigo-300 shadow-xl shadow-indigo-500/70 scale-95'
                        : 'bg-zinc-900/60 border-white/[0.04]'
                    }`}
                  >
                    {isActive && <div className="w-4 h-4 rounded-full bg-white animate-ping" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 bg-zinc-900 border border-white/[0.06] px-4 py-2 rounded-lg text-xs">
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-zinc-400">Audio Stream:</span>
              <span className="font-mono font-black text-lg text-white">
                {activeLetter || '—'}
              </span>
            </div>
          </div>

          {/* Action response buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleClaimPosition}
              disabled={posClaimed}
              className={`p-4 rounded-xl border transition flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                posClaimed
                  ? 'bg-indigo-950/80 border-indigo-400 text-indigo-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/[0.08] text-white'
              }`}
            >
              <span className="text-[11px] font-mono text-indigo-400">KEY [A]</span>
              <span className="text-base font-display font-bold mt-0.5">GRID MATCH</span>
              <span className="text-[10px] text-zinc-400">{posClaimed ? 'Checked' : `Matches ${nLevel} back`}</span>
            </button>

            <button
              onClick={handleClaimLetter}
              disabled={letterClaimed}
              className={`p-4 rounded-xl border transition flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                letterClaimed
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/[0.08] text-white'
              }`}
            >
              <span className="text-[11px] font-mono text-cyan-400">KEY [L]</span>
              <span className="text-base font-display font-bold mt-0.5">SOUND MATCH</span>
              <span className="text-[10px] text-zinc-400">{letterClaimed ? 'Checked' : `Matches ${nLevel} back`}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. FINISHED */}
      {gameState === 'finished' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block">
              Dual {nLevel}-Back Complete
            </span>
            <h3 className="text-3xl font-display font-extrabold text-white">
              Working Memory Calibrated!
            </h3>
            <span className="text-4xl font-mono font-black text-cyan-400 block pt-1">
              {score.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">POINTS</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Accuracy</span>
              <span className="text-xl font-mono font-bold text-white">{accuracy}%</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Streak</span>
              <span className="text-xl font-mono font-bold text-amber-400">{maxCombo}x</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Position Hits</span>
              <span className="text-xl font-mono font-bold text-indigo-400">{posHits}</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Audio Hits</span>
              <span className="text-xl font-mono font-bold text-cyan-400">{letterHits}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={triggerStart}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/[0.08] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
            <button
              onClick={handleSaveResult}
              className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              Save to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
