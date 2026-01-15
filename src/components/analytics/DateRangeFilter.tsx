'use client';

export type DateRange = '7d' | '30d' | '90d' | 'all';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const selectStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--foreground)',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
    paddingRight: '2rem',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRange)}
      className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer select-hover"
      style={selectStyle}
    >
      {DATE_RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function getDateRangeStart(range: DateRange): Date | null {
  if (range === 'all') return null;

  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start;
}
