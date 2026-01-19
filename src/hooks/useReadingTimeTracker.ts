'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface UseReadingTimeTrackerOptions {
  chapterSlug: string;
  updateIntervalSeconds?: number; // How often to send updates to server
  enabled?: boolean; // Whether tracking is enabled
}

/**
 * Hook to track reading time for a chapter.
 *
 * Features:
 * - Tracks time only when the page/tab is visible
 * - Batches updates to reduce API calls (default: every 30 seconds)
 * - Accumulates time on the server (one row per user/chapter)
 * - Pauses when user switches tabs or minimizes window
 * - Sends final update on unmount/navigation
 */
export function useReadingTimeTracker({
  chapterSlug,
  updateIntervalSeconds = 30,
  enabled = true,
}: UseReadingTimeTrackerOptions) {
  const { user, isSignedIn } = useUser();
  const accumulatedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(false);

  // Send accumulated time to server
  const sendTimeUpdate = useCallback(async (force = false) => {
    // Don't send if no user, no time accumulated, or already sending
    if (!isSignedIn || !user || accumulatedSecondsRef.current === 0 || isSendingRef.current) {
      return;
    }

    // Only send if we have at least 1 second or force is true
    if (accumulatedSecondsRef.current < 1 && !force) {
      return;
    }

    const secondsToSend = Math.floor(accumulatedSecondsRef.current);
    if (secondsToSend === 0) return;

    isSendingRef.current = true;

    try {
      const response = await fetch('/api/reading-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterSlug,
          secondsToAdd: secondsToSend,
        }),
      });

      if (response.ok) {
        // Only subtract the seconds we successfully sent
        accumulatedSecondsRef.current -= secondsToSend;
      } else {
        console.error('Failed to update reading time:', await response.text());
      }
    } catch (error) {
      console.error('Error sending reading time update:', error);
    } finally {
      isSendingRef.current = false;
    }
  }, [isSignedIn, user, chapterSlug]);

  // Handle visibility changes
  useEffect(() => {
    if (!enabled || !isSignedIn || !user) return;

    const handleVisibilityChange = () => {
      const wasVisible = isVisibleRef.current;
      isVisibleRef.current = document.visibilityState === 'visible';

      if (wasVisible && !isVisibleRef.current) {
        // Page became hidden - record time since last tick and send update
        if (lastTickRef.current !== null) {
          const now = Date.now();
          const elapsed = (now - lastTickRef.current) / 1000;
          accumulatedSecondsRef.current += elapsed;
          lastTickRef.current = null;
        }
        // Send accumulated time when user leaves
        sendTimeUpdate(true);
      } else if (!wasVisible && isVisibleRef.current) {
        // Page became visible - start tracking again
        lastTickRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isSignedIn, user, sendTimeUpdate]);

  // Main tracking interval
  useEffect(() => {
    if (!enabled || !isSignedIn || !user) return;

    // Start tracking
    lastTickRef.current = Date.now();
    isVisibleRef.current = document.visibilityState === 'visible';

    // Tick every second to accumulate time (only when visible)
    const tickInterval = setInterval(() => {
      if (isVisibleRef.current && lastTickRef.current !== null) {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        accumulatedSecondsRef.current += elapsed;
        lastTickRef.current = now;
      }
    }, 1000);

    // Send updates to server periodically
    intervalRef.current = setInterval(() => {
      sendTimeUpdate();
    }, updateIntervalSeconds * 1000);

    return () => {
      clearInterval(tickInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Record final time before unmount
      if (isVisibleRef.current && lastTickRef.current !== null) {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        accumulatedSecondsRef.current += elapsed;
      }

      // Send final update on unmount (use sendBeacon for reliability)
      if (accumulatedSecondsRef.current > 0 && isSignedIn && user) {
        const secondsToSend = Math.floor(accumulatedSecondsRef.current);
        if (secondsToSend > 0) {
          // Use sendBeacon for reliable delivery on page unload
          const data = JSON.stringify({
            chapterSlug,
            secondsToAdd: secondsToSend,
          });
          navigator.sendBeacon('/api/reading-time', data);
        }
      }
    };
  }, [enabled, isSignedIn, user, chapterSlug, updateIntervalSeconds, sendTimeUpdate]);

  // Handle page unload (backup for sendBeacon)
  useEffect(() => {
    if (!enabled || !isSignedIn || !user) return;

    const handleBeforeUnload = () => {
      // Record final time
      if (isVisibleRef.current && lastTickRef.current !== null) {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        accumulatedSecondsRef.current += elapsed;
        lastTickRef.current = null;
      }

      // Send via beacon
      const secondsToSend = Math.floor(accumulatedSecondsRef.current);
      if (secondsToSend > 0) {
        const data = JSON.stringify({
          chapterSlug,
          secondsToAdd: secondsToSend,
        });
        navigator.sendBeacon('/api/reading-time', data);
        accumulatedSecondsRef.current = 0;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, isSignedIn, user, chapterSlug]);
}
