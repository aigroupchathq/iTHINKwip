import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Zap, ArrowRight, Play, Compass, Activity, Brain } from 'lucide-react';
import { CognitiveChallengeType } from '../../types/neuro';
import { audioEngine, SoundMode } from '../../utils/audioEngine';

interface CircadianWindow {
  startHour: number;
  endHour: number;
  periodName: string;
  neurochemicalState: string;
  primaryCircuit: string;
  recommendedChallenge: CognitiveChallengeType;
  challengeTitle: string;
  recommendedSound: SoundMode;
  soundLabel: string;
  scientificGuidance: string;
}

const CIRCADIAN_WINDOWS: CircadianWindow[] = [
  {
    startHour: 6,
    endHour: 10,
    periodName: 'Cortisol Awakening & Dopamine Rise',
    neurochemicalState: 'High Norepinephrine / Rapid Alertness',
    primaryCircuit: 'Anterior Cingulate & Prefrontal Filter',
    recommendedChallenge: 'stroop',
    challengeTitle: 'Color Contrast Focus',
    recommendedSound: 'gamma',
    soundLabel: '40 Hz Peak Focus Wave',
    scientificGuidance: 'Your dopamine and cortisol levels peak early in the morning, making your visual gating system most receptive to training inhibitory control.'
  },
  {
    startHour: 10,
    endHour: 13,
    periodName: 'Prefrontal Analytical Peak',
    neurochemicalState: 'Maximum Prefrontal Glucose Metabolism',
    primaryCircuit: 'Dorsolateral Prefrontal Cortex (DLPFC)',
    recommendedChallenge: 'nback',
    challengeTitle: 'Dual N-Back Memory',
    recommendedSound: 'alpha',
    soundLabel: '10 Hz Calm Flow Wave',
    scientificGuidance: 'Working memory capacity reaches daily optimum late morning. Ideal window for multi-threaded cognitive retention and fluid logic.'
  },
  {
    startHour: 13,
    endHour: 16,
    periodName: 'Adenosine Lull & Somatic Reset',
    neurochemicalState: 'Adenosine Build-Up / Parasympathetic Pull',
    primaryCircuit: 'Default Mode Network & Autonomic Balance',
    recommendedChallenge: 'trailmaking',
    challengeTitle: 'Trail Path Switcher',
    recommendedSound: 'theta',
    soundLabel: '6 Hz Mindful Reset Wave',
    scientificGuidance: 'Mid-afternoon dip in core temperature and circadian alertness. Avoid brute-force tasks; pair gentle switching trails with theta soundscapes.'
  },
  {
    startHour: 16,
    endHour: 20,
    periodName: 'Secondary Executive & Motor Peak',
    neurochemicalState: 'Serotonergic Stabilization / Fast Reflexes',
    primaryCircuit: 'Striatal Motor Pathways & Basal Ganglia',
    recommendedChallenge: 'gonogo',
    challengeTitle: 'Action & Pause Challenge',
    recommendedSound: 'pink',
    soundLabel: 'Pink Noise Masking',
    scientificGuidance: 'Reaction speed and physical coordination reach an evening summit. Ideal for refining rapid motor suppression and impulse brakes.'
  },
  {
    startHour: 20,
    endHour: 24,
    periodName: 'Melatonin Onset & Synaptic Downscaling',
    neurochemicalState: 'Melatonin Secretion / SWS Preparation',
    primaryCircuit: 'Glymphatic Brain Clearance & Hippocampus',
    recommendedChallenge: 'trailmaking',
    challengeTitle: 'Gentle Relaxation Trail',
    recommendedSound: 'delta',
    soundLabel: '2.5 Hz Deep Sleep Prep Wave',
    scientificGuidance: 'Synaptic homeostasis requires clearing metabolic debris. Wind down with slow-wave acoustic entrainment and avoid high-intensity screens.'
  }
];

interface CircadianFocusEngineProps {
  onSelectChallenge: (type: CognitiveChallengeType) => void;
  onOpenSoundscape?: () => void;
}

