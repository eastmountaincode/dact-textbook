import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// GET: Search for users by email (partial match)
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || email.length < 3) {
      return NextResponse.json({ error: 'Email search must be at least 3 characters' }, { status: 400 });
    }

    // Search profiles by email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name')
      .ilike('email', `%${email}%`)
      .limit(10);

    if (profileError) {
      console.error('Error searching profiles:', profileError);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Get reading time totals for each user
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: readingTime } = await supabase
          .from('reading_time_per_chapter')
          .select('seconds_spent')
          .eq('user_id', profile.user_id);

        const totalSeconds = readingTime?.reduce((sum, r) => sum + r.seconds_spent, 0) || 0;

        return {
          ...profile,
          totalReadingSeconds: totalSeconds,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Reset reading time for a specific user
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
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    // Delete from reading_time_per_chapter
    const { error: perChapterError, count: perChapterCount } = await supabase
      .from('reading_time_per_chapter')
      .delete({ count: 'exact' })
      .eq('user_id', targetUserId);

    if (perChapterError) {
      console.error('Error deleting from reading_time_per_chapter:', perChapterError);
      return NextResponse.json({ error: 'Failed to reset reading time' }, { status: 500 });
    }

    // Delete from reading_time_daily
    const { error: dailyError, count: dailyCount } = await supabase
      .from('reading_time_daily')
      .delete({ count: 'exact' })
      .eq('user_id', targetUserId);

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
