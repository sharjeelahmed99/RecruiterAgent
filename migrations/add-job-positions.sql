
CREATE TABLE IF NOT EXISTS job_positions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