export const CircadianFocusEngine: React.FC<CircadianFocusEngineProps> = ({
  onSelectChallenge,
  onOpenSoundscape
}) => {
  // Current real-world hour or user simulated hour
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    return new Date().getHours();
  });
  const [isLiveClock, setIsLiveClock] = useState(true);

  // Sync to real clock if live
  useEffect(() => {
    if (!isLiveClock) return;
    const interval = setInterval(() => {
      setSelectedHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  // Find active circadian window
  const activeWindow = CIRCADIAN_WINDOWS.find(
    w => selectedHour >= w.startHour && selectedHour < w.endHour
  ) || CIRCADIAN_WINDOWS[0];

  const handleStartSound = (mode: SoundMode) => {
    if (mode !== 'off') {
      audioEngine.playBinaural(220, mode === 'gamma' ? 40 : mode === 'alpha' ? 10 : mode === 'theta' ? 6 : 2.5, mode);
    }
    if (onOpenSoundscape) onOpenSoundscape();
  };

  return (
    <div className="bg-[#0e1117] border border-white/[0.08] rounded-xl p-6 sm:p-7 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Circadian Neuro-Architecture</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Today's Biological Focus Rhythm
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Human executive function shifts throughout the day according to cortisol, dopamine, and adenosine levels. Align your cognitive sessions with your natural biological window.
          </p>
        </div>

        {/* Live Clock / Simulation Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/[0.06] px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300">
            {selectedHour >= 6 && selectedHour < 18 ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{String(selectedHour).padStart(2, '0')}:00 {selectedHour >= 12 ? 'PM' : 'AM'}</span>
          </div>

          <button
            onClick={() => {
              setIsLiveClock(true);
              setSelectedHour(new Date().getHours());
            }}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition cursor-pointer ${
              isLiveClock
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {isLiveClock ? 'Live Time' : 'Reset to Live'}
          </button>
        </div>
      </div>

      {/* Circadian Timeline Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>06:00 (Wake)</span>
          <span>12:00 (Noon)</span>
          <span>18:00 (Dusk)</span>
          <span>24:00 (Sleep)</span>
        </div>

        {/* Interactive Timeline Slider */}
        <input
          type="range"
          min="6"
          max="23"
          step="1"
          value={selectedHour}
          onChange={e => {
            setIsLiveClock(false);
            setSelectedHour(parseInt(e.target.value, 10));
          }}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
        />

        {/* Time bracket markers */}
        <div className="grid grid-cols-5 gap-1 pt-1 text-[11px] font-medium text-zinc-500">
          <span className={activeWindow.startHour === 6 ? 'text-amber-400 font-bold' : ''}>06–10h Dawn</span>
          <span className={activeWindow.startHour === 10 ? 'text-amber-400 font-bold' : ''}>10–13h Peak</span>
          <span className={activeWindow.startHour === 13 ? 'text-amber-400 font-bold' : ''}>13–16h Reset</span>
          <span className={activeWindow.startHour === 16 ? 'text-amber-400 font-bold' : ''}>16–20h Motor</span>
          <span className={activeWindow.startHour === 20 ? 'text-amber-400 font-bold' : ''}>20–24h Rest</span>
        </div>
      </div>

      {/* Active Prescription Card */}
      <div className="bg-[#090b0e] border border-white/[0.08] rounded-xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Current Optimal Window</span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">{activeWindow.startHour}:00 – {activeWindow.endHour}:00</span>
          </div>

          <h3 className="text-xl font-display font-bold text-white">
            {activeWindow.periodName}
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
            {activeWindow.scientificGuidance}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-400 font-mono">
            <span>Circuit: <strong className="text-zinc-200">{activeWindow.primaryCircuit}</strong></span>
            <span>·</span>
            <span>State: <strong className="text-zinc-200">{activeWindow.neurochemicalState}</strong></span>
          </div>
        </div>

        {/* Prescription Actions */}
        <div className="bg-zinc-900/60 border border-white/[0.06] p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Prescribed Workout:
            </span>
            <h4 className="text-sm font-bold text-white">
              {activeWindow.challengeTitle}
            </h4>
            <span className="text-xs text-zinc-400 block">
              Frequency: {activeWindow.soundLabel}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => onSelectChallenge(activeWindow.recommendedChallenge)}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Prescribed Exercise
            </button>
            <button
              onClick={() => handleStartSound(activeWindow.recommendedSound)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Play {activeWindow.soundLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
