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

  // Handle errors from Supabase (e.g., expired link)
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    // Create a response object to capture cookies
    const response = NextResponse.redirect(
      type === 'recovery'
        ? `${origin}/reset-password`
        : `${origin}/auth/confirmed`
    );

    // Create supabase client that sets cookies on the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    // If token expired, exchangeError.message = "Token has expired" or similar
    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    return response;
  }

  // No code provided - redirect based on type
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Default: redirect to confirmed page
  return NextResponse.redirect(`${origin}/auth/confirmed`);
}
