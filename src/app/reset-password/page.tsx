'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

function ResetPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { devBorder } = useDevMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';

  // Redirect to forgot-password if no email
  useEffect(() => {
    if (!email) {
      router.replace('/forgot-password');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        setSuccess(true);
        await setActive({ session: result.createdSessionId });
        // Redirect to welcome page after a short delay
        setTimeout(() => {
          router.push('/chapter/welcome');
        }, 2000);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || 'Invalid code or an error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
        <div className={`w-full max-w-sm ${devBorder('green')}`}>
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Password updated
            </h1>
          </div>

          <div className={`rounded-xl p-8 shadow-lg text-center ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${devBorder('cyan')}`} style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="mb-4" style={{ color: 'var(--foreground)' }}>
              Your password has been updated successfully.
            </p>

            <p className="text-base" style={{ color: 'var(--muted-text)' }}>
              Redirecting you to the textbook...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
      <div className={`w-full max-w-sm ${devBorder('green')}`}>
        <div className={`text-center mb-4 ${devBorder('amber')}`}>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Set new password
          </h1>
          {email && (
            <p className="text-base mt-1" style={{ color: 'var(--muted-text)' }}>
              for {email}
            </p>
          )}
        </div>

        <div className={`rounded-xl p-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <form onSubmit={handleSubmit} className={devBorder('cyan')}>
            {error && (
              <div className={`mb-4 p-3 rounded-lg text-base ${devBorder('red')}`} style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                {error}
              </div>
            )}

            <div className={`mb-4 ${devBorder('teal')}`}>
              <label htmlFor="code" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Reset Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Enter code from email"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none text-center tracking-widest ${devBorder('orange')}`}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className={`mb-4 ${devBorder('teal')}`}>
              <label htmlFor="password" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min 8 characters"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none ${devBorder('orange')}`}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className={`mb-6 ${devBorder('teal')}`}>
              <label htmlFor="confirmPassword" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none ${devBorder('orange')}`}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90 ${devBorder('pink')}`}
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <p className={`mt-6 text-center text-base ${devBorder('lime')}`} style={{ color: 'var(--muted-text)' }}>
            <Link href="/login" className="font-medium cursor-pointer hover:opacity-90" style={{ color: 'var(--berkeley-blue)' }}>
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <TextbookLayout>
      <Suspense fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </TextbookLayout>
  );
}
