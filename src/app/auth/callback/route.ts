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

  const cookieStore = await cookies();

  // Create supabase client to check session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only for checking session
        },
      },
    }
  );

  // Handle errors from Supabase (e.g., expired link)
  if (error) {
    // Check if user is already logged in - if so, just redirect them
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}/chapter/welcome`);
    }

    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  if (code) {
    // For password recovery, we need to set cookies so user can reset password
    // For email confirmation (signup), we just confirm the email but don't log them in
    const isRecovery = type === 'recovery';

    const response = NextResponse.redirect(
      isRecovery ? `${origin}/reset-password` : `${origin}/auth/confirmed`
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Already logged in - just redirect them
        return NextResponse.redirect(`${origin}/chapter/welcome`);
      }

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

      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    return response;
  }

  // No code provided - check if already logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(`${origin}/chapter/welcome`);
  }

  // Not logged in and no code - redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
