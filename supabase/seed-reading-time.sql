-- Reading time seed data for testing date range filtering
-- Run AFTER chapters have been seeded: node scripts/seed-chapters.mjs --run
-- Usage: supabase db execute --file supabase/seed-reading-time.sql

-- Student user ID (from seed.sql)
-- Email: student@example.com / Password: studentpassword123

-- First, insert cumulative totals into reading_time_per_chapter
INSERT INTO public.reading_time_per_chapter (user_id, chapter_id, seconds_spent, last_updated)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CASE
    WHEN c.chapter_order = 1 THEN 3600   -- 1 hour
    WHEN c.chapter_order = 2 THEN 1800   -- 30 min
    WHEN c.chapter_order = 3 THEN 2700   -- 45 min
    WHEN c.chapter_order = 4 THEN 900    -- 15 min
    WHEN c.chapter_order = 5 THEN 1200   -- 20 min
    WHEN c.chapter_order = 6 THEN 600    -- 10 min
    ELSE 300                              -- 5 min default
  END,
  NOW()
FROM public.chapters c
WHERE c.chapter_order <= 10
ON CONFLICT (user_id, chapter_id) DO UPDATE SET
  seconds_spent = EXCLUDED.seconds_spent,
  last_updated = EXCLUDED.last_updated;

-- Daily breakdown for date range filtering tests

-- Today's reading (will show in all date ranges)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CURRENT_DATE,
  300  -- 5 min today
FROM public.chapters c
WHERE c.chapter_order IN (1, 2, 3)
ON CONFLICT (user_id, chapter_id, date) DO UPDATE SET seconds_spent = EXCLUDED.seconds_spent;

-- 3 days ago (will show in 7d, 30d, 90d, all)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CURRENT_DATE - INTERVAL '3 days',
  600  -- 10 min
FROM public.chapters c
WHERE c.chapter_order IN (1, 2, 4)
ON CONFLICT (user_id, chapter_id, date) DO UPDATE SET seconds_spent = EXCLUDED.seconds_spent;

-- 10 days ago (will show in 30d, 90d, all - NOT in 7d)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CURRENT_DATE - INTERVAL '10 days',
  900  -- 15 min
FROM public.chapters c
WHERE c.chapter_order IN (1, 3, 5)
ON CONFLICT (user_id, chapter_id, date) DO UPDATE SET seconds_spent = EXCLUDED.seconds_spent;

-- 45 days ago (will show in 90d, all - NOT in 7d or 30d)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CURRENT_DATE - INTERVAL '45 days',
  1200  -- 20 min
FROM public.chapters c
WHERE c.chapter_order IN (1, 2, 6)
ON CONFLICT (user_id, chapter_id, date) DO UPDATE SET seconds_spent = EXCLUDED.seconds_spent;

-- 120 days ago (will show ONLY in "all" - NOT in 7d, 30d, or 90d)
INSERT INTO public.reading_time_daily (user_id, chapter_id, date, seconds_spent)
SELECT
  '00000000-0000-0000-0000-000000000002',
  c.id,
  CURRENT_DATE - INTERVAL '120 days',
  1800  -- 30 min
FROM public.chapters c
WHERE c.chapter_order IN (1, 4, 7)
ON CONFLICT (user_id, chapter_id, date) DO UPDATE SET seconds_spent = EXCLUDED.seconds_spent;

-- Verify the data was inserted
SELECT 'Cumulative totals:' as info;
SELECT c.title, r.seconds_spent
FROM reading_time_per_chapter r
JOIN chapters c ON c.id = r.chapter_id
WHERE r.user_id = '00000000-0000-0000-0000-000000000002'
ORDER BY c.chapter_order
LIMIT 10;

SELECT 'Daily records:' as info;
SELECT c.title, d.date, d.seconds_spent
FROM reading_time_daily d
JOIN chapters c ON c.id = d.chapter_id
WHERE d.user_id = '00000000-0000-0000-0000-000000000002'
ORDER BY d.date DESC, c.chapter_order
LIMIT 20;
