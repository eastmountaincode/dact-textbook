import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import {
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  FIELD_OPTIONS,
  INSTITUTION_OPTIONS,
  STATISTICS_USE_OPTIONS,
  REFERRAL_OPTIONS,
  getOptionLabel,
  getEducationOrder,
} from '@/lib/profile-options';

// Register English locale for country names
countries.registerLocale(enLocale);

type GroupByField = 'role' | 'country' | 'education_level' | 'field_of_study' | 'institution_type' | 'statistics_use' | 'referral_source';

const VALID_GROUP_BY_FIELDS: GroupByField[] = ['role', 'country', 'education_level', 'field_of_study', 'institution_type', 'statistics_use', 'referral_source'];

// Map groupBy field to centralized options
const FIELD_OPTIONS_MAP = {
  role: ROLE_OPTIONS,
  education_level: EDUCATION_OPTIONS,
  field_of_study: FIELD_OPTIONS,
  institution_type: INSTITUTION_OPTIONS,
  statistics_use: STATISTICS_USE_OPTIONS,
  referral_source: REFERRAL_OPTIONS,
};

// Helper to get label for any field value
function getFieldLabel(field: GroupByField, value: string): string {
  if (!value) return 'Not specified';
  if (field === 'country') {
    return countries.getName(value, 'en') || value;
  }
  const options = FIELD_OPTIONS_MAP[field as keyof typeof FIELD_OPTIONS_MAP];
  return options ? getOptionLabel(options, value) : value;
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const groupBy = (searchParams.get('groupBy') || 'role') as GroupByField;

    if (!VALID_GROUP_BY_FIELDS.includes(groupBy)) {
      return NextResponse.json({ error: 'Invalid groupBy field' }, { status: 400 });
    }

    // Optional additional filters (comma-separated for multiple values)
    const role = searchParams.get('role')?.split(',').filter(Boolean);
    const country = searchParams.get('country')?.split(',').filter(Boolean);
    const educationLevel = searchParams.get('education_level')?.split(',').filter(Boolean);
    const fieldOfStudy = searchParams.get('field_of_study')?.split(',').filter(Boolean);
    const institutionType = searchParams.get('institution_type')?.split(',').filter(Boolean);
    const statisticsUse = searchParams.get('statistics_use')?.split(',').filter(Boolean);
    const referralSource = searchParams.get('referral_source')?.split(',').filter(Boolean);

    // Build query
    let query = supabase.from('user_profiles').select('*');

    // Apply all filters
    if (role?.length) {
      query = query.in('role', role);
    }
    if (country?.length) {
      query = query.in('country', country);
    }
    if (educationLevel?.length) {
      query = query.in('education_level', educationLevel);
    }
    if (fieldOfStudy?.length) {
      query = query.in('field_of_study', fieldOfStudy);
    }
    if (institutionType?.length) {
      query = query.in('institution_type', institutionType);
    }
    if (statisticsUse?.length) {
      query = query.in('statistics_use', statisticsUse);
    }
    if (referralSource?.length) {
      query = query.in('referral_source', referralSource);
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
      .sort((a, b) => {
        // Sort education levels by academic progression, others by count
        if (groupBy === 'education_level') {
          return getEducationOrder(a.value) - getEducationOrder(b.value);
        }
        return b.count - a.count;
      });

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
