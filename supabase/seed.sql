-- Seed file for local development
-- Run with: supabase db reset (this runs migrations then seed.sql)
-- Note: A trigger auto-creates user_profiles rows, so we UPDATE them instead of INSERT

-- ============================================
-- ADMIN USER
-- Email: admin@example.com
-- Password: adminpassword123
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  '$2a$12$s0N6mReT6rDLNclPwpsDGeridITMqYNohKFxlBDKRnJdj.d8TDhCm',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Identity required for login
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Update the auto-created profile with actual data
UPDATE public.user_profiles SET
  first_name = 'Admin',
  last_name = 'User',
  status = 'educator',
  country = 'US',
  education_level = 'phd',
  field_of_study = 'statistics',
  institution_type = 'university',
  statistics_use = 'teaching'
WHERE id = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin');

-- ============================================
-- STUDENT USER
-- Email: student@example.com
-- Password: studentpassword123
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'student@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Test", "last_name": "Student"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Identity required for login
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'student@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000002", "email": "student@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Update the auto-created profile with actual data
UPDATE public.user_profiles SET
  first_name = 'Test',
  last_name = 'Student',
  status = 'student',
  country = 'US',
  education_level = 'undergraduate',
  field_of_study = 'economics',
  institution_type = 'university',
  statistics_use = 'academic_coursework'
WHERE id = '00000000-0000-0000-0000-000000000002';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000002', 'student');

-- ============================================
-- ADDITIONAL USERS (for demographics analytics)
-- Password for all: studentpassword123
-- ============================================

-- Maya Chen
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'maya.chen@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Maya", "last_name": "Chen"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  'maya.chen@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000004", "email": "maya.chen@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

UPDATE public.user_profiles SET
  first_name = 'Maya',
  last_name = 'Chen',
  status = 'student',
  country = 'CA',
  education_level = 'graduate',
  field_of_study = 'computer_science',
  institution_type = 'university',
  statistics_use = 'research'
WHERE id = '00000000-0000-0000-0000-000000000004';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000004', 'student');

-- Samir Patel
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'samir.patel@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Samir", "last_name": "Patel"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  'samir.patel@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000005", "email": "samir.patel@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

UPDATE public.user_profiles SET
  first_name = 'Samir',
  last_name = 'Patel',
  status = 'professional',
  country = 'IN',
  education_level = 'undergraduate',
  field_of_study = 'business',
  institution_type = 'other',
  statistics_use = 'professional_work'
WHERE id = '00000000-0000-0000-0000-000000000005';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000005', 'student');

-- Lucia Rossi
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'lucia.rossi@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Lucia", "last_name": "Rossi"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006',
  'lucia.rossi@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000006", "email": "lucia.rossi@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

UPDATE public.user_profiles SET
  first_name = 'Lucia',
  last_name = 'Rossi',
  status = 'educator',
  country = 'IT',
  education_level = 'phd',
  field_of_study = 'statistics',
  institution_type = 'university',
  statistics_use = 'teaching'
WHERE id = '00000000-0000-0000-0000-000000000006';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000006', 'student');

-- Aisha Okafor
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'aisha.okafor@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Aisha", "last_name": "Okafor"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000007',
  'aisha.okafor@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000007", "email": "aisha.okafor@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

UPDATE public.user_profiles SET
  first_name = 'Aisha',
  last_name = 'Okafor',
  status = 'student',
  country = 'NG',
  education_level = 'high_school',
  field_of_study = 'mathematics',
  institution_type = 'other',
  statistics_use = 'academic_coursework'
WHERE id = '00000000-0000-0000-0000-000000000007';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000007', 'student');

-- Benjamin Wright
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000000',
  'benjamin.wright@example.com',
  '$2a$12$FT.9RxRo5URnDcAjhtLK.uZ7hZW/fKE2r.DU8VSIiKL/omwKSwdmy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Benjamin", "last_name": "Wright"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000008',
  'benjamin.wright@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000008", "email": "benjamin.wright@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

UPDATE public.user_profiles SET
  first_name = 'Benjamin',
  last_name = 'Wright',
  status = 'self_learner',
  country = 'US',
  education_level = 'undergraduate',
  field_of_study = 'data_science',
  institution_type = 'self_study',
  statistics_use = 'personal_projects'
WHERE id = '00000000-0000-0000-0000-000000000008';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000008', 'student');

-- ============================================
-- UNCONFIRMED USER (for testing email not confirmed flow)
-- Email: unconfirmed@example.com
-- Password: unconfirmedpassword123
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'unconfirmed@example.com',
  '$2b$12$ZFgziAJ7U4Jfm8iUlLWaxO2GAABgPix4o8UT/Q96.C8M6G7P4eGKq',
  NULL,
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Unconfirmed", "last_name": "User"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Identity required for login
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'unconfirmed@example.com',
  '{"sub": "00000000-0000-0000-0000-000000000003", "email": "unconfirmed@example.com", "email_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Update the auto-created profile with actual data
