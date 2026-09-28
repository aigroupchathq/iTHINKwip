import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  Eye,
  Network,
  Pause,
  Play,
  Sparkles,
  Waypoints,
  X,
} from 'lucide-react';

const Brain3DScene = lazy(() =>
  import('./Brain3DScene').then(module => ({ default: module.Brain3DScene })),
);

interface NeuralJourneyProps {
  onOpenFlowLab: () => void;
  onStartExercise: () => void;
}

const JOURNEY_STAGES = [
  {
    id: 'brain',
    label: 'Whole Brain',
    navLabel: 'Whole brain',
    eyebrow: '01 · WHOLE BRAIN',
    title: 'Signals spark, travel, and connect.',
    description: 'Watch activity appear across brain regions, then pass along colorful pathways to other regions.',
    note: 'Thoughts are not one signal from one spot. This is an educational animation, not a brain scan.',
    color: '#c6a4ff',
    icon: Brain,
    science: {
      summary: 'Neurons signal within cells and communicate across connections; thoughts emerge from activity distributed across many cells and regions.',
      steps: [
        'Electrical impulses travel along individual neurons.',
        'Neurons pass messages to other cells at synapses.',
        'Many changing connections work together in brain circuits.',
      ],
      caveat: 'The glowing paths are a teaching metaphor, not a recorded thought or a complete map of brain wiring.',
      sources: [
        { label: 'OpenStax: Communication Between Neurons', href: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons' },
      ],
    },
  },
  {
    id: 'network',
    label: 'Brain Networks',
    navLabel: 'Networks',
    eyebrow: '02 · BRAIN NETWORKS',
    title: 'Signals move through networks.',
    description: 'Attention and working memory involve communication between regions, shaped by the task and the person.',
    note: 'This network view is conceptual, not a live brain scan.',
    color: '#b6a5ff',
    icon: Network,
    science: {
      summary: 'A brain network is a group of regions whose activity coordinates as a task unfolds. Networks can overlap and change; they are not isolated modules.',
      steps: [
        'Different regions contribute specialized kinds of processing.',
        'Their activity can coordinate through connected pathways.',
        'The pattern shifts with context, task, and the individual.',
      ],
      caveat: 'The colors name broad research concepts. They do not show fixed boundaries or a measured network in your brain.',
      sources: [
        { label: 'Menon: Large-scale brain networks and psychopathology', href: 'https://pubmed.ncbi.nlm.nih.gov/21459142/' },
      ],
    },
  },
  {
    id: 'highways',
    label: 'Neural Highways',
    navLabel: 'Highways',
    eyebrow: '03 · NEURAL HIGHWAYS',
    title: 'Signals travel along neural pathways.',
    description: 'Neurons pass electrical signals along axons and communicate with other cells, linking activity across the nervous system.',
    note: 'The pathways shown are illustrative, not a map of one person’s brain.',
    color: '#ffbd82',
    icon: Activity,
    science: {
      summary: 'An action potential is a brief electrical change that travels along one neuron’s axon; it does not travel as one continuous signal from brain region to brain region.',
      steps: [
        'A neuron generates an electrical impulse.',
        'The impulse propagates along its axon; myelin can speed conduction.',
        'At the axon ending, the neuron can signal another cell at a synapse.',
      ],
      caveat: 'The illustrated axon is one cell’s route. Real brain pathways involve many neurons and connections.',
      sources: [
        { label: 'OpenStax: The Action Potential', href: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential' },
        { label: 'OpenStax: Communication Between Neurons', href: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons' },
      ],
    },
  },
  {
    id: 'synapse',
    label: 'Synapse Level',
    navLabel: 'Synapse',
    eyebrow: '04 · SYNAPSE LEVEL',
    title: 'A message crosses a tiny gap.',
    description: 'The sending cell releases chemical messengers into the synaptic gap. They bind to receptors on the receiving cell and can change its activity.',
    note: 'Sending cell → synaptic gap → receiving cell.',
    color: '#75bcff',
    icon: Waypoints,
    science: {
      summary: 'At many synapses, an arriving impulse triggers neurotransmitter release. The receiving cell’s receptors turn that chemical message into a change in cell activity.',
      steps: [
        'The impulse reaches the sending cell’s ending.',
        'Neurotransmitters cross the synaptic gap.',
        'Receptors respond; the effect depends on the receptor and circuit.',
      ],
      caveat: 'This cutaway shows a common chemical synapse. Some synapses communicate electrically, and chemical effects are more varied than a simple on/off switch.',
      sources: [
        { label: 'OpenStax: Communication Between Neurons', href: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons' },
      ],
    },
  },
  {
    id: 'flow',
    label: 'Flow State Simulation',
    navLabel: 'Flow',
    eyebrow: '05 · FLOW STATE SIMULATION',
    title: 'Flow has no single brainwave frequency.',
    description: 'Brain rhythms overlap and shift with task, brain region, and person. Researchers have not identified one EEG frequency that defines flow.',
    note: 'EEG bands are broad, overlapping ranges. This illustration does not measure brain activity or identify a flow state.',
    color: '#83e5c2',
    icon: Sparkles,
    science: {
      summary: 'Flow describes an experience of deep involvement, not a single brain switch. Research explores how attention, motivation, and brain dynamics may interact.',
      steps: [
        'A person becomes strongly engaged in an activity.',
        'Brain activity continues across multiple regions and timescales.',
        'Researchers are still testing how these patterns relate to reported flow.',
      ],
      caveat: 'This is a visual metaphor, not a flow detector. No single pathway, brain rhythm, or score can establish that someone is in flow.',
      sources: [
        { label: 'Kotler et al.: First few seconds for flow (review and proposal)', href: 'https://pubmed.ncbi.nlm.nih.gov/36368525/' },
      ],
    },
  },
] as const;

type JourneyStage = (typeof JOURNEY_STAGES)[number]['id'];
type FlowPhase = 'distracted' | 'attention' | 'focus' | 'flow';

const FLOW_PHASES: ReadonlyArray<{ id: FlowPhase; label: string; description: string }> = [
  { id: 'distracted', label: 'Distraction', description: 'Competing signals' },
  { id: 'attention', label: 'Attention', description: 'Patterns emerge' },
  { id: 'focus', label: 'Deep focus', description: 'Activity coordinates' },
  { id: 'flow', label: 'Flow', description: 'More coordinated activity' },
];

const THOUGHT_SIMULATION_STEPS = [
  {
    label: 'A signal sparks',
    description: 'Brain activity is distributed. This single bright pulse is a visual simplification.',
  },
  {
    label: 'A thought takes shape',
    description: 'This preset phrase was written for the demo. Some thoughts arise before we choose them; this animation does not recreate or reveal that process.',
  },
  {
    label: 'You notice it',
    description: 'Try naming it “a thought” and notice it without following its story.',
  },
  {
    label: 'Attention returns',
    description: 'Let the phrase fade, then choose to return to a sound, a breath, or your task.',
  },
] as const;

const FLOW_BANDS = [
  { name: 'Delta', range: '0.5–4 Hz', cycles: 2, color: '#9585ff', detail: 'Very slow; stronger in deep sleep.' },
  { name: 'Theta', range: '4–8 Hz', cycles: 6, color: '#65c8ff', detail: 'Often linked with memory and inward focus.' },
  { name: 'Alpha', range: '8–13 Hz', cycles: 10, color: '#5fe0c1', detail: 'Often seen in relaxed wakefulness.' },
  { name: 'Beta', range: '13–30 Hz', cycles: 20, color: '#ffc26f', detail: 'Common during alert thinking and movement.' },
  { name: 'Gamma', range: '≈30–80+ Hz', cycles: 40, color: '#ff83bd', detail: 'Fast activity; research definitions vary.' },
] as const;

const FLOW_NETWORKS = [
  { name: 'Default mode', color: '#9585ff' },
  { name: 'Executive control', color: '#55d9ff' },
  { name: 'Salience', color: '#ffc26f' },
  { name: 'Reward', color: '#f4f7ff' },
] as const;

function makeWavePath(cycles: number) {
  const samples = cycles * 12;
  return Array.from({ length: samples + 1 }, (_, index) => {
    const x = (index / samples) * 120;
    const y = 12 - Math.sin((index / samples) * Math.PI * 2 * cycles) * 7;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function FlowFrequencyGuide() {
  return (
    <section className="neural-journey__flow-guide" aria-labelledby="flow-frequency-title">
      <div className="neural-journey__flow-guide-heading">
        <div>
          <span className="neural-journey__flow-guide-kicker">BRAIN RHYTHMS, MADE SIMPLE</span>
          <h3 id="flow-frequency-title">Your brain uses many rhythms</h3>
          <p>EEG records electrical rhythms. Hz means cycles per second—not a literal brain vibration.</p>
        </div>
        <span className="neural-journey__flow-guide-unit">Hz = cycles per second</span>
      </div>
      <div className="neural-journey__flow-bands">
        {FLOW_BANDS.map(band => (
          <article className="neural-journey__flow-band" key={band.name} style={{ '--band-color': band.color } as React.CSSProperties}>
            <div className="neural-journey__flow-band-heading">
              <span>{band.name}</span>
              <strong>{band.range}</strong>
            </div>
            <svg className="neural-journey__flow-wave" viewBox="0 0 120 24" role="img" aria-label={`Illustrative ${band.name} rhythm waveform`}>
              <path d={makeWavePath(band.cycles)} />
            </svg>
            <p>{band.detail}</p>
          </article>
        ))}
      </div>
      <div className="neural-journey__flow-network-key" aria-label="Conceptual network color key">
        <span>NETWORK TRANSMISSION</span>
        {FLOW_NETWORKS.map(network => (
          <span className="neural-journey__flow-network-item" key={network.name}>
            <i style={{ backgroundColor: network.color, '--network-color': network.color } as React.CSSProperties} />
            {network.name}
          </span>
        ))}
      </div>
      <p className="neural-journey__flow-caveat">
        The waves and colors are illustrations, not measurements. Bands overlap, and no single frequency tells you that someone is in flow.
      </p>
    </section>
  );
}

function NetworkColorKey() {
  return (
    <div className="neural-journey__network-color-key" role="group" aria-label="Illustrative brain network colors">
      <span className="neural-journey__network-color-key-title">COLOR KEY · CONCEPTUAL NETWORKS</span>
      {FLOW_NETWORKS.map(network => (
        <span className="neural-journey__flow-network-item" key={network.name}>
          <i style={{ backgroundColor: network.color, '--network-color': network.color } as React.CSSProperties} />
          {network.name}
        </span>
      ))}
    </div>
  );
}

const BRAIN_FIBERS = [
  'M174 274 C250 228 304 248 362 286',
  'M190 350 C260 312 313 327 379 359',
  'M254 189 C276 241 270 295 252 344',
  'M348 201 C326 253 334 305 361 343',
  'M388 250 C432 274 452 310 441 355',
  'M215 405 C278 378 330 390 379 424',
];

const NETWORK_PATHS = [
  'M166 290 C247 207 314 250 380 295',
  'M166 290 C229 340 298 367 380 295',
  'M380 295 C440 222 518 232 592 292',
  'M380 295 C445 362 518 365 592 292',
  'M166 290 C246 420 441 421 592 292',
  'M272 235 C319 280 324 331 298 379',
  'M473 232 C437 279 438 330 473 367',
  'M272 235 C359 188 432 187 473 232',
];

function SignalParticles({ color, count = 3, playing }: { color: string; count?: number; playing: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <circle
          key={index}
          r={index === 0 ? 5 : 3.5}
          fill={color}
          className="neural-journey__particle"
        >
          {playing && (
            <animateMotion
              dur={`${3.8 + index * 0.45}s`}
              begin={`${-index * 0.9}s`}
              repeatCount="indefinite"
              path={NETWORK_PATHS[index % NETWORK_PATHS.length]}
            />
          )}
        </circle>
      ))}
    </>
  );
}

function BrainScene({ color, playing }: { color: string; playing: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="brain-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c8bff" stopOpacity=".48" />
          <stop offset="52%" stopColor="#4c8fbd" stopOpacity=".2" />
          <stop offset="100%" stopColor="#142c4e" stopOpacity=".76" />
        </linearGradient>
        <radialGradient id="brain-glow">
          <stop stopColor={color} stopOpacity=".42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id="brain-blur">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <ellipse cx="385" cy="308" rx="225" ry="170" fill="url(#brain-glow)" filter="url(#brain-blur)" />
      <path
        d="M168 309c-12-30 1-61 23-79-7-34 18-63 49-69 12-31 46-45 76-34 21-28 60-30 84-9 31-17 69-5 84 24 35-1 61 28 56 62 27 19 33 56 12 82 15 32-4 70-36 78-8 32-42 52-74 39-24 22-61 17-78-8-31 10-65-6-75-36-37 0-65-27-62-60-29-3-51-26-59-90z"
        transform="translate(0 15)"
        fill="url(#brain-fill)"
        stroke="rgba(187,222,255,.62)"
        strokeWidth="2"
      />
      <path d="M220 248c26-36 66-39 91-10 16 19 14 46-2 64-15 17-42 20-61 7m66-153c-19 15-21 39-6 55 12 13 32 16 48 8m-9 54c-1-25 18-43 42-41 22 2 35 21 30 42-4 19-23 32-43 27m-156 52c9-26 34-39 58-29 20 9 29 32 18 51m69 13c-9-26 5-51 30-56 22-4 42 11 44 33m-13-126c18-24 47-29 69-13 17 12 23 35 14 53m-173 98c23-13 48-8 60 13 10 17 5 39-11 51m102-44c-9-24 1-47 23-55 20-7 42 3 49 23"
        fill="none"
        stroke="rgba(202,220,255,.28)"
        strokeWidth="2"
      />
      {BRAIN_FIBERS.map((path, index) => (
        <path key={path} d={path} fill="none" stroke={color} strokeOpacity={index % 2 ? '.25' : '.43'} strokeWidth="1.2" />
      ))}
      {[ [210,294], [277,249], [347,290], [409,271], [274,366], [363,380], [448,336] ].map(([cx, cy], index) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="19" fill={color} opacity=".09" />
          <circle cx={cx} cy={cy} r={index % 2 ? 4 : 5} fill={color} className="neural-journey__node" style={{ animationDelay: `${index * 180}ms` }} />
        </g>
      ))}
      <path d="M195 370 C280 263 356 306 452 328" fill="none" stroke={color} strokeOpacity=".35" strokeWidth="1.5" />
      <circle r="5" fill="#e8ffff">
        {playing && <animateMotion dur="4s" repeatCount="indefinite" path="M195 370 C280 263 356 306 452 328" />}
      </circle>
      <text x="180" y="475" className="neural-journey__svg-label">DISTRIBUTED ACTIVITY · CONCEPTUAL</text>
    </>
  );
}

function NetworkScene({ color, playing }: { color: string; playing: boolean }) {
  const nodes = [
    [166, 290], [272, 235], [298, 379], [380, 295], [473, 232], [473, 367], [592, 292],
  ];
  return (
    <>
      <defs>
        <radialGradient id="network-glow">
          <stop stopColor={color} stopOpacity=".34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="380" cy="300" r="220" fill="url(#network-glow)" />
      {NETWORK_PATHS.map(path => (
        <path key={path} d={path} fill="none" stroke={color} strokeOpacity=".28" strokeWidth="1.5" />
      ))}
      <g className="neural-journey__signal-layer">
        <SignalParticles color={color} count={7} playing={playing} />
      </g>
      {nodes.map(([cx, cy], index) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="29" fill={color} opacity=".08" />
          <circle cx={cx} cy={cy} r={index === 3 ? 10 : 7} fill={color} className="neural-journey__node" style={{ animationDelay: `${index * 140}ms` }} />
          <circle cx={cx} cy={cy} r="2.5" fill="white" />
        </g>
      ))}
      <text x="214" y="455" className="neural-journey__svg-label">COMMUNICATION BETWEEN SYSTEMS</text>
    </>
  );
}

function NeuronScene({ color, playing }: { color: string; playing: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="highway-brain-fill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b6a5ff" stopOpacity=".28" />
          <stop offset="100%" stopColor="#5c77bc" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="highway-axon" x1="0" x2="1">
          <stop stopColor="#b6a5ff" />
          <stop offset="52%" stopColor={color} />
          <stop offset="100%" stopColor="#78e8df" />
        </linearGradient>
        <filter id="highway-glow">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <ellipse cx="390" cy="240" rx="330" ry="205" fill={color} opacity=".035" />

      <text x="380" y="74" className="neural-journey__diagram-kicker">FROM BRAIN REGION TO SINGLE CELL</text>
      <path
        d="M47 206c-7-19 2-38 17-49-5-23 12-43 34-47 9-22 33-31 54-23 15-20 42-21 59-6 22-12 48-4 58 17 24-1 42 20 39 43 19 13 23 39 8 57 10 22-3 48-25 53-6 22-29 36-51 27-17 16-42 12-54-6-21 7-45-4-52-25-25 0-45-18-43-41-20-2-35-18-40-61z"
        fill="url(#highway-brain-fill)"
        stroke="rgba(205,216,255,.55)"
        strokeWidth="2"
      />
      <path d="M79 160c18-25 45-27 63-7 11 13 10 32-2 44-11 12-29 14-42 5m70-105c-13 10-14 27-4 38 9 9 22 11 33 5m-8 38c-1-17 12-30 29-28 15 1 24 14 21 29-3 13-16 22-30 19m-110 24c7-18 23-27 40-20 14 6 20 22 12 35m48 9c-6-18 3-35 21-38 15-3 29 8 30 23m-9-88c12-16 32-20 47-9 12 8 16 24 10 36"
        fill="none"
        stroke="rgba(209,220,255,.3)"
        strokeWidth="2"
      />
      <circle cx="163" cy="183" r="23" fill={color} opacity=".12" />
      <circle cx="163" cy="183" r="8" fill={color} />
      <path d="M163 183 C220 183 250 196 291 211" fill="none" stroke={color} strokeOpacity=".2" strokeWidth="11" strokeLinecap="round" filter="url(#highway-glow)" />
      <path d="M163 183 C220 183 250 196 291 211" fill="none" stroke={color} strokeOpacity=".8" strokeWidth="2" strokeDasharray="5 6" />
      {playing && (
        <circle r="5" fill="#efffff">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M163 183 C220 183 250 196 291 211" />
        </circle>
      )}

      <path d="M291 211 C319 212 332 206 354 203" fill="none" stroke="rgba(211,220,255,.75)" strokeWidth="5" strokeLinecap="round" />
      <path d="M309 211 C322 173 343 151 365 138 M314 212 C339 235 347 261 358 282" fill="none" stroke="rgba(211,220,255,.72)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="390" cy="210" r="48" fill={color} opacity=".1" filter="url(#highway-glow)" />
      <circle cx="390" cy="210" r="34" fill="#26314f" stroke="rgba(222,230,255,.82)" strokeWidth="2" />
      <circle cx="390" cy="210" r="11" fill={color} opacity=".85" />

      <path d="M423 210 C490 210 550 210 653 210" fill="none" stroke="rgba(186,200,230,.19)" strokeWidth="26" strokeLinecap="round" />
      <path d="M423 210 C490 210 550 210 653 210" fill="none" stroke="url(#highway-axon)" strokeWidth="3" strokeLinecap="round" />
      {[454, 493, 532, 571, 610].map(x => (
        <g key={x}>
          <rect x={x} y="198" width="27" height="24" rx="10" fill="#76d7d5" fillOpacity=".16" stroke="rgba(143,232,225,.68)" strokeWidth="1.5" />
          <line x1={x + 31} y1="194" x2={x + 31} y2="226" stroke="rgba(10,18,42,.9)" strokeWidth="4" />
        </g>
      ))}
      {playing && (
        <circle r="6" fill="#efffff">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M423 210 C490 210 550 210 653 210" />
        </circle>
      )}
      <path d="M653 210c19-26 34-30 47-20m-47 20c20-5 37-5 53 4m-53-4c18 15 28 24 44 21" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

      <text x="148" y="327" className="neural-journey__diagram-label">BRAIN REGION</text>
      <text x="390" y="330" className="neural-journey__diagram-label">CELL BODY</text>
      <text x="541" y="261" className="neural-journey__diagram-label">MYELIN SHEATHS</text>
      <text x="540" y="298" className="neural-journey__diagram-label">AXON · SIGNAL TRAVELS THIS WAY →</text>
      <text x="388" y="405" className="neural-journey__diagram-caption">One neuron carries an electrical impulse along its axon.</text>
      <text x="388" y="430" className="neural-journey__diagram-caption">At the next connection, the message may pass to another cell.</text>
    </>
  );
}

function SynapseScene({ color, playing }: { color: string; playing: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="synapse-sending" x1="0" x2="1">
          <stop stopColor="#b6a5ff" stopOpacity=".34" />
          <stop offset="100%" stopColor="#b6a5ff" stopOpacity=".15" />
        </linearGradient>
        <linearGradient id="synapse-receiving" x1="0" x2="1">
          <stop stopColor="#75bcff" stopOpacity=".12" />
          <stop offset="100%" stopColor="#75bcff" stopOpacity=".34" />
        </linearGradient>
        <filter id="synapse-glow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <text x="380" y="52" className="neural-journey__diagram-kicker">HOW ONE NEURON SIGNALS THE NEXT</text>

      <path d="M35 167 C128 167 205 173 277 194 Q300 201 300 226 L300 290 Q300 315 277 322 C205 344 128 350 35 350Z" fill="url(#synapse-sending)" stroke="rgba(206,193,255,.68)" strokeWidth="2" />
      <path d="M725 167 C632 167 555 173 483 194 Q460 201 460 226 L460 290 Q460 315 483 322 C555 344 632 350 725 350Z" fill="url(#synapse-receiving)" stroke="rgba(158,219,255,.68)" strokeWidth="2" />

      <text x="160" y="137" className="neural-journey__diagram-label">SENDING CELL</text>
      <text x="380" y="116" className="neural-journey__diagram-label">SYNAPTIC GAP</text>
      <text x="600" y="137" className="neural-journey__diagram-label">RECEIVING CELL</text>
      <text x="380" y="168" className="neural-journey__diagram-label">CHEMICAL MESSENGERS</text>
      <text x="520" y="186" className="neural-journey__diagram-label">RECEPTORS</text>
      <path d="M305 199 Q380 180 455 199 M305 315 Q380 334 455 315" fill="none" stroke="rgba(229,237,255,.22)" strokeWidth="1.5" strokeDasharray="5 6" />
      <path d="M322 205 Q380 190 438 205 L438 309 Q380 324 322 309Z" fill={color} fillOpacity=".045" />

      {[ [111,222], [164,268], [220,224], [92,302], [221,300] ].map(([cx, cy], index) => (
        <g key={`vesicle-${index}`}>
          <circle cx={cx} cy={cy} r="15" fill="#f3be79" fillOpacity=".13" stroke="rgba(255,211,151,.63)" strokeWidth="1.4" />
          <circle cx={cx} cy={cy} r="5" fill="#ffd596" />
        </g>
      ))}

      {[222, 250, 278].map((y, index) => (
        <g key={`receptor-${index}`} transform={`translate(460 ${y})`}>
          <path d="M0 0 h-12 v-13 h-12 v13 h-12" fill="none" stroke="#93e4ef" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="-24" cy="-17" r="4" fill="#c4fff5" />
        </g>
      ))}

      {playing && [0, 1, 2, 3, 4].map((index) => (
        <circle key={`transmitter-${index}`} r={index % 2 ? 4 : 5} fill="#ffd596" filter="url(#synapse-glow)">
          <animateMotion
            dur={`${2.2 + index * 0.22}s`}
            begin={`${-index * 0.48}s`}
            repeatCount="indefinite"
            path={`M${284 + (index % 2) * 9} ${218 + index * 18} C335 ${205 + index * 16} 418 ${207 + index * 17} 454 ${222 + index * 17}`}
          />
        </circle>
      ))}
      {!playing && [ [329,228], [366,260], [409,289] ].map(([cx, cy], index) => (
        <circle key={`paused-messenger-${index}`} cx={cx} cy={cy} r="4" fill="#ffd596" />
      ))}

      <path d="M74 365 H686" fill="none" stroke="rgba(194,207,233,.16)" strokeWidth="1" />
      <g className="neural-journey__synapse-step">
        <circle cx="112" cy="390" r="13" fill={color} fillOpacity=".18" stroke={color} />
        <text x="112" y="394" textAnchor="middle">1</text>
        <text x="135" y="387">Impulse arrives</text>
        <text x="135" y="406" className="neural-journey__diagram-caption">at the cell terminal</text>
      </g>
      <g className="neural-journey__synapse-step">
        <circle cx="337" cy="390" r="13" fill="#ffd596" fillOpacity=".16" stroke="#ffd596" />
        <text x="337" y="394" textAnchor="middle">2</text>
        <text x="360" y="387">Messengers cross</text>
        <text x="360" y="406" className="neural-journey__diagram-caption">the tiny gap</text>
      </g>
      <g className="neural-journey__synapse-step">
        <circle cx="551" cy="390" r="13" fill="#93e4ef" fillOpacity=".16" stroke="#93e4ef" />
        <text x="551" y="394" textAnchor="middle">3</text>
        <text x="574" y="387">Receptors respond</text>
        <text x="574" y="406" className="neural-journey__diagram-caption">on the next cell</text>
      </g>
    </>
  );
}

function MobileNeuronScene({ color, playing }: { color: string; playing: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="mobile-axon" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b6a5ff" />
          <stop offset="100%" stopColor="#78e8df" />
        </linearGradient>
        <filter id="mobile-neuron-glow"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <text x="190" y="31" className="neural-journey__diagram-kicker">FOLLOW THE SIGNAL</text>
      <path
        d="M81 107c-8-15-1-32 12-40-3-19 12-34 29-36 8-18 28-26 45-18 13-17 35-17 49-4 18-10 40-3 49 14 20 0 35 17 32 36 16 11 19 33 7 48 8 18-3 39-21 43-5 18-24 29-42 22-14 13-35 10-45-5-17 6-37-3-43-20-21 0-37-15-35-34-16-2-28-15-32-37z"
        fill="rgba(182,165,255,.2)"
        stroke="rgba(214,222,255,.65)"
        strokeWidth="2"
      />
      <path d="M110 89c14-19 35-21 49-6 9 10 8 25-2 35-9 10-23 11-34 4m57-66c-11 8-11 21-3 30 7 7 18 9 27 4m-7 30c-1-14 10-24 23-23 12 1 19 11 17 23-3 11-13 18-24 15m-89 18c6-15 19-22 32-16 11 5 16 18 9 29m40 7c-5-15 2-28 17-31 12-2 23 6 24 19m-7-71c10-13 25-16 38-7 10 7 13 19 8 29"
        fill="none"
        stroke="rgba(214,222,255,.38)"
        strokeWidth="2"
      />
      <circle cx="190" cy="111" r="9" fill={color} />
      <text x="190" y="177" className="neural-journey__diagram-label">BRAIN REGION</text>

      <path d="M164 248 C140 231 126 218 111 202 M160 258 C130 258 113 263 96 277 M164 273 C143 290 131 302 121 316 M216 248 C240 231 254 218 269 202 M220 258 C250 258 267 263 284 277 M216 273 C237 290 249 302 259 316" fill="none" stroke="rgba(208,216,255,.66)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="190" cy="255" r="43" fill={color} opacity=".16" filter="url(#mobile-neuron-glow)" />
      <circle cx="190" cy="255" r="31" fill="#26314f" stroke="rgba(224,231,255,.86)" strokeWidth="2" />
      <circle cx="190" cy="255" r="10" fill={color} />
      <text x="190" y="307" className="neural-journey__diagram-label">CELL BODY</text>

      <path d="M190 287 V452" stroke="rgba(186,200,230,.2)" strokeWidth="20" strokeLinecap="round" />
      <path d="M190 287 V452" stroke="url(#mobile-axon)" strokeWidth="3" strokeLinecap="round" />
      {[316, 354, 392, 430].map(y => (
        <rect key={y} x="171" y={y} width="38" height="26" rx="12" fill="rgba(120,232,223,.16)" stroke="rgba(143,232,225,.72)" strokeWidth="1.5" />
      ))}
      {playing && (
        <circle r="6" fill="#efffff">
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M190 286 V452" />
        </circle>
      )}
      <path d="M190 452c-14 13-25 25-34 40m34-40c13 12 25 25 34 40" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M220 369 H262" fill="none" stroke="rgba(205,216,255,.4)" strokeWidth="1" />
      <text x="269" y="365" textAnchor="start" className="neural-journey__diagram-label">MYELIN</text>
      <text x="269" y="384" textAnchor="start" className="neural-journey__diagram-caption">insulating segments</text>
      <text x="190" y="523" className="neural-journey__diagram-caption">An electrical impulse travels down the axon.</text>
    </>
  );
}

function MobileSynapseScene({ color, playing }: { color: string; playing: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="mobile-synapse-sending" x1="0" x2="1">
          <stop stopColor="#b6a5ff" stopOpacity=".34" />
          <stop offset="100%" stopColor="#b6a5ff" stopOpacity=".16" />
        </linearGradient>
        <linearGradient id="mobile-synapse-receiving" x1="0" x2="1">
          <stop stopColor="#75bcff" stopOpacity=".14" />
          <stop offset="100%" stopColor="#75bcff" stopOpacity=".34" />
        </linearGradient>
        <filter id="mobile-synapse-glow"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <text x="190" y="31" className="neural-journey__diagram-kicker">HOW ONE NEURON SIGNALS THE NEXT</text>
      <text x="190" y="72" className="neural-journey__diagram-label">SENDING CELL</text>
      <path d="M48 88 H332 V140 Q332 168 305 176 H75 Q48 168 48 140Z" fill="url(#mobile-synapse-sending)" stroke="rgba(206,193,255,.68)" strokeWidth="2" />
      {[ [108,128], [156,145], [210,120], [267,146] ].map(([cx, cy], index) => (
        <g key={`mobile-vesicle-${index}`}>
          <circle cx={cx} cy={cy} r="12" fill="#f3be79" fillOpacity=".13" stroke="rgba(255,211,151,.66)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="4" fill="#ffd596" />
        </g>
      ))}
      <text x="190" y="213" className="neural-journey__diagram-label">SYNAPTIC GAP</text>
      <text x="190" y="239" className="neural-journey__diagram-caption">chemical messengers cross here</text>
      <path d="M58 185 H322 M58 296 H322" fill="none" stroke="rgba(229,237,255,.25)" strokeWidth="2" strokeDasharray="6 7" />
      {playing && [0, 1, 2, 3].map(index => (
        <circle key={`mobile-messenger-${index}`} r="5" fill="#ffd596" filter="url(#mobile-synapse-glow)">
          <animateMotion
            dur={`${2.2 + index * 0.2}s`}
            begin={`${-index * 0.48}s`}
            repeatCount="indefinite"
            path={`M${115 + index * 40} 178 C${130 + index * 25} 210 ${250 - index * 25} 265 ${265 - index * 40} 300`}
          />
        </circle>
      ))}
      {!playing && [ [150,225], [190,250], [230,275] ].map(([cx, cy], index) => (
        <circle key={`mobile-paused-messenger-${index}`} cx={cx} cy={cy} r="4" fill="#ffd596" />
      ))}
      <text x="190" y="337" className="neural-journey__diagram-label">RECEIVING CELL</text>
      <path d="M48 352 Q48 320 78 316 H302 Q332 320 332 352 V409 H48Z" fill="url(#mobile-synapse-receiving)" stroke="rgba(158,219,255,.68)" strokeWidth="2" />
      {[ [134,318], [190,318], [246,318] ].map(([x, y], index) => (
        <g key={`mobile-receptor-${index}`}>
          <path d={`M${x} ${y} v-13 h-11 v-13 h22 v13 h-11`} fill="none" stroke="#93e4ef" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <text x="190" y="389" className="neural-journey__diagram-caption">Messengers bind to receptors.</text>

      <path d="M38 431 H342" stroke="rgba(194,207,233,.18)" />
      {[
        { x: 65, n: '1', title: 'Impulse arrives', detail: 'at the terminal', fill: color },
        { x: 190, n: '2', title: 'Messengers cross', detail: 'the tiny gap', fill: '#ffd596' },
        { x: 315, n: '3', title: 'Receptors bind', detail: 'on next cell', fill: '#93e4ef' },
      ].map(step => (
        <g key={step.n} className="neural-journey__mobile-step">
          <circle cx={step.x} cy="459" r="12" fill={step.fill} fillOpacity=".18" stroke={step.fill} />
          <text x={step.x} y="463" textAnchor="middle">{step.n}</text>
          <text x={step.x} y="493" className="neural-journey__mobile-step-title">{step.title}</text>
          <text x={step.x} y="512" className="neural-journey__mobile-step-detail">{step.detail}</text>
        </g>
      ))}
    </>
  );
}

function NeuralScene({ stage, color, playing, flowPhase }: { stage: JourneyStage; color: string; playing: boolean; flowPhase: FlowPhase }) {
  const isDiagram = stage === 'highways' || stage === 'synapse';
  return (
    <div className={`neural-journey__scene ${stage === 'brain' ? 'neural-journey__scene--brain' : ''} ${isDiagram ? 'neural-journey__scene--diagram' : ''} ${playing ? '' : 'neural-journey__scene--paused'}`}>
      {isDiagram ? (
        <div className="neural-journey__diagram-viewport">
          <div className="neural-journey__diagram-scroll">
            <svg
              className="neural-journey__diagram neural-journey__diagram--desktop"
              viewBox="0 0 760 470"
              role="img"
              aria-label={stage === 'highways'
                ? 'Animated pathway map from brain region through neuron cell body along an axon with myelin sheaths.'
                : 'Labeled synapse cutaway showing a sending cell, synaptic gap, chemical messengers, and receiving cell receptors.'}
            >
              {stage === 'highways'
                ? <NeuronScene color={color} playing={playing} />
                : <SynapseScene color={color} playing={playing} />}
            </svg>
            <svg
              className="neural-journey__diagram neural-journey__diagram--mobile"
              viewBox="0 0 380 550"
              role="img"
              aria-label={stage === 'highways'
                ? 'Mobile pathway illustration: a signal travels from a brain region through a neuron cell body and down an axon insulated by myelin.'
                : 'Mobile synapse cutaway: an impulse reaches the sending cell, chemical messengers cross the synaptic gap, and receptors respond on the receiving cell.'}
            >
              {stage === 'highways'
                ? <MobileNeuronScene color={color} playing={playing} />
                : <MobileSynapseScene color={color} playing={playing} />}
            </svg>
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="brain-3d-model brain-3d-model__loading" aria-label="Loading 3D model" />}>
          <Brain3DScene stage={stage} playing={playing} flowPhase={flowPhase} />
        </Suspense>
      )}
      <div className="neural-journey__scene-caption">
        <span className="neural-journey__live-dot" style={{ backgroundColor: color }} />
        <span>
          {isDiagram
            ? 'ILLUSTRATIVE SIGNAL PATH'
            : stage === 'brain' || stage === 'network'
              ? 'ILLUSTRATIVE CIRCUIT SIGNALS'
              : 'SIMULATED SIGNAL PATH'}
        </span>
        <span className="neural-journey__caption-divider" />
        <span>NOT A BRAIN SCAN</span>
        {!isDiagram && (
          <>
            <span className="neural-journey__caption-divider" />
            <a
              href="https://neurotorium.org/tool/brain-atlas/"
              target="_blank"
              rel="noreferrer"
              aria-label="Brain atlas model © the Lundbeck Foundation, from Neurotorium"
            >
              MODEL © LUNDBECK FOUNDATION
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export const NeuralJourney: React.FC<NeuralJourneyProps> = ({ onOpenFlowLab, onStartExercise }) => {
  const [stage, setStage] = useState<JourneyStage>('brain');
  const [flowPhase, setFlowPhase] = useState<FlowPhase>('distracted');
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [thoughtSimulationOpen, setThoughtSimulationOpen] = useState(false);
  const [thoughtSimulationStep, setThoughtSimulationStep] = useState(0);
  const activeStage = JOURNEY_STAGES.find(item => item.id === stage) ?? JOURNEY_STAGES[0];
  const activeStageIndex = JOURNEY_STAGES.findIndex(item => item.id === stage);
  const stageTabsRef = useRef<HTMLDivElement>(null);
  const thoughtSimulationRef = useRef<HTMLDialogElement>(null);
  const StageIcon = activeStage.icon;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const simulationPlaying = playing && !reducedMotion;
  const selectStage = (index: number) => {
    const nextStage = JOURNEY_STAGES[index];
    if (nextStage) setStage(nextStage.id);
  };

  useEffect(() => {
    stageTabsRef.current
      ?.querySelector<HTMLElement>('[aria-current="step"]')
      ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
  }, [stage, reducedMotion]);

  useEffect(() => {
    if (!thoughtSimulationOpen || thoughtSimulationStep >= THOUGHT_SIMULATION_STEPS.length) return;
    const timer = window.setTimeout(() => setThoughtSimulationStep(step => step + 1), reducedMotion ? 2200 : 1800);
    return () => window.clearTimeout(timer);
  }, [thoughtSimulationOpen, thoughtSimulationStep, reducedMotion]);

  const fireThought = () => {
    setThoughtSimulationStep(0);
    if (thoughtSimulationRef.current && !thoughtSimulationRef.current.open) {
      thoughtSimulationRef.current.showModal();
    }
    setThoughtSimulationOpen(true);
  };

  return (
    <section className="neural-journey" aria-labelledby="neural-journey-title" style={{ '--journey-accent': activeStage.color } as React.CSSProperties}>
      <div className="neural-journey__ambient neural-journey__ambient--one" />
      <div className="neural-journey__ambient neural-journey__ambient--two" />
      <div className="neural-journey__content">
        <div className="neural-journey__copy">
          <div className="neural-journey__eyebrow">
            <Sparkles size={14} />
            <span>iTHINK · AN INTERACTIVE NEUROSCIENCE JOURNEY</span>
          </div>
          <p className="neural-journey__overline">A PRACTICE IN OBSERVING</p>
          <h1 id="neural-journey-title">
            You are not
            <span>the thought.</span>
          </h1>
          <p className="neural-journey__intro">
            You are the one who notices. Thoughts can arrive without invitation; you do not have to control or follow them. Watch one pass, then choose where to place your attention.
          </p>
          <div className="neural-journey__observer-path" aria-label="A thought appears, you notice it, and return your attention to this moment">
            <span>THOUGHT APPEARS</span>
            <ArrowRight size={13} aria-hidden="true" />
            <span>YOU NOTICE</span>
            <ArrowRight size={13} aria-hidden="true" />
            <span>RETURN TO NOW</span>
          </div>
          <section className="thought-spotter" aria-labelledby="thought-spotter-title">
            <div className="thought-spotter__heading">
              <div>
                <span className="thought-spotter__kicker">A SHORT INTERACTIVE STORY</span>
                <h2 id="thought-spotter-title">See a thought appear, then notice it</h2>
              </div>
              <span className="thought-spotter__duration">≈ 8 SEC</span>
            </div>
            <p className="thought-spotter__instruction">
              Watch a signal move, a scripted phrase appear, then practice noticing it before returning attention to the present.
            </p>
            <p className="thought-spotter__clarifier">
              <Eye size={13} aria-hidden="true" />
              <span><strong>Thoughts can pop up before we choose them.</strong> This demo does not recreate that process. Its phrase is prewritten; nothing here comes from your brain or reveals why a real thought arose.</span>
            </p>
            <div className="thought-spotter__controls">
              <span className="thought-spotter__count">Sample text only. Nothing is recorded or scored.</span>
              <button type="button" className="thought-spotter__button" onClick={fireThought}>
                <Sparkles size={14} aria-hidden="true" />
                Fire a thought
              </button>
            </div>
          </section>
          <div className="neural-journey__fact">
            <div className="neural-journey__fact-icon"><StageIcon size={17} /></div>
            <div>
              <span className="neural-journey__fact-label">{activeStage.eyebrow} · WHAT TO NOTICE</span>
              <h2>{activeStage.title}</h2>
              <p>{activeStage.description}</p>
            </div>
          </div>
          <section className="neural-journey__science" aria-label={`Science explainer: ${activeStage.label}`}>
            <span className="neural-journey__science-label">THE BIOLOGY, IN BRIEF</span>
            <p>{activeStage.science.summary}</p>
            <details className="neural-journey__science-details">
              <summary>See the steps and what this view simplifies</summary>
              <ol>
                {activeStage.science.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
              <p className="neural-journey__science-caveat">{activeStage.science.caveat}</p>
              <div className="neural-journey__science-sources" aria-label="Sources">
                {activeStage.science.sources.map(source => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ))}
              </div>
            </details>
          </section>
          <div className="neural-journey__actions">
            <button type="button" onClick={onOpenFlowLab} className="neural-journey__primary">
              Explore your own focus <ArrowRight size={16} />
            </button>
            <button type="button" onClick={onStartExercise} className="neural-journey__secondary">
              Try an attention exercise
            </button>
          </div>
          <p className="neural-journey__disclaimer">
            <span aria-hidden="true">ⓘ</span>
            A simplified educational simulation, not measured or individualized brain activity.
          </p>
        </div>

        <div className="neural-journey__visual">
          <div className="neural-journey__visual-top">
            <div>
              <span className="neural-journey__visual-kicker">INTERACTIVE NEUROSCIENCE ATLAS</span>
              <span className="neural-journey__visual-stage">{activeStage.eyebrow}</span>
            </div>
            <button
              type="button"
              onClick={() => setPlaying(value => !value)}
              className="neural-journey__play"
              aria-pressed={simulationPlaying}
              aria-label={reducedMotion ? 'Motion is limited by your system preference' : simulationPlaying ? 'Pause signal animation' : 'Play signal animation'}
              disabled={reducedMotion}
              title={reducedMotion ? 'Animation is limited by your reduced motion setting' : undefined}
            >
              {simulationPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{simulationPlaying ? 'Pause' : reducedMotion ? 'Motion off' : 'Play'}</span>
            </button>
          </div>
          <div className="neural-journey__stage-navigation">
            <div className="neural-journey__stage-navigation-heading">
              <div>
                <span className="neural-journey__navigation-kicker">YOUR JOURNEY</span>
                <span className="neural-journey__navigation-progress" aria-live="polite">
                  STEP {String(activeStageIndex + 1).padStart(2, '0')} <span>OF 05</span>
                </span>
              </div>
              <div className="neural-journey__navigation-arrows">
                <button
                  type="button"
                  onClick={() => selectStage(activeStageIndex - 1)}
                  disabled={activeStageIndex === 0}
                  aria-label="Go to previous journey stage"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => selectStage(activeStageIndex + 1)}
                  disabled={activeStageIndex === JOURNEY_STAGES.length - 1}
                  aria-label="Go to next journey stage"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            <div
              className="neural-journey__progress-track"
              role="progressbar"
              aria-label="Journey progress"
              aria-valuemin={1}
              aria-valuemax={JOURNEY_STAGES.length}
              aria-valuenow={activeStageIndex + 1}
            >
              <span style={{ width: `${((activeStageIndex + 1) / JOURNEY_STAGES.length) * 100}%` }} />
            </div>
            <div className="neural-journey__stage-tabs" ref={stageTabsRef} role="group" aria-label="Choose a neuroscience journey stage">
              {JOURNEY_STAGES.map((item, index) => {
                const Icon = item.icon;
                const selected = item.id === stage;
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-label={`Go to stage ${index + 1}: ${item.label}`}
                    aria-pressed={selected}
                    aria-current={selected ? 'step' : undefined}
                    onClick={() => selectStage(index)}
                    className={`neural-journey__stage-tab${selected ? ' is-active' : ''}`}
                    style={selected ? { '--stage-color': item.color } as React.CSSProperties : undefined}
                  >
                    <span className="neural-journey__stage-tab-top">
                      <span className="neural-journey__stage-number">0{index + 1}</span>
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="neural-journey__stage-tab-label">{item.navLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="neural-journey__model-stage" data-stage={stage}>
            <span className="neural-journey__model-label">
              <i aria-hidden="true" />
              CONCEPTUAL SIGNAL FIELD
            </span>
            <NeuralScene stage={stage} color={activeStage.color} playing={simulationPlaying} flowPhase={flowPhase} />
          </div>
          {(stage === 'brain' || stage === 'network') && <NetworkColorKey />}
          {stage === 'flow' && (
            <>
              <div className="neural-journey__flow-controls" role="group" aria-label="Flow state simulation phases">
                {FLOW_PHASES.map((phase, index) => (
                  <button
                    type="button"
                    key={phase.id}
                    aria-pressed={flowPhase === phase.id}
                    onClick={() => setFlowPhase(phase.id)}
                    className={`neural-journey__flow-phase${flowPhase === phase.id ? ' is-active' : ''}`}
                  >
                    <span className="neural-journey__stage-number">0{index + 1}</span>
                    <span>{phase.label}</span>
                    <small>{phase.description}</small>
                  </button>
                ))}
              </div>
              <FlowFrequencyGuide />
            </>
          )}
          <p id="neural-stage-description" className="neural-journey__visual-note">
            <span aria-hidden="true">i</span>
            {activeStage.note}
          </p>
        </div>
      </div>
      <dialog
        ref={thoughtSimulationRef}
        className="thought-simulation"
        aria-labelledby="thought-simulation-title"
        aria-describedby="thought-simulation-description"
        onClose={() => setThoughtSimulationOpen(false)}
      >
        <div className="thought-simulation__shell" data-step={Math.min(thoughtSimulationStep, THOUGHT_SIMULATION_STEPS.length - 1)}>
          <div className="thought-simulation__topline">
            <span><i aria-hidden="true" /> SCRIPTED EXAMPLE · VISUAL METAPHOR</span>
            <button type="button" className="thought-simulation__close" onClick={() => thoughtSimulationRef.current?.close()} aria-label="Close thought simulation">
              <X size={18} />
            </button>
          </div>
          <div className="thought-simulation__visual" aria-hidden="true">
            <svg viewBox="0 0 760 300" role="presentation">
              <defs>
                <radialGradient id="thought-core">
                  <stop stopColor="#f4ffff" />
                  <stop offset=".28" stopColor="var(--journey-accent)" />
                  <stop offset="1" stopColor="var(--journey-accent)" stopOpacity="0" />
                </radialGradient>
                <filter id="thought-bloom" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>
              <g className="thought-simulation__web">
                <path d="M72 150 C166 40 229 48 325 150 S476 258 574 150 675 58 720 104" />
                <path d="M72 150 C168 260 239 246 325 150 S481 53 574 150 666 238 720 196" />
                <path d="M165 48 C208 116 244 184 280 254 M476 48 C436 117 403 186 365 254 M574 150 H720" />
                <path d="M72 150 H325 M325 150 H574" />
              </g>
              <g className="thought-simulation__web-nodes">
                {[[72,150],[165,48],[165,252],[280,254],[325,150],[365,254],[476,48],[574,150],[666,238],[720,104],[720,196]].map(([cx,cy], index) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index === 4 ? 6 : 3.5} />
                ))}
              </g>
              <path id="thought-signal-route" d="M72 150 C166 40 229 48 325 150 S476 258 574 150 675 58 720 104" fill="none" />
              {thoughtSimulationStep === 0 && !reducedMotion && (
                <circle className="thought-simulation__signal" r="8">
                  <animateMotion dur="1.8s" repeatCount="1" fill="freeze" path="M72 150 C166 40 229 48 325 150 S476 258 574 150 675 58 720 104" />
                </circle>
              )}
              {(reducedMotion || thoughtSimulationStep >= 2) && (
                <circle className="thought-simulation__signal thought-simulation__signal--still" cx={574} cy={150} r="6" />
              )}
              <g className="thought-simulation__thought">
                <path d="M278 62 Q278 38 303 38 H470 Q495 38 495 62 V96 Q495 120 470 120 H362 L338 139 V120 H303 Q278 120 278 96Z" />
                <text x="386" y="83" textAnchor="middle">“What comes next?”</text>
                <text x="386" y="105" textAnchor="middle" className="thought-simulation__sample-label">SCRIPTED SAMPLE</text>
              </g>
              <g className="thought-simulation__observer">
                <circle cx="574" cy="150" r="43" className="thought-simulation__observer-ring" />
                <circle cx="574" cy="150" r="24" />
                <path d="M560 151 Q574 136 588 151 Q574 166 560 151Z" />
                <circle cx="574" cy="151" r="4" />
                <text x="574" y="216" textAnchor="middle">NOTICING</text>
              </g>
              <g className="thought-simulation__anchor">
                <circle cx="720" cy="196" r="10" />
                <text x="716" y="232" textAnchor="end">HERE, NOW</text>
              </g>
            </svg>
          </div>
          <div className="thought-simulation__story" aria-live="polite">
            <div className="thought-simulation__step">
              <span>0{Math.min(thoughtSimulationStep + 1, THOUGHT_SIMULATION_STEPS.length)} / 04</span>
              <div
                className="thought-simulation__progress"
                role="progressbar"
                aria-label="Thought story progress"
                aria-valuemin={0}
                aria-valuemax={THOUGHT_SIMULATION_STEPS.length}
                aria-valuenow={Math.min(thoughtSimulationStep + 1, THOUGHT_SIMULATION_STEPS.length)}
              >
                <i style={{ width: `${(Math.min(thoughtSimulationStep + 1, THOUGHT_SIMULATION_STEPS.length) / THOUGHT_SIMULATION_STEPS.length) * 100}%` }} />
              </div>
            </div>
            <h2 id="thought-simulation-title">{THOUGHT_SIMULATION_STEPS[Math.min(thoughtSimulationStep, THOUGHT_SIMULATION_STEPS.length - 1)].label}</h2>
            <p id="thought-simulation-description">{THOUGHT_SIMULATION_STEPS[Math.min(thoughtSimulationStep, THOUGHT_SIMULATION_STEPS.length - 1)].description}</p>
          </div>
          <div className="thought-simulation__footer">
            <p><Eye size={14} aria-hidden="true" /> Thoughts may arise automatically. Awareness lets you notice one without treating it as a command.</p>
            {thoughtSimulationStep >= THOUGHT_SIMULATION_STEPS.length ? (
              <button type="button" className="thought-simulation__replay" onClick={fireThought}>
                <Play size={14} aria-hidden="true" /> Watch again
              </button>
            ) : (
              <span className="thought-simulation__disclaimer">No thought is recorded · not a brain scan</span>
            )}
          </div>
        </div>
      </dialog>
    </section>
  );
};
