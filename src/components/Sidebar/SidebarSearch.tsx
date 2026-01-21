'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearch, SearchResult } from '../../hooks/useSearch';
import { useDevMode } from '@/providers/DevModeProvider';

interface SidebarSearchProps {
  currentSlug?: string;
}

export default function SidebarSearch({ currentSlug }: SidebarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const { search, results, isLoading, clearResults } = useSearch();
  const { devBorder } = useDevMode();

  // Restore from sessionStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const init = async () => {
      const savedQuery = sessionStorage.getItem('searchQuery') || '';
      if (savedQuery) {
        setSearchQuery(savedQuery);
        setDebouncedQuery(savedQuery);
        // Wait for search to complete before showing UI to prevent flash
        await search(savedQuery);
      }
      setHasMounted(true);
      // Wait for React to render the results before signaling ready
      // Double rAF ensures the DOM has been painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('sidebarSearchReady'));
        });
      });
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save search query to sessionStorage when it changes (after mount)
  useEffect(() => {
    if (!hasMounted) return;
    if (searchQuery) {
      sessionStorage.setItem('searchQuery', searchQuery);
    } else {
      sessionStorage.removeItem('searchQuery');
    }
  }, [searchQuery, hasMounted]);

  // Debounce search input
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip debounce on initial restore from sessionStorage
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

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

  const showSearchResults = hasMounted && debouncedQuery.trim().length > 0 && results.length > 0;
  const showNoResults = hasMounted && debouncedQuery.trim().length > 0 && !isLoading && results.length === 0;

  return (
    <>
      {/* Search Input */}
      <div className={`p-4 border-b border-[var(--sidebar-border)] ${devBorder('yellow')}`}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]"
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
            className="w-full pl-10 pr-10 py-2 text-base rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--berkeley-blue)] focus:border-transparent"
          />
          {isLoading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[var(--input-border)] border-t-[var(--berkeley-blue)] rounded-full animate-spin" />
            </div>
          ) : searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--sidebar-hover)] text-[var(--muted-text)] hover:text-[var(--foreground)] cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className={`border-b border-[var(--sidebar-border)] ${devBorder('emerald')}`}>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">
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
            <p className="px-4 pb-2 text-xs text-[var(--muted-text)]">
              +{results.length - 10} more results
            </p>
          )}
        </div>
      )}

      {showNoResults && (
        <div className="px-4 py-4 text-base text-center text-[var(--muted-text)] border-b border-[var(--sidebar-border)]">
          No results found for &ldquo;{debouncedQuery}&rdquo;
        </div>
      )}
    </>
  );
}

/**
 * Get snippet with match position
 * For multi-word queries, tries to find the full phrase or individual words
 */
function getSnippetWithMatch(
  result: SearchResult,
  query: string
): { snippet: string; matchStart: number; matchEnd: number } {
  const text = result.item.text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // First try: exact phrase match
  let matchIndex = lowerText.indexOf(lowerQuery);

  // Second try: if query has multiple words, try to find them close together
  if (matchIndex === -1 && query.includes(' ')) {
    const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 0) {
      // Find the first significant word
      for (const word of words) {
        const wordIndex = lowerText.indexOf(word);
        if (wordIndex !== -1) {
          matchIndex = wordIndex;
          // Use the word length for highlighting
          const snippetStart = Math.max(0, matchIndex - 50);
          const snippetEnd = Math.min(text.length, matchIndex + word.length + 100);
          let snippet = text.slice(snippetStart, snippetEnd);
          let mStart = matchIndex - snippetStart;
          let mEnd = mStart + word.length;

          if (snippetStart > 0) {
            snippet = '...' + snippet;
            mStart += 3;
            mEnd += 3;
          }
          if (snippetEnd < text.length) {
            snippet = snippet + '...';
          }

          return { snippet, matchStart: mStart, matchEnd: mEnd };
        }
      }
    }
  }

  // Found exact match
  if (matchIndex !== -1) {
    const snippetStart = Math.max(0, matchIndex - 50);
    const snippetEnd = Math.min(text.length, matchIndex + query.length + 100);
    let snippet = text.slice(snippetStart, snippetEnd);
    let matchStart = matchIndex - snippetStart;
    let matchEnd = matchStart + query.length;

    if (snippetStart > 0) {
      snippet = '...' + snippet;
      matchStart += 3;
      matchEnd += 3;
    }
    if (snippetEnd < text.length) {
      snippet = snippet + '...';
    }

    return { snippet, matchStart, matchEnd };
  }

  // No match found, return beginning of text
  const snippet = text.slice(0, 150) + (text.length > 150 ? '...' : '');
  return { snippet, matchStart: -1, matchEnd: -1 };
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

  // Get snippet with match position
  const { snippet, matchStart, matchEnd } = getSnippetWithMatch(result, query);

  // Build URL with search query for highlighting
  const [basePath, hash] = item.href.split('#');
  const separator = basePath.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const params = `q=${encodeURIComponent(query)}&t=${timestamp}`;
  const hrefWithQuery = hash
    ? `${basePath}${separator}${params}#${hash}`
    : `${basePath}${separator}${params}`;

  return (
    <li>
      <Link
        href={hrefWithQuery}
        className={`block px-3 py-2 rounded-lg text-base ${isActive ? 'bg-[var(--sidebar-active)]' : 'hover:bg-[var(--sidebar-hover)]'}`}
      >
        <div className="font-medium truncate text-[var(--foreground)]">{item.title}</div>
        {item.section && (
          <div className="text-xs truncate text-[var(--berkeley-blue)]">{item.section}</div>
        )}
        <div className="text-xs mt-1 line-clamp-2 text-[var(--muted-text)]">
          <HighlightedSnippet snippet={snippet} matchStart={matchStart} matchEnd={matchEnd} />
        </div>
      </Link>
    </li>
  );
}

function HighlightedSnippet({
  snippet,
  matchStart,
  matchEnd,
}: {
  snippet: string;
  matchStart: number;
  matchEnd: number;
}) {
  // If no match position, just return the text
  if (matchStart < 0 || matchEnd < 0 || matchStart >= snippet.length) {
    return <>{snippet}</>;
  }

  const before = snippet.slice(0, matchStart);
  const match = snippet.slice(matchStart, matchEnd);
  const after = snippet.slice(matchEnd);

  return (
    <>
      {before}
      <mark className="bg-[var(--highlight-bg)] text-[var(--highlight-text)] rounded px-0.5">
        {match}
      </mark>
      {after}
    </>
  );
}
