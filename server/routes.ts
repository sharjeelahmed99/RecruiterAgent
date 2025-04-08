import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  questionFilterSchema,
  insertQuestionSchema,
  insertCandidateSchema,
  insertInterviewSchema,
  insertInterviewQuestionSchema,
  generateInterviewSchema,
  USER_ROLES
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, checkRole } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only PDFs, Word docs, and common image formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { checkRole } = setupAuth(app);
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // GET /api/technologies - Get all technologies
  app.get("/api/technologies", async (_req, res) => {
    try {
      const technologies = await storage.getTechnologies();
      res.json(technologies);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch technologies" });
    }
  });

  // GET /api/experience-levels - Get all experience levels
  app.get("/api/experience-levels", async (_req, res) => {
    try {
      const experienceLevels = await storage.getExperienceLevels();
      res.json(experienceLevels);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch experience levels" });
    }
  });

  // GET /api/question-types - Get all question types
  app.get("/api/question-types", async (_req, res) => {
    try {
      const questionTypes = await storage.getQuestionTypes();
      res.json(questionTypes);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch question types" });
    }
  });

  // GET /api/questions - Get all questions
  app.get("/api/questions", async (_req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // GET /api/questions/:id - Get question by ID
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // POST /api/questions - Create a new question
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const newQuestion = await storage.createQuestion(questionData);
      res.status(201).json(newQuestion);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT /api/questions/:id - Update a question
  app.put("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const questionData = insertQuestionSchema.parse(req.body);
      const updatedQuestion = await storage.updateQuestion(id, questionData);

      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(updatedQuestion);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // DELETE /api/questions/:id - Delete a question
  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteQuestion(id);
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // POST /api/questions/generate - Generate random questions based on filters
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const filter = questionFilterSchema.parse(req.body);
      const questions = await storage.getRandomQuestions(filter);

      // Additional check to ensure uniqueness by ID
      const uniqueQuestionIds = new Set();
      const uniqueQuestions = [];

      for (const question of questions) {
        if (!uniqueQuestionIds.has(question.id)) {
          uniqueQuestionIds.add(question.id);
          uniqueQuestions.push(question);
        }
      }

      res.json(uniqueQuestions);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // GET /api/candidates - Get all candidates
  app.get("/api/candidates", async (_req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // GET /api/candidates/:id - Get candidate by ID
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.json(candidate);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  // File upload route for candidate resumes
  app.post("/api/upload/resume", upload.single('resume'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path.replace(process.cwd(), ''); // Get relative path
      res.json({ 
        message: "File uploaded successfully",
        resumeFile: filePath,
        originalName: req.file.originalname
      });
    } catch (err) {
      console.error("File upload error:", err);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // POST /api/candidates - Create a new candidate (HR only)
  app.post("/api/candidates", checkRole([USER_ROLES.HR]), upload.single('resume'), async (req, res) => {
    try {
      // Handle file upload data if present
      const candidateData = {
        ...req.body,
        resumeFile: req.file?.path?.replace(process.cwd(), '') || null
      };
      const validatedData = insertCandidateSchema.parse(candidateData);
      const newCandidate = await storage.createCandidate(validatedData);
      res.status(201).json(newCandidate);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT /api/candidates/:id - Update a candidate
  app.put("/api/candidates/:id", upload.single('resume'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Handle file upload data if present
      const candidateData = {
        ...req.body,
        resumeFile: req.file?.path?.replace(process.cwd(), '') || null
      };
      const validatedData = insertCandidateSchema.parse(candidateData);
      const updatedCandidate = await storage.updateCandidate(id, validatedData);

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.json(updatedCandidate);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // DELETE /api/candidates/:id - Delete a candidate
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteCandidate(id);
      if (!success) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // GET /api/users - Get all technical interviewers (for assignee dropdown)
  app.get("/api/users/technical-interviewers", checkRole([USER_ROLES.HR, USER_ROLES.DIRECTOR]), async (_req, res) => {
    try {
      // Get all users with role TECHNICAL_INTERVIEWER
      const users = await storage.getUsersByRole(USER_ROLES.TECHNICAL_INTERVIEWER);
      // Return users without password
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch technical interviewers" });
    }
  });

  // GET /api/interviews - Get all interviews (filtered by role)
  app.get("/api/interviews", async (req, res) => {
    try {
      let interviews;

      // If user is HR or Director, return all interviews
      if (req.user?.role === USER_ROLES.HR || req.user?.role === USER_ROLES.DIRECTOR) {
        interviews = await storage.getInterviews();
      } 
      // If user is Technical Interviewer, return only assigned interviews
      else if (req.user?.role === USER_ROLES.TECHNICAL_INTERVIEWER) {
        interviews = await storage.getInterviewsByAssignee(req.user.id);
      }
      // Default - empty array if not authenticated
      else {
        interviews = [];
      }

      res.json(interviews);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  // GET /api/interviews/:id - Get interview by ID
  app.get("/api/interviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const interview = await storage.getInterview(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.json(interview);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch interview" });
    }
  });

  // GET /api/interviews/:id/details - Get interview with detailed information
  app.get("/api/interviews/:id/details", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const interviewDetails = await storage.getInterviewWithDetails(id);
      if (!interviewDetails) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.json(interviewDetails);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch interview details" });
    }
  });

  // POST /api/interviews - Create a new interview
  app.post("/api/interviews", async (req, res) => {
    try {
      // Handle date conversion explicitly before validation
      let requestData = { ...req.body };
      if (requestData.date && !(requestData.date instanceof Date)) {
        try {
          // If client sends a Date object that's been stringified during JSON serialization
          requestData.date = new Date(requestData.date);
        } catch (dateErr) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }

      const interviewData = insertInterviewSchema.parse(requestData);
      const newInterview = await storage.createInterview(interviewData);
      res.status(201).json(newInterview);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // POST /api/interviews/generate - Generate a new interview with questions
  app.post("/api/interviews/generate", async (req, res) => {
    try {
      // Parse date before validation
      let requestData = { ...req.body };
      if (requestData.date && typeof requestData.date === 'string') {
        requestData.date = new Date(requestData.date);
      }

      const generateData = generateInterviewSchema.parse(requestData);

      // 1. Create the interview
      const interviewData = {
        title: generateData.title,
        candidateId: generateData.candidateId,
        date: generateData.date,
        status: "in_progress",
        notes: ""
      };

      const newInterview = await storage.createInterview(interviewData);

      // 2. Generate questions
      const questions = await storage.getRandomQuestions(generateData.questionFilters);

      // 3. Add questions to interview
      await Promise.all(questions.map(async (question) => {
        const interviewQuestion = {
          interviewId: newInterview.id,
          questionId: question.id,
          score: null,
          notes: ""
        };

        await storage.createInterviewQuestion(interviewQuestion);
      }));

      // 4. Return the interview with details
      const interviewWithDetails = await storage.getInterviewWithDetails(newInterview.id);
      res.status(201).json(interviewWithDetails);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT /api/interviews/:id - Update an interview
  app.put("/api/interviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Use partial schema for updates instead of requiring all fields
      const interviewData = insertInterviewSchema.partial().parse(req.body);

      // Handle date conversion explicitly if present
      if (interviewData.date && !(interviewData.date instanceof Date)) {
        try {
          interviewData.date = new Date(interviewData.date);
        } catch (dateErr) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }

      const updatedInterview = await storage.updateInterview(id, interviewData);

      if (!updatedInterview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.json(updatedInterview);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // DELETE /api/interviews/:id - Delete an interview
  app.delete("/api/interviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteInterview(id);
      if (!success) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete interview" });
    }
  });

  // GET /api/interviews/:id/questions - Get questions for an interview
  app.get("/api/interviews/:id/questions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const interviewQuestions = await storage.getInterviewQuestions(id);
      res.json(interviewQuestions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch interview questions" });
    }
  });

  // POST /api/interview-questions - Create a new interview question
  app.post("/api/interview-questions", async (req, res) => {
    try {
      const interviewQuestionData = insertInterviewQuestionSchema.parse(req.body);
      const newInterviewQuestion = await storage.createInterviewQuestion(interviewQuestionData);
      res.status(201).json(newInterviewQuestion);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT /api/interview-questions/:id - Update an interview question (for scoring)
  app.put("/api/interview-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const interviewQuestionData = insertInterviewQuestionSchema.partial().parse(req.body);
      const updatedInterviewQuestion = await storage.updateInterviewQuestion(id, interviewQuestionData);

      if (!updatedInterviewQuestion) {
        return res.status(404).json({ message: "Interview question not found" });
      }

      res.json(updatedInterviewQuestion);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // POST /api/interviews/:id/summary - Generate a summary for an interview
  app.post("/api/interviews/:id/summary", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const interviewSummary = await storage.generateInterviewSummary(id);
      if (!interviewSummary) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.json(interviewSummary);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate interview summary" });
    }
  });

  // Admin routes for user management

  // GET /api/admin/users - Get all users (Admin only)
  app.get("/api/admin/users", checkRole([USER_ROLES.ADMIN]), async (_req, res) => {
    try {
      const users = await storage.getUsers();
      // Return users without password
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // PATCH /api/admin/users/:id - Update user role and active status (Admin only)
  app.patch("/api/admin/users/:id", checkRole([USER_ROLES.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const { role, active } = req.body;

      // Validate role and active values
      if (role && !Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({ message: "Invalid role value" });
      }

      if (active !== undefined && typeof active !== 'boolean') {
        return res.status(400).json({ message: "Active must be a boolean value" });
      }

      const updatedUser = await storage.updateUser(id, { role, active });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // DELETE /api/admin/users/:id - Delete a user (Admin only)
  app.delete("/api/admin/users/:id", checkRole([USER_ROLES.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Prevent deleting the last admin account
      const adminUsers = await storage.getUsersByRole(USER_ROLES.ADMIN);
      const isLastAdmin = adminUsers.length === 1 && adminUsers[0].id === id;

      if (isLastAdmin) {
        return res.status(403).json({ 
          message: "Cannot delete the last admin account. Create another admin account first." 
        });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Job Positions routes
  app.get("/api/job-positions", async (req, res) => {
    try {
      const jobPositions = await storage.getJobPositions();
      if (!jobPositions) {
        return res.json([]);
      }
      res.json(jobPositions);
    } catch (error) {
      console.error("Error fetching job positions:", error);
      res.status(500).json({ message: "Failed to fetch job positions" });
    }
  });

  app.post("/api/job-positions", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
    try {
      const positionData = insertJobPositionSchema.parse(req.body);
      const newPosition = await storage.createJobPosition(positionData);
      res.status(201).json(newPosition);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/job-positions/:id", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteJobPosition(id);
      if (!success) {
        return res.status(404).json({ message: "Job position not found" });
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete job position" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}