'use client';

interface ReadingTimeBarProps {
  label: string;
  seconds: number;
  maxSeconds: number;
  color?: string;
  subtitle?: string;
}

export function formatTime(seconds: number, showZero: boolean = false): string {
  if (seconds === 0) return showZero ? '0m' : '–';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins}m`;
  }
  const hours = seconds / 3600;
  if (hours < 10) {
    return `${hours.toFixed(1)}h`;
  }
  return `${Math.round(hours)}h`;
}

export function ReadingTimeBar({ label, seconds, maxSeconds, color = 'var(--berkeley-blue)', subtitle }: ReadingTimeBarProps) {
  const percentage = maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 0;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      {/* Label */}
      <div className="flex-1 md:flex-none md:w-64">
        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
        {subtitle && (
          <span className="text-xs ml-2" style={{ color: 'var(--muted-text)' }}>({subtitle})</span>
        )}
      </div>

      {/* Bar - hidden on mobile */}
      <div className="hidden md:flex flex-1 items-center gap-3">
        <div
          className="flex-1 h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--input-border)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
              minWidth: seconds > 0 ? '4px' : '0',
            }}
          />
        </div>
      </div>

      {/* Time value - fixed width to ensure consistent bar lengths */}
      <span
        className="text-right text-sm font-medium flex-shrink-0 w-12"
        style={{ color: 'var(--foreground)' }}
      >
        {formatTime(seconds)}
      </span>
    </div>
  );
}

interface ReadingTimeBarListProps {
  items: Array<{
    id: string;
    label: string;
    seconds: number;
  }>;
  color?: string;
  emptyMessage?: string;
}

export function ReadingTimeBarList({ items, color, emptyMessage = 'No data available' }: ReadingTimeBarListProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted-text)' }}>{emptyMessage}</p>
      </div>
    );
  }

  const maxSeconds = Math.max(...items.map(item => item.seconds), 1);

  return (
    <div>
      {items.map((item) => (
        <ReadingTimeBar
          key={item.id}
          label={item.label}
          seconds={item.seconds}
          maxSeconds={maxSeconds}
          color={color}
        />
      ))}
    </div>
  );
}
