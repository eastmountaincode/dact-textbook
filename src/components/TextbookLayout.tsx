'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useDevMode } from '@/providers/DevModeProvider';

interface ChapterInfo {
  slug: string;
  title: string;
  chapterNumber: number;
}

interface Section {
  name: string;
  chapters: ChapterInfo[];
}

interface TextbookLayoutProps {
  children: React.ReactNode;
  sections: Section[];
  currentSlug?: string;
}

export default function TextbookLayout({
  children,
  sections,
  currentSlug,
}: TextbookLayoutProps) {
  const { devMode, devBorder } = useDevMode();
  const MIN_FONT_SIZE = 14;
  const MAX_FONT_SIZE = 22;
  const DEFAULT_FONT_SIZE = 16;

  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedFontFamily = localStorage.getItem('fontFamily') as 'serif' | 'sans';
    if (savedFontSize) {
      const parsed = parseInt(savedFontSize, 10);
      if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
        setFontSize(parsed);
      }
    }
    if (savedFontFamily) setFontFamily(savedFontFamily);
  }, []);

  // Save preferences
  const handleFontSizeIncrease = () => {
    const newSize = Math.min(fontSize + 2, MAX_FONT_SIZE);
    setFontSize(newSize);
    localStorage.setItem('fontSize', String(newSize));
    // Dispatch event so notes can recalculate positions
    window.dispatchEvent(new CustomEvent('fontSizeChange'));
  };

  const handleFontSizeDecrease = () => {
    const newSize = Math.max(fontSize - 2, MIN_FONT_SIZE);
    setFontSize(newSize);
    localStorage.setItem('fontSize', String(newSize));
    // Dispatch event so notes can recalculate positions
    window.dispatchEvent(new CustomEvent('fontSizeChange'));
  };

  const handleFontSizeReset = () => {
    setFontSize(DEFAULT_FONT_SIZE);
    localStorage.setItem('fontSize', String(DEFAULT_FONT_SIZE));
    window.dispatchEvent(new CustomEvent('fontSizeChange'));
  };

  const handleFontFamilyChange = (family: 'serif' | 'sans') => {
    setFontFamily(family);
    localStorage.setItem('fontFamily', family);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fontFamilyClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  const canIncrease = fontSize < MAX_FONT_SIZE;
  const canDecrease = fontSize > MIN_FONT_SIZE;

  return (
    <div className={`min-h-screen ${fontFamilyClass} ${devMode ? 'dev-mode' : ''} ${devBorder('purple')}`} style={{ backgroundColor: 'var(--background)' }}>
      <Header
        fontFamily={fontFamily}
        fontSize={fontSize}
        defaultFontSize={DEFAULT_FONT_SIZE}
        onFontSizeIncrease={handleFontSizeIncrease}
        onFontSizeDecrease={handleFontSizeDecrease}
        onFontSizeReset={handleFontSizeReset}
        onFontFamilyChange={handleFontFamilyChange}
        canIncrease={canIncrease}
        canDecrease={canDecrease}
      />

      <Sidebar
        sections={sections}
        currentSlug={currentSlug}
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <main
        className={`ml-0 md:ml-72 pt-14 min-h-screen overflow-x-hidden overscroll-contain ${devBorder('green')}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-4xl mx-auto px-8 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
