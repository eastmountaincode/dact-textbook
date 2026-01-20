import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Check authentication using Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role key for the keep-alive ping (same as cron job)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Simple query to keep the database active (same as cron job)
    const { error } = await serviceSupabase.from('chapters').select('id').limit(1);

    if (error) {
      // Log the failure
      await serviceSupabase.from('cron_logs').insert({
        job_name: 'keep-alive',
        status: 'error',
        message: `Manual trigger: ${error.message}`,
      });

      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Log the success
    await serviceSupabase.from('cron_logs').insert({
      job_name: 'keep-alive',
      status: 'success',
      message: 'Manual trigger: Database ping successful',
    });

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Manual keep-alive trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
