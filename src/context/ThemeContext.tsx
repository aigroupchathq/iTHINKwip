import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'obsidian' | 'emerald' | 'amber' | 'violet' | 'paper';
export type ExperienceTheme = 'matrix' | 'story' | 'socratic' | 'workbench' | 'zen';

interface ExperienceThemeConfig {
  id: ExperienceTheme;
  name: string;
  description: string;
  interaction: string;
}

export const EXPERIENCE_THEMES: Record<ExperienceTheme, ExperienceThemeConfig> = {
  matrix: {
    id: 'matrix',
    name: 'The Jungian Matrix',
    description: 'An analytical map of ideas, relationships, and evidence.',
    interaction: 'Select a node to inspect its connection.',
  },
  story: {
    id: 'story',
    name: "The Storyteller's Journey",
    description: 'An editorial path that unfolds one chapter at a time.',
    interaction: 'Choose a chapter, then follow the thread.',
  },
  socratic: {
    id: 'socratic',
    name: 'The Socratic Dialogue',
    description: 'A guided inquiry where useful questions reveal the ideas.',
    interaction: 'Ask a question to open a line of inquiry.',
  },
  workbench: {
    id: 'workbench',
    name: 'The Modular Workbench',
    description: 'A hands-on control room for exploring concepts in action.',
    interaction: 'Adjust the workspace density to suit your focus.',
  },
  zen: {
    id: 'zen',
    name: 'The Minimalist Zen',
    description: 'A spacious, single-concept view with room to reflect.',
    interaction: 'Reveal one idea at a time.',
  },
};

export const EXPERIENCE_PALETTE_MAP: Record<AppTheme, ExperienceTheme> = {
  obsidian: 'matrix',
  emerald: 'zen',
  amber: 'story',
  violet: 'socratic',
  paper: 'workbench',
};

const EXPERIENCE_PALETTE_KEYS: AppTheme[] = ['obsidian', 'emerald', 'amber', 'violet', 'paper'];

function isExperienceTheme(value: string | null): value is ExperienceTheme {
  return Boolean(value && Object.prototype.hasOwnProperty.call(EXPERIENCE_THEMES, value));
}

function isAppTheme(value: string | null): value is AppTheme {
  return Boolean(value && Object.prototype.hasOwnProperty.call(THEMES, value));
}

function getInitialAppTheme(): AppTheme {
  try {
    const savedPalette = localStorage.getItem('ithink_theme');
    if (isAppTheme(savedPalette)) return savedPalette;

    const savedLayout = localStorage.getItem('ithink_experience_theme');
    if (isExperienceTheme(savedLayout)) {
      const matchingPalette = EXPERIENCE_PALETTE_KEYS.find(
        palette => EXPERIENCE_PALETTE_MAP[palette] === savedLayout
      );
      if (matchingPalette) return matchingPalette;
    }
  } catch {
    return 'emerald';
  }
  return 'emerald';
}

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
    name: 'Quiet Grove',
    category: 'dark',
    accentColor: '#9bc8a8',
    accentClass: 'text-emerald-300',
    accentBgClass: 'bg-emerald-400',
    borderClass: 'border-emerald-400/30',
    bgClass: 'bg-[#0b100e]',
    surfaceClass: 'bg-[#111a15]',
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
  experienceTheme: ExperienceTheme;
  experienceConfig: ExperienceThemeConfig;
  preferenceError: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'obsidian',
  config: THEMES.obsidian,
  setTheme: () => {},
  experienceTheme: 'workbench',
  experienceConfig: EXPERIENCE_THEMES.workbench,
  preferenceError: '',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(getInitialAppTheme);
  const [preferenceError, setPreferenceError] = useState('');
  const experienceTheme = EXPERIENCE_PALETTE_MAP[theme];

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ithink_theme', newTheme);
      localStorage.setItem('ithink_experience_theme', EXPERIENCE_PALETTE_MAP[newTheme]);
      setPreferenceError('');
    } catch {
      setPreferenceError(
        'The palette and its paired layout changed for this session, but could not be saved in this browser.'
      );
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

  useEffect(() => {
    document.documentElement.setAttribute('data-experience', experienceTheme);
  }, [experienceTheme]);

  const config = THEMES[theme];
  const experienceConfig = EXPERIENCE_THEMES[experienceTheme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        config,
        setTheme,
        experienceTheme,
        experienceConfig,
        preferenceError,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
