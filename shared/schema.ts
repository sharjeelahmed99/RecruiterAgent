import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TECHNOLOGIES TABLE
export const technologies = pgTable("technologies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export type Technology = typeof technologies.$inferSelect;
export type InsertTechnology = typeof technologies.$inferInsert;

// EXPERIENCE LEVELS TABLE
export const experienceLevels = pgTable("experience_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),  // beginner, intermediate, advanced
  description: text("description"),
});

export type ExperienceLevel = typeof experienceLevels.$inferSelect;
export type InsertExperienceLevel = typeof experienceLevels.$inferInsert;

// QUESTION TYPES TABLE
export const questionTypes = pgTable("question_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),  // algorithms, database, framework, etc.
  description: text("description"),
});

export type QuestionType = typeof questionTypes.$inferSelect;
export type InsertQuestionType = typeof questionTypes.$inferInsert;

// QUESTIONS TABLE
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  answer: text("answer").notNull(),
  technologyId: integer("technology_id").notNull(),
  experienceLevelId: integer("experience_level_id").notNull(),
  questionTypeId: integer("question_type_id").notNull(),
  
  // Scoring flags for different skills
  evaluatesTechnical: boolean("evaluates_technical").default(true),
  evaluatesProblemSolving: boolean("evaluates_problem_solving").default(false),
  evaluatesCommunication: boolean("evaluates_communication").default(false),
  
  // Flag for custom user-defined questions
  isCustom: boolean("is_custom").default(false),
});

export const insertQuestionSchema = createInsertSchema(questions);
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// CANDIDATES TABLE
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  status: text("status", { enum: ["new", "in_progress", "hired", "rejected"] }).notNull(),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastInterviewDate: timestamp("last_interview_date"),
});

export const insertCandidateSchema = createInsertSchema(candidates);
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

// INTERVIEWS TABLE
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  overallScore: integer("overall_score"),
  technicalScore: integer("technical_score"),
  problemSolvingScore: integer("problem_solving_score"),
  communicationScore: integer("communication_score"),
  recommendation: text("recommendation"),
  assigneeId: integer("assignee_id").references(() => users.id),
  position: text("position"),
  technologies: text("technologies").array(),
  createdAt: timestamp("created_at").defaultNow(),
  createdByAdmin: boolean("created_by_admin").notNull().default(false),
  hrNotes: text("hr_notes")
});

export const insertInterviewSchema = createInsertSchema(interviews);
export type Interview = typeof interviews.$inferSelect & {
  candidate?: Candidate | null;
  assignee?: User | null;
  questions?: InterviewQuestion[];
  hrNotes?: string | null;
};

export type InsertInterview = typeof interviews.$inferInsert;

// INTERVIEW QUESTIONS TABLE
export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull(),
  questionId: integer("question_id").notNull(),
  score: integer("score"),
  notes: text("notes"),
  skipped: boolean("skipped").default(false),
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions);
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;

// Full interview data with related entities
export type InterviewWithDetails = Interview & {
  candidate: Candidate;
  assignee?: User;  // The user assigned to conduct the interview
  questions: (InterviewQuestion & {
    question: Question & {
      technology: Technology;
      experienceLevel: ExperienceLevel;
      questionType: QuestionType;
    };
  })[];
};

// Define a schema for the question filter
export const questionFilterSchema = z.object({
  experienceLevelId: z.number().optional(),
  technologyId: z.number().optional(),
  questionTypeId: z.number().optional(),
  count: z.number().default(3),
});

export type QuestionFilter = z.infer<typeof questionFilterSchema>;

// Schema for generating a new interview
export const generateInterviewSchema = z.object({
  title: z.string(),
  candidateId: z.number(),
  date: z.date(),
  assigneeId: z.number().optional(),
  questionFilters: questionFilterSchema,
});

export type GenerateInterview = z.infer<typeof generateInterviewSchema>;

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  HR: "hr",
  TECHNICAL_INTERVIEWER: "technical_interviewer",
  DIRECTOR: "director"
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  role: text("role").notNull().default(USER_ROLES.TECHNICAL_INTERVIEWER),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  active: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// JOB POSITIONS TABLE
export const jobPositions = pgTable("job_positions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  level: text("level").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: json("requirements").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").notNull().default(true),
});

export const insertJobPositionSchema = createInsertSchema(jobPositions);
export type JobPosition = typeof jobPositions.$inferSelect;
export type InsertJobPosition = z.infer<typeof insertJobPositionSchema>;

export const candidateTechnologies = pgTable('candidate_technologies', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').notNull().references(() => candidates.id),
  technologyId: integer('technology_id').notNull().references(() => technologies.id)
});

// Create enum for application status
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'reviewed', 'accepted', 'rejected']);

// Job Applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  jobId: integer("job_id").notNull().references(() => jobPositions.id),
  status: applicationStatusEnum("status").notNull().default('pending'),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications);
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
