import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role to check if email exists in auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user exists in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error checking email:', error);
      return NextResponse.json({ error: 'Unable to check email' }, { status: 500 });
    }

    const emailExists = data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ exists: emailExists });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
