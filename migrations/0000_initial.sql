-- Create Technologies Table
CREATE TABLE IF NOT EXISTS "technologies" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT
);

-- Create Experience Levels Table
CREATE TABLE IF NOT EXISTS "experience_levels" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT
);

-- Create Question Types Table
CREATE TABLE IF NOT EXISTS "question_types" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT
);

-- Create Questions Table
CREATE TABLE IF NOT EXISTS "questions" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "technology_id" INTEGER NOT NULL REFERENCES "technologies"("id"),
  "experience_level_id" INTEGER NOT NULL REFERENCES "experience_levels"("id"),
  "question_type_id" INTEGER NOT NULL REFERENCES "question_types"("id"),
  "evaluates_technical" BOOLEAN NOT NULL DEFAULT TRUE,
  "evaluates_problem_solving" BOOLEAN NOT NULL DEFAULT FALSE,
  "evaluates_communication" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_custom" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Candidates Table
CREATE TABLE IF NOT EXISTS "candidates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "notes" TEXT,
  "resume_url" TEXT,
  "resume_file" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "name" VARCHAR(255),
  "role" VARCHAR(50) NOT NULL DEFAULT 'technical_interviewer',
  "active" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Interviews Table
CREATE TABLE IF NOT EXISTS "interviews" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "candidate_id" INTEGER NOT NULL REFERENCES "candidates"("id"),
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "assignee_id" INTEGER REFERENCES "users"("id"),
  "status" VARCHAR(50) NOT NULL,
  "notes" TEXT,
  "overall_score" INTEGER,
  "technical_score" INTEGER,
  "problem_solving_score" INTEGER,
  "communication_score" INTEGER,
  "recommendation" VARCHAR(50),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Interview Questions Table
CREATE TABLE IF NOT EXISTS "interview_questions" (
  "id" SERIAL PRIMARY KEY,
  "interview_id" INTEGER NOT NULL REFERENCES "interviews"("id"),
  "question_id" INTEGER NOT NULL REFERENCES "questions"("id"),
  "score" INTEGER,
  "notes" TEXT,
  "skipped" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Job Positions Table
CREATE TABLE IF NOT EXISTS "job_positions" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "department" VARCHAR(255) NOT NULL,
  "level" VARCHAR(255) NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "requirements" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);