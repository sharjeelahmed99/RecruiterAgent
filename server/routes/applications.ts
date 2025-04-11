import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { checkRole } from "../auth";
import { USER_ROLES } from "@shared/schema";
import { emailService } from "../services/emailService";

const router = Router();

// Configure multer for resume uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

const applicationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  resume: z.string().optional(),
  coverLetter: z.string().optional(),
  jobId: z.number().int().positive("Invalid job ID"),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
});

// Get all applications
router.get("/applications", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    console.log("Fetching job applications...");
    const applications = await storage.getJobApplications(0); // 0 means get all applications
    console.log("Raw applications from storage:", applications);
    
    // Ensure applications is an array
    const applicationsArray = Array.isArray(applications) ? applications : [];
    console.log("Applications array:", applicationsArray);
    
    const applicationsWithDetails = await Promise.all(applicationsArray.map(async (application) => {
      console.log("Processing application:", application.id);
      const candidate = await storage.getCandidate(application.candidateId);
      console.log("Candidate for application:", candidate);
      const job = await storage.getJobPosition(application.jobId);
      console.log("Job for application:", job);
      const technologies: any[] = [
        "JavaScript",
        "TypeScript",
        "React",
        "Angular",
        "Vue",
        "Node.js",
        "Python",
        "Java",
        "C#",
        "PHP",
        "Ruby",
        "Go",
        "Rust",
        "SQL",
        "MongoDB",
        "AWS",
        "Azure",
        "Docker",
        "Kubernetes",
        "Git",
      ]; //await storage.getCandidateTechnologies(application.candidateId);
      console.log("Technologies for candidate:", technologies);
      
      const result = {
        ...application,
        candidate: {
          id: candidate?.id,
          fullName: candidate?.name || 'Unknown',
          email: candidate?.email || '',
          phone: candidate?.phone || '',
          technologies: technologies,
          appliedAt: application.createdAt?.toISOString() || '',
        },
        job: {
          id: job?.id,
          title: job?.title || 'Unknown Position',
          requirements: job?.requirements || [],
        },
      };
      console.log("Processed application result:", result);
      return result;
    }));
    
    console.log("Final applications with details:", applicationsWithDetails);
    // Ensure we're sending an array
    res.json(Array.isArray(applicationsWithDetails) ? applicationsWithDetails : []);
  } catch (error) {
    console.error("Error fetching applications:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

// Get a single application
router.get("/applications/:id", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const application = await storage.getJobApplication(parseInt(req.params.id));
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
});

// Update application status
router.put("/applications/:id/status", checkRole([USER_ROLES.HR, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    const applicationId = parseInt(req.params.id);
    
    console.log(`Updating application ${applicationId} status to ${validatedData.status}`);
    
    // Get the application first to get the candidate ID
    const application = await storage.getJobApplication(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    console.log(`Found application with candidate ID: ${application.candidateId}`);

    // Update the application status
    const updatedApplication = await storage.updateJobApplication(applicationId, {
      status: validatedData.status,
    });
    
    if (!updatedApplication) {
      console.error(`Failed to update application ${applicationId}`);
      return res.status(500).json({ message: "Failed to update application" });
    }
    
    console.log(`Updated application status to ${updatedApplication.status}`);

    // Get the current candidate to verify it exists
    const currentCandidate = await storage.getCandidate(application.candidateId);
    if (!currentCandidate) {
      console.error(`Candidate ${application.candidateId} not found`);
      return res.status(500).json({ message: "Candidate not found" });
    }
    
    console.log(`Current candidate status: ${currentCandidate.status}`);

    // If the application is accepted, send an acceptance email
    if (validatedData.status === "accepted") {
      // Get job details for the email
      const job = await storage.getJobPosition(application.jobId);
      
      // Send acceptance notification email asynchronously
      emailService.sendApplicationAcceptanceNotification(
        currentCandidate.email,
        currentCandidate.name,
        job?.title || "Position",
        "RecruitAI"
      ).catch(error => {
        console.error('Error sending acceptance email:', error);
      });
    }
    
    // If the application is rejected, send a rejection email
    if (validatedData.status === "rejected") {
      // Get job details for the email
      const job = await storage.getJobPosition(application.jobId);
      
      // Send rejection notification email asynchronously
      emailService.sendApplicationRejectionNotification(
        currentCandidate.email,
        currentCandidate.name,
        job?.title || "Position",
        "RecruitAI"
      ).catch(error => {
        console.error('Error sending rejection email:', error);
      });
    }

    // Update candidate status based on application status
    if (validatedData.status === 'accepted') {
      console.log(`Updating candidate ${application.candidateId} status to in_progress`);
      const updatedCandidate = await storage.updateCandidate(application.candidateId, {
        status: 'in_progress'
      });
      console.log(`Updated candidate status to: ${updatedCandidate?.status}`);
    } else if (validatedData.status === 'rejected') {
      console.log(`Updating candidate ${application.candidateId} status to new`);
      const updatedCandidate = await storage.updateCandidate(application.candidateId, {
        status: 'new'
      });
      console.log(`Updated candidate status to: ${updatedCandidate?.status}`);
    }

    res.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid status", errors: error.errors });
    }
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Failed to update application status" });
  }
});

// Submit a job application
router.post("/applications", async (req, res) => {
  try {
    const validatedData = applicationSchema.parse(req.body);
    
    // Create candidate
    const candidate = await storage.createCandidate({
      name: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      status: "new",
    });

    // Create job application
    const application = await storage.createJobApplication({
      candidateId: candidate.id,
      jobId: validatedData.jobId,
      status: "pending",
      coverLetter: validatedData.coverLetter,
    });

    // Get job details for the email
    const job = await storage.getJobPosition(validatedData.jobId);
    
    // Send confirmation email asynchronously
    emailService.sendJobApplicationConfirmation(
      validatedData.email,
      validatedData.fullName,
      job?.title || "Position",
      "RecruitAI"
    ).catch(error => {
      console.error('Error sending application confirmation email:', error);
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error("Error creating job application:", error);
      res.status(500).json({ error: "Failed to create job application" });
    }
  }
});

export default router; 