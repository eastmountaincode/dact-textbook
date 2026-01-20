import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role key for cron jobs to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Simple query to keep the database active
    const { error } = await supabase.from('chapters').select('id').limit(1);

    if (error) {
      // Log the failure
      await supabase.from('cron_logs').insert({
        job_name: 'keep-alive',
        status: 'error',
        message: error.message,
      });

      console.error('Supabase keep-alive error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Log the success
    await supabase.from('cron_logs').insert({
      job_name: 'keep-alive',
      status: 'success',
      message: 'Database ping successful',
    });

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    // Attempt to log the error (may fail if DB is down)
    try {
      await supabase.from('cron_logs').insert({
        job_name: 'keep-alive',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch {
      // Ignore logging failure
    }

    console.error('Keep-alive cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
