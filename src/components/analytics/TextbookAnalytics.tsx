'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Select, { StylesConfig, components, InputProps, GroupBase, DropdownIndicatorProps } from 'react-select';
import AsyncSelect from 'react-select/async';
import { ReadingTimeBar, formatTime } from './ReadingTimeBar';
import { DateRangeFilter, DateRange } from './DateRangeFilter';
import { COUNTRIES, getCountryLabel } from '@/components/CountrySelect';
import {
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  FIELD_OPTIONS,
  INSTITUTION_OPTIONS,
  getOptionLabel,
} from '@/lib/profile-options';

type CountryOption = { value: string; label: string };
type UserOption = { value: string; label: string };
type ChapterOption = { value: string; label: string };
type FilterField = 'role' | 'country' | 'education_level' | 'field_of_study' | 'institution_type' | 'user' | 'chapter';
type NonCountryUserChapterField = Exclude<FilterField, 'country' | 'user' | 'chapter'>;
type GroupByField = 'role' | 'country' | 'education_level' | 'field_of_study' | 'institution_type' | null;

// Custom Input component to disable browser autofill
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

// Filter options for dropdown fields (using centralized constants)
const FILTER_OPTIONS: Record<NonCountryUserChapterField, { label: string; values: { value: string; label: string }[] }> = {
  role: { label: 'Role', values: ROLE_OPTIONS },
  education_level: { label: 'Education', values: EDUCATION_OPTIONS },
  field_of_study: { label: 'Field of Study', values: FIELD_OPTIONS },
  institution_type: { label: 'Institution', values: INSTITUTION_OPTIONS },
};

interface ChapterData {
  id: string;
  slug: string;
  title: string;
  section: string;
  order: number;
  seconds: number;
  userCount: number;
}

interface Summary {
  totalSeconds: number;
  totalChapters: number;
  chaptersWithActivity: number;
  uniqueUsers: number;
}

interface GroupedSummary {
  totalSeconds: number;
  uniqueUsers: number;
  groupCount: number;
}

interface GroupedData {
  value: string;
  label: string;
  seconds: number;
  userCount: number;
}

interface Filters {
  [key: string]: string[] | undefined;
}

interface TextbookAnalyticsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  devBorder?: (color: any) => string;
}

