import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Activity, 
  Zap, 
  Flame, 
  Sliders, 
  RotateCcw,
  ShieldAlert,
  Layers,
  Cpu
} from 'lucide-react';
import { BRAIN_REGIONS } from '../data/neuroData';
import { BrainRegion } from '../types/neuro';
import { audioEngine, SoundMode } from '../utils/audioEngine';
import { taskAudio } from '../utils/taskAudio';

interface InteractiveBrainConnectomeProps {
  onSelectRegion?: (region: BrainRegion) => void;
  selectedRegionId?: string;
  showControls?: boolean;
  className?: string;
}

export type CognitiveWorkloadMode = 
  | 'conflict' // Stroop / ACC Conflict resolution
  | 'memory'   // Dual N-back working memory loop
  | 'inhibit'  // Go/No-Go motor braking
  | 'switch'   // Trail making frontoparietal switching
  | 'baseline';// Resting state default mode

interface WorkloadDefinition {
  id: CognitiveWorkloadMode;
  name: string;
  targetHubs: string[]; // hub ids actively firing
  hz: number;
  soundMode: SoundMode;
  primaryColor: string;
  glowColor: string;
  actionPotentialsPerSec: number;
  neurotransmitter: string;
  description: string;
  associatedExerciseId: string;
  associatedExerciseName: string;
}

const WORKLOAD_MODES: WorkloadDefinition[] = [
  {
    id: 'conflict',
    name: 'Conflict Filtering',
    targetHubs: ['acc', 'dlpfc'],
    hz: 40,
    soundMode: 'gamma',
    primaryColor: '#22d3ee', // Cyan
    glowColor: 'rgba(34, 211, 238, 0.5)',
    actionPotentialsPerSec: 320,
    neurotransmitter: 'Norepinephrine & Dopamine D1',
    description: 'Anterior Cingulate (ACC) flags conflicting word/ink signals, suppressing automatic reading impulses.',
    associatedExerciseId: 'acc',
    associatedExerciseName: 'Color Focus',
  },
  {
    id: 'memory',
    name: 'Working Memory Loop',
    targetHubs: ['dlpfc', 'hippocampus'],
    hz: 18,
    soundMode: 'alpha',
    primaryColor: '#818cf8', // Indigo
    glowColor: 'rgba(129, 140, 248, 0.5)',
    actionPotentialsPerSec: 280,
    neurotransmitter: 'Acetylcholine & Glutamate',
    description: 'Dorsolateral Prefrontal Cortex reverberates with Hippocampus to hold spatial & acoustic positions.',
    associatedExerciseId: 'dlpfc',
    associatedExerciseName: 'Memory Match',
  },
  {
    id: 'inhibit',
    name: 'Motor Impulse Brake',
    targetHubs: ['basalganglia', 'acc'],
    hz: 24,
    soundMode: 'alpha',
    primaryColor: '#34d399', // Emerald
    glowColor: 'rgba(52, 211, 153, 0.5)',
    actionPotentialsPerSec: 360,
    neurotransmitter: 'GABA Hyperdirect Pathway',
    description: 'Subthalamic Nucleus rapidly halts motor readiness when unexpected No-Go red stimuli appear.',
    associatedExerciseId: 'basalganglia',
    associatedExerciseName: 'Reflex Pause',
  },
  {
    id: 'switch',
    name: 'Task Switching Agility',
    targetHubs: ['parietal', 'dlpfc', 'occipital'],
    hz: 30,
    soundMode: 'gamma',
    primaryColor: '#f59e0b', // Amber
    glowColor: 'rgba(245, 158, 11, 0.5)',
    actionPotentialsPerSec: 310,
    neurotransmitter: 'Dopamine D2 & Serotonin',
    description: 'Frontoparietal attention network reconfigures mental rules between numerical and alphabetical sequences.',
    associatedExerciseId: 'parietal',
    associatedExerciseName: 'Mind Switch',
  },
  {
    id: 'baseline',
    name: 'Default Mode (Resting)',
    targetHubs: ['hippocampus', 'parietal'],
    hz: 10,
    soundMode: 'alpha',
    primaryColor: '#94a3b8', // Slate
    glowColor: 'rgba(148, 163, 184, 0.3)',
    actionPotentialsPerSec: 110,
    neurotransmitter: 'Endogenous Serotonin',
    description: 'Calm synchronized resting baseline when the brain is self-reflecting without external task demands.',
    associatedExerciseId: 'dlpfc',
    associatedExerciseName: 'Resting State',
  },
];

