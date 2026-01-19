import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Clerk webhook events we care about
type WebhookEvent = {
  type: string;
  data: {
    id: string;
    [key: string]: unknown;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'user.deleted') {
    const userId = event.data.id;

    // Use service role key for deletion (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Delete user data from all tables
      // Order matters due to potential foreign key constraints

      // Delete reading time data
      const { error: readingTimeError } = await supabase
        .from('reading_time_per_chapter')
        .delete()
        .eq('user_id', userId);

      if (readingTimeError) {
        console.error('Error deleting reading_time_per_chapter:', readingTimeError);
      }

      const { error: readingTimeDailyError } = await supabase
        .from('reading_time_daily')
        .delete()
        .eq('user_id', userId);

      if (readingTimeDailyError) {
        console.error('Error deleting reading_time_daily:', readingTimeDailyError);
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error deleting user_roles:', roleError);
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting user_profiles:', profileError);
      }

      console.log(`Successfully deleted all data for user: ${userId}`);
    } catch (err) {
      console.error('Error deleting user data:', err);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
