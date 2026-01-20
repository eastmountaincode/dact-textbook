'use client';

import { useState, useEffect } from 'react';
import { DevBorderColor } from '@/providers/DevModeProvider';

interface CronLog {
  id: number;
  job_name: string;
  status: 'success' | 'error';
  message: string;
  created_at: string;
}

interface MaintenanceData {
  lastSuccessfulRun: string | null;
  recentLogs: CronLog[];
}

interface UserSearchResult {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  totalReadingSeconds: number;
}

interface SiteMaintenanceProps {
  devBorder?: (color: DevBorderColor) => string;
}

export function SiteMaintenance({ devBorder = () => '' }: SiteMaintenanceProps) {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Reading time reset state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  async function fetchData() {
    try {
      const response = await fetch('/api/analytics/maintenance');
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance data');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleTrigger() {
    setIsTriggering(true);
    try {
      const response = await fetch('/api/analytics/maintenance/trigger', {
        method: 'POST',
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to trigger keep-alive');
      }
      // Refresh data after successful trigger
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger');
    } finally {
      setIsTriggering(false);
    }
  }

  async function handleSearchUsers() {
    if (searchEmail.length < 3) {
      setSearchError('Enter at least 3 characters');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setResetSuccess(null);

    try {
      const response = await fetch(`/api/analytics/maintenance/reset-reading-time?email=${encodeURIComponent(searchEmail)}`);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Search failed');
      }
      const result = await response.json();
      setSearchResults(result.users);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleResetReadingTime(targetUserId: string, userEmail: string) {
    if (!confirm(`Are you sure you want to reset all reading time for ${userEmail}? This cannot be undone.`)) {
      return;
    }

    setIsResetting(targetUserId);
    setResetSuccess(null);

    try {
      const response = await fetch('/api/analytics/maintenance/reset-reading-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Reset failed');
      }

      const result = await response.json();
      setResetSuccess(`Reset complete: ${result.deletedPerChapter} chapter records, ${result.deletedDaily} daily records deleted`);

      // Update the search results to reflect the reset
      setSearchResults(prev =>
        prev.map(u =>
          u.user_id === targetUserId ? { ...u, totalReadingSeconds: 0 } : u
        )
      );
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsResetting(null);
    }
  }

  function formatReadingTime(seconds: number): string {
    if (seconds === 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-xl p-6 animate-pulse ${devBorder('purple')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className="h-5 rounded w-1/4 mb-4" style={{ backgroundColor: 'var(--card-border)' }} />
        <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--card-border)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-xl p-6 ${devBorder('purple')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
      </div>
    );
  }

  const lastRun = data?.recentLogs?.[0];

  return (
    <div
      className={`rounded-xl p-6 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
        Database Keep-Alive
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        A cron job runs daily at midnight UTC to ping the Supabase database and prevent it from pausing due to inactivity.
      </p>

      <div className="space-y-3 text-sm">
        <div className="flex">
          <span className="w-20" style={{ color: 'var(--muted-text)' }}>Last run</span>
          <span style={{ color: 'var(--foreground)' }}>
            {lastRun ? formatDate(lastRun.created_at) : 'Never'}
          </span>
        </div>
        <div className="flex">
          <span className="w-20" style={{ color: 'var(--muted-text)' }}>Status</span>
          <span style={{ color: 'var(--foreground)' }}>
            {lastRun ? (lastRun.status === 'success' ? 'Success' : 'Failed') : '—'}
          </span>
        </div>
        <div className="flex">
          <span className="w-20" style={{ color: 'var(--muted-text)' }}>Endpoint</span>
          <span style={{ color: 'var(--foreground)' }}>/api/cron/keep-alive</span>
        </div>
      </div>

      <button
        onClick={handleTrigger}
        disabled={isTriggering}
        className="mt-6 px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50 hover:opacity-90 cursor-pointer"
        style={{ backgroundColor: 'var(--berkeley-blue)' }}
      >
        {isTriggering ? 'Running...' : 'Run Now'}
      </button>

      {/* Reset Reading Time Section */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--card-border)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          Reset Reading Time
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>
          Search for a user by email and reset their reading time data.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
            placeholder="Search by email..."
            className="flex-1 px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
          />
          <button
            onClick={handleSearchUsers}
            disabled={isSearching || searchEmail.length < 3}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50 hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: 'var(--berkeley-blue)' }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchError && (
          <p className="text-sm mb-4" style={{ color: '#dc2626' }}>
            {searchError}
          </p>
        )}

        {resetSuccess && (
          <p className="text-sm mb-4" style={{ color: '#16a34a' }}>
            {resetSuccess}
          </p>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-text)' }}>
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm whitespace-nowrap" style={{ color: 'var(--muted-text)' }}>
                    {formatReadingTime(user.totalReadingSeconds)}
                  </span>
                  <button
                    onClick={() => handleResetReadingTime(user.user_id, user.email)}
                    disabled={isResetting === user.user_id || user.totalReadingSeconds === 0}
                    className="px-3 py-1 text-xs rounded font-medium disabled:opacity-50 hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: user.totalReadingSeconds === 0 ? 'var(--card-border)' : '#dc2626',
                      color: 'white',
                    }}
                  >
                    {isResetting === user.user_id ? 'Resetting...' : 'Reset'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
