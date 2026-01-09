import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TextbookLayout from '@/components/TextbookLayout';

export default async function EmailConfirmedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return (
    <TextbookLayout>
      <div className="min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Email confirmed
            </h1>
          </div>

          <div className="rounded-xl p-8 shadow-lg text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--sidebar-section-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--berkeley-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="mb-6" style={{ color: 'var(--foreground)' }}>
              Your email has been confirmed. You&apos;re now signed in.
            </p>

            <div className="space-y-3">
              <Link
                href="/chapter/welcome"
                className="block w-full py-3 rounded-lg font-medium text-white text-center hover:opacity-90"
                style={{ backgroundColor: 'var(--berkeley-blue)' }}
              >
                Go to Textbook
              </Link>

              <Link
                href="/account"
                className="block w-full py-3 rounded-lg font-medium text-center"
                style={{ color: 'var(--berkeley-blue)', backgroundColor: 'var(--sidebar-section-bg)' }}
              >
                Go to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TextbookLayout>
  );
}
