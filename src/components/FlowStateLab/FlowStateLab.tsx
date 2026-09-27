import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell,
  BellOff, 
  Zap, 
  Flame, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Brain,
  Sliders,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
  FastForward,
  BookOpen
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { taskAudio } from '../../utils/taskAudio';

type RecoveryPhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4';

interface RecoveryPhase {
  id: RecoveryPhaseId;
  name: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  title: string;
  cognitiveMechanism: string;
  attentionResidue: number; // percentage stuck on distraction
  workingMemoryBuffer: number; // percentage restored
  brainwaveHz: number;
  brainwaveType: string;
  eegColor: string;
  neurochemicalState: string;
  researchCitation: string;
}

const RECOVERY_PHASES: RecoveryPhase[] = [
  {
    id: 'phase1',
    name: '01. Acute Eviction',
    timeRange: '00:00 – 04:30',
    startSec: 0,
    endSec: 270,
    title: 'Working Memory Scratchpad Wipe',
    cognitiveMechanism: 'The incoming alert triggers the sensory salience network, abruptly ejecting active variables from the Dorsolateral Prefrontal Cortex. Amygdala vigilance spikes, while dopamine drops precipitously.',
    attentionResidue: 84,
    workingMemoryBuffer: 12,
    brainwaveHz: 28,
    brainwaveType: 'Chaotic High-Beta',
    eegColor: '#f43f5e',
    neurochemicalState: 'Cortisol & Adrenaline Surge · Dopamine Collapse',
    researchCitation: 'Sophie Leroy (2009) · Why is it so hard to do my work? The Challenge of Attention Residue',
  },
  {
    id: 'phase2',
    name: '02. Intervening Detour',
    timeRange: '04:31 – 13:45',
    startSec: 271,
    endSec: 825,
    title: 'Secondary Distraction Drift',
    cognitiveMechanism: 'Empirical logging reveals workers rarely return immediately. They perform an average of 2.2 secondary actions ("quick email check", "new browser tab"). The attentional spotlight remains fractured.',
    attentionResidue: 62,
    workingMemoryBuffer: 30,
    brainwaveHz: 20,
    brainwaveType: 'Fragmented Beta',
    eegColor: '#fbbf24',
    neurochemicalState: 'High Noradrenergic Arousal · Low Acetylcholine Binding',
    researchCitation: 'Dr. Gloria Mark (UC Irvine) · The Cost of Interrupted Work: More Speed and Stress',
  },
  {
    id: 'phase3',
    name: '03. Model Reconstruction',
    timeRange: '13:46 – 19:15',
    startSec: 826,
    endSec: 1155,
    title: 'Episodic Context Reloading',
    cognitiveMechanism: 'Returning to the primary task requires re-reading recent lines, re-orienting coordinate state, and asking "Where was I?". High metabolic glucose consumption as the hippocampus reconstructs working context.',
    attentionResidue: 28,
    workingMemoryBuffer: 68,
    brainwaveHz: 14,
    brainwaveType: 'Low-Beta & Emerging Alpha',
    eegColor: '#38bdf8',
    neurochemicalState: 'Restoring Acetylcholine · Dopamine Stabilizing',
    researchCitation: 'Monk, Trafton & Boehm-Davis · Attentional Recovery Profiles in Human-Computer Interaction',
  },
  {
    id: 'phase4',
    name: '04. Hypofrontality Re-entry',
    timeRange: '19:16 – 23:15',
    startSec: 1156,
    endSec: 1395,
    title: 'Flow Threshold Consolidation',
    cognitiveMechanism: 'The inner critic and self-monitoring circuits quieten down again (transient hypofrontality). Default Mode Network deactivates. Harmonious alpha-theta synchrony (9.5Hz) returns, unlocking effortless performance.',
    attentionResidue: 4,
    workingMemoryBuffer: 100,
    brainwaveHz: 9.5,
    brainwaveType: 'Alpha-Theta Coherence',
    eegColor: '#34d399',
    neurochemicalState: 'Balanced Anandamide, Endorphins, Dopamine & Serotonin',
    researchCitation: 'Mihaly Csíkszentmihályi & Arne Dietrich · Transient Hypofrontality in Optimal Flow States',
  },
];

