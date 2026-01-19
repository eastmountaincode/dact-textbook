import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getEducationOrder } from '@/lib/profile-options';

type DateRange = '7d' | '30d' | '90d' | 'all';

function getDateRangeStart(range: DateRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  try {
    // Check authentication using Clerk
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUserId)
      .single();

    if (roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = (searchParams.get('dateRange') || 'all') as DateRange;
    const userId = searchParams.get('userId');
    const groupBy = searchParams.get('groupBy') as 'role' | 'country' | 'education_level' | 'field_of_study' | 'institution_type' | null;
    const chapterFilter = searchParams.get('chapter')?.split(',').filter(Boolean);

    // Demographic filters (multi-value via comma-separated strings)
    const roleFilter = searchParams.get('role')?.split(',').filter(Boolean);
    const countryFilter = searchParams.get('country')?.split(',').filter(Boolean);
    const educationLevelFilter = searchParams.get('education_level')?.split(',').filter(Boolean);
    const fieldOfStudyFilter = searchParams.get('field_of_study')?.split(',').filter(Boolean);
    const institutionTypeFilter = searchParams.get('institution_type')?.split(',').filter(Boolean);

    const hasFilters = roleFilter?.length || countryFilter?.length ||
      educationLevelFilter?.length || fieldOfStudyFilter?.length || institutionTypeFilter?.length;

    const dateStart = getDateRangeStart(dateRange);

    // Fetch all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, slug, title, section, chapter_order')
      .order('chapter_order');

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    // Fetch user profiles if we have demographic filters
    let allowedUserIds: Set<string> | null = null;

    if (hasFilters) {
      let profilesQuery = supabase
        .from('user_profiles')
        .select('id, role, country, education_level, field_of_study, institution_type');

      // Apply demographic filters
      if (roleFilter?.length) {
        profilesQuery = profilesQuery.in('role', roleFilter);
      }
      if (countryFilter?.length) {
        profilesQuery = profilesQuery.in('country', countryFilter);
      }
      if (educationLevelFilter?.length) {
        profilesQuery = profilesQuery.in('education_level', educationLevelFilter);
      }
      if (fieldOfStudyFilter?.length) {
        profilesQuery = profilesQuery.in('field_of_study', fieldOfStudyFilter);
      }
      if (institutionTypeFilter?.length) {
        profilesQuery = profilesQuery.in('institution_type', institutionTypeFilter);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
      }

      // Build allowed user IDs set
      allowedUserIds = new Set<string>();
      for (const profile of profiles || []) {
        allowedUserIds.add(profile.id);
      }
    }

    // Determine which table to use based on date range
    const useDaily = dateRange !== 'all';

    interface ReadingTimeRecord {
      chapter_id: string;
      seconds_spent: number;
      user_id: string;
    }

    let rawReadingTimes: ReadingTimeRecord[] = [];

    if (useDaily) {
      // Use reading_time_daily for date-filtered queries
      let readingTimeQuery = supabase
        .from('reading_time_daily')
        .select('chapter_id, seconds_spent, user_id, date');

      // Apply date filter
      if (dateStart) {
        readingTimeQuery = readingTimeQuery.gte('date', dateStart.toISOString().split('T')[0]);
      }

      // Apply user filter for individual drill-down
      if (userId) {
        readingTimeQuery = readingTimeQuery.eq('user_id', userId);
      }

      const { data, error: readingError } = await readingTimeQuery;

      if (readingError) {
        console.error('Error fetching reading times (daily):', readingError);
        return NextResponse.json({ error: 'Failed to fetch reading times' }, { status: 500 });
      }

      rawReadingTimes = (data || []) as ReadingTimeRecord[];
    } else {
      // Use reading_time_per_chapter for cumulative totals (all time)
      let readingTimeQuery = supabase
        .from('reading_time_per_chapter')
        .select('chapter_id, seconds_spent, user_id');

      // Apply user filter for individual drill-down
      if (userId) {
        readingTimeQuery = readingTimeQuery.eq('user_id', userId);
      }

      const { data, error: readingError } = await readingTimeQuery;

      if (readingError) {
        console.error('Error fetching reading times (cumulative):', readingError);
        return NextResponse.json({ error: 'Failed to fetch reading times' }, { status: 500 });
      }

      rawReadingTimes = (data || []) as ReadingTimeRecord[];
    }

    // Filter reading times by allowed user IDs if we have demographic filters
    const readingTimes = allowedUserIds
      ? rawReadingTimes.filter(rt => allowedUserIds!.has(rt.user_id))
      : rawReadingTimes;

    // Apply chapter filter if provided
    const filteredReadingTimes = chapterFilter?.length
      ? readingTimes.filter(rt => chapterFilter.includes(rt.chapter_id))
      : readingTimes;

    // Handle groupBy queries - aggregate by demographic field
    if (groupBy) {
      // Get all unique user IDs from reading times
      const userIdsWithReading = [...new Set(filteredReadingTimes.map(rt => rt.user_id))];

      if (userIdsWithReading.length === 0) {
        return NextResponse.json({
          grouped: [],
          summary: {
            totalSeconds: 0,
            uniqueUsers: 0,
            groupCount: 0,
          },
        });
      }

      // Fetch profiles for users with reading activity
      const { data: profilesForGrouping, error: profilesGroupError } = await supabase
        .from('user_profiles')
        .select(`id, ${groupBy}`)
        .in('id', userIdsWithReading);

      if (profilesGroupError) {
        console.error('Error fetching profiles for grouping:', profilesGroupError);
        return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
      }

      // Build user -> group value mapping
      const userToGroup = new Map<string, string>();
      for (const profile of profilesForGrouping || []) {
        const groupValue = (profile as Record<string, unknown>)[groupBy] as string | null;
        userToGroup.set(profile.id, groupValue || 'Unknown');
      }

      // Aggregate reading time by group value
      const groupData = new Map<string, { seconds: number; userIds: Set<string> }>();

      for (const rt of filteredReadingTimes) {
        const groupValue = userToGroup.get(rt.user_id) || 'Unknown';
        if (!groupData.has(groupValue)) {
          groupData.set(groupValue, { seconds: 0, userIds: new Set() });
        }
        const data = groupData.get(groupValue)!;
        data.seconds += rt.seconds_spent;
        data.userIds.add(rt.user_id);
      }

      // Convert to array and sort (education by level, others by seconds)
      const grouped = Array.from(groupData.entries())
        .map(([value, data]) => ({
          value,
          label: value,
          seconds: data.seconds,
          userCount: data.userIds.size,
        }))
        .sort((a, b) => {
          if (groupBy === 'education_level') {
            return getEducationOrder(a.value) - getEducationOrder(b.value);
          }
          return b.seconds - a.seconds;
        });

      const totalSeconds = grouped.reduce((sum, g) => sum + g.seconds, 0);

      return NextResponse.json({
        chapterOptions: (chapters || []).map(chapter => ({
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title || chapter.slug,
          section: chapter.section || 'Other',
          order: chapter.chapter_order,
        })),
        grouped,
        summary: {
          totalSeconds,
          uniqueUsers: userIdsWithReading.length,
          groupCount: grouped.length,
        },
      });
    }

    // Aggregate by chapter
    const chapterData = new Map<string, { seconds: number; userIds: Set<string> }>();

    const chaptersForResponse = chapterFilter?.length
      ? (chapters || []).filter(chapter => chapterFilter.includes(chapter.id))
      : (chapters || []);

    // Initialize all chapters with 0
    for (const chapter of chaptersForResponse) {
      chapterData.set(chapter.id, { seconds: 0, userIds: new Set() });
    }

    // Sum up reading times
    for (const rt of filteredReadingTimes) {
      if (chapterData.has(rt.chapter_id)) {
        const data = chapterData.get(rt.chapter_id)!;
        data.seconds += rt.seconds_spent;
        data.userIds.add(rt.user_id);
      }
    }

    // Build chapters response with section info
    const chaptersResponse = chaptersForResponse.map(chapter => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title || chapter.slug,
      section: chapter.section || 'Other',
      order: chapter.chapter_order,
      seconds: chapterData.get(chapter.id)?.seconds || 0,
      userCount: chapterData.get(chapter.id)?.userIds.size || 0,
    }));

    // Calculate summary
    const totalSeconds = chaptersResponse.reduce((sum, ch) => sum + ch.seconds, 0);
    const uniqueUsers = new Set(filteredReadingTimes.map(rt => rt.user_id));
    const chaptersWithActivity = chaptersResponse.filter(ch => ch.seconds > 0).length;

    return NextResponse.json({
      chapterOptions: (chapters || []).map(chapter => ({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title || chapter.slug,
        section: chapter.section || 'Other',
        order: chapter.chapter_order,
      })),
      chapters: chaptersResponse,
      summary: {
        totalSeconds,
        totalChapters: chaptersResponse.length,
        chaptersWithActivity,
        uniqueUsers: uniqueUsers.size,
      },
    });
  } catch (error) {
    console.error('Error fetching textbook analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
