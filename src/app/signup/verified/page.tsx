'use client';

import Link from 'next/link';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function EmailVerifiedPage() {
  const { devBorder } = useDevMode();

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex py-8 px-8 justify-center ${devBorder('blue')}`}>
        <div className={`w-full max-w-md ${devBorder('green')}`}>
          {/* Title area */}
          <div className={`text-center mb-4 ${devBorder('amber')}`}>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Email Verified
            </h1>
          </div>

          {/* Card */}
          <div className={`rounded-xl p-8 shadow-lg text-center ${devBorder('purple')}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            {/* Checkmark icon */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${devBorder('cyan')}`} style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className={`text-base mb-6 ${devBorder('teal')}`} style={{ color: 'var(--foreground)' }}>
              Your email has been successfully verified.
            </p>

            {/* <p className={`text-base mb-6 ${devBorder('orange')}`} style={{ color: 'var(--muted-text)' }}>
              Your account is now active and ready to use.
            </p> */}

            <Link
              href="/chapter/welcome"
              className="inline-block w-full py-3 rounded-lg font-medium text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: 'var(--berkeley-blue)' }}
            >
              Continue to Textbook
            </Link>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
