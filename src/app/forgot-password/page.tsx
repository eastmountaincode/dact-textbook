'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Clerk handles password reset through its SignIn component
// Redirect users to login page where they can click "Forgot password?"
export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
