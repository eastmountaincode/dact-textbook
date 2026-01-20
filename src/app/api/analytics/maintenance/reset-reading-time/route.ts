import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// POST: Reset all reading time data
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { resetAll } = body;

    if (!resetAll) {
      return NextResponse.json({ error: 'Missing resetAll flag' }, { status: 400 });
    }

    // Delete all from reading_time_per_chapter
    const { error: perChapterError, count: perChapterCount } = await supabase
      .from('reading_time_per_chapter')
      .delete({ count: 'exact' })
      .neq('user_id', ''); // Delete all rows (neq empty string matches all)

    if (perChapterError) {
      console.error('Error deleting from reading_time_per_chapter:', perChapterError);
      return NextResponse.json({ error: 'Failed to reset reading time' }, { status: 500 });
    }

    // Delete all from reading_time_daily
    const { error: dailyError, count: dailyCount } = await supabase
      .from('reading_time_daily')
      .delete({ count: 'exact' })
      .neq('user_id', ''); // Delete all rows

    if (dailyError) {
      console.error('Error deleting from reading_time_daily:', dailyError);
      return NextResponse.json({ error: 'Failed to reset daily reading time' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedPerChapter: perChapterCount || 0,
      deletedDaily: dailyCount || 0,
    });
  } catch (error) {
    console.error('Error resetting reading time:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
