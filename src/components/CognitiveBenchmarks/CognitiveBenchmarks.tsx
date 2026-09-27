import React, { useState } from 'react';
import { Award, Info, ChevronRight, BarChart2, ShieldCheck } from 'lucide-react';

interface BenchmarkRow {
  domain: string;
  testName: string;
  metricUnit: string;
  age18_35: { mean: number; top10: number };
  age36_55: { mean: number; top10: number };
  age56_75: { mean: number; top10: number };
  clinicalSignificance: string;
}

const BENCHMARKS: BenchmarkRow[] = [
  {
    domain: 'Inhibitory Gating',
    testName: 'Stroop Color-Word Test',
    metricUnit: 'Interference Cost (ms)',
    age18_35: { mean: 98, top10: 52 },
    age36_55: { mean: 124, top10: 74 },
    age56_75: { mean: 168, top10: 104 },
    clinicalSignificance: 'Lower millisecond cost indicates superior prefrontal suppression of automatic reading reflexes. Highly correlated with resistence to digital distraction.'
  },
  {
    domain: 'Working Memory Span',
    testName: 'Dual N-Back Paradigm',
    metricUnit: 'Maximum N-Span Achieved',
    age18_35: { mean: 2.4, top10: 3.2 },
    age36_55: { mean: 2.1, top10: 2.8 },
    age56_75: { mean: 1.7, top10: 2.3 },
    clinicalSignificance: 'Reflects dorsolateral prefrontal cortex buffer capacity. Correlates with complex problem solving, mental math, and emotional regulation under pressure.'
  },
  {
    domain: 'Motor Inhibition',
    testName: 'Go / No-Go Sustained Vigilance',
    metricUnit: 'Commission Error Rate (%)',
    age18_35: { mean: 8.2, top10: 2.5 },
    age36_55: { mean: 11.4, top10: 4.1 },
    age56_75: { mean: 15.6, top10: 6.8 },
    clinicalSignificance: 'Measures basal ganglia subthalamic hyperdirect braking. High error rates reflect impulsive decision triggers; training strengthens pause resilience.'
  },
  {
    domain: 'Cognitive Flexibility',
    testName: 'Trail Making Test B - A',
    metricUnit: 'Switching Cost: Part B - Part A (s)',
    age18_35: { mean: 18.5, top10: 9.2 },
    age36_55: { mean: 26.4, top10: 14.8 },
    age56_75: { mean: 42.1, top10: 22.5 },
    clinicalSignificance: 'The clinical gold-standard difference score isolating pure mental task switching from baseline eye-hand motor coordination.'
  }
];

export const CognitiveBenchmarks: React.FC = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'18_35' | '36_55' | '56_75'>('18_35');
  const [expandedTest, setExpandedTest] = useState<string | null>(BENCHMARKS[0].testName);

  return (
    <div className="bg-[#0e1117] border border-white/[0.08] rounded-xl p-6 sm:p-7 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Normative Neuropsychological Baselines</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Age-Normed Cognitive Percentiles
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Derived from meta-analytic neuropsychological cohorts. See how individual metrics map against healthy population averages across different life decades.
          </p>
        </div>

        {/* Age Bracket Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-white/[0.06] rounded-lg text-xs self-start md:self-auto">
          {(['18_35', '36_55', '56_75'] as const).map(age => (
            <button
              key={age}
              onClick={() => setSelectedAgeGroup(age)}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                selectedAgeGroup === age
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {age === '18_35' ? 'Ages 18–35' : age === '36_55' ? 'Ages 36–55' : 'Ages 56–75'}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BENCHMARKS.map(item => {
          const stats = selectedAgeGroup === '18_35' 
            ? item.age18_35 
            : selectedAgeGroup === '36_55' 
            ? item.age36_55 
            : item.age56_75;
          const isExpanded = expandedTest === item.testName;

          return (
            <div
              key={item.testName}
              onClick={() => setExpandedTest(isExpanded ? null : item.testName)}
              className="bg-[#090b0e] border border-white/[0.06] hover:border-white/[0.14] rounded-xl p-5 space-y-3 cursor-pointer transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                    {item.domain}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {item.testName}
                  </h4>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/20">
                  {item.metricUnit}
                </span>
              </div>

              {/* Mean vs Top 10th Percentile */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Cohort Average</span>
                  <span className="text-lg font-bold text-zinc-200 font-mono">
                    {stats.mean}
                  </span>
                </div>
                <div className="bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 block uppercase font-mono">Top 10th Percentile</span>
                  <span className="text-lg font-bold text-cyan-300 font-mono">
                    {stats.top10}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-400 leading-relaxed space-y-1">
                  <span className="font-semibold text-zinc-300 block">Clinical Significance:</span>
                  <p>{item.clinicalSignificance}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
