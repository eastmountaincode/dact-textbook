'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useDevMode } from '@/providers/DevModeProvider';
// TODO: Search disabled temporarily - needs fix for navigating to specific occurrences
// import SidebarSearch from './SidebarSearch';

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

interface SidebarProps {
  sections: Section[];
  currentSlug?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ sections, currentSlug, isOpen, onToggle }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const { devBorder } = useDevMode();

  // Set up scroll listener once on mount
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleScroll = () => {
      sessionStorage.setItem('sidebar-scroll', String(sidebar.scrollTop));
    };

    sidebar.addEventListener('scroll', handleScroll);
    return () => sidebar.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position on mount and after navigation
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll) {
      sidebar.scrollTop = parseInt(savedScroll, 10);
    }
  }, [currentSlug]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      onToggle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug]);

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - handles positioning and transform */}
      <div
        className={`fixed left-0 top-14 bottom-0 w-72 z-40 duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Mobile Toggle Button - positioned on right edge, outside overflow */}
        <button
          onClick={onToggle}
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-50 md:hidden flex items-center justify-center w-6 h-16 rounded-r-md cursor-pointer bg-[var(--sidebar-bg)] border-r border-t border-b border-[var(--sidebar-border)]"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            className={`w-4 h-4 text-[var(--muted-text)] ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Sidebar Content - scrollable */}
        <aside
          ref={sidebarRef}
          className={`h-full overflow-y-auto bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] font-serif ${devBorder('blue')}`}
        >
          {/* Search - disabled temporarily */}
          {/* <SidebarSearch currentSlug={currentSlug} /> */}

          {/* Section List */}
          <nav className={`${devBorder('cyan')}`}>
            {sections.map((section) => (
                <div key={section.name} className={`${devBorder('orange')}`}>
                  {/* Section Header */}
                  <div
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--sidebar-section-bg)] text-[var(--muted-text)] ${devBorder('pink')}`}
                  >
                    {section.name}
                  </div>

                  {/* Chapter List */}
                  <ul className={`${devBorder('teal')}`}>
                    {section.chapters.map((chapter) => {
                      const isActive = chapter.slug === currentSlug;
                      const hasNumber = chapter.chapterNumber !== null;
                      return (
                        <li key={chapter.slug} className={`${devBorder('violet')}`}>
                          <Link
                            href={`/chapter/${chapter.slug}`}
                            className={`flex items-baseline py-2.5 ${hasNumber ? 'pl-2' : 'pl-4'} pr-5 text-sm ${isActive ? 'bg-[var(--berkeley-blue)] text-white' : 'text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]'}`}
                          >
                            {hasNumber && (
                              <span
                                className={`inline-block w-6 flex-shrink-0 text-xs text-right pr-2 -translate-y-0.5 ${isActive ? 'text-white/60' : 'text-[var(--muted-text)]'} ${devBorder('red')}`}
                              >
                                {chapter.chapterNumber}
                              </span>
                            )}
                            <span className={`${devBorder('green')}`}>
                              {chapter.title}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
