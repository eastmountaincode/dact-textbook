import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type DateRange = '7d' | '30d' | '90d' | 'all';

function getDateRangeStart(range: DateRange): string | null {
  if (range === 'all') return null;
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = (searchParams.get('dateRange') || 'all') as DateRange;
    const dateStart = getDateRangeStart(dateRange);

    // Get all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, slug, title, section, chapter_order')
      .order('chapter_order');

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    let readingTimeMap: Map<string, { seconds: number; lastUpdated: string | null }>;

    if (dateStart) {
      // Use daily table for date-range queries
      const { data: dailyTimes, error: dailyError } = await supabase
        .from('reading_time_daily')
        .select('chapter_id, seconds_spent, updated_at')
        .eq('user_id', user.id)
        .gte('date', dateStart);

      if (dailyError) {
        console.error('Error fetching daily reading times:', dailyError);
        return NextResponse.json({ error: 'Failed to fetch reading times' }, { status: 500 });
      }

      // Aggregate daily times per chapter
      const aggregated = new Map<string, { seconds: number; lastUpdated: string | null }>();
      for (const dt of dailyTimes || []) {
        const existing = aggregated.get(dt.chapter_id);
        if (existing) {
          existing.seconds += dt.seconds_spent;
          if (dt.updated_at && (!existing.lastUpdated || new Date(dt.updated_at) > new Date(existing.lastUpdated))) {
            existing.lastUpdated = dt.updated_at;
          }
        } else {
          aggregated.set(dt.chapter_id, {
            seconds: dt.seconds_spent,
            lastUpdated: dt.updated_at,
          });
        }
      }
      readingTimeMap = aggregated;
    } else {
      // Use cumulative table for "all time" queries (more efficient)
      const { data: readingTimes, error: readingError } = await supabase
        .from('reading_time_per_chapter')
        .select('chapter_id, seconds_spent, last_updated')
        .eq('user_id', user.id);

      if (readingError) {
        console.error('Error fetching reading times:', readingError);
        return NextResponse.json({ error: 'Failed to fetch reading times' }, { status: 500 });
      }

      readingTimeMap = new Map(
        readingTimes?.map(rt => [rt.chapter_id, {
          seconds: rt.seconds_spent,
          lastUpdated: rt.last_updated,
        }]) || []
      );
    }

    // Combine chapters with reading times
    const chaptersWithTime = chapters?.map(chapter => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title || chapter.slug,
      section: chapter.section,
      order: chapter.chapter_order,
      seconds: readingTimeMap.get(chapter.id)?.seconds || 0,
      lastUpdated: readingTimeMap.get(chapter.id)?.lastUpdated || null,
    })) || [];

    // Calculate summary stats
    const chaptersWithReadingTime = chaptersWithTime.filter(c => c.seconds > 0);
    const totalSeconds = chaptersWithTime.reduce((sum, c) => sum + c.seconds, 0);
    const lastActivity = chaptersWithReadingTime.length > 0
      ? chaptersWithReadingTime.reduce((latest, c) => {
          if (!c.lastUpdated) return latest;
          if (!latest) return c.lastUpdated;
          return new Date(c.lastUpdated) > new Date(latest) ? c.lastUpdated : latest;
        }, null as string | null)
      : null;

    return NextResponse.json({
      chapters: chaptersWithTime,
      summary: {
        totalSeconds,
        chaptersVisited: chaptersWithReadingTime.length,
        totalChapters: chapters?.length || 0,
        lastActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
