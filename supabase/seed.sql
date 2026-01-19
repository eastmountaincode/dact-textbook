-- Seed file for local development
-- Run with: supabase db reset (this runs migrations then seed.sql)

-- ============================================
-- NOTE: User Management with Clerk
-- ============================================
-- Users are managed by Clerk, not Supabase auth.
--
-- To create test users with profiles:
--   node scripts/seed-test-users.mjs
--
-- This creates users in Clerk AND their profiles in Supabase.
-- All test users have password: TestPassword123!
--
-- To make a user an admin, see: promote-admin.sql
-- ============================================

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
