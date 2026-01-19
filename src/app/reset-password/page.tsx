'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Clerk handles the full password reset flow through its SignIn component
// Redirect users to login page
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
