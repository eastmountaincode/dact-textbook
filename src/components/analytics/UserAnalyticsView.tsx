'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingTimeBar, formatTime } from './ReadingTimeBar';
import { DateRangeFilter, DateRange } from './DateRangeFilter';

interface ChapterData {
  id: string;
  slug: string;
  title: string;
  section: string | null;
  order: number;
  seconds: number;
}

interface Summary {
  totalSeconds: number;
  chaptersVisited: number;
  totalChapters: number;
  lastActivity: string | null;
}

interface UserAnalyticsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  devBorder?: (color: any) => string;
}

export function UserAnalyticsView({ devBorder = () => '' }: UserAnalyticsViewProps) {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const fetchData = useCallback(async (isInitial: boolean) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }
    try {
      const res = await fetch(`/api/analytics/user-reading-time?dateRange=${dateRange}`);
      if (!res.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await res.json();
      setChapters(data.chapters);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [dateRange]);

  // Initial load
  useEffect(() => {
    fetchData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when date range changes (but not on initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchData(false);
  }, [dateRange, fetchData]);

  // Group chapters by section
  const groupedChapters = chapters.reduce((acc, chapter) => {
    const section = chapter.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(chapter);
    return acc;
  }, {} as Record<string, ChapterData[]>);

  // Get section order based on first chapter in each section
  const sectionOrder = Object.keys(groupedChapters).sort((a, b) => {
    const aFirst = groupedChapters[a][0];
    const bFirst = groupedChapters[b][0];
    return (aFirst?.order || 0) - (bFirst?.order || 0);
  });

  const maxSeconds = Math.max(...chapters.map(c => c.seconds), 1);

  if (isLoading) {
    return (
      <div
        className={`rounded-xl p-8 ${devBorder('purple')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded mb-4" style={{ backgroundColor: 'var(--input-bg)' }} />
          <div className="h-4 w-48 rounded mb-8" style={{ backgroundColor: 'var(--input-bg)' }} />
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div className="h-8 w-16 rounded mb-2" style={{ backgroundColor: 'var(--card-border)' }} />
                <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--card-border)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-xl p-8 ${devBorder('purple')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      {/* Header with date range */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            Your Activity
          </h2>
          <p className="text-base" style={{ color: 'var(--muted-text)' }}>
            Track your reading progress and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>Updating...</span>
          )}
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--berkeley-blue)' }}>
            {summary ? formatTime(summary.totalSeconds) : '--'}
          </div>
          <div className="text-base" style={{ color: 'var(--muted-text)' }}>
            Total Reading Time
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--berkeley-blue)' }}>
            {summary && summary.chaptersVisited > 0
              ? formatTime(Math.round(summary.totalSeconds / summary.chaptersVisited))
              : '--'}
          </div>
          <div className="text-base" style={{ color: 'var(--muted-text)' }}>
            Avg per Chapter
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--berkeley-blue)' }}>
            {summary ? `${summary.chaptersVisited}/${summary.totalChapters}` : '--'}
          </div>
          <div className="text-base" style={{ color: 'var(--muted-text)' }}>
            Chapters Visited
          </div>
        </div>
      </div>

      {/* Reading Time by Chapter */}
      <h3 className="font-medium mb-4" style={{ color: 'var(--foreground)' }}>
        Reading Time by Chapter
      </h3>

      {chapters.length === 0 ? (
        <p className="text-base py-8 text-center" style={{ color: 'var(--muted-text)' }}>
          No chapters available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {sectionOrder.map(section => (
            <div
              key={section}
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
            >
              <h4
                className="text-base font-medium mb-3"
                style={{ color: 'var(--muted-text)' }}
              >
                {section}
              </h4>
              <div>
                {groupedChapters[section].map(chapter => (
                  <ReadingTimeBar
                    key={chapter.id}
                    label={chapter.title}
                    seconds={chapter.seconds}
                    maxSeconds={maxSeconds}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {summary && summary.chaptersVisited === 0 && (
        <p className="mt-6 text-base text-center" style={{ color: 'var(--muted-text)' }}>
          Start reading to track your progress!
        </p>
      )}
    </div>
  );
}
