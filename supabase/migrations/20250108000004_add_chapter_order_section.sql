-- Add order and section columns to chapters table
-- These are populated by the seed-chapters script at build time

ALTER TABLE chapters ADD COLUMN chapter_order INTEGER;
ALTER TABLE chapters ADD COLUMN section TEXT;
