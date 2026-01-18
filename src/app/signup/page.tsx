'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';
import { CountrySelect } from '@/components/CountrySelect';
import {
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  FIELD_OPTIONS,
  INSTITUTION_OPTIONS,
  STATISTICS_USE_OPTIONS,
  REFERRAL_OPTIONS,
  withPlaceholder,
} from '@/lib/profile-options';

// Add placeholders for form selects
const ROLE_FORM_OPTIONS = withPlaceholder(ROLE_OPTIONS, 'Select role');
const EDUCATION_FORM_OPTIONS = withPlaceholder(EDUCATION_OPTIONS, 'Select level');
const FIELD_FORM_OPTIONS = withPlaceholder(FIELD_OPTIONS, 'Select field');
const INSTITUTION_FORM_OPTIONS = withPlaceholder(INSTITUTION_OPTIONS, 'Select type');
const STATISTICS_USE_FORM_OPTIONS = withPlaceholder(STATISTICS_USE_OPTIONS, 'Select option');
const REFERRAL_FORM_OPTIONS = withPlaceholder(REFERRAL_OPTIONS, 'Select option');

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    country: '',
    firstName: '',
    lastName: '',
    educationLevel: '',
    fieldOfStudy: '',
    institutionType: '',
    statisticsUse: '',
    referralSource: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signUp, user } = useAuth();
  const { devBorder } = useDevMode();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/chapter/welcome');
    }
  }, [user, router]);

  // Debounced email availability check - triggers as user types
  useEffect(() => {
    const email = formData.email;

    // Don't check if email is empty or invalid
    if (!email || !email.includes('@')) {
      setEmailStatus('idle');
      return;
    }

    // Set to checking immediately so user knows something is happening
    setEmailStatus('checking');

    // Debounce the actual API call
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setEmailStatus(data.exists ? 'taken' : 'available');
      } catch {
        setEmailStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Password validation helpers
  const isPasswordLongEnough = formData.password.length >= 8;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Helper to set error and scroll to it
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.email || !formData.password || !formData.role || !formData.country || !formData.educationLevel) {
      showError('Please fill in all required fields.');
      return;
    }

    // Check if email is already taken
    if (emailStatus === 'taken') {
      showError('This email is already registered. Please use a different email or log in.');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName || undefined,
      last_name: formData.lastName || undefined,
      role: formData.role,
      country: formData.country,
      education_level: formData.educationLevel,
      field_of_study: formData.fieldOfStudy || undefined,
      institution_type: formData.institutionType || undefined,
      statistics_use: formData.statisticsUse || undefined,
      referral_source: formData.referralSource || undefined,
    });

    if (error) {
      showError(error.message);
      setIsLoading(false);
    } else {
      router.push('/signup/confirm');
    }
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
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex pt-12 pb-12 justify-center px-8 ${devBorder('blue')}`}>
        <div className={`w-full max-w-2xl ${devBorder('green')}`}>
        {/* Title area */}
        <div className={`text-center mb-4 ${devBorder('amber')}`}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Create account
          </h1>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl px-8 py-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <form onSubmit={handleSubmit} className={devBorder('cyan')}>
            {error && (
              <div ref={errorRef} className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                {error}
              </div>
            )}

            {/* Required Information */}
            <div className={`mb-6 ${devBorder('orange')}`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-text)' }}>
                Required Information
              </p>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@university.edu"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
                {emailStatus === 'checking' && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-text)' }}>Checking availability...</p>
                )}
                {emailStatus === 'taken' && (
                  <p className="text-xs mt-1 text-red-600">This email is already registered</p>
                )}
                {emailStatus === 'available' && (
                  <p className="text-xs mt-1 text-green-600">✓</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
                {formData.password && !isPasswordLongEnough && (
                  <p className="text-xs mt-1 text-red-600">Password must be at least 8 characters</p>
                )}
                {formData.password && isPasswordLongEnough && (
                  <p className="text-xs mt-1 text-green-600">✓</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
                {formData.confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs mt-1 text-red-600">Passwords do not match</p>
                )}
                {formData.confirmPassword && doPasswordsMatch && (
                  <p className="text-xs mt-1 text-green-600">✓</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {ROLE_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="country" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="educationLevel" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Highest or Current Level of Education <span className="text-red-500">*</span>
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {EDUCATION_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Information */}
            <div className={`mb-6 ${devBorder('lime')}`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-text)' }}>
                Optional Information
              </p>

              <div className="mb-4">
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
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="mb-4">
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
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="fieldOfStudy" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Field of Study/Work
                </label>
                <select
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {FIELD_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="institutionType" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Institution Type
                </label>
                <select
                  id="institutionType"
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {INSTITUTION_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="statisticsUse" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  What do you plan to use statistics for?
                </label>
                <select
                  id="statisticsUse"
                  name="statisticsUse"
                  value={formData.statisticsUse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {STATISTICS_USE_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="referralSource" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  How did you hear about us?
                </label>
                <select
                  id="referralSource"
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none cursor-pointer"
                  style={selectStyle}
                >
                  {REFERRAL_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90 ${devBorder('indigo')}`}
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${devBorder('teal')}`} style={{ color: 'var(--muted-text)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  </TextbookLayout>
  );
}
