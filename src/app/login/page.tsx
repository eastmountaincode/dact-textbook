'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';
import { createClient } from '@/lib/supabase/client';

type ErrorType = 'email_not_confirmed' | 'invalid_credentials' | 'rate_limited' | 'link_expired' | 'generic';

interface LoginError {
  type: ErrorType;
  message: string;
}

function parseLoginError(errorMessage: string): LoginError {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('email not confirmed')) {
    return {
      type: 'email_not_confirmed',
      message: 'Please check your email and click the confirmation link to activate your account.',
    };
  }

  if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
    return {
      type: 'invalid_credentials',
      message: 'Incorrect email or password. Please try again.',
    };
  }

  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      type: 'rate_limited',
      message: 'Too many login attempts. Please wait a moment and try again.',
    };
  }

  if (lowerMessage.includes('expired') || lowerMessage.includes('invalid') || lowerMessage.includes('otp')) {
    return {
      type: 'link_expired',
      message: 'This link has expired or is invalid. Please log in or request a new confirmation email.',
    };
  }

  return {
    type: 'generic',
    message: errorMessage,
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const { devBorder } = useDevMode();

  // Check for error in URL (e.g., from expired confirmation link)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(parseLoginError(urlError));
      // Clear the error from URL without reloading the page
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(parseLoginError(error.message));
      setIsLoading(false);
    } else {
      router.push('/chapter/welcome');
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    setResendSuccess(false);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setIsResending(false);

    if (error) {
      setError(parseLoginError(error.message));
    } else {
      setResendSuccess(true);
    }
  };

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4 ${devBorder('blue')}`}>
        <div className={`w-full max-w-sm ${devBorder('green')}`}>
        {/* Title area */}
        <div className={`text-center mb-4 ${devBorder('amber')}`}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Log in to your account
          </h1>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl p-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <form onSubmit={handleSubmit} className={devBorder('cyan')}>
            {error && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${devBorder('red')}`} style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                <p>{error.message}</p>
                {(error.type === 'email_not_confirmed' || error.type === 'link_expired') && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResending || !email}
                    className="mt-2 underline cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}
            {resendSuccess && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${devBorder('green')}`} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}>
                Confirmation email sent! Please check your inbox.
              </div>
            )}

            <div className={`mb-4 ${devBorder('teal')}`}>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none ${devBorder('orange')}`}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className={`mb-6 text-right ${devBorder('indigo')}`}>
              <Link href="/forgot-password" className="text-sm cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
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

          <p className={`mt-6 text-center text-sm ${devBorder('lime')}`} style={{ color: 'var(--muted-text)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
              Create account
            </Link>
          </p>
        </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
