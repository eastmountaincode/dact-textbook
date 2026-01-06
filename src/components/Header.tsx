'use client';

import { useState } from 'react';
import { useDevMode } from '@/providers/DevModeProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface HeaderProps {
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  onFontSizeReset: () => void;
  onFontFamilyChange: (family: 'serif' | 'sans') => void;
  fontFamily: 'serif' | 'sans';
  fontSize: number;
  defaultFontSize: number;
  canIncrease: boolean;
  canDecrease: boolean;
}

export default function Header({
  onFontSizeIncrease,
  onFontSizeDecrease,
  onFontSizeReset,
  onFontFamilyChange,
  fontFamily,
  fontSize,
  defaultFontSize,
  canIncrease,
  canDecrease
}: HeaderProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const { devBorder } = useDevMode();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 h-14 text-white z-50 flex items-center justify-between px-6 shadow-md ${devBorder('red')}`} style={{ backgroundColor: 'var(--header-bg)' }}>
      {/* Logo / Title */}
      <div className={`flex items-center gap-4 ${devBorder('amber')}`}>
        <a href="/" className={`text-[#FDB515] font-semibold text-lg hover:opacity-80 ${devBorder('emerald')}`}>
          The Philomath
        </a>
        <span className={`text-white/60 text-sm hidden sm:inline ${devBorder('lime')}`}>
          Data Analytics for Critical Thinkers
        </span>
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-4 ${devBorder('cyan')}`}>
        {/* Font Controls */}
        <div className="relative">
          {/* Font settings (open/close menu) */}
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer ${devBorder('violet')}`}
            title="Font settings"
          >
            <span className="w-5 h-5 flex items-center justify-center text-lg font-serif">A</span>
          </button>

          {showFontMenu && (
            <div className={`absolute right-0 top-10 rounded-lg shadow-xl p-4 w-48 z-50 ${devBorder('pink')}`} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Size</p>
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{fontSize}px</span>
                </div>
                <div className="flex gap-2 items-center">
                  {/* Font size: decrease */}
                  <button
                    onClick={onFontSizeDecrease}
                    disabled={!canDecrease}
                    className="w-8 h-8 rounded flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canDecrease ? 'var(--sidebar-section-bg)' : 'var(--input-bg)',
                      color: canDecrease ? 'var(--foreground)' : 'var(--muted-text)',
                    }}
                    title="Smaller"
                  >
                    <span className="text-xs font-serif">A</span>
                  </button>
                  {/* Font size: increase */}
                  <button
                    onClick={onFontSizeIncrease}
                    disabled={!canIncrease}
                    className="w-8 h-8 rounded flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canIncrease ? 'var(--sidebar-section-bg)' : 'var(--input-bg)',
                      color: canIncrease ? 'var(--foreground)' : 'var(--muted-text)',
                    }}
                    title="Larger"
                  >
                    <span className="text-base font-serif">A</span>
                  </button>
                  {/* Font size: reset to default */}
                  <button
                    onClick={onFontSizeReset}
                    disabled={fontSize === defaultFontSize}
                    className="px-2 py-1 rounded text-xs cursor-pointer disabled:cursor-not-allowed"
                    style={{ color: fontSize !== defaultFontSize ? 'var(--muted-text)' : 'var(--input-border)' }}
                    title="Reset to default"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-text)' }}>Style</p>
                <div className="flex gap-2">
                  {/* Font family: serif */}
                  <button
                    onClick={() => onFontFamilyChange('serif')}
                    className="px-3 py-1 rounded text-sm font-serif cursor-pointer"
                    style={{
                      backgroundColor: fontFamily === 'serif' ? 'var(--berkeley-blue)' : 'var(--sidebar-section-bg)',
                      color: fontFamily === 'serif' ? 'white' : 'var(--foreground)',
                    }}
                  >
                    Serif
                  </button>
                  {/* Font family: sans */}
                  <button
                    onClick={() => onFontFamilyChange('sans')}
                    className="px-3 py-1 rounded text-sm font-sans cursor-pointer"
                    style={{
                      backgroundColor: fontFamily === 'sans' ? 'var(--berkeley-blue)' : 'var(--sidebar-section-bg)',
                      color: fontFamily === 'sans' ? 'white' : 'var(--foreground)',
                    }}
                  >
                    Sans
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer ${devBorder('indigo')}`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Account */}
        <button
          className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer ${devBorder('rose')}`}
          title="Account"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
