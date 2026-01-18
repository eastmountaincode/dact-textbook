'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDevMode } from '@/providers/DevModeProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

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
  canDecrease,
}: HeaderProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { devBorder } = useDevMode();
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await signOut();
    // Use hard navigation to ensure cookies are fully cleared before loading new page
    window.location.href = '/login';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 h-14 text-white z-50 flex items-center justify-between px-6 shadow-md font-serif ${devBorder('red')}`} style={{ backgroundColor: 'var(--header-bg)' }}>
      {/* Logo / Title */}
      <div className={`flex items-center ${devBorder('amber')}`}>
        <a href="/chapter/welcome" className={`text-white font-normal text-lg hover:opacity-80 ${devBorder('emerald')}`}>
          Data Analytics for Critical Thinkers
        </a>
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-4 ${devBorder('cyan')}`}>
        {/* Font Controls - hidden on small screens */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer ${devBorder('violet')}`}
            title="Font settings"
          >
            <span className={`w-5 h-5 flex items-center justify-center text-lg font-serif ${devBorder('fuchsia')}`}>A</span>
          </button>

          {showFontMenu && (
            <div className={`absolute right-0 top-11 rounded-lg shadow-xl p-4 w-48 z-50 ${devBorder('pink')}`} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Size</p>
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{fontSize}px</span>
                </div>
                <div className="flex gap-2 items-center">
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

        {/* Theme Toggle - hidden on small screens */}
        <button
          onClick={toggleTheme}
          className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer hidden md:block ${devBorder('indigo')}`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className={`w-5 h-5 ${devBorder('sky')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${devBorder('sky')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Desktop: Account or Login buttons */}
        <div className="relative hidden md:block">
          {user ? (
            <>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-2 ${devBorder('rose')}`}
                title="Account"
              >
                <svg className={`w-5 h-5 ${devBorder('orange')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={`text-sm ${devBorder('yellow')}`}>
                  {profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 top-11 rounded-lg shadow-xl p-4 w-56 z-50" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                  <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-text)' }}>
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setShowAccountMenu(false)}
                    className="block w-full text-left px-2 py-1 rounded text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1 rounded text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={`flex items-center gap-2 ${devBorder('rose')}`}>
              <Link
                href="/login"
                className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer hover:opacity-80 ${devBorder('orange')}`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer hover:opacity-90 text-[var(--header-bg)] ${devBorder('yellow')}`}
                style={{ backgroundColor: '#FDB515' }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Hamburger menu (always shown on mobile) */}
        <div className="relative md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`p-2 rounded-lg cursor-pointer ${showMobileMenu ? 'bg-white/20' : 'hover:bg-white/10'} ${devBorder('rose')}`}
            title="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {showMobileMenu && (
            <div className="absolute right-0 top-11 rounded-lg shadow-xl p-4 w-64 z-50" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
              {/* Auth section - different for logged in vs logged out */}
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                {user ? (
                  <>
                    <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-text)' }}>
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setShowMobileMenu(false)}
                      className="block w-full text-left px-2 py-1 rounded text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-2 py-1 rounded text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setShowMobileMenu(false)}
                      className="block w-full text-center px-4 py-2 rounded-lg text-sm mb-2 hover:opacity-80"
                      style={{ backgroundColor: 'var(--sidebar-section-bg)', color: 'var(--foreground)' }}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setShowMobileMenu(false)}
                      className="block w-full text-center px-4 py-2 rounded-lg text-sm text-[var(--header-bg)] hover:opacity-90"
                      style={{ backgroundColor: '#FDB515' }}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>

              {/* Font controls */}
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Font Size</p>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{fontSize}px</span>
                  </div>
                  <div className="flex gap-2 items-center">
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
                  <p className="text-xs mb-2" style={{ color: 'var(--muted-text)' }}>Font Style</p>
                  <div className="flex gap-2">
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

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--sidebar-hover)] cursor-pointer"
                style={{ color: 'var(--foreground)' }}
              >
                {isDark ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm">Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="text-sm">Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
