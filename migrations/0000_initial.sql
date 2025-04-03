-- Create Technologies Table
CREATE TABLE IF NOT EXISTS "technologies" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT
);

-- Create Experience Levels Table
CREATE TABLE IF NOT EXISTS "experience_levels" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT
);

-- Create Question Types Table
CREATE TABLE IF NOT EXISTS "question_types" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
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
  "question_type_id" INTEGER NOT NULL REFERENCES "question_types"("id")
);

-- Create Candidates Table
CREATE TABLE IF NOT EXISTS "candidates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "resume_url" TEXT,
  "notes" TEXT
);

-- Create Interviews Table
CREATE TABLE IF NOT EXISTS "interviews" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "candidate_id" INTEGER NOT NULL REFERENCES "candidates"("id"),
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" VARCHAR(50) NOT NULL,
  "notes" TEXT,
  "technical_score" DECIMAL(3,1),
  "problem_solving_score" DECIMAL(3,1),
  "communication_score" DECIMAL(3,1),
  "overall_score" DECIMAL(3,1),
  "recommendation" VARCHAR(50)
);

-- Create Interview Questions Table
CREATE TABLE IF NOT EXISTS "interview_questions" (
  "id" SERIAL PRIMARY KEY,
  "interview_id" INTEGER NOT NULL REFERENCES "interviews"("id"),
  "question_id" INTEGER NOT NULL REFERENCES "questions"("id"),
  "score" INTEGER,
  "notes" TEXT
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'user'
);