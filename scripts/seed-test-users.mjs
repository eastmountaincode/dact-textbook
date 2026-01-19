#!/usr/bin/env node

/**
 * Seed Test Users
 *
 * Creates test users in Clerk and corresponding profiles in Supabase.
 * Run with: node scripts/seed-test-users.mjs
 *
 * Prerequisites:
 * - CLERK_SECRET_KEY in .env.local
 * - Supabase running locally (or SUPABASE_URL/SUPABASE_ANON_KEY for remote)
 */

import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY not found in .env.local');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not found');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test users to create
const TEST_USERS = [
  {
    email: 'admin@test.com',
    password: 'TestPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    profile: {
      role: 'educator',
      country: 'US',
      education_level: 'phd',
      field_of_study: 'statistics',
      institution_type: 'university',
      statistics_use: 'teaching',
      referral_source: 'colleague',
    },
    isAdmin: true,
  },
  {
    email: 'student@test.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Student',
    profile: {
      role: 'student',
      country: 'US',
      education_level: 'undergraduate',
      field_of_study: 'economics',
      institution_type: 'university',
      statistics_use: 'academic_coursework',
      referral_source: 'professor',
    },
    isAdmin: false,
  },
  {
    email: 'maya.chen@test.com',
    password: 'TestPassword123!',
    firstName: 'Maya',
    lastName: 'Chen',
    profile: {
      role: 'student',
      country: 'CA',
      education_level: 'graduate',
      field_of_study: 'computer_science',
      institution_type: 'university',
      statistics_use: 'research',
      referral_source: 'search_engine',
    },
    isAdmin: false,
  },
  {
    email: 'samir.patel@test.com',
    password: 'TestPassword123!',
    firstName: 'Samir',
    lastName: 'Patel',
    profile: {
      role: 'professional',
      country: 'IN',
      education_level: 'undergraduate',
      field_of_study: null,
      institution_type: null,
      statistics_use: 'work_projects',
      referral_source: null,
    },
    isAdmin: false,
  },
  {
    email: 'lucia.rossi@test.com',
    password: 'TestPassword123!',
    firstName: 'Lucia',
    lastName: 'Rossi',
    profile: {
      role: 'educator',
      country: 'IT',
      education_level: 'phd',
      field_of_study: 'statistics',
      institution_type: 'university',
      statistics_use: 'teaching',
      referral_source: 'conference',
    },
    isAdmin: false,
  },
  {
    email: 'aisha.okafor@test.com',
    password: 'TestPassword123!',
    firstName: 'Aisha',
    lastName: 'Okafor',
    profile: {
      role: 'student',
      country: 'NG',
      education_level: 'high_school',
      field_of_study: 'mathematics',
      institution_type: null,
      statistics_use: null,
      referral_source: 'social_media',
    },
    isAdmin: false,
  },
  {
    email: 'benjamin.wright@test.com',
    password: 'TestPassword123!',
    firstName: 'Benjamin',
    lastName: 'Wright',
    profile: {
      role: 'self_learner',
      country: 'US',
      education_level: 'undergraduate',
      field_of_study: 'data_science',
      institution_type: 'self_study',
      statistics_use: 'personal_projects',
      referral_source: 'youtube',
    },
    isAdmin: false,
  },
];

async function createOrGetUser(userData, forceRecreate = false) {
  const { email, password, firstName, lastName } = userData;

  // Check if user already exists in Clerk
  const existingUsers = await clerk.users.getUserList({ emailAddress: [email] });

  if (existingUsers.data.length > 0) {
    if (forceRecreate) {
      // Delete existing user to recreate with fresh settings
      const existingUser = existingUsers.data[0];
      await clerk.users.deleteUser(existingUser.id);
      console.log(`  Deleted existing user ${email} from Clerk`);
    } else {
      console.log(`  User ${email} already exists in Clerk`);
      return existingUsers.data[0];
    }
  }

  // Create new user in Clerk
  const user = await clerk.users.createUser({
    emailAddress: [email],
    password,
    firstName,
    lastName,
    skipPasswordChecks: true,
    skipEmailVerification: true,
  });

  console.log(`  Created user ${email} in Clerk (ID: ${user.id})`);

  // Verify the email address (skipEmailVerification only skips sending the email, doesn't mark it verified)
  const emailAddress = user.emailAddresses.find(e => e.emailAddress === email);
  if (emailAddress) {
    try {
      // Use the backend API to verify the email
      await clerk.emailAddresses.updateEmailAddress(emailAddress.id, {
        verified: true,
      });
      console.log(`  Verified email ${email}`);
    } catch (verifyErr) {
      console.log(`  Note: Could not verify email (may need manual verification): ${verifyErr.message}`);
    }
  }

  return user;
}

