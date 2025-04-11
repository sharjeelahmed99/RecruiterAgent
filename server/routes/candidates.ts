import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { checkRole } from "../auth";
import { USER_ROLES } from "@shared/schema";

const router = Router();

// Validation schemas
const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  status: z.enum(["new", "in_progress", "hired", "rejected"]).optional(),
});

const updateCandidateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "in_progress", "hired", "rejected"]).optional(),
  technologies: z.array(z.string()).optional(),
});

// Get all candidates
router.get("/api/candidates", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const candidates = await storage.getCandidates();
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// Get a single candidate
router.get("/api/candidates/:id", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const candidate = await storage.getCandidate(parseInt(req.params.id));
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Failed to fetch candidate" });
  }
});

// Get candidate's interviews
router.get("/api/candidates/:id/interviews", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const interviews = await storage.getCandidateInterviews(parseInt(req.params.id));
    res.json(interviews);
  } catch (error) {
    console.error("Error fetching candidate interviews:", error);
    res.status(500).json({ message: "Failed to fetch candidate interviews" });
  }
});

// Create a new candidate
router.post("/api/candidates", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const data = createCandidateSchema.parse(req.body);
    data.status = "in_progress";
    const candidate = await storage.createCandidate(data);
    res.status(201).json(candidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Error creating candidate:", error);
    res.status(500).json({ message: "Failed to create candidate" });
  }
});

// Update a candidate
router.put("/api/candidates/:id", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateCandidateSchema.parse(req.body);
    
    const updatedCandidate = await storage.updateCandidate(parseInt(id), updateData);
    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(updatedCandidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Failed to update candidate" });
  }
});

// Delete a candidate
router.delete("/api/candidates/:id", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    await storage.deleteCandidate(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Failed to delete candidate" });
  }
});

export default router; 