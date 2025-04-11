-- Create enum for candidate status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE candidate_status AS ENUM ('new', 'in_progress', 'hired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to candidates table if it doesn't exist
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status candidate_status DEFAULT 'new';

-- Add resume_file column to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_file TEXT;

-- Update existing records to have a default status if null
UPDATE candidates SET status = 'new' WHERE status IS NULL;

-- Add last_interview_date column if it doesn't exist
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_interview_date TIMESTAMP WITH TIME ZONE; 
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE; 