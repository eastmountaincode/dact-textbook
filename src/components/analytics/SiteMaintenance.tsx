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

interface SiteMaintenanceProps {
  devBorder?: (color: DevBorderColor) => string;
}

export function SiteMaintenance({ devBorder = () => '' }: SiteMaintenanceProps) {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

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
    </div>
  );
}
