import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  BrainCircuit, 
  FileDown 
} from 'lucide-react';
import { RESOURCE_PROTOCOLS } from '../../data/neuroData';
import { ResourceProtocol } from '../../types/neuro';

export const ResourceLibrary: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<ResourceProtocol | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Habit Rewiring Lab state
  const [habitForm, setHabitForm] = useState({
    badHabit: 'Impulsively opening social media during work',
    sensoryCue: 'Encountering difficult analytical problem / brief boredom',
    craving: 'Fast dopamine release and distraction relief',
    frictionInterruption: '60-second breathing pause + Go/No-Go motor freeze',
    adaptiveAction: 'Perform 20 deep belly breaths or 1 Stroop challenge round',
    reward: 'Mark streak point in SynapSync and enjoy natural mental clarity'
  });
  const [generatedLoopSaved, setGeneratedLoopSaved] = useState(false);

  const handleCopyProtocol = (protocol: ResourceProtocol) => {
    const text = `SYNAPSYNC EVIDENCE PROTOCOL: ${protocol.title}
Category: ${protocol.category}
Duration: ${protocol.duration}
Scientific Citation: ${protocol.citation}

Description:
${protocol.description}

Steps:
${protocol.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopiedId(protocol.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadFile = (protocol: ResourceProtocol) => {
    const text = `========================================================================
SYNAPSYNC COMMUNITY & NEUROSCIENCE RESOURCE
Guide: ${protocol.title}
Category: ${protocol.category}
Estimated Time: ${protocol.duration}
Reference: ${protocol.citation}
========================================================================

WHY THIS HELPS:
${protocol.description}

EASY STEP-BY-STEP PRACTICE:
${protocol.steps.map((step, idx) => `[Step ${idx + 1}] ${step}`).join('\n\n')}

A GENTLE REMINDER:
Building new habits takes patience and self-compassion. Celebrate your small daily wins—each repetition makes positive change a little more natural.

Need support? Reach out anytime at support@synapsync.org
========================================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = protocol.downloadFileName.replace('.pdf', '.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveHabitLoop = () => {
    setGeneratedLoopSaved(true);
    setTimeout(() => setGeneratedLoopSaved(false), 3000);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Practical Guides & Daily Tools</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Science-Backed Resource Library
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
          Practical worksheets, calming audio guides, and clear habit routines designed to make healthy daily habits feel natural, achievable, and sustainable.
        </p>
      </div>

      {/* Protocols Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Clinical Focus & Recovery Protocols</h2>
            <p className="text-xs text-slate-400">Grounded in published neurobiological literature</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">4 Verified Guides</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RESOURCE_PROTOCOLS.map(proto => (
            <div
              key={proto.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-cyan-400 font-mono">
                    {proto.category}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {proto.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{proto.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {proto.description}
                </p>

                <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800/80">
                  {proto.citation}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedProtocol(proto)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>View Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyProtocol(proto)}
                    title="Copy full text"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs cursor-pointer transition"
                  >
                    {copiedId === proto.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(proto)}
                    className="py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Habit Rewiring Lab */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Mindful Habit Builder</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Gentle Habit Shift Designer</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Break the automatic autopilot cycle by placing a kind, mindful pause between the urge and your response.
            </p>
          </div>
          {generatedLoopSaved && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Your Toolkit
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">1. Target Automatic Habit to Rewire</label>
              <input
                type="text"
                value={habitForm.badHabit}
                onChange={e => setHabitForm({ ...habitForm, badHabit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">2. Sensory Cue / Trigger</label>
              <input
                type="text"
                value={habitForm.sensoryCue}
                onChange={e => setHabitForm({ ...habitForm, sensoryCue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">3. Craving / Neurological Urge</label>
              <input
                type="text"
                value={habitForm.craving}
                onChange={e => setHabitForm({ ...habitForm, craving: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">4. Prefrontal Delay Friction (Interruption Brake)</label>
              <input
                type="text"
                value={habitForm.frictionInterruption}
                onChange={e => setHabitForm({ ...habitForm, frictionInterruption: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">5. Adaptive Substitute Action</label>
              <input
                type="text"
                value={habitForm.adaptiveAction}
                onChange={e => setHabitForm({ ...habitForm, adaptiveAction: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">6. Reward & Plasticity Anchor</label>
              <input
                type="text"
                value={habitForm.reward}
                onChange={e => setHabitForm({ ...habitForm, reward: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Neural Loop Schematic Visualizer */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
            Your New Habit Flow:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200">
              <strong>[TRIGGER]</strong> {habitForm.sensoryCue}
            </span>
            <span className="text-cyan-400 font-bold">→</span>
            <span className="bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300">
              <strong>[PAUSE]</strong> {habitForm.frictionInterruption}
            </span>
            <span className="text-cyan-400 font-bold">→</span>
            <span className="bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300">
              <strong>[KIND CHOICE]</strong> {habitForm.adaptiveAction}
            </span>
            <span className="text-cyan-400 font-bold">→</span>
            <span className="bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300">
              <strong>[CELEBRATION]</strong> {habitForm.reward}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSaveHabitLoop}
            className="py-2.5 px-6 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Save to My Personal Toolkit
          </button>
        </div>
      </div>

      {/* Protocol Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                  {selectedProtocol.category} · {selectedProtocol.duration}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedProtocol.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 text-xs border border-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProtocol.description}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Prescribed Step-by-Step Sequence:
              </span>
              <div className="space-y-2.5">
                {selectedProtocol.steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              Source: {selectedProtocol.citation}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownloadFile(selectedProtocol)}
                className="py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md"
              >
                <Download className="w-4 h-4" /> Download Protocol PDF/Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
