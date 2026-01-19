'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

function LoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { devBorder } = useDevMode();

  // Redirect if already logged in
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.replace('/chapter/welcome');
    }
  }, [isSignedIn, isUserLoaded, router]);

  // Check for error in URL
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/chapter/welcome';
      } else {
        // Handle incomplete sign-in (e.g., 2FA, email verification)
        setError('Unable to complete sign in. Please try again or contact support.');
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string; code: string }> };
      const errorObj = clerkError.errors?.[0];
      const errorMessage = errorObj?.longMessage || errorObj?.message || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while Clerk initializes
  if (!isLoaded || !isUserLoaded) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
      </div>
    );
  }

  // Don't render form if already signed in (will redirect)
  if (isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p style={{ color: 'var(--muted-text)' }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
      <div className={`w-full max-w-sm ${devBorder('green')}`}>
        {/* Title area */}
        <div className={`text-center mb-4 ${devBorder('amber')}`}>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Log in to your account
          </h1>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl p-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <form onSubmit={handleSubmit} className={devBorder('cyan')}>
            {error && (
              <div
                className={`mb-4 p-3 rounded-lg text-base ${devBorder('red')}`}
                style={{
                  backgroundColor: 'var(--callout-warning-bg)',
                  color: '#dc2626',
                  border: '1px solid var(--callout-warning-border)'
                }}
              >
                <p>{error}</p>
              </div>
            )}

            <div className={`mb-4 ${devBorder('teal')}`}>
              <label htmlFor="email" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none ${devBorder('orange')}`}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className={`mb-4 ${devBorder('teal')}`}>
              <label htmlFor="password" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className={`w-full px-4 py-3 pr-12 rounded-lg text-base outline-none ${devBorder('orange')}`}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                  style={{ color: 'var(--muted-text)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={`mb-6 text-right ${devBorder('indigo')}`}>
              <Link href="/forgot-password" className="text-base cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90 ${devBorder('pink')}`}
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className={`mt-6 text-center text-base ${devBorder('lime')}`} style={{ color: 'var(--muted-text)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium cursor-pointer hover:opacity-90" style={{ color: 'var(--berkeley-blue)' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <TextbookLayout>
      <Suspense fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </TextbookLayout>
  );
}
