import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Require at least 2 characters to search
    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get user IDs that have reading activity
    const { data: readingData, error: readingError } = await supabase
      .from('reading_time_per_chapter')
      .select('user_id');

    if (readingError) {
      console.error('Error fetching reading times:', readingError);
      return NextResponse.json({ error: 'Failed to fetch reading data' }, { status: 500 });
    }

    // Build set of user IDs with activity
    const usersWithActivity = new Set((readingData || []).map(r => r.user_id));

    // Search users by first_name or last_name
    const { data: profiles, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(50); // Get more to filter

    if (usersError) {
      console.error('Error searching users:', usersError);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Filter to only users with reading activity and format for react-select
    const users = (profiles || [])
      .filter(u => usersWithActivity.has(u.id))
      .slice(0, 20) // Limit to 20 after filtering
      .map(u => {
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown User';
        return {
          value: u.id,
          label: name,
        };
      });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in users-search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
