-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the trading update function to run every 2 minutes
SELECT cron.schedule(
  'update-trading-state-job',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT
    net.http_post(
        url:='https://bqzyjigjcgmlttkgdwpm.supabase.co/functions/v1/update-trading-state',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;