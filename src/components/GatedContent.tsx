'use client';

import Link from 'next/link';

interface GatedContentProps {
  chapterTitle?: string;
}

export default function GatedContent({ chapterTitle }: GatedContentProps) {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
        An account is required to read this chapter
      </h1>

      <div className="rounded-xl p-8 mb-8" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {chapterTitle && (
          <p className="text-lg mb-4" style={{ color: 'var(--muted-text)' }}>
            You&apos;re trying to access: <strong style={{ color: 'var(--foreground)' }}>{chapterTitle}</strong>
          </p>
        )}

        <p className="mb-6" style={{ color: 'var(--muted-text)' }}>
          Creating an account allows us to keep delivering the most accurate and relevant
          information that ultimately helps you achieve your learning goals. Registration
          is free and only takes a moment.
        </p>

        <div className="flex gap-4 flex-wrap">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: 'var(--berkeley-blue)' }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: 'var(--california-gold)',
              color: 'var(--berkeley-blue)'
            }}
          >
            Create Account
          </Link>
        </div>
      </div>

    </div>
  );
}
