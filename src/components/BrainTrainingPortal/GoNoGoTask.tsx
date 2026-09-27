import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Award, 
  Volume2, 
  VolumeX, 
  Flame, 
  Trophy, 
  Sparkles,
  Zap,
  Timer,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeResult } from '../../types/neuro';
import { taskAudio } from '../../utils/taskAudio';

interface GoNoGoTaskProps {
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface GoTrial {
  isGo: boolean;
  durationMs: number;
}

export const GoNoGoTask: React.FC<GoNoGoTaskProps> = ({ onComplete, onCancel }) => {
  const [ratioMode, setRatioMode] = useState<'standard' | 'high_vigilance' | 'balanced'>('standard');
  const [trialCountOption, setTrialCountOption] = useState<20 | 30>(20);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // States
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'running' | 'finished'>('intro');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [trials, setTrials] = useState<GoTrial[]>([]);
  const [stimulusState, setStimulusState] = useState<'blank' | 'go' | 'nogo'>('blank');
  const [userPressed, setUserPressed] = useState(false);

  // Gamification
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState<'green' | 'red' | null>(null);

  // Performance telemetry
  const [goHits, setGoHits] = useState(0);
  const [omissions, setOmissions] = useState(0);
  const [commissions, setCommissions] = useState(0);
  const [correctWithholds, setCorrectWithholds] = useState(0);
  const [latencies, setLatencies] = useState<number[]>([]);

  const stimulusStartTimeRef = useRef<number>(0);
  const trialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    taskAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const generateTrials = (): GoTrial[] => {
    const list: GoTrial[] = [];
    const goProbability = ratioMode === 'high_vigilance' ? 0.85 : ratioMode === 'balanced' ? 0.60 : 0.75;

    for (let i = 0; i < trialCountOption; i++) {
      const isGo = i < 2 ? true : Math.random() < goProbability;
      list.push({ isGo, durationMs: ratioMode === 'high_vigilance' ? 640 : 750 });
    }
    return list;
  };

  const triggerStart = () => {
    const t = generateTrials();
    setTrials(t);
    setCurrentTrialIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLastFeedback(null);
    setGoHits(0);
    setOmissions(0);
    setCommissions(0);
    setCorrectWithholds(0);
    setLatencies([]);

    setGameState('countdown');
    setCountdownNum(3);
    taskAudio.playTone(440, 0.08);

    const cInterval = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(cInterval);
          taskAudio.playTone(880, 0.18);
          setGameState('running');
          runTrial(0, t);
          return 0;
        }
        taskAudio.playTone(prev === 2 ? 550 : 660, 0.08);
        return prev - 1;
      });
    }, 600);
  };

  const runTrial = (idx: number, trialList: GoTrial[]) => {
    if (idx >= trialList.length) {
      finishTask();
      return;
    }

    setCurrentTrialIdx(idx);
    setUserPressed(false);
    setStimulusState('blank');

    const isi = 450 + Math.random() * 450;
    trialTimeoutRef.current = setTimeout(() => {
      const trial = trialList[idx];
      setStimulusState(trial.isGo ? 'go' : 'nogo');
      stimulusStartTimeRef.current = performance.now();

      trialTimeoutRef.current = setTimeout(() => {
        setStimulusState('blank');

        // Check if withheld properly
        if (!trial.isGo) {
          setCorrectWithholds(w => w + 1);
          setCombo(c => {
            const nextC = c + 1;
            setMaxCombo(m => Math.max(m, nextC));
            return nextC;
          });
          const gained = 180;
          setScore(s => s + gained);
          setLastFeedback(`CLEAN BRAKE! (+${gained} PTS)`);
        } else {
          // Missed a GO
          setOmissions(o => o + 1);
          setCombo(0);
          setLastFeedback('MISSED GO');
        }

        trialTimeoutRef.current = setTimeout(() => {
          runTrial(idx + 1, trialList);
        }, 220);
      }, trial.durationMs);
    }, isi);
  };

  const handleAction = () => {
    if (gameState !== 'running' || stimulusState === 'blank' || userPressed) return;
    setUserPressed(true);

    const rt = Math.round(performance.now() - stimulusStartTimeRef.current);
    const trial = trials[currentTrialIdx];

    if (trial.isGo) {
      taskAudio.playSuccess();
      setScreenFlash('green');
      setTimeout(() => setScreenFlash(null), 120);

      setGoHits(h => h + 1);
      setLatencies(l => [...l, rt]);

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const mult = newCombo >= 8 ? 2.5 : newCombo >= 4 ? 1.5 : 1.0;
      const speedBonus = Math.max(0, Math.round((600 - rt) * 0.3));
      const gained = Math.round((100 + speedBonus) * mult);

      setScore(s => s + gained);
      setLastFeedback(`FAST GO! ${rt}ms (+${gained} PTS)`);
    } else {
      taskAudio.playSlip();
      setScreenFlash('red');
      setTimeout(() => setScreenFlash(null), 200);

      setCommissions(c => c + 1);
      setCombo(0);
      setLastFeedback('IMPULSE SLIP (-0)');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'running') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (trialTimeoutRef.current) clearTimeout(trialTimeoutRef.current);
    };
  }, [gameState, stimulusState, userPressed, currentTrialIdx, trials, combo]);

  const finishTask = () => {
    taskAudio.playCompletion();
    setGameState('finished');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  const totalDecisions = trials.length;
  const correctDecisions = goHits + correctWithholds;
  const accuracy = totalDecisions > 0 ? Math.round((correctDecisions / totalDecisions) * 100) : 100;
  const meanRt = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 480;

  const motorInhibitionScore = Math.min(
    100,
    Math.max(25, Math.round(accuracy * 0.7 + Math.max(0, 700 - meanRt) * 0.05 - commissions * 4))
  );

  const handleSaveResult = () => {
    const result: ChallengeResult = {
      id: `res-gonogo-${Date.now()}`,
      challengeType: 'gonogo',
      date: new Date().toISOString(),
      accuracy,
      meanReactionTimeMs: meanRt,
      score,
      commissionErrors: commissions,
      omissionErrors: omissions,
      prefrontalIndex: motorInhibitionScore,
    };
    onComplete(result);
  };

  return (
    <div className={`relative bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden transition-all duration-150 ${
      screenFlash === 'green' ? 'ring-2 ring-emerald-500/50 bg-emerald-950/20' : screenFlash === 'red' ? 'ring-2 ring-rose-500/50 bg-rose-950/20' : ''
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Action & Pause Reflex Challenge
            </h2>
            <span className="text-xs text-zinc-400 block">Subthalamic Motor Inhibition</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              soundEnabled
                ? 'bg-zinc-800 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-white/[0.06] text-zinc-500'
            }`}
            title="Audio toggle"
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

      {/* 1. INTRO / RULES */}
      {gameState === 'intro' && (
        <div className="space-y-6">
          <div className="bg-[#0e1117] border border-white/[0.08] p-5 rounded-xl space-y-4">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block font-bold">
              The Motor Brake Rule:
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  GO
                </div>
                <div>
                  <strong className="text-emerald-400 block">TAP ON GREEN</strong>
                  <span className="text-zinc-400 text-[11px]">Hit Space or tap box fast</span>
                </div>
              </div>

              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-xs">
                  ✕
                </div>
                <div>
                  <strong className="text-rose-400 block">HOLD ON RED</strong>
                  <span className="text-zinc-400 text-[11px]">Do not tap! Safe brake</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              Randomized timing intervals prevent rhythmic guessing. Build your combo streak by reacting rapidly to Go while holding steady on No-Go!
            </p>
          </div>

          <button
            onClick={triggerStart}
            className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 transition shadow-xl shadow-emerald-500/10 cursor-pointer active:scale-98"
          >
            <Play className="w-5 h-5 fill-current text-zinc-950" />
            <span>START REFLEX CHALLENGE NOW</span>
          </button>
        </div>
      )}

      {/* 2. COUNTDOWN */}
      {gameState === 'countdown' && (
        <div className="h-72 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
            Ready Natural Brakes...
          </span>
          <span className="text-8xl font-display font-black text-white animate-in zoom-in-50 duration-200">
            {countdownNum}
          </span>
          <span className="text-xs text-zinc-500">Tap anywhere or press [SPACEBAR] on Green</span>
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
                <span className="text-base font-mono font-bold text-emerald-400">
                  {combo}x
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">TRIAL</span>
              <span className="text-sm font-mono font-bold text-zinc-300">
                {currentTrialIdx + 1} / {trials.length}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {lastFeedback && (
            <div className="text-center text-xs font-mono font-bold text-emerald-300 animate-in fade-in duration-100">
              {lastFeedback}
            </div>
          )}

          {/* Target arena */}
          <div
            onClick={handleAction}
            className={`h-56 rounded-2xl border flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-75 relative overflow-hidden ${
              stimulusState === 'go'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                : stimulusState === 'nogo'
                ? 'bg-rose-950/60 border-rose-500 shadow-xl shadow-rose-500/20 scale-[1.02]'
                : 'bg-[#07080b] border-white/[0.08]'
            }`}
          >
            {stimulusState === 'go' && (
              <div className="text-center animate-in zoom-in-95 duration-100">
                <div className="w-24 h-24 rounded-full bg-emerald-400 shadow-2xl shadow-emerald-400/60 flex items-center justify-center mx-auto mb-2 text-slate-950 font-display font-black text-3xl">
                  GO
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300">TAP NOW!</span>
              </div>
            )}

            {stimulusState === 'nogo' && (
              <div className="text-center animate-in zoom-in-95 duration-100">
                <div className="w-24 h-24 rounded-full bg-rose-600 shadow-2xl shadow-rose-600/60 flex items-center justify-center mx-auto mb-2 text-white font-display font-black text-3xl">
                  HOLD
                </div>
                <span className="text-xs font-mono font-bold text-rose-300">PAUSE! DO NOT TAP</span>
              </div>
            )}

            {stimulusState === 'blank' && (
              <div className="text-zinc-600 font-mono text-3xl">+</div>
            )}

            <span className="absolute bottom-2 text-[10px] font-mono text-zinc-500">
              Click box or press [SPACEBAR]
            </span>
          </div>

          <button
            onClick={handleAction}
            className="w-full py-4 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white font-display font-bold border border-white/[0.08] transition cursor-pointer text-center text-sm shadow-md"
          >
            TAP HERE ON GO [SPACEBAR]
          </button>
        </div>
      )}

      {/* 4. FINISHED */}
      {gameState === 'finished' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              Reflex Challenge Complete
            </span>
            <h3 className="text-3xl font-display font-extrabold text-white">
              Inhibitory Brakes Primed!
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
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Reaction Time</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{meanRt}ms</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Impulse Slips</span>
              <span className="text-xl font-mono font-bold text-rose-400">{commissions}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={triggerStart}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/[0.08] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={handleSaveResult}
              className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Save to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