// Anatomical brain coordinates on a normalized 420x280 canvas
const ANATOMICAL_HUBS = [
  { id: 'dlpfc', name: 'Prefrontal Hub', lobe: 'Executive Planning (DLPFC)', cx: 120, cy: 105, r: 8, regionId: 'dlpfc' },
  { id: 'acc', name: 'Conflict Filter', lobe: 'Anterior Cingulate (ACC)', cx: 185, cy: 90, r: 8, regionId: 'acc' },
  { id: 'parietal', name: 'Switch Node', lobe: 'Parietal Attention Cortex', cx: 285, cy: 105, r: 8, regionId: 'parietal' },
  { id: 'hippocampus', name: 'Memory Loop', lobe: 'Temporal / Hippocampus', cx: 175, cy: 175, r: 7.5, regionId: 'hippocampus' },
  { id: 'basalganglia', name: 'Motor Brake', lobe: 'Basal Ganglia / STN', cx: 240, cy: 165, r: 7.5, regionId: 'basalganglia' },
  { id: 'occipital', name: 'Visual Cortex', lobe: 'Occipital Processing', cx: 335, cy: 165, r: 7, regionId: 'parietal' },
];

// Neural connection tracts
const TRACTS = [
  { from: 0, to: 1, label: 'Prefrontal-Cingulate Axis' },
  { from: 1, to: 2, label: 'Frontoparietal Stream' },
  { from: 0, to: 3, label: 'Working Memory Reverberation' },
  { from: 1, to: 4, label: 'Hyperdirect Motor Brake' },
  { from: 4, to: 2, label: 'Striatal-Parietal Coordination' },
  { from: 2, to: 5, label: 'Visual Attention Gating' },
  { from: 3, to: 4, label: 'Hippocampal-Striatal Relay' },
];

