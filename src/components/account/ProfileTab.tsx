'use client';

import { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/providers/ProfileProvider';
import { DevBorderColor } from '@/providers/DevModeProvider';
import { CountrySelect } from '@/components/CountrySelect';
import {
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  FIELD_OPTIONS,
  INSTITUTION_OPTIONS,
  STATISTICS_USE_OPTIONS,
  withPlaceholder,
} from '@/lib/profile-options';

const ROLE_FORM_OPTIONS = withPlaceholder(ROLE_OPTIONS, 'Select role');
const EDUCATION_FORM_OPTIONS = withPlaceholder(EDUCATION_OPTIONS, 'Select level');
const FIELD_FORM_OPTIONS = withPlaceholder(FIELD_OPTIONS, 'Select field');
const INSTITUTION_FORM_OPTIONS = withPlaceholder(INSTITUTION_OPTIONS, 'Select type');
const STATISTICS_USE_FORM_OPTIONS = withPlaceholder(STATISTICS_USE_OPTIONS, 'Select option');

interface ProfileTabProps {
  profile: ReturnType<typeof useProfile>['profile'];
  email: string | undefined;
  updateProfile: ReturnType<typeof useProfile>['updateProfile'];
  devBorder: (color: DevBorderColor) => string;
}

export function ProfileTab({ profile, email, updateProfile, devBorder }: ProfileTabProps) {
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    role: profile?.role || '',
    country: profile?.country || '',
    educationLevel: profile?.education_level || '',
    fieldOfStudy: profile?.field_of_study || '',
    institutionType: profile?.institution_type || '',
    statisticsUse: profile?.statistics_use || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: profile.role || '',
        country: profile.country || '',
        educationLevel: profile.education_level || '',
        fieldOfStudy: profile.field_of_study || '',
        institutionType: profile.institution_type || '',
        statisticsUse: profile.statistics_use || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await updateProfile({
      first_name: formData.firstName || undefined,
      last_name: formData.lastName || undefined,
      role: formData.role || undefined,
      country: formData.country || undefined,
      education_level: formData.educationLevel || undefined,
      field_of_study: formData.fieldOfStudy || undefined,
      institution_type: formData.institutionType || undefined,
      statistics_use: formData.statisticsUse || undefined,
    });

    setIsLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    }

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1rem',
    paddingRight: '2.5rem',
  };

  return (
    <div
      ref={formRef}
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', scrollMarginTop: '5rem' }}
    >
      <form onSubmit={handleSubmit}>
        {message && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: message.type === 'success' ? 'var(--callout-note-bg)' : 'var(--callout-warning-bg)',
              color: message.type === 'success' ? 'var(--callout-note-border)' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? 'var(--callout-note-border)' : 'var(--callout-warning-border)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Email
          </label>
          <input
            type="email"
            value={email || ''}
            disabled
            className="w-full px-4 py-3 rounded-lg text-sm outline-none opacity-60 cursor-not-allowed"
            style={inputStyle}
          />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Role and Country row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {ROLE_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Country
            </label>
            <CountrySelect
              value={formData.country}
              onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            />
          </div>
        </div>

        {/* Education and Field row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Highest or Current Level of Education
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {EDUCATION_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Field of Study/Work
            </label>
            <select
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {FIELD_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Institution Type and Statistics Use row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="institutionType" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Institution Type
            </label>
            <select
              id="institutionType"
              name="institutionType"
              value={formData.institutionType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {INSTITUTION_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="statisticsUse" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              What do you plan to use statistics for?
            </label>
            <select
              id="statisticsUse"
              name="statisticsUse"
              value={formData.statisticsUse}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {STATISTICS_USE_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: 'var(--berkeley-blue)' }}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
