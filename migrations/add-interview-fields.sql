-- Add position and technologies fields to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS technologies text[];

-- Remove position and technologies from candidates table
ALTER TABLE candidates DROP COLUMN IF EXISTS position;
ALTER TABLE candidates DROP COLUMN IF EXISTS technologies; 