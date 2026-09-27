import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { useTheme, THEMES, AppTheme } from '../context/ThemeContext';

export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, config, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.1] hover:border-white/[0.25] bg-zinc-900/80 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
        title="Change Visual Theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: config.accentColor }}
        />
        <span className="hidden sm:inline text-[11px] font-medium">{config.name}</span>
        <Palette className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-[#0e1117] border border-white/[0.12] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-white/[0.06] mb-1">
            Visual Theme
          </div>

          <div className="space-y-0.5">
            {(Object.keys(THEMES) as AppTheme[]).map(themeKey => {
              const th = THEMES[themeKey];
              const isSelected = theme === themeKey;

              return (
                <button
                  key={themeKey}
                  onClick={() => {
                    setTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: th.accentColor }}
                    />
                    <span className="font-medium text-[11px]">{th.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {th.category === 'light' ? (
                      <Sun className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Moon className="w-3 h-3 text-zinc-500" />
                    )}
                    {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
