'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearch, getMatchSnippet, SearchResult } from '../../hooks/useSearch';
import { useDevMode } from '@/providers/DevModeProvider';

interface SidebarSearchProps {
  currentSlug?: string;
}

export default function SidebarSearch({ currentSlug }: SidebarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { search, results, isLoading, clearResults } = useSearch();
  const { devBorder } = useDevMode();

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

  const showSearchResults = debouncedQuery.trim().length > 0 && results.length > 0;
  const showNoResults = debouncedQuery.trim().length > 0 && !isLoading && results.length === 0;

  // Calculate occurrence index for each result - tracks position within same section (same href including hash)
  const resultsWithOccurrence = results.slice(0, 10).map((result, index) => {
    // Count how many previous results have the same full href (including section anchor)
    // This tracks occurrences within the same section, not just the same chapter
    const href = result.item.href;
    let occurrenceIndex = 0;
    for (let i = 0; i < index; i++) {
      if (results[i].item.href === href) {
        occurrenceIndex++;
      }
    }
    return { result, occurrenceIndex };
  });

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
            {resultsWithOccurrence.map(({ result, occurrenceIndex }) => (
              <SearchResultItem
                key={result.item.objectID}
                result={result}
                query={debouncedQuery}
                isActive={result.item.href.includes(currentSlug || '')}
                occurrenceIndex={occurrenceIndex}
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

function SearchResultItem({
  result,
  query,
  isActive,
  occurrenceIndex,
}: {
  result: SearchResult;
  query: string;
  isActive: boolean;
  occurrenceIndex: number;
}) {
  const { item } = result;
  const snippet = getMatchSnippet(item.text, query);

  // Add search query, occurrence index, and timestamp to URL so the page can highlight/scroll
  // The timestamp ensures the effect re-runs even when navigating within the same page
  // URL format: /chapter/slug?q=term&n=0&t=timestamp#section-id
  const [basePath, hash] = item.href.split('#');
  const separator = basePath.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const hrefWithQuery = hash
    ? `${basePath}${separator}q=${encodeURIComponent(query)}&n=${occurrenceIndex}&t=${timestamp}#${hash}`
    : `${basePath}${separator}q=${encodeURIComponent(query)}&n=${occurrenceIndex}&t=${timestamp}`;

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
          <mark key={i} className="bg-[var(--highlight-bg)] text-[var(--highlight-text)] rounded px-0.5">
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