export const FlowStateLab: React.FC = () => {
  // 1. Simulation States: 'flow' or 'interrupted'
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);
  const [currentRecoverySec, setCurrentRecoverySec] = useState<number>(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);

  // 2. Challenge vs Skill Interactive Slider (The 4% Rule)
  const [challengeLevel, setChallengeLevel] = useState<number>(54);
  const [skillLevel, setSkillLevel] = useState<number>(50);

  // 3. Deep Flow Session Timer (25 min standard flow block)
  const [sessionTimerActive, setSessionTimerActive] = useState<boolean>(false);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number>(25 * 60);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eegCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timelineIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine current active recovery phase based on currentRecoverySec
  const currentPhase: RecoveryPhase = isInterrupted 
    ? (RECOVERY_PHASES.find(p => currentRecoverySec >= p.startSec && currentRecoverySec <= p.endSec) || RECOVERY_PHASES[0])
    : RECOVERY_PHASES[3]; // in full flow, phase 4 attributes apply

  // Interactive timeline playback
  useEffect(() => {
    if (isTimelinePlaying && isInterrupted) {
      timelineIntervalRef.current = setInterval(() => {
        setCurrentRecoverySec(prev => {
          if (prev >= 1395) {
            setIsTimelinePlaying(false);
            taskAudio.playSuccess();
            return 1395;
          }
          return prev + 15; // fast-forward 15s per tick
        });
      }, 150);
    } else {
      if (timelineIntervalRef.current) clearInterval(timelineIntervalRef.current);
    }
    return () => {
      if (timelineIntervalRef.current) clearInterval(timelineIntervalRef.current);
    };
  }, [isTimelinePlaying, isInterrupted]);

  // Handle Audio Flow Binaural Sync (9.5Hz Alpha-Theta Borderline)
  const toggleFlowAudio = () => {
    if (isSimulatingAudio) {
      audioEngine.stop();
      setIsSimulatingAudio(false);
    } else {
      audioEngine.playBinaural(220, isInterrupted ? currentPhase.brainwaveHz : 9.5, 'alpha');
      setIsSimulatingAudio(true);
    }
  };

  // Trigger Realistic Distraction Shatter
  const triggerDistraction = () => {
    taskAudio.playSlip();
    setIsInterrupted(true);
    setCurrentRecoverySec(0);
    setIsTimelinePlaying(true);

    if (isSimulatingAudio) {
      audioEngine.stop();
      setIsSimulatingAudio(false);
    }
  };

  // Trigger Instant Flow State
  const restoreFlow = () => {
    taskAudio.playSuccess();
    setIsInterrupted(false);
    setCurrentRecoverySec(1395);
    setIsTimelinePlaying(false);
  };

  // Jump directly to a recovery phase
  const jumpToPhase = (phase: RecoveryPhase) => {
    setIsInterrupted(true);
    setCurrentRecoverySec(phase.startSec);
    setIsTimelinePlaying(false);
  };

  // Deep Flow Session Timer countdown
  useEffect(() => {
    if (sessionTimerActive) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(sessionIntervalRef.current as NodeJS.Timeout);
            taskAudio.playCompletion();
            setSessionTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    }
    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, [sessionTimerActive]);

  // Challenge vs Skill Diagnostic
  const diff = challengeLevel - skillLevel;
  let flowZone = 'The Flow Channel (Optimal 4% Stretch)';
  let flowZoneColor = 'text-cyan-400';
  let flowZoneDesc = 'Perceived challenge slightly exceeds existing skill level by ~4%. The prefrontal cortex is fully recruited with zero room for inner self-doubt.';

  if (diff > 15) {
    flowZone = 'High Anxiety & Overwhelm';
    flowZoneColor = 'text-rose-400';
    flowZoneDesc = 'Challenge outpaces capacity. Cortisol spikes, narrowing working memory and triggering the amygdala stress reflex.';
  } else if (diff < -15) {
    flowZone = 'Boredom & Mind Wandering';
    flowZoneColor = 'text-amber-400';
    flowZoneDesc = 'Task is too easy. The Default Mode Network reactivates, causing daydreaming and attention drift.';
  }

  // Realistic Anatomical Brain Simulation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Draw Anatomical Brain Silhouette
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 145, 105, 0, 0, Math.PI * 2);

      if (!isInterrupted || currentRecoverySec >= 1156) {
        // Deep Flow: Serene bioluminescent cyan-emerald glow
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
      } else if (currentRecoverySec < 270) {
        // Phase 1 Acute Eviction: Red emergency spike noise
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.fillStyle = 'rgba(244, 63, 94, 0.09)';
      } else if (currentRecoverySec < 825) {
        // Phase 2 Drift: Amber fragmented friction
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.06)';
      } else {
        // Phase 3 Rebuilding: Re-cohering cyan-blue
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      }
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Frontal Cortex / Prefrontal Zone (Front left)
      const pfcX = cx - 75;
      const pfcY = cy - 25;

      if (!isInterrupted || currentRecoverySec >= 1156) {
        // TRANSIENT HYPOFRONTALITY: Prefrontal inner critic is QUIET & DIMMED
        const quietPulse = Math.sin(time * 1.5) * 0.15 + 0.85;
        const pfcGrad = ctx.createRadialGradient(pfcX, pfcY, 0, pfcX, pfcY, 45);
        pfcGrad.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
        pfcGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pfcGrad;
        ctx.beginPath();
        ctx.arc(pfcX, pfcY, 45 * quietPulse, 0, Math.PI * 2);
        ctx.fill();

        // Harmonious whole-brain Alpha-Theta traveling waves
        for (let ring = 1; ring <= 4; ring++) {
          const ringRadius = ((time * 28 + ring * 35) % 135);
          const alpha = (1 - ringRadius / 135) * 0.45;
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, ringRadius * 1.2, ringRadius * 0.85, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Dopamine / Anandamide synaptic sparks
        for (let s = 0; s < 18; s++) {
          const sparkAngle = (time * 0.8 + s * (Math.PI / 9));
          const sparkDist = 30 + Math.sin(time * 2 + s) * 55;
          const sx = cx + Math.cos(sparkAngle) * sparkDist * 1.2;
          const sy = cy + Math.sin(sparkAngle) * sparkDist * 0.8;

          ctx.fillStyle = s % 2 === 0 ? '#38bdf8' : '#34d399';
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentRecoverySec < 270) {
        // ACUTE SHATTER: Jagged red high-beta electrical sparks firing erratically
        for (let spike = 0; spike < 26; spike++) {
          const angle = Math.random() * Math.PI * 2;
          const len = 25 + Math.random() * 85;
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
        }

        // Prefrontal Overdrive (Loud Alert Vigilance)
        const panicPulse = Math.sin(time * 9) * 0.3 + 0.7;
        const pfcGrad = ctx.createRadialGradient(pfcX, pfcY, 0, pfcX, pfcY, 55);
        pfcGrad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
        pfcGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pfcGrad;
        ctx.beginPath();
        ctx.arc(pfcX, pfcY, 55 * panicPulse, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentRecoverySec < 825) {
        // SECONDARY DETOUR: Split attention tracts (bifurcated nodes)
        const d1X = cx - 50;
        const d1Y = cy - 20;
        const d2X = cx + 50;
        const d2Y = cy + 20;

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d1X, d1Y);
        ctx.lineTo(d2X, d2Y);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(d1X, d1Y, 6, 0, Math.PI * 2);
        ctx.arc(d2X, d2Y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // MODEL RECONSTRUCTION: Re-cohering neural connections
        const reProgress = (currentRecoverySec - 825) / 330;
        for (let ring = 1; ring <= 3; ring++) {
          const ringRadius = ((time * 20 + ring * 40) % 120);
          const alpha = (1 - ringRadius / 120) * 0.35 * reProgress;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, ringRadius * 1.1, ringRadius * 0.8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isInterrupted, currentRecoverySec]);

  // Live Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = eegCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let oscTime = 0;

    const renderEEG = () => {
      oscTime += 0.055;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.lineWidth = 2;

      if (!isInterrupted || currentRecoverySec >= 1156) {
        // Synchronized 9.5Hz Alpha-Theta Wave
        ctx.strokeStyle = '#34d399';
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * 3.5 - oscTime * 4) * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (currentRecoverySec < 270) {
        // Chaotic High-Beta Noise
        ctx.strokeStyle = '#f43f5e';
        for (let x = 0; x < w; x += 3) {
          const noise = (Math.random() - 0.5) * (h * 0.85);
          const y = h / 2 + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (currentRecoverySec < 825) {
        // Fragmented Beta
        ctx.strokeStyle = '#fbbf24';
        for (let x = 0; x < w; x++) {
          const y = h / 2 + (Math.sin(x * 0.15 - oscTime * 7) + (Math.random() - 0.5) * 0.3) * (h * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Rebuilding Low-Beta
        ctx.strokeStyle = '#38bdf8';
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * 4.5 - oscTime * 5) * (h * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderEEG);
    };

    animId = requestAnimationFrame(renderEEG);
    return () => cancelAnimationFrame(animId);
  }, [isInterrupted, currentRecoverySec]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* 1. HERO HEADER: Flow State & The Evidence Base */}
      <div className="relative rounded-2xl bg-[#0b0d12] border border-white/[0.08] p-7 sm:p-10 overflow-hidden shadow-2xl bg-grid-pattern">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-widest font-semibold">Evidence-Informed Neuroscience</span>
              <span>·</span>
              <span className="text-zinc-500">Transient Hypofrontality</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
              The Neurobiology of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Flow State</span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              Flow is an empirically documented psychological and neurobiological state where <strong>the prefrontal cortex temporarily silences its inner critic</strong> (transient hypofrontality). Second-guessing dissolves, time dilates, and cognitive throughput surges—yet this hyper-focus is remarkably fragile.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Dr. Gloria Mark (UC Irvine) Interruption Cohorts
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sophie Leroy Attention Residue Model
              </span>
            </div>
          </div>

          {/* Quick Flow Soundscape Entrainment Player */}
          <div className="lg:col-span-5 bg-[#0e1117] border border-white/[0.08] p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-400 uppercase tracking-wider">Acoustic Shield</span>
              <span className="font-mono text-cyan-400 font-bold">9.5 Hz Borderline</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-white">
                Alpha-Theta Flow Synchronizer
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Binaural acoustic carrier frequency bridging conscious logic with subconscious intuition to guard against distracting auditory pings.
              </p>
            </div>

            <button
              onClick={toggleFlowAudio}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                isSimulatingAudio
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
            >
              {isSimulatingAudio ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Pause 9.5Hz Carrier</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream Flow Soundscape (9.5 Hz)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE FRAGILITY OF FLOW: 23-MINUTE PENALTY & REALISTIC INTERACTIVE REBUILDING BUFFER */}
      <div className="bg-[#0e1117] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>THE FRAGILITY OF FLOW: 23-MINUTE PENALTY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              A Single Notification Shatters Flow
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Research by Dr. Gloria Mark at UC Irvine shows that when a knowledge worker is interrupted by a message or notification, it takes an average of <strong>23 minutes and 15 seconds</strong> to regain the same depth of focus.
            </p>
          </div>

          {/* Interactive Trigger Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerDistraction}
              className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-98"
              title="Simulate sudden message ping"
            >
              <Bell className="w-3.5 h-3.5 fill-current animate-bounce" />
              <span>Simulate Notification Ping</span>
            </button>

            <button
              onClick={restoreFlow}
              className="py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30"
              title="Calibrate straight to deep flow"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-cyan-400" />
              <span>Restore Flow</span>
            </button>
          </div>
        </div>

        {/* Live Brain Canvas & EEG Oscilloscope Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Canvas: Live Brain State & Hypofrontality Visualizer */}
          <div className="lg:col-span-7 bg-[#07080b] border border-white/[0.08] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={420}
              height={260}
              className="w-full max-w-[420px] h-[240px]"
            />

            {/* Live State Label Overlay */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentPhase.eegColor }}
              />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {!isInterrupted || currentRecoverySec >= 1156 ? 'TRANSIENT HYPOFRONTALITY (FLOW)' : currentPhase.title.toUpperCase()}
              </span>
            </div>

            {/* Bottom Real-time Oscilloscope */}
            <div className="absolute bottom-3 right-4 bg-zinc-950/80 border border-white/[0.08] px-3 py-1.5 rounded-lg flex items-center gap-2">
              <canvas
                ref={eegCanvasRef}
                width={80}
                height={22}
                className="w-20 h-5"
              />
              <span className="text-[11px] font-mono font-bold" style={{ color: currentPhase.eegColor }}>
                {isInterrupted ? `${currentPhase.brainwaveHz} Hz (${currentPhase.brainwaveType})` : '9.5 Hz Alpha/Theta'}
              </span>
            </div>
          </div>

          {/* Right Column: Rebuilding Buffer Telemetry Cards */}
          <div className="lg:col-span-5 space-y-3">
            {/* Live Timer & Progress Clock */}
            <div className="bg-zinc-900/80 border border-white/[0.08] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">RECOVERY ELAPSED:</span>
                <span className="text-lg font-bold text-white">{formatTime(currentRecoverySec)} / 23:15</span>
              </div>

              {/* Progress Bar through 23:15 */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (currentRecoverySec / 1395) * 100)}%`,
                    backgroundColor: currentPhase.eegColor
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>00:00 (Ping)</span>
                <span>13:45 (Detour)</span>
                <span>23:15 (Flow)</span>
              </div>
            </div>

            {/* Working Memory Scratchpad Buffer Telemetry */}
            <div className="bg-zinc-900/60 border border-white/[0.06] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Working Memory Restored</span>
                <span className="font-mono text-cyan-400 font-bold">{currentPhase.workingMemoryBuffer}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${currentPhase.workingMemoryBuffer}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono">
                Prefrontal buffer capacity holding active task variables
              </span>
            </div>

            {/* Attention Residue Index */}
            <div className="bg-zinc-900/60 border border-white/[0.06] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Attention Residue (Distraction Drag)</span>
                <span className="font-mono text-rose-400 font-bold">{currentPhase.attentionResidue}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${currentPhase.attentionResidue}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono">
                Cognitive bandwidth stuck on the interruptive message
              </span>
            </div>
          </div>
        </div>

        {/* 3. DETAILED 4-PHASE REBUILDING BUFFER BREAKDOWN (Interactive Stepper) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-white tracking-tight">
              The 4 Cognitive Recovery Phases (Dr. Gloria Mark · UC Irvine Model)
            </h3>
            <span className="text-xs font-mono text-zinc-500">Click any phase to inspect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {RECOVERY_PHASES.map((phase) => {
              const isSelected = isInterrupted && currentRecoverySec >= phase.startSec && currentRecoverySec <= phase.endSec;

              return (
                <div
                  key={phase.id}
                  onClick={() => jumpToPhase(phase)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-zinc-900 border-white/[0.3] shadow-lg'
                      : 'bg-zinc-900/40 border-white/[0.06] hover:bg-zinc-900/70 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 font-bold">{phase.name}</span>
                      <span className="text-zinc-500">{phase.timeRange}</span>
                    </div>
                    <h4 className="text-sm font-display font-bold text-white leading-tight">
                      {phase.title}
                    </h4>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {phase.cognitiveMechanism}
                  </p>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Residue: {phase.attentionResidue}%</span>
                    <span style={{ color: phase.eegColor }} className="font-bold">
                      {phase.brainwaveType.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Phase Deep Scientific Insight Box */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 max-w-3xl">
              <div className="flex items-center gap-2 font-mono text-zinc-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-zinc-400">Grounding Research:</span>
                <span className="font-bold text-white">{currentPhase.researchCitation}</span>
              </div>
              <p className="text-zinc-400 text-xs">
                {currentPhase.cognitiveMechanism}
              </p>
            </div>

            <button
              onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
              className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.1] font-mono text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isTimelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <FastForward className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isTimelinePlaying ? 'Pause Simulation' : 'Fast-Forward Recovery'}</span>
            </button>
          </div>
        </div>

        {/* 4. REALISTIC FLOW DEFENSE PROTOCOLS (Evidence-Informed Cognitive Armor) */}
        <div className="bg-zinc-900/40 border border-white/[0.06] p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-semibold">Evidence-Informed Flow Armor</span>
          </div>
          <h3 className="text-base font-display font-bold text-white">
            How to Cut the 23-Minute Penalty to Under 4 Minutes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.04] space-y-1.5">
              <span className="font-bold text-white font-display block">
                1. Working Memory Bookmarks
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Before switching tabs or answering an urgent ping, jot down <strong>a 1-sentence note of your exact next planned keystroke</strong>. Research shows this "ready-to-resume" cue prevents working memory cache eviction, slashing recovery time from 23m 15s to 4m 12s.
              </p>
            </div>

            <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.04] space-y-1.5">
              <span className="font-bold text-white font-display block">
                2. The 15-Minute Flow Ramp Gate
              </span>
              <p className="text-zinc-400 leading-relaxed">
                The first 15 minutes of any deep work session are the most precarious. Neuroimaging proves the inner critic takes ~12–15 minutes of uninterrupted friction to down-regulate. Block all notifications during this ramp.
              </p>
            </div>

            <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.04] space-y-1.5">
              <span className="font-bold text-white font-display block">
                3. Batch Communications Synchrony
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Check Slack, email, and messages only in designated 15-minute bursts every 90 minutes. Eliminate "continuous partial attention"—the brain cannot sustain transient hypofrontality with real-time push notifications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. THE 4% SWEET SPOT: CHALLENGE VS SKILL MATRIX */}
      <div className="bg-[#0b0d12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>The Goldilocks Trigger</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            The 4% Challenge-Skill Rule (Csíkszentmihályi Matrix)
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Flow requires a razor-thin balance: if a task is too easy, you slip into boredom; if it is too hard, you drown in anxiety. The sweet spot is when the challenge pushes you exactly <strong>4% beyond your comfort zone</strong>.
          </p>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-5 bg-zinc-900/60 border border-white/[0.06] p-5 rounded-xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-semibold">Perceived Challenge Level</span>
                <span className="font-mono text-cyan-400 font-bold">{challengeLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={challengeLevel}
                onChange={e => setChallengeLevel(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-semibold">Your Current Skill Level</span>
                <span className="font-mono text-emerald-400 font-bold">{skillLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skillLevel}
                onChange={e => setSkillLevel(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-between text-[11px] font-mono text-zinc-500 border-t border-white/[0.04]">
              <span>Differential: {diff > 0 ? `+${diff}%` : `${diff}%`}</span>
              <button
                onClick={() => {
                  setSkillLevel(50);
                  setChallengeLevel(54);
                }}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Reset to 4% Flow Sweet Spot
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-[#0e1117] border border-white/[0.08] p-6 rounded-xl space-y-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Cognitive State Diagnosis:
            </span>
            <h3 className={`text-xl font-display font-bold ${flowZoneColor}`}>
              {flowZone}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {flowZoneDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 6. THE 25-MINUTE IMMERSION BLOCK TIMER (Deep Flow Protocol) */}
      <div className="bg-[#0e1117] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Uninterrupted Deep Work Block</span>
          </div>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            25-Minute Flow Protection Sprint
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Turn off your phone, close communication apps, and lock in for 25 uninterrupted minutes. Once you pass the 15-minute mark, your neurochemistry naturally enters flow.
          </p>
        </div>

        {/* Timer Display & Action */}
        <div className="flex items-center gap-4 bg-zinc-900/90 border border-white/[0.08] px-6 py-4 rounded-xl">
          <div className="text-center font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block">REMAINING</span>
            <span className="text-3xl font-black text-white tracking-widest">
              {formatTime(sessionSecondsRemaining)}
            </span>
          </div>

          <button
            onClick={() => setSessionTimerActive(!sessionTimerActive)}
            className={`py-3 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm ${
              sessionTimerActive
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-white hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            {sessionTimerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{sessionTimerActive ? 'Pause' : 'Start Flow Sprint'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
