import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Award, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Flame, 
  Trophy, 
  Sparkles,
  Zap,
  Timer,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeResult } from '../../types/neuro';
import { taskAudio } from '../../utils/taskAudio';

interface TrailMakingTaskProps {
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface TrailNode {
  id: string;
  label: string;
  type: 'num' | 'letter';
  orderIndex: number;
  x: number;
  y: number;
}

export const TrailMakingTask: React.FC<TrailMakingTaskProps> = ({ onComplete, onCancel }) => {
  const [subtestType, setSubtestType] = useState<'partB' | 'partA'>('partB');
  const [nodeCount, setNodeCount] = useState<10 | 14>(10);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // States
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'running' | 'finished'>('intro');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [nodes, setNodes] = useState<TrailNode[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [lastMistakeNode, setLastMistakeNode] = useState<string | null>(null);

  // Gamification
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);
  const lastNodeTimestampRef = useRef<number>(0);

  useEffect(() => {
    taskAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const getSequence = (): string[] => {
    if (subtestType === 'partA') {
      return Array.from({ length: nodeCount }, (_, i) => String(i + 1));
    } else {
      const seq: string[] = [];
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      for (let i = 0; i < Math.floor(nodeCount / 2); i++) {
        seq.push(String(i + 1));
        seq.push(letters[i]);
      }
      return seq.slice(0, nodeCount);
    }
  };

  const sequence = getSequence();

  const generateRandomNodes = (seq: string[]): TrailNode[] => {
    const list: TrailNode[] = [];
    const minDistance = nodeCount === 14 ? 14 : 17;

    for (let i = 0; i < seq.length; i++) {
      const label = seq[i];
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 150) {
        attempts++;
        x = 10 + Math.random() * 80;
        y = 12 + Math.random() * 74;

        valid = list.every(existing => {
          const dx = existing.x - x;
          const dy = existing.y - y;
          return Math.sqrt(dx * dx + dy * dy) >= minDistance;
        });
      }

      list.push({
        id: `node-${label}-${i}`,
        label,
        type: isNaN(Number(label)) ? 'letter' : 'num',
        orderIndex: i,
        x,
        y,
      });
    }

    return list;
  };

  const triggerStart = () => {
    const seq = getSequence();
    const generated = generateRandomNodes(seq);
    setNodes(generated);
    setCurrentStepIndex(0);
    setMistakes(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLastFeedback(null);
    setElapsedTimeMs(0);
    setLastMistakeNode(null);

    setGameState('countdown');
    setCountdownNum(3);
    taskAudio.playTone(440, 0.08);

    const cInterval = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(cInterval);
          taskAudio.playTone(880, 0.18);
          setGameState('running');

          startTimestampRef.current = performance.now();
          lastNodeTimestampRef.current = performance.now();
          timerIntervalRef.current = setInterval(() => {
            setElapsedTimeMs(Math.round(performance.now() - startTimestampRef.current));
          }, 100);

          return 0;
        }
        taskAudio.playTone(prev === 2 ? 550 : 660, 0.08);
        return prev - 1;
      });
    }, 600);
  };

  const handleNodeClick = (node: TrailNode) => {
    if (gameState !== 'running') return;

    if (node.orderIndex === currentStepIndex) {
      setLastMistakeNode(null);

      // Reaction speed for this step
      const stepRt = performance.now() - lastNodeTimestampRef.current;
      lastNodeTimestampRef.current = performance.now();

      taskAudio.playTone(320 + currentStepIndex * 35, 0.12);

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const mult = newCombo >= 6 ? 2.5 : newCombo >= 3 ? 1.5 : 1.0;
      const speedBonus = Math.max(0, Math.round((1800 - stepRt) * 0.1));
      const gained = Math.round((120 + speedBonus) * mult);

      setScore(s => s + gained);
      setLastFeedback(`CONNECTED! (+${gained} PTS)`);

      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);

      if (nextIdx >= nodes.length) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        taskAudio.playCompletion();
        setGameState('finished');
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
    } else if (node.orderIndex > currentStepIndex) {
      taskAudio.playSlip();
      setMistakes(m => m + 1);
      setCombo(0);
      setLastMistakeNode(node.id);
      setLastFeedback('ORDER ERROR');
      setTimeout(() => setLastMistakeNode(null), 500);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const totalTimeSeconds = Math.max(1, Math.round(elapsedTimeMs / 100) / 10);
  const accuracy = Math.max(20, Math.round((sequence.length / (sequence.length + mistakes * 1.5)) * 100));
  const flexScore = Math.max(
    25,
    Math.min(100, Math.round(100 - (totalTimeSeconds * 2.1) - (mistakes * 5)))
  );

  const handleSaveResult = () => {
    const result: ChallengeResult = {
      id: `res-tmt-${Date.now()}`,
      challengeType: 'trailmaking',
      date: new Date().toISOString(),
      accuracy,
      meanReactionTimeMs: Math.round(elapsedTimeMs / sequence.length),
      score,
      prefrontalIndex: flexScore,
    };
    onComplete(result);
  };

  return (
    <div className="relative bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              {subtestType === 'partB' ? 'Alternating Trail Arcade (Part B)' : 'Visual Speed Trail (Part A)'}
            </h2>
            <span className="text-xs text-zinc-400 block">Executive Mental Flexibility</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              soundEnabled
                ? 'bg-zinc-800 border-amber-500/40 text-amber-300'
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
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block font-bold">
              The Path Connection Rule:
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {subtestType === 'partB' ? (
                <>
                  Connect the scattered bubbles in alternating sequence: 
                  <span className="text-amber-400 font-mono font-bold"> 1 ➔ A ➔ 2 ➔ B ➔ 3 ➔ C </span>! 
                  Speed through the trail without skipping a step to build your combo multiplier.
                </>
              ) : (
                <>
                  Connect the numbers in order: 
                  <span className="text-amber-400 font-mono font-bold"> 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 </span>!
                </>
              )}
            </p>
          </div>

          {/* Subtest Selector */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setSubtestType('partB')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                subtestType === 'partB'
                  ? 'bg-amber-500/10 border-amber-500/60 text-white font-bold'
                  : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block font-bold">Part B (1 ➔ A ➔ 2)</span>
              <span className="text-[10px] text-zinc-500">Executive Task Switching</span>
            </button>
            <button
              onClick={() => setSubtestType('partA')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                subtestType === 'partA'
                  ? 'bg-amber-500/10 border-amber-500/60 text-white font-bold'
                  : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block font-bold">Part A (1 ➔ 2 ➔ 3)</span>
              <span className="text-[10px] text-zinc-500">Visual Search Speed</span>
            </button>
          </div>

          <button
            onClick={triggerStart}
            className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 transition shadow-xl shadow-amber-500/10 cursor-pointer active:scale-98"
          >
            <Play className="w-5 h-5 fill-current text-zinc-950" />
            <span>START TRAIL CHALLENGE NOW</span>
          </button>
        </div>
      )}

      {/* 2. COUNTDOWN */}
      {gameState === 'countdown' && (
        <div className="h-72 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest animate-pulse">
            Prepare Visual Scan...
          </span>
          <span className="text-8xl font-display font-black text-white animate-in zoom-in-50 duration-200">
            {countdownNum}
          </span>
          <span className="text-xs text-zinc-500">First target is [1]</span>
        </div>
      )}

      {/* 3. RUNNING GAME */}
      {gameState === 'running' && (
        <div className="space-y-4">
          {/* Scoreboard */}
          <div className="bg-[#0e1117] border border-white/[0.08] px-4 py-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">SCORE</span>
                <span className="text-base font-mono font-bold text-white">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-white/[0.06]">
              <span className="text-zinc-400">NEXT:</span>
              <span className="text-base font-mono font-black text-amber-400">
                {sequence[currentStepIndex] || ''}
              </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400 font-mono">
              <span>Time: <strong className="text-white">{totalTimeSeconds}s</strong></span>
              <span>Streak: <strong className="text-amber-400">{combo}x</strong></span>
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="h-84 bg-[#07080b] border border-white/[0.08] rounded-xl relative overflow-hidden select-none shadow-inner">
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {nodes.map(node => {
                if (node.orderIndex < currentStepIndex && node.orderIndex > 0) {
                  const prevNode = nodes.find(n => n.orderIndex === node.orderIndex - 1);
                  if (prevNode) {
                    return (
                      <line
                        key={`line-${node.id}`}
                        x1={`${prevNode.x}%`}
                        y1={`${prevNode.y}%`}
                        x2={`${node.x}%`}
                        y2={`${node.y}%`}
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                        strokeDasharray="4 2"
                        opacity="0.8"
                      />
                    );
                  }
                }
                return null;
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const isCompleted = node.orderIndex < currentStepIndex;
              const isCurrent = node.orderIndex === currentStepIndex;
              const isMistake = lastMistakeNode === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full font-bold font-mono text-sm transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md z-10 ${
                    isCompleted
                      ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-300 opacity-60'
                      : isCurrent
                      ? 'bg-amber-400 text-zinc-950 border-2 border-white scale-110 shadow-amber-400/60 shadow-xl animate-pulse font-black'
                      : isMistake
                      ? 'bg-rose-500 text-white border-2 border-white animate-bounce'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.1] hover:scale-105 active:scale-95'
                  }`}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FINISHED */}
      {gameState === 'finished' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Trail Path Complete
            </span>
            <h3 className="text-3xl font-display font-extrabold text-white">
              Flexibility Network Activated!
            </h3>
            <span className="text-4xl font-mono font-black text-cyan-400 block pt-1">
              {score.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">POINTS</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Duration</span>
              <span className="text-xl font-mono font-bold text-amber-400">{totalTimeSeconds}s</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Accuracy</span>
              <span className="text-xl font-mono font-bold text-white">{accuracy}%</span>
            </div>
            <div className="bg-zinc-900/80 border border-white/[0.06] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Order Slips</span>
              <span className="text-xl font-mono font-bold text-rose-400">{mistakes}</span>
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
              className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Save to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
