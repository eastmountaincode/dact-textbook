-- Daily reading time tracking for date-range queries
-- Stores reading time per user/chapter/day instead of cumulative totals
CREATE TABLE reading_time_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  seconds_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, date)
);

-- Index for efficient date-range queries
CREATE INDEX idx_reading_time_daily_date ON reading_time_daily(date);
CREATE INDEX idx_reading_time_daily_user_date ON reading_time_daily(user_id, date);

-- Enable Row Level Security
ALTER TABLE reading_time_daily ENABLE ROW LEVEL SECURITY;

-- Users can view their own daily reading time
CREATE POLICY "Users can view their own daily reading time"
  ON reading_time_daily FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own daily reading time
CREATE POLICY "Users can insert their own daily reading time"
  ON reading_time_daily FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily reading time
CREATE POLICY "Users can update their own daily reading time"
  ON reading_time_daily FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all daily reading time
CREATE POLICY "Admins can view all daily reading time"
  ON reading_time_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_reading_time_daily_updated_at
  BEFORE UPDATE ON reading_time_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
