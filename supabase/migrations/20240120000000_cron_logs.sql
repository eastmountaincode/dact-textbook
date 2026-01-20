-- Create cron_logs table to track cron job executions
CREATE TABLE IF NOT EXISTS cron_logs (
  id SERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_cron_logs_job_name ON cron_logs(job_name);
CREATE INDEX idx_cron_logs_created_at ON cron_logs(created_at DESC);

-- Enable RLS
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for cron jobs)
CREATE POLICY "Service role can manage cron_logs" ON cron_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
