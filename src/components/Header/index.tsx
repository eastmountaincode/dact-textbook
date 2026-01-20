'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDevMode } from '@/providers/DevModeProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser, useClerk } from '@clerk/nextjs';
import { useProfile } from '@/providers/ProfileProvider';
import FontControls from './FontControls';
import AccountMenu from './AccountMenu';
import MobileMenu from './MobileMenu';

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
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { profile } = useProfile();

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await signOut();
    window.location.href = '/login';
  };

  const displayName = profile?.first_name || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  return (
    <header className={`fixed top-0 left-0 right-0 h-14 text-white z-50 flex items-center justify-between px-6 shadow-md font-serif ${devBorder('red')}`} style={{ backgroundColor: 'var(--header-bg)' }}>
      {/* Logo / Title */}
      <div className={`flex items-center min-w-0 ${devBorder('amber')}`}>
        <a href="/chapter/welcome" className={`text-white text-sm md:text-lg hover:opacity-80 truncate ${devBorder('emerald')}`}>
          Data Analytics for Critical Thinkers
        </a>
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-4 ${devBorder('cyan')}`}>
        {/* Font Controls - Desktop */}
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
              <FontControls
                fontSize={fontSize}
                defaultFontSize={defaultFontSize}
                fontFamily={fontFamily}
                canIncrease={canIncrease}
                canDecrease={canDecrease}
                onFontSizeIncrease={onFontSizeIncrease}
                onFontSizeDecrease={onFontSizeDecrease}
                onFontSizeReset={onFontSizeReset}
                onFontFamilyChange={onFontFamilyChange}
              />
            </div>
          )}
        </div>

        {/* Theme Toggle - Desktop */}
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

        {/* Account Menu - Desktop */}
        <div className="relative hidden md:block">
          {isSignedIn ? (
            <>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`p-2 hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-2 ${devBorder('rose')}`}
                title="Account"
              >
                <svg className={`w-5 h-5 ${devBorder('orange')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={`text-base pr-1 ${devBorder('yellow')}`}>
                  {displayName}
                </span>
              </button>

              {showAccountMenu && (
                <AccountMenu
                  displayName={displayName}
                  userEmail={userEmail}
                  onLogout={handleLogout}
                  onClose={() => setShowAccountMenu(false)}
                />
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

        {/* Mobile Menu */}
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
            <MobileMenu
              isSignedIn={isSignedIn ?? false}
              displayName={displayName}
              userEmail={userEmail}
              isDark={isDark}
              fontSize={fontSize}
              defaultFontSize={defaultFontSize}
              fontFamily={fontFamily}
              canIncrease={canIncrease}
              canDecrease={canDecrease}
              onFontSizeIncrease={onFontSizeIncrease}
              onFontSizeDecrease={onFontSizeDecrease}
              onFontSizeReset={onFontSizeReset}
              onFontFamilyChange={onFontFamilyChange}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              onClose={() => setShowMobileMenu(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
