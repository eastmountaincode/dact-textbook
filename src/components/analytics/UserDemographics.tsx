'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Select, { StylesConfig, components, InputProps, GroupBase, DropdownIndicatorProps } from 'react-select';
import { COUNTRIES, getCountryLabel } from '@/components/CountrySelect';
import {
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  FIELD_OPTIONS,
  INSTITUTION_OPTIONS,
  STATISTICS_USE_OPTIONS,
  REFERRAL_OPTIONS,
} from '@/lib/profile-options';

type GroupByField = 'role' | 'country' | 'education_level' | 'field_of_study' | 'institution_type' | 'statistics_use' | 'referral_source';
type CountryOption = { value: string; label: string };

// Custom Input component to disable browser autofill for country filter
const NoAutofillInput = (props: InputProps<CountryOption, false, GroupBase<CountryOption>>) => (
  <components.Input
    {...props}
    autoComplete="off"
    data-lpignore="true"
    data-form-type="other"
  />
);

// Custom dropdown indicator to match native select arrow
const CustomDropdownIndicator = (props: DropdownIndicatorProps<CountryOption, false, GroupBase<CountryOption>>) => (
  <components.DropdownIndicator {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ width: '1rem', height: '1rem' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </components.DropdownIndicator>
);

const GROUP_BY_OPTIONS: { value: GroupByField; label: string }[] = [
  { value: 'role', label: 'Role' },
  { value: 'country', label: 'Country' },
  { value: 'education_level', label: 'Education Level' },
  { value: 'field_of_study', label: 'Field of Study' },
  { value: 'institution_type', label: 'Institution Type' },
  { value: 'statistics_use', label: 'Statistics Use' },
  { value: 'referral_source', label: 'Referral Source' },
];

// Filter options for non-country fields (country uses searchable select with full ISO list)
// Uses centralized options from profile-options.ts to stay in sync with signup form and account settings
type NonCountryField = Exclude<GroupByField, 'country'>;
const FILTER_OPTIONS: Record<NonCountryField, { label: string; values: { value: string; label: string }[] }> = {
  role: { label: 'Role', values: ROLE_OPTIONS },
  education_level: { label: 'Education', values: EDUCATION_OPTIONS },
  field_of_study: { label: 'Field of Study', values: FIELD_OPTIONS },
  institution_type: { label: 'Institution', values: INSTITUTION_OPTIONS },
  statistics_use: { label: 'Statistics Use', values: STATISTICS_USE_OPTIONS },
  referral_source: { label: 'Referral Source', values: REFERRAL_OPTIONS },
};

interface GroupData {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

interface Filters {
  [key: string]: string[] | undefined;
}

interface UserDemographicsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  devBorder?: (color: any) => string;
}

function DemographicBar({
  label,
  count,
  percentage,
  maxPercentage
}: {
  label: string;
  count: number;
  percentage: number;
  maxPercentage: number;
}) {
  const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {count.toLocaleString()}
          </span>
          <span className="text-base" style={{ color: 'var(--muted-text)' }}>
            ({percentage}%)
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            backgroundColor: 'var(--berkeley-blue)',
          }}
        />
      </div>
    </div>
  );
}

