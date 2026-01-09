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
  institution_type = 'university'
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
  institution_type = 'university'
WHERE id = '00000000-0000-0000-0000-000000000002';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000002', 'student');

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
  institution_type = 'other'
WHERE id = '00000000-0000-0000-0000-000000000003';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000003', 'student');
