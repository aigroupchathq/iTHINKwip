import React from 'react';
import {
  Activity,
  BookOpen,
  Brain,
  Headphones,
  HeartPulse,
  House,
  MessageCircle,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react';
import { ActiveTab } from '../types/neuro';
import { audioEngine } from '../utils/audioEngine';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const audioStatus = audioEngine.getStatus();

  const navLinks: { id: ActiveTab; label: string; icon: typeof House }[] = [
    { id: 'training', label: 'Start Here', icon: House },
    { id: 'flow', label: 'Flow State Lab', icon: Sparkles },
    { id: 'soundscape', label: 'Audio Studio', icon: Headphones },
    { id: 'tracker', label: 'My Practice', icon: Activity },
    { id: 'education', label: 'Neuroscience Atlas', icon: Brain },
    { id: 'rehab', label: 'Clinical Directory', icon: HeartPulse },
    { id: 'library', label: 'Protocol Library', icon: BookOpen },
    { id: 'community', label: 'Community', icon: MessageCircle },
  ];

  return (
    <header className="app-header sticky top-0 z-40">
      <div className="app-header__inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="app-header__top">
          <div className="app-header__brand">
            <button
              onClick={() => setActiveTab('training')}
              aria-label="iTHINK home"
              className="app-header__wordmark"
            >
              iTHINK
            </button>
            <span className="app-header__tagline">Notice your mind. Choose your next step.</span>
          </div>

          <div className="app-header__actions">
            <ThemeSelector />

            {audioStatus.isRunning ? (
              <div className="app-header__audio-status">
                <Volume2 size={15} aria-hidden="true" />
                <span className="app-header__audio-label">{audioStatus.mode} soundscape</span>
                <button
                  onClick={() => {
                    audioEngine.stop();
                    setActiveTab(activeTab);
                  }}
                  className="app-header__audio-stop"
                  aria-label="Stop soundscape"
                  title="Stop soundscape"
                >
                  <Square size={12} fill="currentColor" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('soundscape')}
                className="app-header__sound-button"
              >
                <Headphones size={15} aria-hidden="true" />
                <span>Soundscapes</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('flow')}
              className="app-header__reflect-button"
            >
              <span>Reflect</span>
              <span className="app-header__reflect-full">now</span>
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" className="app-header__nav">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`app-header__nav-link${isActive ? ' is-active' : ''}`}
              >
                <Icon size={15} strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
