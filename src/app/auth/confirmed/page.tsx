'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TextbookLayout from '@/components/TextbookLayout';

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const isLinkInvalid = searchParams.get('already') === 'true';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {isLinkInvalid ? 'Link no longer valid' : 'Email confirmed'}
          </h1>
        </div>

        <div className="rounded-xl p-8 shadow-lg text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
            {isLinkInvalid ? (
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <p className="mb-6" style={{ color: 'var(--foreground)' }}>
            {isLinkInvalid
              ? 'This confirmation link is no longer valid. If you have already confirmed your email, please log in. Otherwise, try signing up again.'
              : 'Your email has been confirmed. You can now log in to your account.'}
          </p>

          <Link
            href="/login"
            className="block w-full py-3 rounded-lg font-medium text-white text-center hover:opacity-90"
            style={{ backgroundColor: 'var(--berkeley-blue)' }}
          >
            Log In
          </Link>

          {isLinkInvalid && (
            <Link
              href="/signup"
              className="block w-full py-3 mt-3 rounded-lg font-medium text-center hover:opacity-90"
              style={{ color: 'var(--berkeley-blue)', border: '1px solid var(--berkeley-blue)' }}
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailConfirmedPage() {
  return (
    <TextbookLayout>
      <Suspense fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-4">
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Email confirmed
              </h1>
            </div>
          </div>
        </div>
      }>
        <ConfirmedContent />
      </Suspense>
    </TextbookLayout>
  );
}
