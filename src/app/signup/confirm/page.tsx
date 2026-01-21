'use client';

import Link from 'next/link';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function ConfirmEmailPage() {
  const { devBorder } = useDevMode();

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex py-10 px-10 justify-center ${devBorder('blue')}`}>
        <div className={`w-full max-w-md ${devBorder('green')}`}>
          {/* Title area */}
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Check your email
            </h1>
          </div>

          {/* Card */}
          <div className={`rounded-xl p-8 shadow-lg text-center ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            {/* Email icon */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${devBorder('cyan')}`} style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <p className={`mb-4 ${devBorder('teal')}`} style={{ color: 'var(--foreground)' }}>
              We&apos;ve sent a confirmation link to your email address.
            </p>

            <p className={`text-base mb-6 ${devBorder('orange')}`} style={{ color: 'var(--muted-text)' }}>
              Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
            </p>

            <div className={`pt-4 border-t ${devBorder('lime')}`} style={{ borderColor: 'var(--card-border)' }}>
              <p className="text-base" style={{ color: 'var(--muted-text)' }}>
                Already confirmed?{' '}
                <Link href="/login" className="font-medium cursor-pointer" style={{ color: 'var(--berkeley-blue)' }}>
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
