import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type GroupByField = 'status' | 'country' | 'education_level' | 'field_of_study' | 'institution_type';

const FIELD_LABELS: Record<GroupByField, Record<string, string>> = {
  status: {
    student: 'Student',
    professional: 'Professional',
    educator: 'Educator',
    researcher: 'Researcher',
    other: 'Other',
  },
  country: {
    US: 'United States',
    CA: 'Canada',
    GB: 'United Kingdom',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    IN: 'India',
    CN: 'China',
    JP: 'Japan',
    BR: 'Brazil',
    MX: 'Mexico',
    OTHER: 'Other',
  },
  education_level: {
    high_school: 'High School',
    undergraduate: 'Undergraduate',
    graduate: 'Graduate',
    phd: 'PhD',
    professional: 'Professional',
  },
  field_of_study: {
    economics: 'Economics',
    statistics: 'Statistics',
    data_science: 'Data Science',
    business: 'Business',
    social_sciences: 'Social Sciences',
    natural_sciences: 'Natural Sciences',
    engineering: 'Engineering',
    other: 'Other',
  },
  institution_type: {
    university: 'University',
    community_college: 'Community College',
    company: 'Company',
    government: 'Government',
    self_study: 'Self-study',
    other: 'Other',
  },
};

const GROUP_BY_LABELS: Record<GroupByField, string> = {
  status: 'Status',
  country: 'Country',
  education_level: 'Education Level',
  field_of_study: 'Field of Study',
  institution_type: 'Institution Type',
};

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
    const type = searchParams.get('type') || 'users';
    const groupBy = (searchParams.get('groupBy') || 'status') as GroupByField;

    if (type === 'users') {
      // Export user demographics
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
      }

      // Group by the specified field
      const groupCounts = new Map<string, number>();
      const totalUsers = profiles?.length || 0;

      for (const profile of profiles || []) {
        const value = profile[groupBy] || 'Not specified';
        groupCounts.set(value, (groupCounts.get(value) || 0) + 1);
      }

      // Convert to CSV
      const groupByLabel = GROUP_BY_LABELS[groupBy];
      const rows = [
        [groupByLabel, 'Count', 'Percentage'].join(','),
        ...Array.from(groupCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => {
            const label = FIELD_LABELS[groupBy][value] || value || 'Not specified';
            const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0';
            return [
              `"${label}"`,
              count,
              `${percentage}%`,
            ].join(',');
          }),
        '',
        `Total Users,${totalUsers}`,
      ];

      const csv = rows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-demographics-${groupBy}.csv"`,
        },
      });
    } else if (type === 'textbook') {
      // Export textbook analytics
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title, slug, section, chapter_order')
        .order('chapter_order');

      const { data: readingTimes } = await supabase
        .from('reading_time_per_chapter')
        .select('chapter_id, seconds_spent, user_id');

      // Aggregate by chapter
      const chapterData = new Map<string, { seconds: number; users: Set<string> }>();

      for (const chapter of chapters || []) {
        chapterData.set(chapter.id, { seconds: 0, users: new Set() });
      }

      for (const rt of readingTimes || []) {
        if (chapterData.has(rt.chapter_id)) {
          const data = chapterData.get(rt.chapter_id)!;
          data.seconds += rt.seconds_spent;
          data.users.add(rt.user_id);
        }
      }

      // Convert to CSV
      const rows = [
        ['Section', 'Chapter', 'Total Time (seconds)', 'Total Time (formatted)', 'Unique Users'].join(','),
        ...(chapters || []).map(chapter => {
          const data = chapterData.get(chapter.id);
          const seconds = data?.seconds || 0;
          const hours = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return [
            `"${chapter.section || 'Other'}"`,
            `"${chapter.title || chapter.slug}"`,
            seconds,
            `"${formatted}"`,
            data?.users.size || 0,
          ].join(',');
        }),
      ];

      const csv = rows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="textbook-analytics.csv"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
