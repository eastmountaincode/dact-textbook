'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { devBorder } = useDevMode();

  // Redirect if already logged in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/chapter/welcome');
    }
  }, [isSignedIn, router]);

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
    if (!isLoaded) return;

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
        // Handle other statuses if needed (e.g., 2FA)
        console.log('Sign in status:', result.status);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; code: string }> };
      const errorMessage = clerkError.errors?.[0]?.message || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedIn) {
    return null;
  }

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
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${devBorder('red')}`}
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
                disabled={isLoading || !isLoaded}
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
