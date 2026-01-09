'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setNewPassword } = useAuth();
  const { devBorder } = useDevMode();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const { error } = await setNewPassword(password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      // Redirect to welcome page after a short delay
      setTimeout(() => {
        router.push('/chapter/welcome');
      }, 2000);
    }
  };

  if (success) {
    return (
      <TextbookLayout>
        <div className={`min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4 ${devBorder('blue')}`}>
          <div className={`w-full max-w-sm ${devBorder('green')}`}>
            <div className={`text-center mb-4 ${devBorder('amber')}`}>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
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

              <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                Redirecting you to the textbook...
              </p>
            </div>
          </div>
        </div>
      </TextbookLayout>
    );
  }

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4 ${devBorder('blue')}`}>
        <div className={`w-full max-w-sm ${devBorder('green')}`}>
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Set new password
            </h1>
          </div>

          <div className={`rounded-xl p-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <form onSubmit={handleSubmit} className={devBorder('cyan')}>
              {error && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${devBorder('red')}`} style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                  {error}
                </div>
              )}

              <div className={`mb-4 ${devBorder('teal')}`}>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
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

            <p className={`mt-6 text-center text-sm ${devBorder('lime')}`} style={{ color: 'var(--muted-text)' }}>
              <Link href="/login" className="font-medium cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
                Back to Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