async function createProfile(clerkUserId, firstName, lastName, profileData) {
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', clerkUserId)
    .maybeSingle();

  if (existing) {
    // Update existing profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        ...profileData,
      })
      .eq('id', clerkUserId);

    if (error) throw error;
    console.log(`  Updated profile for ${clerkUserId}`);
  } else {
    // Insert new profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: clerkUserId,
        first_name: firstName,
        last_name: lastName,
        ...profileData,
      });

    if (error) throw error;
    console.log(`  Created profile for ${clerkUserId}`);
  }
}

async function setUserRole(clerkUserId, isAdmin) {
  const role = isAdmin ? 'admin' : 'student';

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: clerkUserId, role }, { onConflict: 'user_id' });

  if (error) throw error;
  console.log(`  Set role to '${role}' for ${clerkUserId}`);
}

async function trackLogin(clerkUserId) {
  const { error } = await supabase
    .from('logins')
    .insert({ user_id: clerkUserId });

  if (error && !error.message.includes('duplicate')) {
    throw error;
  }
}

async function seedReadingTime(clerkUserId, pattern) {
  // Get chapters
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_order')
    .order('chapter_order');

  if (!chapters || chapters.length === 0) {
    console.log('  No chapters found, skipping reading time seed');
    return;
  }

  // Generate reading time based on pattern
  for (const chapter of chapters) {
    const seconds = pattern(chapter.chapter_order);
    if (seconds > 0) {
      await supabase
        .from('reading_time_per_chapter')
        .upsert({
          user_id: clerkUserId,
          chapter_id: chapter.id,
          seconds_spent: seconds,
        }, { onConflict: 'user_id,chapter_id' });
    }
  }
  console.log(`  Seeded reading time data`);
}

// Reading time patterns for different user types
const READING_PATTERNS = {
  admin: (order) => order <= 10 ? 3600 - (order * 200) : 0,
  student: (order) => order <= 8 ? 2400 - (order * 200) : 0,
  maya: (order) => order <= 15 ? 5400 - (order * 300) : 0, // Very engaged
  samir: (order) => [9, 10, 11, 20, 21, 22].includes(order) ? 3000 : 300, // Practical chapters
  lucia: (order) => order <= 14 ? 6000 - (order * 300) : 0, // Thorough reader
  aisha: (order) => order <= 6 ? 2700 - (order * 300) : 0, // Beginner
  benjamin: (order) => [9, 10, 11, 20, 21, 22, 23, 24, 25].includes(order) ? 3600 : 300, // Data science focus
};

async function main() {
  // Check for --force flag to recreate users
  const forceRecreate = process.argv.includes('--force');

  console.log('Seeding test users...');
  if (forceRecreate) {
    console.log('(--force: will delete and recreate existing users)\n');
  } else {
    console.log('(use --force to recreate existing users)\n');
  }

  const createdUsers = [];

  for (const userData of TEST_USERS) {
    console.log(`Processing ${userData.email}...`);

    try {
      // Create or get Clerk user
      const clerkUser = await createOrGetUser(userData, forceRecreate);

      // Create Supabase profile
      await createProfile(
        clerkUser.id,
        userData.firstName,
        userData.lastName,
        userData.profile
      );

      // Set user role
      await setUserRole(clerkUser.id, userData.isAdmin);

      // Track initial login
      await trackLogin(clerkUser.id);

      // Seed reading time based on user type
      const patternKey = userData.firstName.toLowerCase();
      const pattern = READING_PATTERNS[patternKey] || READING_PATTERNS.student;
      await seedReadingTime(clerkUser.id, pattern);

      createdUsers.push({
        email: userData.email,
        clerkId: clerkUser.id,
        isAdmin: userData.isAdmin,
      });

      console.log('');
    } catch (error) {
      console.error(`  Error processing ${userData.email}:`, error.message);
      console.log('');
    }
  }

  console.log('\n========================================');
  console.log('Test Users Summary');
  console.log('========================================');
  console.log('Password for all users: TestPassword123!\n');

  for (const user of createdUsers) {
    console.log(`${user.email}`);
    console.log(`  Clerk ID: ${user.clerkId}`);
    console.log(`  Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
    console.log('');
  }
}

main().catch(console.error);