export const InteractiveBrainConnectome: React.FC<InteractiveBrainConnectomeProps> = ({
  onSelectRegion,
  selectedRegionId = 'dlpfc',
  showControls = true,
  className = '',
}) => {
  const [activeWorkload, setActiveWorkload] = useState<CognitiveWorkloadMode>('conflict');
  const [cognitiveLoadMultiplier, setCognitiveLoadMultiplier] = useState<number>(1.2);
  const [isSimulatingBurst, setIsSimulatingBurst] = useState<boolean>(false);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentWorkload = WORKLOAD_MODES.find(w => w.id === activeWorkload) || WORKLOAD_MODES[0];
  const matchedRegion = BRAIN_REGIONS.find(r => r.id === currentWorkload.associatedExerciseId) || BRAIN_REGIONS[0];

  // Sync if selectedRegionId changes externally
  useEffect(() => {
    if (selectedRegionId === 'acc') setActiveWorkload('conflict');
    else if (selectedRegionId === 'dlpfc') setActiveWorkload('memory');
    else if (selectedRegionId === 'basalganglia') setActiveWorkload('inhibit');
    else if (selectedRegionId === 'parietal') setActiveWorkload('switch');
  }, [selectedRegionId]);

  // Audio tone sync with workload
  const toggleAudio = () => {
    if (isPlayingSound) {
      audioEngine.stop();
      setIsPlayingSound(false);
    } else {
      audioEngine.playBinaural(220, currentWorkload.hz, currentWorkload.soundMode);
      setIsPlayingSound(true);
    }
  };

  const handleWorkloadChange = (mode: CognitiveWorkloadMode) => {
    setActiveWorkload(mode);
    const target = WORKLOAD_MODES.find(w => w.id === mode) || WORKLOAD_MODES[0];
    if (isPlayingSound) {
      audioEngine.playBinaural(220, target.hz, target.soundMode);
    }
  };

  // Trigger high-salience cognitive spike (simulating acute mental work)
  const triggerCognitiveSpike = () => {
    taskAudio.playTone(580, 0.12);
    setIsSimulatingBurst(true);
    setCognitiveLoadMultiplier(2.5);

    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    burstTimeoutRef.current = setTimeout(() => {
      setIsSimulatingBurst(false);
      setCognitiveLoadMultiplier(1.2);
    }, 2800);
  };

  // Real-time Canvas Rendering: Showing Neural Pathways ACTUALLY WORKING
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03 * cognitiveLoadMultiplier;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Brain Cortex Silhouette
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2 + 5, 150, 105, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Lateral sulcus & lobes
      ctx.beginPath();
      ctx.moveTo(130, 80);
      ctx.quadraticCurveTo(210, 130, 180, 185);
      ctx.moveTo(140, 120);
      ctx.quadraticCurveTo(230, 140, 310, 125);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.stroke();
      ctx.restore();

      // 2. Draw Synaptic Axon Pathways with Directional Action Potentials
      TRACTS.forEach((tract, tIdx) => {
        const h1 = ANATOMICAL_HUBS[tract.from];
        const h2 = ANATOMICAL_HUBS[tract.to];

        const isTractActive = currentWorkload.targetHubs.includes(h1.id) || currentWorkload.targetHubs.includes(h2.id);

        // Axon fiber
        ctx.beginPath();
        ctx.moveTo(h1.cx, h1.cy);
        ctx.lineTo(h2.cx, h2.cy);
        ctx.strokeStyle = isTractActive
          ? `rgba(255, 255, 255, ${isSimulatingBurst ? 0.35 : 0.15})`
          : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = isTractActive ? 1.8 : 1;
        ctx.stroke();

        // Traveling Action Potential Impulse Particles
        const particleCount = isTractActive ? (isSimulatingBurst ? 4 : 2) : 1;
        for (let p = 0; p < particleCount; p++) {
          const progress = (time * 0.8 + (tIdx * 0.35) + (p / particleCount)) % 1;
          const px = h1.cx + (h2.cx - h1.cx) * progress;
          const py = h1.cy + (h2.cy - h1.cy) * progress;

          // Glowing photon spark
          const radius = isTractActive ? (isSimulatingBurst ? 6 : 4.5) : 2.5;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, radius * 2);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, isTractActive ? currentWorkload.primaryColor : '#ffffff');
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw Active Functional Brain Centers (Heatmap & Aura)
      ANATOMICAL_HUBS.forEach(hub => {
        const isTargeted = currentWorkload.targetHubs.includes(hub.id);
        const pulse = Math.sin(time * 3 + hub.cx) * 0.5 + 0.5;

        if (isTargeted) {
          // Energetic cortical heatmap glow around actively working regions
          const auraRadius = isSimulatingBurst ? hub.r + 20 + pulse * 14 : hub.r + 10 + pulse * 8;
          const heatGrad = ctx.createRadialGradient(hub.cx, hub.cy, 0, hub.cx, hub.cy, auraRadius);
          heatGrad.addColorStop(0, currentWorkload.glowColor);
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(hub.cx, hub.cy, auraRadius, 0, Math.PI * 2);
          ctx.fill();

          // Concentric electric ripple ring
          ctx.beginPath();
          ctx.arc(hub.cx, hub.cy, hub.r + 6 + pulse * 7, 0, Math.PI * 2);
          ctx.strokeStyle = currentWorkload.primaryColor;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        // Central anatomical node
        ctx.beginPath();
        ctx.arc(hub.cx, hub.cy, hub.r, 0, Math.PI * 2);
        ctx.fillStyle = isTargeted ? currentWorkload.primaryColor : '#27272a';
        ctx.fill();
        ctx.strokeStyle = isTargeted ? '#ffffff' : '#3f3f46';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node center spark
        ctx.beginPath();
        ctx.arc(hub.cx, hub.cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentWorkload, cognitiveLoadMultiplier, isSimulatingBurst]);

  // EEG Oscilloscope: Graphing Active Brainwaves
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let oscTime = 0;

    const renderOsc = () => {
      oscTime += 0.06 * cognitiveLoadMultiplier;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Center baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Oscillating brainwave curve
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = currentWorkload.primaryColor;

      const waveCycles = currentWorkload.hz / 5;
      const amplitude = (h / 2) * (isSimulatingBurst ? 0.9 : 0.65);

      for (let x = 0; x < w; x++) {
        const angle = (x / w) * Math.PI * 2 * waveCycles - oscTime * 5;
        const noise = (Math.sin(x * 0.2 + oscTime * 3) * 0.15);
        const y = h / 2 + (Math.sin(angle) + noise) * amplitude;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderOsc);
    };

    animId = requestAnimationFrame(renderOsc);
    return () => cancelAnimationFrame(animId);
  }, [currentWorkload, cognitiveLoadMultiplier, isSimulatingBurst]);

  const liveActionPotentials = Math.round(
    currentWorkload.actionPotentialsPerSec * cognitiveLoadMultiplier
  );

  return (
    <div className={`relative bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Top Header: Telemetry & Sound Carrier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentWorkload.primaryColor }}
            />
            <h3 className="text-base font-display font-bold text-white tracking-tight">
              Active Neural Circuit Visualizer
            </h3>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              [Live fMRI Simulation]
            </span>
          </div>
          <span className="text-xs text-zinc-400 block mt-0.5">
            Observing: {currentWorkload.name} ({currentWorkload.description.split('.')[0]})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Problem-Solving Spike */}
          <button
            onClick={triggerCognitiveSpike}
            disabled={isSimulatingBurst}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
              isSimulatingBurst
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 border-white/[0.1] text-zinc-300 hover:text-white hover:border-white/[0.25]'
            }`}
            title="Simulate acute cognitive load burst"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingBurst ? 'fill-current animate-bounce' : 'text-amber-400'}`} />
            <span>{isSimulatingBurst ? 'Firing Spike!' : 'Simulate Spike'}</span>
          </button>

          {/* Hear Binaural Audio */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
              isPlayingSound
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-zinc-900 border-white/[0.1] text-zinc-400 hover:text-white'
            }`}
            title="Listen to frequency"
          >
            {isPlayingSound ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isPlayingSound ? `${currentWorkload.hz}Hz` : 'Audio'}</span>
          </button>
        </div>
      </div>

      {/* Cognitive Workload Mode Selector (Real, Functional Switching) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {WORKLOAD_MODES.map(mode => {
          const isSelected = activeWorkload === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleWorkloadChange(mode.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-white/[0.3] shadow-md text-white'
                  : 'bg-zinc-900/40 border-white/[0.05] hover:bg-zinc-900/70 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display line-clamp-1">{mode.name}</span>
                <span
                  className="w-2 h-2 rounded-full shrink-0 ml-1"
                  style={{ backgroundColor: mode.primaryColor }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">
                {mode.associatedExerciseName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Neural Firing Stage */}
      <div className="relative w-full h-68 sm:h-74 bg-[#07080b] rounded-xl border border-white/[0.06] overflow-hidden flex items-center justify-center select-none shadow-inner">
        {/* Dynamic Brain Canvas */}
        <canvas
          ref={canvasRef}
          width={420}
          height={280}
          className="w-full max-w-[420px] h-[260px] relative z-10"
        />

        {/* Anatomical Label Tooltips */}
        {ANATOMICAL_HUBS.map(hub => {
          const isFiring = currentWorkload.targetHubs.includes(hub.id);
          return (
            <div
              key={hub.id}
              style={{
                left: `${(hub.cx / 420) * 100}%`,
                top: `${(hub.cy / 280) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              <span
                className={`text-[9px] font-mono tracking-tight absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap transition-colors ${
                  isFiring ? 'text-white font-bold' : 'text-zinc-600'
                }`}
              >
                {hub.name}
              </span>
            </div>
          );
        })}

        {/* Top Left: Live Real-Time Throughput Badge */}
        <div className="absolute top-3 left-3 bg-zinc-950/80 border border-white/[0.08] px-3 py-1.5 rounded-lg flex items-center gap-2 z-20">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <div className="font-mono text-[11px]">
            <span className="text-zinc-500 block text-[9px] uppercase">Synaptic Firing</span>
            <span className="text-white font-bold">{liveActionPotentials} AP / sec</span>
          </div>
        </div>

        {/* Bottom Right: EEG Waveform Oscilloscope */}
        <div className="absolute bottom-3 right-3 bg-zinc-950/80 border border-white/[0.08] px-3 py-1.5 rounded-lg flex items-center gap-2 z-20">
          <canvas
            ref={oscCanvasRef}
            width={70}
            height={22}
            className="w-18 h-5"
          />
          <span className="text-[11px] font-mono font-bold text-white">
            {currentWorkload.hz} Hz
          </span>
        </div>
      </div>

      {/* Live Neurochemical & Circuit Mechanism Banner */}
      {showControls && (
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-[11px] uppercase">Primary Neurotransmitters:</span>
              <span className="font-mono font-bold text-white">{currentWorkload.neurotransmitter}</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
              {currentWorkload.description}
            </p>
          </div>

          <button
            onClick={() => {
              if (onSelectRegion) onSelectRegion(matchedRegion);
            }}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice {currentWorkload.associatedExerciseName}</span>
          </button>
        </div>
      )}
    </div>
  );
};