export function UserDemographics({ devBorder = () => '' }: UserDemographicsProps) {
  const [groupBy, setGroupBy] = useState<GroupByField>('role');
  const [filters, setFilters] = useState<Filters>({});
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isInitial: boolean) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({ groupBy });
      Object.entries(filters).forEach(([key, values]) => {
        if (values && Array.isArray(values) && values.length > 0) {
          params.set(key, values.join(','));
        }
      });
      const res = await fetch(`/api/analytics/user-demographics?${params.toString()}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch data');
      }

      const data = await res.json();
      setGroups(data.groups);
      setTotalUsers(data.totalUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [groupBy, filters]);

  useEffect(() => {
    fetchData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchData(false);
  }, [groupBy, filters, fetchData]);

  const selectStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--foreground)',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '1rem',
    paddingLeft: '12px',
    paddingRight: '40px',
  };

  const groupByLabel = GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label || groupBy;
  const maxPercentage = Math.max(...groups.map(g => g.percentage), 1);

  // Get available filter fields (exclude country - it has its own searchable input)
  const availableFilterFields = (Object.keys(FILTER_OPTIONS) as NonCountryField[]).filter(
    field => field !== groupBy
  );

  // Get active filters as individual chips (field + single value pairs)
  const activeFilterChips: { field: GroupByField; value: string }[] = [];
  Object.entries(filters).forEach(([field, values]) => {
    if (values && Array.isArray(values) && values.length > 0) {
      values.forEach(value => {
        activeFilterChips.push({ field: field as GroupByField, value });
      });
    }
  });

  // Get selected values for a field (to exclude from dropdown)
  const getSelectedValues = (field: NonCountryField): string[] => {
    const values = filters[field];
    return Array.isArray(values) ? values : [];
  };

  // Get selected country codes (to exclude from country dropdown)
  const selectedCountries = filters.country || [];

  const handleAddFilter = (combined: string) => {
    if (!combined) return;
    const [field, value] = combined.split(':');
    if (field && value) {
      setFilters(prev => {
        const existing = prev[field] || [];
        if (existing.includes(value)) return prev;
        return { ...prev, [field]: [...existing, value] };
      });
    }
  };

  const handleAddCountryFilter = (countryCode: string) => {
    if (!countryCode) return;
    setFilters(prev => {
      const existing = prev.country || [];
      if (existing.includes(countryCode)) return prev;
      return { ...prev, country: [...existing, countryCode] };
    });
  };

  const handleRemoveFilter = (field: string, value: string) => {
    setFilters(prev => {
      const existing = prev[field] || [];
      const newValues = existing.filter(v => v !== value);
      if (newValues.length === 0) {
        const newFilters = { ...prev };
        delete newFilters[field];
        return newFilters;
      }
      return { ...prev, [field]: newValues };
    });
  };

  const getFilterLabel = (field: GroupByField, value: string): string => {
    if (field === 'country') {
      return getCountryLabel(value);
    }
    const opt = FILTER_OPTIONS[field as NonCountryField]?.values.find(v => v.value === value);
    return opt?.label || value;
  };

  // Styles for the country filter react-select
  const countrySelectStyles: StylesConfig<CountryOption, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      borderColor: state.isFocused ? 'var(--berkeley-blue)' : 'var(--card-border)',
      borderRadius: '0.5rem',
      padding: '0',
      fontSize: '0.875rem',
      minHeight: '38px',
      boxShadow: 'none',
      cursor: 'pointer',
      transition: 'none',
      '&:hover': {
        borderColor: 'var(--berkeley-blue)',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 0 0 12px', // Match native select (12px left padding)
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '0.5rem',
      zIndex: 50,
      transition: 'none',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'var(--input-bg)' : 'transparent',
      color: 'var(--foreground)',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'none',
      '&:active': {
        backgroundColor: 'var(--input-bg)',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--foreground)',
      transition: 'none',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--foreground)',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--foreground)',
      transition: 'none',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '0 12px 0 8px',
      transition: 'none',
      '&:hover': {
        color: '#6b7280',
      },
    }),
  };

  // Available countries (exclude already selected ones)
  const availableCountries = COUNTRIES.filter(c => !selectedCountries.includes(c.value));
  const showCountryFilter = groupBy !== 'country';

  if (isLoading) {
    return (
      <div className={`space-y-4 ${devBorder('purple')}`}>
        {/* Grouping skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-4 w-36 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
            <div className="h-9 w-32 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
          </div>
        </div>
        {/* Filter skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
            <div className="h-9 w-32 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
            <div className="h-9 w-44 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
          </div>
        </div>
        {/* Results skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="h-6 w-32 rounded mb-2" style={{ backgroundColor: 'var(--input-bg)' }} />
          <div className="h-4 w-24 rounded mb-6" style={{ backgroundColor: 'var(--input-bg)' }} />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
                  <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--input-bg)' }} />
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
    <div className={`space-y-4 ${devBorder('purple')}`}>
      {/* Grouping Card */}
      <div
        className={`rounded-xl p-6 ${devBorder('blue')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className={`flex flex-wrap items-center gap-3 ${devBorder('cyan')}`}>
          <span className="text-base" style={{ color: 'var(--muted-text)' }}>Show users grouped by</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="py-2 rounded-lg text-base outline-none cursor-pointer select-hover"
            style={selectStyle}
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isFetching && (
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>Updating...</span>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <div
        className={`rounded-xl p-6 ${devBorder('green')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        {/* Add filter controls */}
        <div className={`flex flex-wrap items-center gap-3 ${devBorder('yellow')}`}>
          <span className="text-base" style={{ color: 'var(--muted-text)' }}>Filter by</span>

          {/* Regular filter dropdown (status, education, field of study, institution) */}
          <select
            value=""
            onChange={(e) => handleAddFilter(e.target.value)}
            className={`py-2 rounded-lg text-base outline-none cursor-pointer select-hover ${devBorder('red')}`}
            style={selectStyle}
          >
            <option value="">+ Add filter</option>
            {availableFilterFields.map(field => {
              const selectedValues = getSelectedValues(field);
              const availableValues = FILTER_OPTIONS[field].values.filter(
                v => !selectedValues.includes(v.value)
              );
              if (availableValues.length === 0) return null;
              return (
                <optgroup key={field} label={FILTER_OPTIONS[field].label}>
                  {availableValues.map(v => (
                    <option key={`${field}:${v.value}`} value={`${field}:${v.value}`}>
                      {v.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {/* Country filter (searchable) */}
          {showCountryFilter && (
            <div className={devBorder('blue')} style={{ width: '200px' }}>
              <Select<CountryOption, false>
                value={null}
                onChange={(option) => {
                  if (option) {
                    handleAddCountryFilter(option.value);
                  }
                }}
                options={availableCountries}
                styles={countrySelectStyles}
                placeholder="+ Add country filter"
                isClearable={false}
                isSearchable
                classNamePrefix="country-filter"
                components={{ Input: NoAutofillInput, DropdownIndicator: CustomDropdownIndicator }}
              />
            </div>
          )}

          {/* Clear all button */}
          {activeFilterChips.length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="text-base cursor-pointer hover:underline"
              style={{ color: 'var(--muted-text)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filters */}
        <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${devBorder('orange')}`} style={{ borderColor: 'var(--card-border)' }}>
          <span className="text-base" style={{ color: 'var(--muted-text)' }}>Active filters:</span>

          {activeFilterChips.length === 0 ? (
            <span className="text-base" style={{ color: 'var(--muted-text)', fontStyle: 'italic' }}>None</span>
          ) : (
            activeFilterChips.map(({ field, value }) => (
              <div
                key={`${field}:${value}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-base"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
              >
                <span style={{ color: 'var(--muted-text)' }}>
                  {field === 'country' ? 'Country' : FILTER_OPTIONS[field as NonCountryField].label}:
                </span>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {getFilterLabel(field, value)}
                </span>
                <button
                  onClick={() => handleRemoveFilter(field, value)}
                  className="ml-1 hover:opacity-70 cursor-pointer text-lg leading-none"
                  style={{ color: 'var(--muted-text)' }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Results Card */}
      <div
        className={`rounded-xl p-6 ${devBorder('red')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        {/* Header */}
        <div className={`mb-4 pb-4 border-b ${devBorder('pink')}`} style={{ borderColor: 'var(--card-border)' }}>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
            Users by {groupByLabel}
            {activeFilterChips.length > 0 && (
              <span className="font-normal text-base ml-2" style={{ color: 'var(--muted-text)' }}>
                ({activeFilterChips.length} {activeFilterChips.length === 1 ? 'filter' : 'filters'} applied)
              </span>
            )}
          </h3>
          <p className="text-base" style={{ color: 'var(--muted-text)' }}>
            {totalUsers.toLocaleString()} total users
          </p>
        </div>

        {/* Results List */}
        {groups.length === 0 ? (
          <p className="text-base py-8 text-center" style={{ color: 'var(--muted-text)' }}>
            No user data available for the selected filters.
          </p>
        ) : (
          <div className={devBorder('cyan')}>
            {groups.map((group) => (
              <DemographicBar
                key={group.value}
                label={group.label}
                count={group.count}
                percentage={group.percentage}
                maxPercentage={maxPercentage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
