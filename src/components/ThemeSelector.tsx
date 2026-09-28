import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { useTheme, THEMES, AppTheme, EXPERIENCE_THEMES, EXPERIENCE_PALETTE_MAP } from '../context/ThemeContext';

export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, config, setTheme, experienceConfig, preferenceError } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    dropdownRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitemradio"][aria-checked="true"]')
      ?.focus();

    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
    );
    const activeIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowDown') nextIndex = (activeIndex + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (activeIndex - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <div className={`theme-selector ${className}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(value => !value)}
        className="theme-selector__trigger"
        aria-label={`Experience palette: ${config.name}, paired with ${experienceConfig.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-describedby={preferenceError ? 'theme-preference-error' : undefined}
        title="Change palette and layout"
      >
        <span
          className="theme-selector__swatch"
          style={{ backgroundColor: config.accentColor }}
          aria-hidden="true"
        />
        <span className="theme-selector__labels">
          <span className="theme-selector__name">{config.name}</span>
          <small className="theme-selector__experience-name">{experienceConfig.name}</small>
        </span>
        <Palette size={15} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="theme-selector__menu"
          role="menu"
          aria-label="Choose a palette and layout"
          onKeyDown={handleMenuKeyDown}
        >
          <div className="theme-selector__menu-title">
            <span>Palette and layout</span>
            <small>Choose a color mood and its matching way to explore.</small>
          </div>
          <div className="theme-selector__options">
            {(Object.keys(THEMES) as AppTheme[]).map(themeKey => {
              const th = THEMES[themeKey];
              const isSelected = theme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => {
                    setTheme(themeKey);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`theme-selector__option${isSelected ? ' is-selected' : ''}`}
                >
                  <span className="theme-selector__option-name">
                    <span
                      className="theme-selector__option-swatch"
                      style={{ backgroundColor: th.accentColor }}
                      aria-hidden="true"
                    />
                    <span className="theme-selector__option-copy">
                      <strong>{th.name}</strong>
                      <small>{EXPERIENCE_THEMES[EXPERIENCE_PALETTE_MAP[themeKey]].name}</small>
                    </span>
                  </span>
                  <span className="theme-selector__option-meta">
                    {th.category === 'light' ? (
                      <Sun size={13} aria-label="Light theme" />
                    ) : (
                      <Moon size={13} aria-label="Dark theme" />
                    )}
                    {isSelected && <Check size={14} aria-label="Selected" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {preferenceError && (
        <span id="theme-preference-error" role="status" className="theme-selector__error">
          {preferenceError}
        </span>
      )}
    </div>
  );
};
