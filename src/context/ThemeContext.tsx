import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'obsidian' | 'emerald' | 'amber' | 'violet' | 'paper';

interface ThemeConfig {
  id: AppTheme;
  name: string;
  category: 'dark' | 'light';
  accentColor: string;
  accentClass: string;
  accentBgClass: string;
  borderClass: string;
  bgClass: string;
  surfaceClass: string;
  textPrimaryClass: string;
  textMutedClass: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Cyan',
    category: 'dark',
    accentColor: '#22d3ee',
    accentClass: 'text-cyan-400',
    accentBgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500/30',
    bgClass: 'bg-[#090b0e]',
    surfaceClass: 'bg-[#0e1117]',
    textPrimaryClass: 'text-white',
    textMutedClass: 'text-zinc-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Neural Emerald',
    category: 'dark',
    accentColor: '#10b981',
    accentClass: 'text-emerald-400',
    accentBgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-[#080d0a]',
    surfaceClass: 'bg-[#0b140f]',
    textPrimaryClass: 'text-white',
    textMutedClass: 'text-zinc-400',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    category: 'dark',
    accentColor: '#f59e0b',
    accentClass: 'text-amber-400',
    accentBgClass: 'bg-amber-500',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-[#0d0b08]',
    surfaceClass: 'bg-[#15120c]',
    textPrimaryClass: 'text-white',
    textMutedClass: 'text-zinc-400',
  },
  violet: {
    id: 'violet',
    name: 'Twilight Violet',
    category: 'dark',
    accentColor: '#a78bfa',
    accentClass: 'text-purple-400',
    accentBgClass: 'bg-purple-500',
    borderClass: 'border-purple-500/30',
    bgClass: 'bg-[#0c0a14]',
    surfaceClass: 'bg-[#13101f]',
    textPrimaryClass: 'text-white',
    textMutedClass: 'text-zinc-400',
  },
  paper: {
    id: 'paper',
    name: 'Paper Research',
    category: 'light',
    accentColor: '#0284c7',
    accentClass: 'text-sky-600',
    accentBgClass: 'bg-sky-600',
    borderClass: 'border-slate-300',
    bgClass: 'bg-[#f8fafc]',
    surfaceClass: 'bg-white',
    textPrimaryClass: 'text-slate-900',
    textMutedClass: 'text-slate-600',
  },
};

interface ThemeContextType {
  theme: AppTheme;
  config: ThemeConfig;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'obsidian',
  config: THEMES.obsidian,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('ithink_theme') as AppTheme;
      return saved && THEMES[saved] ? saved : 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ithink_theme', newTheme);
    } catch {
      // ignore local storage error
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'paper') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }
  }, [theme]);

  const config = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, config, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
