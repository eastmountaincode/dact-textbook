'use client';

import { useReadingTimeTracker } from '@/hooks/useReadingTimeTracker';

interface ReadingTimeTrackerProps {
  chapterSlug: string;
}

/**
 * Invisible component that tracks reading time for a chapter.
 *
 * Include this component on chapter pages where you want to track
 * how long authenticated users spend reading.
 *
 * - Updates are batched and sent every 30 seconds
 * - Pauses tracking when the tab is not visible
 * - Sends a final update when navigating away
 * - Time is accumulated per user/chapter in the database
 */
export default function ReadingTimeTracker({ chapterSlug }: ReadingTimeTrackerProps) {
  useReadingTimeTracker({
    chapterSlug,
    updateIntervalSeconds: 30,
    enabled: true,
  });

  // This component renders nothing - it just runs the tracking hook
  return null;
}
