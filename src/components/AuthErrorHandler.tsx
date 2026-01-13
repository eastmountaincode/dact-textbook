'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Handles auth errors that come back in URL hash fragments from Supabase.
 * These happen when clicking invalid/expired confirmation links while logged in.
 * Supabase redirects to the site with #error=... in the URL.
 */
export function AuthErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check for error in hash fragment
    const hash = window.location.hash;
    if (!hash || !hash.includes('error=')) return;

    // Parse the hash fragment
    const params = new URLSearchParams(hash.substring(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');

    // Handle OTP expired/invalid errors (from confirmation links)
    if (error === 'access_denied' && (errorCode === 'otp_expired' || errorCode === 'otp_invalid')) {
      // Clear the hash and redirect to the "link invalid" page
      window.history.replaceState(null, '', window.location.pathname);
      router.push('/auth/confirmed?already=true');
    }
  }, [router]);

  return null;
}