UPDATE public.user_profiles SET
  first_name = 'Unconfirmed',
  last_name = 'User',
  status = 'student',
  country = 'US',
  education_level = 'undergraduate',
  field_of_study = 'other',
  institution_type = 'other',
  statistics_use = 'academic_coursework'
WHERE id = '00000000-0000-0000-0000-000000000003';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000003', 'student');

-- ============================================
-- CHAPTERS (auto-generated from content files)
-- Regenerate with: node scripts/seed-chapters.mjs
-- ============================================

INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('556402dc-5564-02dc-5564-02dc556402dc', 'welcome', 'Welcome', 1, 'Preface') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('6b7b9125-6b7b-9125-6b7b-91256b7b9125', 'about-the-author', 'About the Authors', 2, 'Preface') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('7a8e73de-7a8e-73de-7a8e-73de7a8e73de', 'intro-data-analytics', 'The Purpose of Data Analytics', 3, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('41273fe7-4127-3fe7-4127-3fe741273fe7', 'probability-distributions', 'Probability', 4, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('2f73f4d8-2f73-f4d8-2f73-f4d82f73f4d8', 'parameters-statistics', 'Parameters and statistics', 5, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('21c89eef-21c8-9eef-21c8-9eef21c89eef', 'operators-properties', 'Expectation and Variance Operators', 6, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('6eb3a815-6eb3-a815-6eb3-a8156eb3a815', 'bounds-outliers', 'Bounding Outliers', 7, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('7199f46c-7199-f46c-7199-f46c7199f46c', 'normal-distribution', 'The normal distribution', 8, 'Theoretical Foundations') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('2899b528-2899-b528-2899-b5282899b528', 'data', 'Data', 9, 'Descriptive Statistics') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('4748a2a8-4748-a2a8-4748-a2a84748a2a8', 'summary-statistics', 'Summary statistics', 10, 'Descriptive Statistics') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('378f7dae-378f-7dae-378f-7dae378f7dae', 'graphing', 'Graphing', 11, 'Descriptive Statistics') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('749f4d18-749f-4d18-749f-4d18749f4d18', 'bayesian-inference', 'Bayesian inference', 12, 'Bayesian Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('0f5c3c91-0f5c-3c91-0f5c-3c910f5c3c91', 'foundations-frequentist', 'Foundations of Frequentist Statistics', 13, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('2165446f-2165-446f-2165-446f2165446f', 'estimating-mean', 'Estimating the population mean', 14, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('648535e5-6485-35e5-6485-35e5648535e5', 'estimating-variance', 'Estimating the population variance', 15, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('7c1ddc0e-7c1d-dc0e-7c1d-dc0e7c1ddc0e', 'testing-mean-large', 'Testing a claim about a population mean', 16, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('7c85b5da-7c85-b5da-7c85-b5da7c85b5da', 'testing-mean-small', 'Claim about a population mean (small sample)', 17, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('2336aa52-2336-aa52-2336-aa522336aa52', 'testing-two-means', 'Claims about two population means', 18, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('0c50f154-0c50-f154-0c50-f1540c50f154', 'testing-multiple-means', 'Claim about multiple population means', 19, 'Frequentist Inference') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('3a684644-3a68-4644-3a68-46443a684644', 'correlation', 'Correlation', 20, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('32aa6f03-32aa-6f03-32aa-6f0332aa6f03', 'bivariate-regression', 'Bivariate regression', 21, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('7a17cc47-7a17-cc47-7a17-cc477a17cc47', 'multivariate-regression', 'Multiple Regression', 22, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('306ed8d1-306e-d8d1-306e-d8d1306ed8d1', 'panel-data', 'Panel Data Methods', 23, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('047e2e6a-047e-2e6a-047e-2e6a047e2e6a', 'propensity-score', 'Propensity Score Matching', 24, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;
INSERT INTO chapters (id, slug, title, chapter_order, section) VALUES ('18936df4-1893-6df4-1893-6df418936df4', 'dichotomous-choice', 'Dichotomous Choice Modeling', 25, 'Advanced Modeling') ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, chapter_order = EXCLUDED.chapter_order, section = EXCLUDED.section;

-- ============================================
-- READING TIME SEED DATA (for student user)
-- Tests date range filtering
-- ============================================

-- Cumulative totals
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000002', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 3600 WHEN 2 THEN 1800 WHEN 3 THEN 2700
    WHEN 4 THEN 900 WHEN 5 THEN 1200 WHEN 6 THEN 600 ELSE 300
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 10
ON CONFLICT (user_id, chapter_id) DO NOTHING;

-- Daily: Today (shows in all ranges)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000002', c.id, CURRENT_DATE, 300
FROM public.chapters c WHERE c.chapter_order IN (1, 2, 3)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Daily: 3 days ago (shows in 7d, 30d, 90d, all)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000002', c.id, CURRENT_DATE - INTERVAL '3 days', 600
FROM public.chapters c WHERE c.chapter_order IN (1, 2, 4)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Daily: 10 days ago (shows in 30d, 90d, all - NOT 7d)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000002', c.id, CURRENT_DATE - INTERVAL '10 days', 900
FROM public.chapters c WHERE c.chapter_order IN (1, 3, 5)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Daily: 45 days ago (shows in 90d, all - NOT 7d, 30d)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000002', c.id, CURRENT_DATE - INTERVAL '45 days', 1200
FROM public.chapters c WHERE c.chapter_order IN (1, 2, 6)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Daily: 120 days ago (shows ONLY in all)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000002', c.id, CURRENT_DATE - INTERVAL '120 days', 1800
FROM public.chapters c WHERE c.chapter_order IN (1, 4, 7)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- ============================================
-- READING TIME FOR ADDITIONAL USERS
-- For testing textbook analytics with multiple users
-- ============================================

-- Maya Chen (graduate student, Canada) - very engaged reader
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000004', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 1800 WHEN 2 THEN 1200 WHEN 3 THEN 5400  -- 1.5h on chapter 3
    WHEN 4 THEN 3600 WHEN 5 THEN 4200 WHEN 6 THEN 2700
    WHEN 7 THEN 1800 WHEN 8 THEN 3000 WHEN 9 THEN 2400
    WHEN 10 THEN 1500 ELSE 600
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 15
ON CONFLICT (user_id, chapter_id) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000004', c.id, CURRENT_DATE - INTERVAL '2 days', 1200
FROM public.chapters c WHERE c.chapter_order IN (3, 4, 5)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000004', c.id, CURRENT_DATE - INTERVAL '5 days', 900
FROM public.chapters c WHERE c.chapter_order IN (1, 2, 6)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Samir Patel (professional, India) - focused on practical chapters
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000005', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 600 WHEN 2 THEN 300 WHEN 3 THEN 1800
    WHEN 9 THEN 2400 WHEN 10 THEN 3000 WHEN 11 THEN 2100  -- data/stats chapters
    WHEN 20 THEN 1800 WHEN 21 THEN 2400 WHEN 22 THEN 3600  -- regression
    ELSE 300
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 22
ON CONFLICT (user_id, chapter_id) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000005', c.id, CURRENT_DATE - INTERVAL '1 day', 600
FROM public.chapters c WHERE c.chapter_order IN (9, 10, 21)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Lucia Rossi (PhD educator, Italy) - thorough reader, especially theory
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000006', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 2100 WHEN 2 THEN 1500 WHEN 3 THEN 7200  -- 2h on chapter 3
    WHEN 4 THEN 5400 WHEN 5 THEN 6000 WHEN 6 THEN 4800
    WHEN 7 THEN 3600 WHEN 8 THEN 4200 WHEN 12 THEN 5400  -- Bayesian
    WHEN 13 THEN 6000 WHEN 14 THEN 4500 ELSE 1200
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 20
ON CONFLICT (user_id, chapter_id) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000006', c.id, CURRENT_DATE, 1800
FROM public.chapters c WHERE c.chapter_order IN (3, 4, 12)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000006', c.id, CURRENT_DATE - INTERVAL '7 days', 1500
FROM public.chapters c WHERE c.chapter_order IN (5, 6, 13)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Aisha Okafor (secondary student, Nigeria) - beginner, early chapters
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000007', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 2400 WHEN 2 THEN 1800 WHEN 3 THEN 3600
    WHEN 4 THEN 2700 WHEN 5 THEN 1800 WHEN 9 THEN 1500
    WHEN 10 THEN 1200 WHEN 11 THEN 900 ELSE 0
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 11
ON CONFLICT (user_id, chapter_id) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000007', c.id, CURRENT_DATE - INTERVAL '4 days', 900
FROM public.chapters c WHERE c.chapter_order IN (1, 3, 4)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

-- Benjamin Wright (self-learner, US) - practical focus, data science
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT '00000000-0000-0000-0000-000000000008', c.id,
  CASE c.chapter_order
    WHEN 1 THEN 900 WHEN 3 THEN 2100 WHEN 9 THEN 3000
    WHEN 10 THEN 2700 WHEN 11 THEN 2400 WHEN 20 THEN 3600
    WHEN 21 THEN 4200 WHEN 22 THEN 4800 WHEN 23 THEN 2400
    WHEN 24 THEN 1800 WHEN 25 THEN 1500 ELSE 300
  END, NOW()
FROM public.chapters c WHERE c.chapter_order <= 25
ON CONFLICT (user_id, chapter_id) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000008', c.id, CURRENT_DATE - INTERVAL '1 day', 1200
FROM public.chapters c WHERE c.chapter_order IN (21, 22, 23)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;

INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT '00000000-0000-0000-0000-000000000008', c.id, CURRENT_DATE - INTERVAL '15 days', 900
FROM public.chapters c WHERE c.chapter_order IN (9, 10, 11)
ON CONFLICT (user_id, chapter_id, date) DO NOTHING;
