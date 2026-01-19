'use client';

import { useState, useRef, useEffect } from 'react';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

interface VerificationFormProps {
  email: string;
  isLoading: boolean;
  onVerify: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onStartOver: () => void;
}

export function VerificationForm({
  email,
  isLoading,
  onVerify,
  onResendCode,
  onStartOver,
}: VerificationFormProps) {
  const { devBorder } = useDevMode();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const savedExpiry = localStorage.getItem('resendCooldownExpiry');
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) {
      localStorage.removeItem('resendCooldownExpiry');
      return;
    }
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)',
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError(null);
    try {
      await onVerify(verificationCode);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string; code?: string }> };
      const errorObj = clerkError.errors?.[0];
      // Use longMessage for full context, fall back to message, then default
      // Common codes: 'form_code_incorrect' for wrong/expired codes
      let errorMessage = errorObj?.longMessage || errorObj?.message || 'Invalid verification code';
      if (errorObj?.code === 'form_code_incorrect') {
        errorMessage = 'Incorrect verification code. Please check your email for the latest code.';
      }
      showError(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResend = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      await onResendCode();
      setResendCooldown(30);
      localStorage.setItem('resendCooldownExpiry', String(Date.now() + 30000));
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string; longMessage?: string }> };
      const errorObj = clerkError.errors?.[0];
      showError(errorObj?.longMessage || errorObj?.message || 'Failed to resend code');
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isLoading || localLoading;

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex pt-8 pb-8 justify-center px-8 ${devBorder('blue')}`}>
        <div className={`w-full max-w-md ${devBorder('green')}`}>
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Verify your email
            </h1>
            <p className="text-base mt-2" style={{ color: 'var(--muted-text)' }}>
              We sent a verification code to <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{email}</span>
            </p>
          </div>

          <div className={`rounded-xl px-8 py-8 shadow-lg ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div ref={errorRef} className="mb-4 p-3 rounded-lg text-base" style={{ backgroundColor: 'var(--callout-warning-bg)', color: '#dc2626', border: '1px solid var(--callout-warning-border)' }}>
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="code" className="block text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none text-center"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90"
                style={{ backgroundColor: 'var(--berkeley-blue)' }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-base" style={{ color: 'var(--muted-text)' }}>
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  className="cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                  style={{ color: 'var(--berkeley-blue)' }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                </button>
              </p>
              <p className="text-base" style={{ color: 'var(--muted-text)' }}>
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={onStartOver}
                  className="cursor-pointer hover:underline"
                  style={{ color: 'var(--berkeley-blue)' }}
                >
                  Start over
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
