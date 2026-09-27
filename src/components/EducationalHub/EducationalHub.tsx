import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { BRAIN_REGIONS, EDUCATIONAL_ARTICLES } from '../../data/neuroData';
import { EducationalArticle, BrainRegion } from '../../types/neuro';
import { InteractiveBrainConnectome } from '../InteractiveBrainConnectome';

export const EducationalHub: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<BrainRegion>(BRAIN_REGIONS[0]);
  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Neuroplasticity', 'Focus & Attention', 'Recovery & Rehab', 'Sleep & Synapses'];

  const filteredArticles = activeCategory === 'All'
    ? EDUCATIONAL_ARTICLES
    : EDUCATIONAL_ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Neuroscience Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          The Neuroscience Educational Hub
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
          Demystifying brain plasticity, neurotransmitter gating, and cognitive rehabilitation through 
          peer-reviewed neuroscience, interactive anatomical models, and expert curricula.
        </p>
      </div>

      {/* Interactive Brain Anatomy & Functional Atlas with Luminous Connectome */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Interactive Functional Atlas
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Explore Key Cognitive Structures</h2>
          </div>
          <span className="text-xs text-slate-400">Click any neural hotspot on the holographic connectome</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Visual Anatomical Brain Map with Luminous Connectome */}
          <div className="lg:col-span-6">
            <InteractiveBrainConnectome
              onSelectRegion={reg => setSelectedRegion(reg)}
              selectedRegionId={selectedRegion.id}
              showControls={true}
              className="w-full shadow-2xl"
            />
          </div>

          {/* Region Details Inspector */}
          <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                {selectedRegion.scientificName}
              </span>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {selectedRegion.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedRegion.cognitiveRole}
            </p>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Core Cognitive Functions:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedRegion.keyFunctions.map((func, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Neuroplasticity & Training Mechanism
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedRegion.neuroplasticityMechanism}
              </p>
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 mt-2 font-mono">
                <span>Directly Trained Via:</span>
                <strong className="text-cyan-400">{selectedRegion.relevantChallenge}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Peer-Reviewed Articles Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Peer-Reviewed Insights & Articles</h2>
            <p className="text-xs text-slate-400">Written by clinical neurologists and cognitive neuroscientists</p>
          </div>

          {/* Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-cyan-400 font-medium">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.publishDate}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {article.summary}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Key Biological Takeaways:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {article.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">{article.author}</span>
                  <span className="text-[10px] text-slate-400 block">{article.authorRole}</span>
                </div>
                <button
                  onClick={() => setSelectedArticle(article)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Masterclasses Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4" /> Structured Video Masterclasses
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Neuroscience Video Courses</h2>
          </div>
          <span className="text-xs text-slate-400">Included in All Access</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="h-36 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-800 relative group overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 group-hover:scale-110 transition">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-400 mt-2 font-mono">Module 1 · 8 Video Lessons</span>
            </div>
            <h3 className="text-sm font-bold text-white">Dopamine Circuits & The Friction of Focus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dr. Elena Vance explains how baseline dopamine tonic levels dictate task persistence and how to harness deliberate noradrenergic friction.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="h-36 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-800 relative group overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 group-hover:scale-110 transition">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-400 mt-2 font-mono">Module 2 · 6 Video Lessons</span>
            </div>
            <h3 className="text-sm font-bold text-white">Sleep Spindles & Glymphatic Waste Flushing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dr. Aris Thorne breaks down slow-wave sleep architecture, delta rhythms, and the biological wash cycle that stabilizes synaptic plasticity.
            </p>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  {selectedArticle.category} · {selectedArticle.readTime}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {selectedArticle.title}
                </h2>
                <span className="text-xs text-slate-400 block">
                  By {selectedArticle.author} ({selectedArticle.authorRole})
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 text-xs border border-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Executive Synthesis
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedArticle.summary}
              </p>
            </div>

            <div className="space-y-5">
              {selectedArticle.contentSections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-white">
                    {sec.heading}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Published {selectedArticle.publishDate} · Peer-Reviewed Content
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
