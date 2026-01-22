'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { useDevMode } from '@/providers/DevModeProvider';

interface ChapterInfo {
  slug: string;
  title: string;
  chapterNumber: number | null;
}

interface Section {
  name: string;
  chapters: ChapterInfo[];
  isPreface?: boolean;
}

interface ChapterLayoutClientProps {
  children: React.ReactNode;
  sections: Section[];
}

export default function ChapterLayoutClient({
  children,
  sections,
}: ChapterLayoutClientProps) {
  const { devMode, devBorder } = useDevMode();
  const pathname = usePathname();

  const MIN_FONT_SIZE = 14;
  const MAX_FONT_SIZE = 22;
  const DEFAULT_FONT_SIZE = 16;

  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract current slug from pathname (/chapter/slug-name -> slug-name)
  const currentSlug = pathname?.split('/').pop() || '';

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
    <div className={`min-h-screen ${devMode ? 'dev-mode' : ''} ${devBorder('purple')}`} style={{ backgroundColor: 'var(--background)' }}>
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
        className={`ml-0 md:ml-72 fixed top-14 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden ${devBorder('green')}`}
      >
        <div
          className={`max-w-4xl mx-auto px-10 py-10 ${fontFamilyClass}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
