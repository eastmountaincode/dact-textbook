import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register English locale for country names
countries.registerLocale(enLocale);

type GroupByField = 'status' | 'country' | 'education_level' | 'field_of_study' | 'institution_type';
type NonCountryField = Exclude<GroupByField, 'country'>;

const VALID_GROUP_BY_FIELDS: GroupByField[] = ['status', 'country', 'education_level', 'field_of_study', 'institution_type'];

// Labels for non-country fields (country uses i18n-iso-countries package)
const FIELD_LABELS: Record<NonCountryField, Record<string, string>> = {
  status: {
    student: 'Student',
    professional: 'Professional',
    educator: 'Educator',
    researcher: 'Researcher',
    other: 'Other',
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

// Helper to get label for any field value
function getFieldLabel(field: GroupByField, value: string): string {
  if (!value) return 'Not specified';
  if (field === 'country') {
    return countries.getName(value, 'en') || value;
  }
  return FIELD_LABELS[field as NonCountryField]?.[value] || value;
}

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
    const groupBy = (searchParams.get('groupBy') || 'status') as GroupByField;

    if (!VALID_GROUP_BY_FIELDS.includes(groupBy)) {
      return NextResponse.json({ error: 'Invalid groupBy field' }, { status: 400 });
    }

    // Optional additional filters (comma-separated for multiple values)
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const country = searchParams.get('country')?.split(',').filter(Boolean);
    const educationLevel = searchParams.get('education_level')?.split(',').filter(Boolean);
    const fieldOfStudy = searchParams.get('field_of_study')?.split(',').filter(Boolean);
    const institutionType = searchParams.get('institution_type')?.split(',').filter(Boolean);

    // Build query
    let query = supabase.from('user_profiles').select('*');

    // Apply filters (excluding the groupBy field to allow meaningful grouping)
    if (status?.length && groupBy !== 'status') {
      query = query.in('status', status);
    }
    if (country?.length && groupBy !== 'country') {
      query = query.in('country', country);
    }
    if (educationLevel?.length && groupBy !== 'education_level') {
      query = query.in('education_level', educationLevel);
    }
    if (fieldOfStudy?.length && groupBy !== 'field_of_study') {
      query = query.in('field_of_study', fieldOfStudy);
    }
    if (institutionType?.length && groupBy !== 'institution_type') {
      query = query.in('institution_type', institutionType);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Count total users
    const totalUsers = profiles?.length || 0;

    // Group by the specified field
    const groupCounts = new Map<string, number>();

    for (const profile of profiles || []) {
      const value = profile[groupBy] || 'Not specified';
      groupCounts.set(value, (groupCounts.get(value) || 0) + 1);
    }

    // Convert to array with labels and percentages
    const groups = Array.from(groupCounts.entries())
      .map(([value, count]) => ({
        value,
        label: getFieldLabel(groupBy, value),
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalUsers,
      groupBy,
      groups,
    });
  } catch (error) {
    console.error('Error fetching user demographics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
