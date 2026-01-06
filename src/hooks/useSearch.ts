'use client';

import { useState, useCallback, useRef } from 'react';
import Fuse, { IFuseOptions, FuseResultMatch } from 'fuse.js';

export interface SearchEntry {
  objectID: string;
  href: string;
  title: string;
  section: string;
  text: string;
}

export interface SearchResult {
  item: SearchEntry;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

const fuseOptions: IFuseOptions<SearchEntry> = {
  keys: [
    { name: 'title', weight: 20 },
    { name: 'section', weight: 20 },
    { name: 'text', weight: 10 },
  ],
  includeScore: true,
  includeMatches: true,
  threshold: 0.1, // Stricter matching to reduce false positives
  ignoreLocation: true,
  minMatchCharLength: 3,
};

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null);
  const indexLoadedRef = useRef(false);

  // Load search index lazily
  const loadIndex = useCallback(async () => {
    if (indexLoadedRef.current || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/search.json');
      if (!response.ok) {
        throw new Error('Failed to load search index');
      }
      const data: SearchEntry[] = await response.json();
      fuseRef.current = new Fuse(data, fuseOptions);
      indexLoadedRef.current = true;
      setIsReady(true);
    } catch (error) {
      console.error('Error loading search index:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Search function
  const search = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query.trim()) {
        setResults([]);
        return [];
      }

      // Load index if not loaded
      if (!fuseRef.current) {
        await loadIndex();
      }

      if (!fuseRef.current) {
        return [];
      }

      const searchResults = fuseRef.current.search(query, { limit: 20 });
      setResults(searchResults);
      return searchResults;
    },
    [loadIndex]
  );

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    search,
    results,
    isLoading,
    isReady,
    clearResults,
    loadIndex,
  };
}

/**
 * Extract a snippet of text around the match
 */
export function getMatchSnippet(text: string, query: string, maxLength = 150): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, matchIndex + query.length + 100);

  let snippet = text.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}
