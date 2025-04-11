-- Create enum for candidate status

-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- Create candidates table


-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES job_positions(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, job_id)
);

-- Create candidate_technologies table for many-to-many relationship
CREATE TABLE IF NOT EXISTS candidate_technologies (
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (candidate_id, technology_id)
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add last_interview_date column to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_interview_date TIMESTAMP WITH TIME ZONE; 