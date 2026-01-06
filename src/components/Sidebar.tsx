'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useSearch, getMatchSnippet, SearchResult } from '../hooks/useSearch';
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

interface SidebarProps {
  sections: Section[];
  currentSlug?: string;
}

export default function Sidebar({ sections, currentSlug }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { search, results, isLoading, clearResults } = useSearch();
  const { devBorder } = useDevMode();

  // Preserve scroll position across navigation
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Restore scroll position from sessionStorage
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll) {
      sidebar.scrollTop = parseInt(savedScroll, 10);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem('sidebar-scroll', String(sidebar.scrollTop));
    };

    sidebar.addEventListener('scroll', handleScroll);
    return () => sidebar.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, search, clearResults]);

  // Flatten chapters for filtering
  const allChapters = sections.flatMap(s => s.chapters);

  const showSearchResults = debouncedQuery.trim().length > 0 && results.length > 0;
  const showNoResults = debouncedQuery.trim().length > 0 && !isLoading && results.length === 0;

  return (
    <aside ref={sidebarRef} className={`fixed left-0 top-14 bottom-0 w-64 overflow-y-auto z-40 ${devBorder('blue')}`} style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
      {/* Search */}
      <div className={`p-4 ${devBorder('yellow')}`} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted-text)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] focus:border-transparent"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--foreground)' }}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-t-[#003262] rounded-full animate-spin" style={{ borderColor: 'var(--input-border)', borderTopColor: 'var(--berkeley-blue)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className={`${devBorder('emerald')}`} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>
            Search Results ({results.length})
          </p>
          <ul className="px-2 pb-2 space-y-1">
            {results.slice(0, 10).map((result) => (
              <SearchResultItem
                key={result.item.objectID}
                result={result}
                query={debouncedQuery}
                isActive={result.item.href.includes(currentSlug || '')}
              />
            ))}
          </ul>
          {results.length > 10 && (
            <p className="px-4 pb-2 text-xs" style={{ color: 'var(--muted-text)' }}>
              +{results.length - 10} more results
            </p>
          )}
        </div>
      )}

      {showNoResults && (
        <div className="px-4 py-4 text-sm text-center" style={{ color: 'var(--muted-text)', borderBottom: '1px solid var(--sidebar-border)' }}>
          No results found for &ldquo;{debouncedQuery}&rdquo;
        </div>
      )}

      {/* Section List */}
      <nav className={`p-2 ${devBorder('cyan')}`}>
        {sections.map((section) => {
          const hasActiveChapter = section.chapters.some(ch => ch.slug === currentSlug);

          return (
            <div key={section.name} className={`mb-2 ${devBorder('orange')}`}>
              {/* Section Header */}
              <div
                className="px-3 py-2 text-sm font-semibold"
                style={{ color: hasActiveChapter ? 'var(--berkeley-blue)' : 'var(--foreground)' }}
              >
                {section.name}
              </div>

              {/* Chapter List */}
              <ul className={`mt-1 ml-2 space-y-1 ${devBorder('teal')}`}>
                {section.chapters.map((chapter) => {
                  const isActive = chapter.slug === currentSlug;
                  return (
                    <li key={chapter.slug} className={devBorder('violet')}>
                      <Link
                        href={`/chapter/${chapter.slug}`}
                        className="block px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: isActive ? 'var(--berkeley-blue)' : 'transparent',
                          color: isActive ? 'white' : 'var(--foreground)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span
                          className="text-xs mr-2"
                          style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--muted-text)' }}
                        >
                          {chapter.chapterNumber}
                        </span>
                        {chapter.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function SearchResultItem({
  result,
  query,
  isActive,
}: {
  result: SearchResult;
  query: string;
  isActive: boolean;
}) {
  const { item } = result;
  const snippet = getMatchSnippet(item.text, query);

  // Add search query to URL so the page can highlight/scroll to the match
  const hrefWithQuery = `${item.href}${item.href.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`;

  return (
    <li>
      <Link
        href={hrefWithQuery}
        className="block px-3 py-2 rounded-lg text-sm"
        style={{ backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent' }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = isActive ? 'var(--sidebar-active)' : 'transparent';
        }}
      >
        <div className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{item.title}</div>
        {item.section && (
          <div className="text-xs truncate" style={{ color: 'var(--berkeley-blue)' }}>{item.section}</div>
        )}
        <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted-text)' }}>
          <HighlightedText text={snippet} query={query} />
        </div>
      </Link>
    </li>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
