import React from 'react';
import { Headphones, Volume2, Square } from 'lucide-react';
import { ActiveTab } from '../types/neuro';
import { audioEngine } from '../utils/audioEngine';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dailyStreak: number;
  latestScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  latestScore,
}) => {
  const audioStatus = audioEngine.getStatus();

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'training', label: 'Cognitive Exercises' },
    { id: 'flow', label: 'Flow State Lab' },
    { id: 'soundscape', label: 'Audio Studio' },
    { id: 'tracker', label: 'Circadian & Milestones' },
    { id: 'education', label: 'Neuroscience Atlas' },
    { id: 'rehab', label: 'Clinical Directory' },
    { id: 'library', label: 'Protocol Library' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090b0e]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: iTHINK brand wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('training')}
              className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white hover:text-cyan-400 transition-colors cursor-pointer"
            >
              iTHINK
            </button>
            <span className="hidden sm:inline-block text-xs text-zinc-500 font-mono pl-2 border-l border-zinc-800">
              Self-Observation & Practice
            </span>
          </div>

          {/* Zone 2: Clean Typography Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium tracking-wide">
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`transition-colors cursor-pointer py-1 relative whitespace-nowrap ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Theme selector & audio state & fast start) */}
          <div className="flex items-center gap-3">
            {/* Theme Customizer Dropdown */}
            <ThemeSelector />

            {/* Live Audio indicator if running */}
            {audioStatus.isRunning ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="capitalize hidden sm:inline">{audioStatus.mode} Wave</span>
                <button
                  onClick={() => {
                    audioEngine.stop();
                    setActiveTab(activeTab);
                  }}
                  className="hover:text-white p-0.5 transition cursor-pointer"
                  title="Pause audio"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('soundscape')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition px-2.5 py-1.5 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                <span>Soundscapes</span>
              </button>
            )}

            {/* Quick Practice Action */}
            <button
              onClick={() => setActiveTab('training')}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Start Session
            </button>
          </div>
        </div>

        {/* Mobile Nav Scroller (Only visible on small viewports) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-white/[0.04] scrollbar-none text-xs">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
