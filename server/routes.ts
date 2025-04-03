import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  questionFilterSchema,
  insertQuestionSchema,
  insertCandidateSchema,
  insertInterviewSchema,
  insertInterviewQuestionSchema,
  generateInterviewSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.json(questions);
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

  // POST /api/candidates - Create a new candidate
  app.post("/api/candidates", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const newCandidate = await storage.createCandidate(candidateData);
      res.status(201).json(newCandidate);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // PUT /api/candidates/:id - Update a candidate
  app.put("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const candidateData = insertCandidateSchema.parse(req.body);
      const updatedCandidate = await storage.updateCandidate(id, candidateData);
      
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

  // GET /api/interviews - Get all interviews
  app.get("/api/interviews", async (_req, res) => {
    try {
      const interviews = await storage.getInterviews();
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
      const interviewData = insertInterviewSchema.parse(req.body);
      const newInterview = await storage.createInterview(interviewData);
      res.status(201).json(newInterview);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // POST /api/interviews/generate - Generate a new interview with questions
  app.post("/api/interviews/generate", async (req, res) => {
    try {
      const generateData = generateInterviewSchema.parse(req.body);
      
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

      const interviewData = insertInterviewSchema.parse(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
