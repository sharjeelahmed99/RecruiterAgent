-- Add active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT false;

-- Set all existing users to active by default
UPDATE users SET active = true WHERE active IS NULL;