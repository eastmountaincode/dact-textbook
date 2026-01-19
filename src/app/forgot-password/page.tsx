'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { devBorder } = useDevMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError(null);
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccess(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      const errorObj = clerkError.errors?.[0];
      setError(errorObj?.longMessage || errorObj?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <TextbookLayout>
        <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
          <div className={`w-full max-w-sm ${devBorder('green')}`}>
            <div className={`text-center mb-4 ${devBorder('amber')}`}>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Check your email
              </h1>
            </div>

            <div className={`rounded-xl p-8 shadow-lg text-center ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${devBorder('cyan')}`} style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <p className="mb-4" style={{ color: 'var(--foreground)' }}>
                We&apos;ve sent a password reset code to <strong>{email}</strong>
              </p>

              <p className="text-base mb-6" style={{ color: 'var(--muted-text)' }}>
                Check your email for the code and use it to reset your password. If you don&apos;t see it, check your spam folder.
              </p>

              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-block px-6 py-3 rounded-lg font-medium text-white cursor-pointer hover:opacity-90"
                style={{ backgroundColor: 'var(--berkeley-blue)' }}
              >
                Enter Reset Code
              </Link>

              <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <Link href="/login" className="text-base font-medium cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
                  Back to Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </TextbookLayout>
    );
  }

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
        <div className={`w-full max-w-sm ${devBorder('green')}`}>
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Reset your password
            </h1>
          </div>

          <div className={`rounded-xl p-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className={`text-base mb-6 ${devBorder('teal')}`} style={{ color: 'var(--muted-text)' }}>
              Enter your email address and we&apos;ll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit} className={devBorder('cyan')}>
              {error && (
                <div className={`mb-4 p-3 rounded-lg text-base ${devBorder('red')}`} style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                  {error}
                </div>
              )}

              <div className={`mb-6 ${devBorder('teal')}`}>
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

              <button
                type="submit"
                disabled={isLoading || !isLoaded}
                className={`w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90 ${devBorder('pink')}`}
                style={{ backgroundColor: 'var(--berkeley-blue)' }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>

            <p className={`mt-6 text-center text-base ${devBorder('lime')}`} style={{ color: 'var(--muted-text)' }}>
              Remember your password?{' '}
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
