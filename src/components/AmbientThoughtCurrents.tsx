import React, { useEffect, useState } from 'react';
import { ActiveTab } from '../types/neuro';

const NETWORK_PATHS = [
  'M70 235 C205 175 326 250 455 353',
  'M90 588 C240 616 330 456 455 353',
  'M235 83 C292 205 365 270 455 353',
  'M252 808 C318 642 375 492 455 353',
  'M455 353 C568 290 667 258 790 348',
  'M455 353 C570 421 673 472 790 485',
  'M790 348 C900 244 1008 274 1110 356',
  'M790 348 C903 371 1005 391 1110 356',
  'M790 485 C904 526 1002 501 1110 438',
  'M1110 356 C1210 286 1305 280 1390 218',
  'M1110 356 C1218 361 1298 416 1394 517',
  'M1110 438 C1220 502 1294 570 1392 665',
  'M235 83 C212 278 220 470 252 808',
  'M1390 218 C1420 350 1415 518 1392 665',
  'M455 353 C565 340 688 365 790 348',
  'M790 485 C884 435 1004 400 1110 356',
] as const;

const NETWORK_NODES = [
  [70, 235], [235, 83], [90, 588], [252, 808],
  [455, 353], [352, 244], [350, 518], [790, 348],
  [790, 485], [660, 295], [660, 457], [1110, 356],
  [1110, 438], [964, 287], [972, 408], [1220, 300],
  [1260, 440], [1390, 218], [1394, 517], [1392, 665],
] as const;

const CURRENT_MOODS: Record<ActiveTab, { speed: string; signalSpeed: string; intensity: number }> = {
  training: { speed: '25s', signalSpeed: '3.8s', intensity: 0.38 },
  flow: { speed: '42s', signalSpeed: '6.4s', intensity: 0.3 },
  soundscape: { speed: '48s', signalSpeed: '7.2s', intensity: 0.27 },
  tracker: { speed: '24s', signalSpeed: '3.6s', intensity: 0.35 },
  education: { speed: '18s', signalSpeed: '2.8s', intensity: 0.43 },
  rehab: { speed: '40s', signalSpeed: '6s', intensity: 0.28 },
  library: { speed: '32s', signalSpeed: '4.8s', intensity: 0.32 },
  community: { speed: '27s', signalSpeed: '4s', intensity: 0.37 },
  blueprint: { speed: '21s', signalSpeed: '3.2s', intensity: 0.4 },
};

interface AmbientThoughtCurrentsProps {
  activeTab: ActiveTab;
}

export function AmbientThoughtCurrents({ activeTab }: AmbientThoughtCurrentsProps) {
  const mood = CURRENT_MOODS[activeTab];
  const [motionAllowed, setMotionAllowed] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setMotionAllowed(!preference.matches);
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, []);

  const style = {
    '--current-speed': mood.speed,
    '--signal-speed': mood.signalSpeed,
    '--current-intensity': mood.intensity,
  } as React.CSSProperties;

  return (
    <svg
      className="ambient-thought-currents"
      data-current-section={activeTab}
      style={style}
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="thought-current-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8a0ff" />
          <stop offset="52%" stopColor="var(--theme-accent)" />
          <stop offset="100%" stopColor="#8edbd4" />
        </linearGradient>
        <filter id="thought-current-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g className="ambient-thought-currents__network">
        {NETWORK_PATHS.map((path, pathIndex) => (
          <g key={path}>
            <path className="ambient-thought-currents__axon-glow" d={path} />
            <path className="ambient-thought-currents__axon" d={path} />
            {motionAllowed && [0, 1].map(pulse => (
              <circle
                key={`${path}-${pulse}`}
                className="ambient-thought-currents__firing-signal"
                r={pulse === 0 ? 3 : 2.2}
                style={pulse ? { opacity: 0.7 } : undefined}
              >
                <animateMotion
                  dur={mood.signalSpeed}
                  begin={`${-(pulse * 0.5 + (pathIndex % 4) * 0.3)}s`}
                  repeatCount="indefinite"
                  path={path}
                  rotate="auto"
                />
              </circle>
            ))}
          </g>
        ))}
        {NETWORK_NODES.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            className="ambient-thought-currents__node"
            cx={cx}
            cy={cy}
            r={index % 4 === 0 ? 4 : 2.8}
            style={{ animationDelay: `${(index % 7) * -0.38}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
