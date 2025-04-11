-- Add hrNotes column to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS  hr_notes TEXT;

-- Update existing rows to have null hr_notes
UPDATE interviews SET hr_notes = NULL WHERE hr_notes IS NULL; 