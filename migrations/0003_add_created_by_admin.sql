-- Add created_by_admin field to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS created_by_admin boolean DEFAULT false; 
