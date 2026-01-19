'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';
import { CountrySelect } from '@/components/CountrySelect';
import { VerificationForm } from '@/components/auth/VerificationForm';
import { createClient } from '@/lib/supabase/client';
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
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { devBorder } = useDevMode();

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
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('signupFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Check if there's a pending verification from a previous session
  useEffect(() => {
    if (isLoaded && signUp?.status === 'missing_requirements') {
      // Check if email verification is pending
      const emailVerification = signUp.verifications?.emailAddress;
      if (emailVerification?.status === 'unverified') {
        setPendingVerification(true);
        setPendingEmail(signUp.emailAddress || null);
      }
    }
  }, [isLoaded, signUp]);

  // Redirect if already logged in
  if (isSignedIn) {
    router.replace('/chapter/welcome');
    return null;
  }

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

    if (!isLoaded) return;

    // Validate required fields
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role || !formData.country || !formData.educationLevel) {
      showError('Please fill in all required fields.');
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

    try {
      // Create the user with Clerk
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Save form data to localStorage in case user navigates away
      localStorage.setItem('signupFormData', JSON.stringify(formData));

      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      const errorObj = clerkError.errors?.[0];
      showError(errorObj?.longMessage || errorObj?.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (code: string) => {
    if (!isLoaded) return;

    const result = await signUp.attemptEmailAddressVerification({ code });

    if (result.status === 'complete') {
      // Save profile data to Supabase
      const supabase = createClient();
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: result.createdUserId,
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          role: formData.role,
          country: formData.country,
          education_level: formData.educationLevel,
          field_of_study: formData.fieldOfStudy || null,
          institution_type: formData.institutionType || null,
          statistics_use: formData.statisticsUse || null,
          referral_source: formData.referralSource || null,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Error saving profile:', profileError);
      }

      // Create user_roles entry (default to 'student')
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: result.createdUserId,
          role: 'student',
        }, { onConflict: 'user_id' });

      if (roleError) {
        console.error('Error saving user role:', roleError);
      }

      // Track the initial login
      const { error: loginError } = await supabase
        .from('user_profiles')
        .update({ last_logged_in: new Date().toISOString() })
        .eq('id', result.createdUserId);

      if (loginError) {
        console.error('Error tracking login:', loginError);
      }

      // Clear saved form data
      localStorage.removeItem('signupFormData');

      // Set the session active and redirect immediately
      // Using window.location.href to prevent race condition with isSignedIn redirect
      await setActive({ session: result.createdSessionId });
      window.location.href = '/signup/verified';
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  const handleStartOver = () => {
    setPendingVerification(false);
    setPendingEmail(null);
    setError(null);
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

  // Verification code form
  if (pendingVerification) {
    const displayEmail = formData.email || pendingEmail || 'your email';

    return (
      <VerificationForm
        email={displayEmail}
        isLoading={isLoading}
        onVerify={handleVerification}
        onResendCode={handleResendCode}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
        <div className={`w-full max-w-2xl ${devBorder('green')}`}>
        {/* Title area */}
        <div className={`text-center mb-4 ${devBorder('amber')}`}>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Create account
          </h1>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl px-8 py-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <form onSubmit={handleSubmit} className={devBorder('cyan')}>
            {error && (
              <div ref={errorRef} className="mb-4 p-3 rounded-lg text-base" style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                {error}
              </div>
            )}

            {/* Required Information */}
            <div className={`mb-6 ${devBorder('orange')}`}>
              <p className="text-base font-semibold mb-4" style={{ color: 'var(--berkeley-blue)' }}>
                Required Information
              </p>

              <div className="mb-4">
                <label htmlFor="email" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="confirmPassword" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                    className="w-full px-4 py-3 rounded-lg text-base outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                    className="w-full px-4 py-3 rounded-lg text-base outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="country" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="educationLevel" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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

            {/* Divider */}
            <div className="my-8 border-t" style={{ borderColor: 'var(--card-border)' }} />

            {/* Optional Information */}
            <div className={`mb-6 ${devBorder('lime')}`}>
              <p className="text-base font-semibold mb-4" style={{ color: 'var(--berkeley-blue)' }}>
                Optional Information
              </p>

              <div className="mb-4">
                <label htmlFor="fieldOfStudy" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="institutionType" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="statisticsUse" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="referralSource" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
              disabled={isLoading || !isLoaded}
              className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90 ${devBorder('indigo')}`}
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={`mt-6 text-center text-base ${devBorder('teal')}`} style={{ color: 'var(--muted-text)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium cursor-pointer hover:opacity-90" style={{ color: 'var(--berkeley-blue)' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  </TextbookLayout>
  );
}