export function TextbookAnalytics({ devBorder = () => '' }: TextbookAnalyticsProps) {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [filters, setFilters] = useState<Filters>({});
  const [groupBy, setGroupBy] = useState<GroupByField>(null);

  // Grouped data (when groupBy is set)
  const [grouped, setGrouped] = useState<GroupedData[]>([]);
  const [groupedSummary, setGroupedSummary] = useState<GroupedSummary | null>(null);

  // Track selected users for display in chips (need label for display)
  const [selectedUsers, setSelectedUsers] = useState<Map<string, string>>(new Map());

  // Chapter options from API (for filter dropdown)
  const [chapterOptions, setChapterOptions] = useState<ChapterOption[]>([]);
  // Track selected chapters for display in chips
  const [selectedChapters, setSelectedChapters] = useState<Map<string, string>>(new Map());

  const fetchData = useCallback(async (isInitial: boolean) => {
    if (isInitial) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('dateRange', dateRange);

      // Add groupBy parameter
      if (groupBy) {
        params.set('groupBy', groupBy);
      }

      // Add multi-value filters (comma-separated)
      Object.entries(filters).forEach(([key, values]) => {
        if (values && Array.isArray(values) && values.length > 0) {
          // For user filter, send as userId parameter
          if (key === 'user' && values.length === 1) {
            params.set('userId', values[0]);
          } else if (key !== 'user') {
            params.set(key, values.join(','));
          }
        }
      });

      const res = await fetch(`/api/analytics/textbook-analytics?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      const data = await res.json();

      // Store chapter options for filter dropdown (always returned)
      if (data.chapterOptions) {
        // First, separate preface and numbered chapters
        const allChapters = data.chapterOptions as { id: string; title: string; section: string; order: number }[];
        const numberedChapters = allChapters.filter(ch => ch.section && ch.section.toLowerCase() !== 'preface');

        setChapterOptions(allChapters.map((ch) => {
          // Format label with chapter number for non-Preface chapters
          const isNumbered = ch.section && ch.section.toLowerCase() !== 'preface';
          if (isNumbered) {
            // Find the position among numbered chapters (1-indexed)
            const chapterNum = numberedChapters.findIndex(nc => nc.id === ch.id) + 1;
            return {
              value: ch.id,
              label: `${chapterNum}: ${ch.title}`,
            };
          }
          return {
            value: ch.id,
            label: ch.title,
          };
        }));
      }

      // Handle grouped vs chapter response
      if (groupBy) {
        setGrouped(data.grouped || []);
        setGroupedSummary(data.summary);
        // Clear chapter data when grouping
        setChapters([]);
        setSummary(null);
      } else {
        setChapters(data.chapters);
        setSummary(data.summary);
        // Clear grouped data when not grouping
        setGrouped([]);
        setGroupedSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, filters, groupBy]);

  // Initial load
  useEffect(() => {
    fetchData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when params change (but not on initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchData(false);
  }, [dateRange, filters, groupBy, fetchData]);

  // Filter handlers
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

  const handleAddUserFilter = (userId: string, userName: string) => {
    if (!userId) return;
    setFilters(prev => {
      const existing = prev.user || [];
      if (existing.includes(userId)) return prev;
      return { ...prev, user: [...existing, userId] };
    });
    setSelectedUsers(prev => new Map(prev).set(userId, userName));
  };

  const handleAddChapterFilter = (chapterId: string, chapterTitle: string) => {
    if (!chapterId) return;
    setFilters(prev => {
      const existing = prev.chapter || [];
      if (existing.includes(chapterId)) return prev;
      return { ...prev, chapter: [...existing, chapterId] };
    });
    setSelectedChapters(prev => new Map(prev).set(chapterId, chapterTitle));
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
    if (field === 'user') {
      setSelectedUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(value);
        return newMap;
      });
    }
    if (field === 'chapter') {
      setSelectedChapters(prev => {
        const newMap = new Map(prev);
        newMap.delete(value);
        return newMap;
      });
    }
  };

  const getFilterLabel = (field: string, value: string): string => {
    if (field === 'country') {
      return getCountryLabel(value);
    }
    if (field === 'user') {
      return selectedUsers.get(value) || value;
    }
    if (field === 'chapter') {
      return selectedChapters.get(value) || value;
    }
    const opt = FILTER_OPTIONS[field as NonCountryUserChapterField]?.values.find(v => v.value === value);
    return opt?.label || value;
  };

  // Get label for grouped data value
  const getGroupedLabel = (value: string): string => {
    if (!groupBy) return value;
    if (groupBy === 'country') {
      return getCountryLabel(value);
    }
    const opt = FILTER_OPTIONS[groupBy as NonCountryUserChapterField]?.values.find(v => v.value === value);
    return opt?.label || value;
  };

  const getFieldLabel = (field: string): string => {
    if (field === 'country') return 'Country';
    if (field === 'user') return 'User';
    if (field === 'chapter') return 'Chapter';
    return FILTER_OPTIONS[field as NonCountryUserChapterField]?.label || field;
  };

  // Get active filters as individual chips
  const activeFilterChips: { field: string; value: string }[] = [];
  Object.entries(filters).forEach(([field, values]) => {
    if (values && Array.isArray(values) && values.length > 0) {
      values.forEach(value => {
        activeFilterChips.push({ field, value });
      });
    }
  });

  // Get selected values for a field (to exclude from dropdown)
  const getSelectedValues = (field: NonCountryUserChapterField): string[] => {
    const values = filters[field];
    return Array.isArray(values) ? values : [];
  };

  // Get selected country codes (to exclude from country dropdown)
  const selectedCountries = filters.country || [];

  // Async user search
  const loadUserOptions = async (inputValue: string): Promise<UserOption[]> => {
    if (inputValue.length < 2) return [];
    try {
      const res = await fetch(`/api/analytics/users-search?q=${encodeURIComponent(inputValue)}`);
      const data = await res.json();
      // Filter out already selected users
      const selectedUserIds = filters.user || [];
      return (data.users || []).filter((u: UserOption) => !selectedUserIds.includes(u.value));
    } catch {
      return [];
    }
  };

  // Group chapters by section
  const groupedChapters = chapters.reduce((acc, chapter) => {
    const section = chapter.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(chapter);
    return acc;
  }, {} as Record<string, ChapterData[]>);

  // Get numbered chapters for display labels
  const numberedChaptersForDisplay = chapters.filter(ch => ch.section && ch.section.toLowerCase() !== 'preface');

  // Get chapter display label with number for non-preface chapters
  const getChapterDisplayLabel = (chapter: ChapterData): string => {
    const isNumbered = chapter.section && chapter.section.toLowerCase() !== 'preface';
    if (isNumbered) {
      const chapterNum = numberedChaptersForDisplay.findIndex(nc => nc.id === chapter.id) + 1;
      return `${chapterNum}: ${chapter.title}`;
    }
    return chapter.title;
  };

  // Get section order based on first chapter in each section
  const sectionOrder = Object.keys(groupedChapters).sort((a, b) => {
    const aFirst = groupedChapters[a][0];
    const bFirst = groupedChapters[b][0];
    return (aFirst?.order || 0) - (bFirst?.order || 0);
  });

  // Styles for react-select
  const selectStyles: StylesConfig<CountryOption, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      borderColor: state.isFocused ? 'var(--berkeley-blue)' : 'var(--card-border)',
      borderRadius: '0.5rem',
      padding: '0',
      fontSize: '1rem',
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
      fontSize: '1rem',
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

  const nativeSelectStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--foreground)',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '1rem',
    paddingLeft: '13px',
    paddingRight: '40px',
  };

  // Available countries (exclude already selected ones)
  const availableCountries = COUNTRIES.filter(c => !selectedCountries.includes(c.value));

  // Available filter fields
  const availableFilterFields = Object.keys(FILTER_OPTIONS) as NonCountryUserChapterField[];

  // Group by options
  const GROUP_BY_OPTIONS: { value: GroupByField; label: string }[] = [
    { value: null, label: 'None (by Chapter)' },
    { value: 'role', label: 'Role' },
    { value: 'education_level', label: 'Education Level' },
    { value: 'country', label: 'Country' },
    { value: 'field_of_study', label: 'Field of Study' },
    { value: 'institution_type', label: 'Institution Type' },
  ];

  const maxSeconds = groupBy
    ? Math.max(...grouped.map(g => g.seconds), 1)
    : Math.max(...chapters.map(c => c.seconds), 1);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${devBorder('purple')}`}>
        {/* Date/Filter skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
            <div className="h-9 w-24 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
            <div className="h-9 w-44 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }} />
          </div>
        </div>
        {/* Summary skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-8 w-16 rounded mb-1" style={{ backgroundColor: 'var(--input-bg)' }} />
                <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--input-bg)' }} />
              </div>
            ))}
          </div>
        </div>
        {/* Chapters skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-lg p-4" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div className="h-4 w-32 rounded mb-3" style={{ backgroundColor: 'var(--card-border)' }} />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j}>
                      <div className="flex justify-between mb-1">
                        <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--card-border)' }} />
                        <div className="h-4 w-12 rounded" style={{ backgroundColor: 'var(--card-border)' }} />
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--card-border)' }} />
                    </div>
                  ))}
                </div>
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
    <div className={`flex flex-col lg:flex-row gap-6 ${devBorder('purple')}`}>
      {/* Left Column - Filter Controls */}
      <div className="lg:w-80 flex-shrink-0 space-y-4">
        {/* Date Range Card */}
        <div
          className={`rounded-xl p-5 ${devBorder('blue')}`}
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <h3 className="text-base font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Date Range
          </h3>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        {/* Group By Card */}
        <div
          className={`rounded-xl p-5 ${devBorder('cyan')}`}
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <h3 className="text-base font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Group By
          </h3>
          <select
            value={groupBy || ''}
            onChange={(e) => setGroupBy((e.target.value || null) as GroupByField)}
            className="w-full py-2 rounded-lg text-base outline-none cursor-pointer select-hover"
            style={nativeSelectStyle}
          >
            {GROUP_BY_OPTIONS.map(opt => (
              <option key={opt.value || 'none'} value={opt.value || ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Card */}
        <div
          className={`rounded-xl p-5 ${devBorder('green')}`}
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
              Filters
            </h3>
            {activeFilterChips.length > 0 && (
              <button
                onClick={() => {
                  setFilters({});
                  setSelectedUsers(new Map());
                  setSelectedChapters(new Map());
                }}
                className="text-xs cursor-pointer hover:underline"
                style={{ color: 'var(--muted-text)' }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter controls - stacked vertically */}
          <div className={`space-y-3 ${devBorder('yellow')}`}>
            {/* Regular filter dropdown */}
            <select
              value=""
              onChange={(e) => handleAddFilter(e.target.value)}
              className="w-full py-2 rounded-lg text-base outline-none cursor-pointer select-hover"
              style={nativeSelectStyle}
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
            <Select<CountryOption, false>
              value={null}
              onChange={(option) => {
                if (option) {
                  handleAddCountryFilter(option.value);
                }
              }}
              options={availableCountries}
              styles={selectStyles}
              placeholder="+ Add country"
              isClearable={false}
              isSearchable
              classNamePrefix="country-filter"
              components={{ Input: NoAutofillInput, DropdownIndicator: CustomDropdownIndicator }}
            />

            {/* User filter (async searchable) */}
            <AsyncSelect<UserOption, false>
              value={null}
              onChange={(option) => {
                if (option) {
                  handleAddUserFilter(option.value, option.label);
                }
              }}
              loadOptions={loadUserOptions}
              styles={selectStyles as StylesConfig<UserOption, false>}
              placeholder="+ Add user"
              isClearable={false}
              isSearchable
              classNamePrefix="user-filter"
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < 2 ? 'Type to search...' : 'No users found'
              }
              components={{
                Input: NoAutofillInput as typeof components.Input<UserOption, false, GroupBase<UserOption>>,
                DropdownIndicator: CustomDropdownIndicator as typeof components.DropdownIndicator<UserOption, false, GroupBase<UserOption>>,
              }}
            />

            {/* Chapter filter (searchable) */}
            <Select<ChapterOption, false>
              value={null}
              onChange={(option) => {
                if (option) {
                  handleAddChapterFilter(option.value, option.label);
                }
              }}
              options={chapterOptions.filter(ch => !(filters.chapter || []).includes(ch.value))}
              styles={selectStyles as StylesConfig<ChapterOption, false>}
              placeholder="+ Add chapter"
              isClearable={false}
              isSearchable
              classNamePrefix="chapter-filter"
              components={{
                Input: NoAutofillInput as typeof components.Input<ChapterOption, false, GroupBase<ChapterOption>>,
                DropdownIndicator: CustomDropdownIndicator as typeof components.DropdownIndicator<ChapterOption, false, GroupBase<ChapterOption>>,
              }}
            />
          </div>

          {/* Active filters */}
          {activeFilterChips.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${devBorder('orange')}`} style={{ borderColor: 'var(--card-border)' }}>
              {activeFilterChips.map(({ field, value }) => (
                <div
                  key={`${field}:${value}`}
                  className="flex items-start gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
                >
                  <span style={{ color: 'var(--muted-text)' }}>
                    {getFieldLabel(field)}:
                  </span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {getFilterLabel(field, value)}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(field, value)}
                    className="ml-1 self-center hover:opacity-70 cursor-pointer text-base leading-none"
                    style={{ color: 'var(--muted-text)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Summary Card */}
        <div
          className={`rounded-xl px-5 py-4 ${devBorder('blue')}`}
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          {groupBy ? (
            /* Grouped summary */
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {groupedSummary ? formatTime(groupedSummary.totalSeconds) : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Total Time
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {groupedSummary ? groupedSummary.uniqueUsers : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Readers
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {groupedSummary ? groupedSummary.groupCount : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Groups
                </div>
              </div>
            </div>
          ) : (
            /* Chapter summary */
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {summary ? formatTime(summary.totalSeconds) : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Total Time
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {summary ? summary.uniqueUsers : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Readers
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {summary && summary.chaptersWithActivity > 0
                    ? formatTime(Math.round(summary.totalSeconds / summary.chaptersWithActivity))
                    : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Avg/Chapter
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>
                  {summary ? `${summary.chaptersWithActivity}/${summary.totalChapters}` : '--'}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Active Chapters
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        <div
          className={`rounded-xl p-6 ${devBorder('red')}`}
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          {groupBy ? (
            /* Grouped results */
            <>
              <h3 className="font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                Reading Time by {GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label || groupBy}
                {filters.chapter?.length === 1 && (
                  <span style={{ color: 'var(--muted-text)', fontWeight: 'normal' }}>
                    {' '}for {selectedChapters.get(filters.chapter[0]) || 'selected chapter'}
                  </span>
                )}
                {filters.chapter && filters.chapter.length > 1 && (
                  <span style={{ color: 'var(--muted-text)', fontWeight: 'normal' }}>
                    {' '}for {filters.chapter.length} chapters
                  </span>
                )}
                {activeFilterChips.length > 0 && (
                  <span className="font-normal text-sm ml-2" style={{ color: 'var(--muted-text)' }}>
                    ({activeFilterChips.length} {activeFilterChips.length === 1 ? 'filter' : 'filters'} applied)
                  </span>
                )}
              </h3>

              {grouped.length === 0 ? (
                <p className="text-base py-8 text-center" style={{ color: 'var(--muted-text)' }}>
                  No data available for this grouping.
                </p>
              ) : (
                <div>
                  {grouped.map(item => (
                    <ReadingTimeBar
                      key={item.value}
                      label={getGroupedLabel(item.value)}
                      seconds={item.seconds}
                      maxSeconds={maxSeconds}
                      subtitle={`${item.userCount} reader${item.userCount !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Chapter results - Grouped by Section */
            <>
              <h3 className="font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                Reading Time by Chapter
                {activeFilterChips.length > 0 && (
                  <span className="font-normal text-sm ml-2" style={{ color: 'var(--muted-text)' }}>
                    ({activeFilterChips.length} {activeFilterChips.length === 1 ? 'filter' : 'filters'} applied)
                  </span>
                )}
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
                            label={getChapterDisplayLabel(chapter)}
                            seconds={chapter.seconds}
                            maxSeconds={maxSeconds}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
