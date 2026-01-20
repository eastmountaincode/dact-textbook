import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Get recent cron logs (last 10)
    const { data: recentLogs, error: logsError } = await supabase
      .from('cron_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Error fetching cron logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch maintenance data' }, { status: 500 });
    }

    // Get the most recent successful run
    const lastSuccessfulRun = recentLogs?.find(log => log.status === 'success');

    // Get counts by status
    const { data: statusCounts, error: countError } = await supabase
      .from('cron_logs')
      .select('status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (countError) {
      console.error('Error fetching status counts:', countError);
    }

    const successCount = statusCounts?.filter(l => l.status === 'success').length || 0;
    const errorCount = statusCounts?.filter(l => l.status === 'error').length || 0;

    return NextResponse.json({
      lastSuccessfulRun: lastSuccessfulRun?.created_at || null,
      recentLogs: recentLogs || [],
      stats: {
        successCount,
        errorCount,
        totalRuns: successCount + errorCount,
      },
    });
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
