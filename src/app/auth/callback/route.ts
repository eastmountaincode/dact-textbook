import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // Debug logging
  console.log('[auth/callback] URL:', requestUrl.toString());
  console.log('[auth/callback] code:', code ? 'present' : 'missing');
  console.log('[auth/callback] type:', type);
  console.log('[auth/callback] error:', error);

  const cookieStore = await cookies();

  // Handle errors from Supabase (e.g., expired link)
  if (error) {
    const errorMessage = errorDescription || error;
    // Always redirect to login with error - let user see the error and log in properly
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  if (code) {
    // For password recovery, we need to set cookies so user can reset password
    // For email confirmation (signup), we just confirm the email but don't log them in
    const isRecovery = type === 'recovery';

    const confirmationRedirect = `${origin}/auth/confirmed`;
    const recoveryRedirect = `${origin}/reset-password`;

    const response = NextResponse.redirect(
      isRecovery ? recoveryRedirect : confirmationRedirect
    );

    // Create supabase client - only set cookies for recovery flow
    const supabaseWithCookies = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Only set cookies for password recovery, not for signup confirmation
            if (isRecovery) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabaseWithCookies.auth.exchangeCodeForSession(code);

    // If exchange failed (e.g., link already used), handle appropriately
    if (exchangeError) {
      // Check if this is an "already used" or "expired" link error for signup confirmation
      // These errors indicate the email was likely already confirmed
      const errorLower = exchangeError.message.toLowerCase();
      const isLinkUsedOrExpired = errorLower.includes('expired') ||
                                   errorLower.includes('invalid') ||
                                   errorLower.includes('already');
      const isPKCEError = errorLower.includes('pkce') ||
                          errorLower.includes('code verifier');

      if (!isRecovery && (isLinkUsedOrExpired || isPKCEError)) {
        // For signup confirmation, show a friendly "already confirmed" message
        // PKCE errors typically mean the email was confirmed but session couldn't be established
        return NextResponse.redirect(`${origin}/auth/confirmed?already=true`);
      }

      // For recovery or other errors, redirect to login with error
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Success - redirect to appropriate page
    // For signup confirmation: always go to /auth/confirmed (user must log in manually)
    // For recovery: go to reset-password page
    console.log('[auth/callback] Success! Redirecting to:', isRecovery ? recoveryRedirect : confirmationRedirect);
    return response;
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
