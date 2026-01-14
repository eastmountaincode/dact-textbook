'use client';

import Select, { StylesConfig, components, InputProps, GroupBase } from 'react-select';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register English locale
countries.registerLocale(enLocale);

type CountryOption = { value: string; label: string };

// Custom Input component to disable browser autofill
const NoAutofillInput = (props: InputProps<CountryOption, false, GroupBase<CountryOption>>) => (
  <components.Input
    {...props}
    autoComplete="off"
    data-lpignore="true"
    data-form-type="other"
  />
);

// Country list from i18n-iso-countries package
// Source: https://www.npmjs.com/package/i18n-iso-countries
// Data: ISO 3166-1 standard (maintained by ISO - International Organization for Standardization)
// Updates: Package is regularly updated when ISO publishes changes
const countryObj = countries.getNames('en', { select: 'official' });
const COUNTRIES: CountryOption[] = Object.entries(countryObj)
  .map(([code, name]) => ({ value: code, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  required,
  id = 'country',
  name = 'country',
  placeholder = 'Select or type to search...',
}: CountrySelectProps) {
  const selectedOption = COUNTRIES.find(c => c.value === value) || null;

  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--input-bg)',
      borderColor: state.isFocused ? 'var(--berkeley-blue)' : 'var(--input-border)',
      borderRadius: '0.5rem',
      padding: '0.375rem 0.5rem',
      fontSize: '1rem',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'var(--berkeley-blue)',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '0.5rem',
      zIndex: 50,
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
      '&:active': {
        backgroundColor: 'var(--input-bg)',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--foreground)',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--foreground)',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--muted-text)',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'var(--muted-text)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
  };

  return (
    <Select
      inputId={id}
      name={name}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      options={COUNTRIES}
      styles={customStyles}
      placeholder={placeholder}
      isClearable
      isSearchable
      required={required}
      classNamePrefix="country-select"
      components={{ Input: NoAutofillInput }}
    />
  );
}

// Export the country list for use in other components (like filters)
export { COUNTRIES };

// Helper to get country label from code
export function getCountryLabel(code: string): string {
  return countries.getName(code, 'en') || code;
}
