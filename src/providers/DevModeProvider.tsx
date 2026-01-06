'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Available dev border colors - match classes in globals.css
export type DevBorderColor =
  | 'red' | 'blue' | 'green' | 'amber' | 'purple' | 'cyan'
  | 'pink' | 'violet' | 'yellow' | 'emerald' | 'teal' | 'orange'
  | 'lime' | 'indigo' | 'rose' | 'sky' | 'fuchsia' | 'slate';

interface DevModeContextType {
  devMode: boolean;
  toggleDevMode: () => void;
  devBorder: (color: DevBorderColor) => string;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevMode] = useState(false);

  const toggleDevMode = () => setDevMode((prev) => !prev);

  // Returns the dev border class - always returns the class name,
  // but the CSS only applies when .dev-mode is on the parent
  const devBorder = (color: DevBorderColor): string => `dev-border-${color}`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if not typing in an input/textarea
      if (
        e.key.toLowerCase() === 'b' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        toggleDevMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode, devBorder }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}
