import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Clock, 
  Activity, 
  Wind, 
  Info,
  Waves
} from 'lucide-react';
import { audioEngine, SOUND_PRESETS, SoundMode } from '../utils/audioEngine';

export const NeuroAudioStudio: React.FC = () => {
  const [activeMode, setActiveMode] = useState<SoundMode>('off');
  const [volume, setVolume] = useState<number>(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(25);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Top-off Inhale' | 'Hold' | 'Slow Exhale'>('Inhale');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = Object.values(SOUND_PRESETS);

  // Synchronize audio playing
  const handleToggleSound = (mode: SoundMode) => {
    if (activeMode === mode) {
      // Turn off
      audioEngine.stop();
      setActiveMode('off');
      setIsTimerRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else {
      // Switch mode
      const preset = SOUND_PRESETS[mode as Exclude<SoundMode, 'off'>];
      if (!preset) return;

      if (mode === 'pink' || mode === 'brown') {
        audioEngine.playNoise(mode);
      } else {
        audioEngine.playBinaural(preset.baseFreq, preset.frequencyDelta, mode);
      }
      audioEngine.setVolume(isMuted ? 0 : volume);
      setActiveMode(mode);
      setRemainingSeconds(timerMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const handleStopAll = () => {
    audioEngine.stop();
    setActiveMode('off');
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (!isMuted) {
      audioEngine.setVolume(newVol);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && activeMode !== 'off') {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            handleStopAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeMode]);

  // Physiological Sigh / Breath Pacer Loop (Inhale 4s, Top-off 1s, Exhale 7s)
  useEffect(() => {
    let breathTick = 0;
    breathIntervalRef.current = setInterval(() => {
      breathTick = (breathTick + 1) % 12;
      if (breathTick < 4) {
        setBreathPhase('Inhale');
      } else if (breathTick < 5) {
        setBreathPhase('Top-off Inhale');
      } else if (breathTick < 6) {
        setBreathPhase('Hold');
      } else {
        setBreathPhase('Slow Exhale');
      }
    }, 1000);

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  // Real-Time Canvas Waveform / Frequency visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const analyser = audioEngine.getAnalyser();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && activeMode !== 'off') {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / (bufferLength / 2)) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength / 2; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4'); // cyan
          gradient.addColorStop(1, '#6366f1'); // indigo

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        // Idle gentle wave
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = canvas.height / 2;
        ctx.moveTo(0, midY);
        for (let i = 0; i < canvas.width; i++) {
          ctx.lineTo(i, midY + Math.sin(i * 0.05) * 2);
        }
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeMode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Headphones className="w-4 h-4" />
              <span>Calming & Focus Soundscapes</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Focus & Relaxation Audio Studio</h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Gentle sound frequencies and soothing soundscapes crafted to help you settle in, whether you're tackling high-focus work or winding down after a stressful day. For binaural beats, pop on a pair of regular headphones.
            </p>
          </div>

          {/* Quick status box */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${activeMode !== 'off' ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'}`} />
            <div>
              <span className="text-[11px] text-slate-500 block uppercase">Sound Status</span>
              <span className="text-sm font-bold text-white">
                {activeMode !== 'off' ? SOUND_PRESETS[activeMode].name : 'Ready to play'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Console: Visualizer + Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <canvas
              ref={canvasRef}
              width={260}
              height={50}
              className="bg-slate-950 border border-slate-800 rounded-lg w-full md:w-[260px] h-[50px]"
            />
            {activeMode !== 'off' && (
              <span className="text-xs text-cyan-400 font-mono flex items-center gap-1 shrink-0">
                <Waves className="w-3.5 h-3.5 animate-pulse" /> Generating Audio
              </span>
            )}
          </div>

          {/* Master Controls: Volume & Timer */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Volume Slider */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
              <button
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs text-slate-400 font-mono w-7 text-right">
                {isMuted ? 0 : Math.round(volume * 100)}%
              </span>
            </div>

            {/* Session Timer */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-white font-bold">{formatTime(remainingSeconds)}</span>
              {activeMode !== 'off' && (
                <button
                  onClick={handleStopAll}
                  className="ml-2 px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[11px] border border-rose-500/30 cursor-pointer flex items-center gap-1"
                >
                  <Square className="w-3 h-3 fill-current" /> Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Frequency Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map(p => {
            const isPlaying = activeMode === p.id;
            return (
              <div
                key={p.id}
                className={`border rounded-xl p-5 transition flex flex-col justify-between ${
                  isPlaying
                    ? 'bg-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400 font-mono">
                      {p.targetWave}
                    </span>
                    {isPlaying && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="text-slate-500 block">Biological Action:</span>
                    {p.benefits}
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => handleToggleSound(p.id)}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isPlaying
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Play Soundscape
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guided NSDR / Physiological Sigh Visual Pacer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Soothing Breath Guide (Physiological Sigh)</h3>
              <p className="text-xs text-slate-400">Two quick inhales followed by a long, slow exhale to help calm your nervous system in under 60 seconds</p>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/10">
            {breathPhase}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animated Pulsing Ring */}
          <div
            className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${
              breathPhase === 'Inhale'
                ? 'scale-110 border-indigo-400 bg-indigo-500/10'
                : breathPhase === 'Top-off Inhale'
                ? 'scale-125 border-cyan-400 bg-cyan-500/20'
                : breathPhase === 'Hold'
                ? 'scale-125 border-amber-400 bg-amber-500/10'
                : 'scale-90 border-slate-600 bg-slate-800/20'
            }`}
          >
            <span className="text-xs font-bold text-white text-center px-2">
              {breathPhase}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-6 text-center max-w-md">
            Breathe along with the circle. Take two gentle breaths in through your nose, then a slow, relaxed sigh out through your mouth. It's the fastest natural way to lower stress and regain clear focus.
          </p>
        </div>
      </div>
    </div>
  );
};
