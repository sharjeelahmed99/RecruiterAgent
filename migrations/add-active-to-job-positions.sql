-- Add active column to job_positions table
ALTER TABLE job_positions ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Set all existing job positions to active by default
UPDATE job_positions SET active = true WHERE active IS NULL; 