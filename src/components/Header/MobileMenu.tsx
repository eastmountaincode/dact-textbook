'use client';

import Link from 'next/link';
import FontControls from './FontControls';

interface MobileMenuProps {
  isSignedIn: boolean;
  displayName: string;
  userEmail: string;
  isDark: boolean;
  fontSize: number;
  defaultFontSize: number;
  fontFamily: 'serif' | 'sans';
  canIncrease: boolean;
  canDecrease: boolean;
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  onFontSizeReset: () => void;
  onFontFamilyChange: (family: 'serif' | 'sans') => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export default function MobileMenu({
  isSignedIn,
  displayName,
  userEmail,
  isDark,
  fontSize,
  defaultFontSize,
  fontFamily,
  canIncrease,
  canDecrease,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onFontSizeReset,
  onFontFamilyChange,
  onToggleTheme,
  onLogout,
  onClose,
}: MobileMenuProps) {
  return (
    <div
      className="absolute right-0 top-11 rounded-lg shadow-xl p-4 w-64 z-50"
      style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
    >
      {/* Auth section */}
      <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        {isSignedIn ? (
          <>
            <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <p className="text-base" style={{ color: 'var(--foreground)' }}>
                {displayName}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-text)' }}>
                {userEmail}
              </p>
            </div>
            <Link
              href="/account"
              onClick={onClose}
              className="block w-full text-left px-2 py-1 rounded text-base hover:bg-[var(--sidebar-hover)] cursor-pointer"
              style={{ color: 'var(--foreground)' }}
            >
              Account
            </Link>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full text-left px-2 py-1 rounded text-base hover:bg-[var(--sidebar-hover)] cursor-pointer"
              style={{ color: 'var(--foreground)' }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full text-center px-4 py-2 rounded-lg text-base mb-2 hover:opacity-80"
              style={{ backgroundColor: 'var(--sidebar-section-bg)', color: 'var(--foreground)' }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="block w-full text-center px-4 py-2 rounded-lg text-base text-[var(--header-bg)] hover:opacity-90"
              style={{ backgroundColor: '#FDB515' }}
            >
              Create Account
            </Link>
          </>
        )}
      </div>

      {/* Font controls */}
      <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
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

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--sidebar-hover)] cursor-pointer"
        style={{ color: 'var(--foreground)' }}
      >
        {isDark ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-base">Switch to Light Mode</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className="text-base">Switch to Dark Mode</span>
          </>
        )}
      </button>
    </div>
  );
}
