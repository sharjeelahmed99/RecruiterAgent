import { eq, and, sql, desc, like, or } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import {
  User,
  Technology,
  ExperienceLevel,
  QuestionType,
  Question,
  Candidate,
  Interview,
  InterviewQuestion,
  InterviewWithDetails,
  InsertUser,
  InsertQuestion,
  InsertCandidate,
  InsertInterview,
  InsertInterviewQuestion,
  QuestionFilter
} from "@shared/schema";

// Define additional insert types that aren't in the shared schema
type InsertTechnology = {
  name: string;
  description: string;
};

type InsertExperienceLevel = {
  name: string;
  description: string;
};

type InsertQuestionType = {
  name: string;
  description: string;
};

import * as schema from "../shared/schema";

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Technology methods
  async getTechnologies(): Promise<Technology[]> {
    return await db.select().from(schema.technologies);
  }

  async getTechnology(id: number): Promise<Technology | undefined> {
    const technologies = await db.select().from(schema.technologies).where(eq(schema.technologies.id, id));
    return technologies[0];
  }

  // Experience level methods
  async getExperienceLevels(): Promise<ExperienceLevel[]> {
    return await db.select().from(schema.experienceLevels);
  }

  async getExperienceLevel(id: number): Promise<ExperienceLevel | undefined> {
    const levels = await db.select().from(schema.experienceLevels).where(eq(schema.experienceLevels.id, id));
    return levels[0];
  }

  // Question type methods
  async getQuestionTypes(): Promise<QuestionType[]> {
    return await db.select().from(schema.questionTypes);
  }

  async getQuestionType(id: number): Promise<QuestionType | undefined> {
    const types = await db.select().from(schema.questionTypes).where(eq(schema.questionTypes.id, id));
    return types[0];
  }

  // Question methods
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(schema.questions);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const questions = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
    return questions[0];
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(schema.questions).values(question).returning();
    return result[0];
  }

  async updateQuestion(id: number, question: Partial<Question>): Promise<Question | undefined> {
    const result = await db.update(schema.questions)
      .set(question)
      .where(eq(schema.questions.id, id))
      .returning();
    return result[0];
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await db.delete(schema.questions).where(eq(schema.questions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getFilteredQuestions(filter: QuestionFilter): Promise<Question[]> {
    let queryBuilder = db.select().from(schema.questions);
    
    // Add filter conditions
    const conditions = [];
    
    if (filter.technologyId) {
      conditions.push(eq(schema.questions.technologyId, filter.technologyId));
    }
    
    if (filter.experienceLevelId) {
      conditions.push(eq(schema.questions.experienceLevelId, filter.experienceLevelId));
    }
    
    if (filter.questionTypeId) {
      conditions.push(eq(schema.questions.questionTypeId, filter.questionTypeId));
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    return await queryBuilder;
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(schema.candidates);
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const candidates = await db.select().from(schema.candidates).where(eq(schema.candidates.id, id));
    return candidates[0];
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const result = await db.insert(schema.candidates).values(candidate).returning();
    return result[0];
  }

  async updateCandidate(id: number, candidate: Partial<Candidate>): Promise<Candidate | undefined> {
    const result = await db.update(schema.candidates)
      .set(candidate)
      .where(eq(schema.candidates.id, id))
      .returning();
    return result[0];
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.delete(schema.candidates).where(eq(schema.candidates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Interview methods
  async getInterviews(): Promise<Interview[]> {
    return await db.select().from(schema.interviews);
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const interviews = await db.select().from(schema.interviews).where(eq(schema.interviews.id, id));
    return interviews[0];
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const result = await db.insert(schema.interviews).values(interview).returning();
    return result[0];
  }

  async updateInterview(id: number, interview: Partial<Interview>): Promise<Interview | undefined> {
    const result = await db.update(schema.interviews)
      .set(interview)
      .where(eq(schema.interviews.id, id))
      .returning();
    return result[0];
  }

  async deleteInterview(id: number): Promise<boolean> {
    const result = await db.delete(schema.interviews).where(eq(schema.interviews.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getInterviewWithDetails(id: number): Promise<InterviewWithDetails | undefined> {
    // Get the interview
    const interview = await this.getInterview(id);
    if (!interview) {
      return undefined;
    }

    // Get the candidate
    const candidate = await this.getCandidate(interview.candidateId);
    if (!candidate) {
      return undefined;
    }

    // Get interview questions
    const interviewQuestions = await this.getInterviewQuestions(id);
    
    // Get full details for each question
    const questionDetails = await Promise.all(
      interviewQuestions.map(async (iq) => {
        const question = await this.getQuestion(iq.questionId);
        if (!question) {
          return null;
        }

        const technology = await this.getTechnology(question.technologyId);
        const experienceLevel = await this.getExperienceLevel(question.experienceLevelId);
        const questionType = await this.getQuestionType(question.questionTypeId);

        if (!technology || !experienceLevel || !questionType) {
          return null;
        }

        return {
          ...iq,
          question: {
            ...question,
            technology,
            experienceLevel,
            questionType
          }
        };
      })
    );

    // Filter out any null values from questionDetails
    const validQuestionDetails = questionDetails.filter(q => q !== null) as (InterviewQuestion & {
      question: Question & {
        technology: Technology;
        experienceLevel: ExperienceLevel;
        questionType: QuestionType;
      };
    })[];

    // Combine everything into InterviewWithDetails
    return {
      ...interview,
      candidate,
      questions: validQuestionDetails
    };
  }

  // Interview Question methods
  async getInterviewQuestions(interviewId: number): Promise<InterviewQuestion[]> {
    return await db.select()
      .from(schema.interviewQuestions)
      .where(eq(schema.interviewQuestions.interviewId, interviewId));
  }

  async getInterviewQuestion(id: number): Promise<InterviewQuestion | undefined> {
    const questions = await db.select()
      .from(schema.interviewQuestions)
      .where(eq(schema.interviewQuestions.id, id));
    return questions[0];
  }

  async createInterviewQuestion(interviewQuestion: InsertInterviewQuestion): Promise<InterviewQuestion> {
    const result = await db.insert(schema.interviewQuestions)
      .values(interviewQuestion)
      .returning();
    return result[0];
  }

  async updateInterviewQuestion(id: number, interviewQuestion: Partial<InterviewQuestion>): Promise<InterviewQuestion | undefined> {
    const result = await db.update(schema.interviewQuestions)
      .set(interviewQuestion)
      .where(eq(schema.interviewQuestions.id, id))
      .returning();
    return result[0];
  }

  async deleteInterviewQuestion(id: number): Promise<boolean> {
    const result = await db.delete(schema.interviewQuestions)
      .where(eq(schema.interviewQuestions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Specialized methods
  async getRandomQuestions(filter: QuestionFilter): Promise<Question[]> {
    const filteredQuestions = await this.getFilteredQuestions(filter);
    
    // Ensure we have unique questions by ID
    const uniqueQuestions = Array.from(
      new Map(filteredQuestions.map(q => [q.id, q])).values()
    );
    
    // Shuffle and limit to the requested count
    const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, filter.count || 5);
  }

  async generateInterviewSummary(interviewId: number): Promise<Interview | undefined> {
    try {
      // Get the interview
      const interview = await this.getInterview(interviewId);
      if (!interview) {
        console.error(`Interview with ID ${interviewId} not found`);
        return undefined;
      }
      
      // Get interview questions with scores
      const interviewQuestions = await this.getInterviewQuestions(interviewId);
      
      if (interviewQuestions.length === 0) {
        console.error(`No questions found for interview with ID ${interviewId}`);
        return interview; // Return original interview without changes
      }
      
      // Calculate average scores
      const scoredQuestions = interviewQuestions.filter(q => q.score !== null);
      const totalQuestions = scoredQuestions.length;
      
      if (totalQuestions === 0) {
        console.error(`No scored questions found for interview with ID ${interviewId}`);
        return interview; // Return original interview without changes
      }
      
      const technicalScoreSum = scoredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
      const technicalScore = parseFloat((technicalScoreSum / totalQuestions).toFixed(1));
      
      // Use technical score for other metrics as a placeholder
      // In a real app, these would be calculated separately
      const problemSolvingScore = technicalScore;
      const communicationScore = technicalScore;
      
      // Overall score is the average of the three scores
      const overallScore = parseFloat(((technicalScore + problemSolvingScore + communicationScore) / 3).toFixed(1));
      
      // Generate a recommendation based on the overall score
      let recommendation: string;
      if (overallScore >= 4.5) {
        recommendation = "strong_hire";
      } else if (overallScore >= 3.5) {
        recommendation = "hire";
      } else if (overallScore >= 2.5) {
        recommendation = "consider";
      } else {
        recommendation = "pass";
      }
      
      // Update the interview with the calculated scores and recommendation
      const updatedInterview = await this.updateInterview(interviewId, {
        technicalScore,
        problemSolvingScore,
        communicationScore,
        overallScore,
        recommendation,
        status: "completed"
      });
      
      return updatedInterview;
    } catch (error) {
      console.error('Error generating interview summary:', error);
      return undefined;
    }
  }

  // Initialize the database with sample data
  async initializeData(): Promise<void> {
    try {
      // Check if data already exists
      const existingTechnologies = await this.getTechnologies();
      if (existingTechnologies.length > 0) {
        console.log("Database already initialized with sample data");
        return;
      }

      // Add experience levels
      const beginner: InsertExperienceLevel = {
        name: "beginner",
        description: "Entry-level knowledge, 0-2 years of experience"
      };
      await db.insert(schema.experienceLevels).values(beginner);

      const intermediate: InsertExperienceLevel = {
        name: "intermediate",
        description: "Working knowledge, 2-5 years of experience"
      };
      await db.insert(schema.experienceLevels).values(intermediate);

      const advanced: InsertExperienceLevel = {
        name: "advanced",
        description: "Expert knowledge, 5+ years of experience"
      };
      await db.insert(schema.experienceLevels).values(advanced);

      // Add technologies
      const react: InsertTechnology = {
        name: "React",
        description: "A JavaScript library for building user interfaces"
      };
      await db.insert(schema.technologies).values(react);

      const angular: InsertTechnology = {
        name: "Angular",
        description: "A platform for building mobile and desktop web applications"
      };
      await db.insert(schema.technologies).values(angular);

      const vue: InsertTechnology = {
        name: "Vue",
        description: "A progressive framework for building user interfaces"
      };
      await db.insert(schema.technologies).values(vue);

      const node: InsertTechnology = {
        name: "Node.js",
        description: "A JavaScript runtime built on Chrome's V8 JavaScript engine"
      };
      await db.insert(schema.technologies).values(node);

      const python: InsertTechnology = {
        name: "Python",
        description: "A programming language that lets you work quickly and integrate systems effectively"
      };
      await db.insert(schema.technologies).values(python);

      const dotnet: InsertTechnology = {
        name: ".NET",
        description: "A free, cross-platform, open source developer platform for building many different types of applications"
      };
      await db.insert(schema.technologies).values(dotnet);

      // Add question types
      const algorithms: InsertQuestionType = {
        name: "algorithms",
        description: "Algorithm design and analysis"
      };
      await db.insert(schema.questionTypes).values(algorithms);

      const database: InsertQuestionType = {
        name: "database",
        description: "Database design and query optimization"
      };
      await db.insert(schema.questionTypes).values(database);

      const framework: InsertQuestionType = {
        name: "framework",
        description: "Framework-specific knowledge and concepts"
      };
      await db.insert(schema.questionTypes).values(framework);

      const architecture: InsertQuestionType = {
        name: "architecture",
        description: "Software architecture and design patterns"
      };
      await db.insert(schema.questionTypes).values(architecture);

      // Add sample questions
      const sampleQuestions = [
        {
          title: "Explain React's Virtual DOM",
          content: "What is the Virtual DOM in React and how does it improve performance?",
          answer: "The Virtual DOM is a lightweight copy of the actual DOM in memory. React uses it to optimize rendering by comparing the virtual DOM with the actual DOM and updating only the parts that have changed, rather than re-rendering the entire DOM. This process is called reconciliation and it significantly improves performance by reducing expensive DOM operations.",
          technologyId: 1, // React
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3 // Framework
        },
        {
          title: "Compare Angular and React",
          content: "What are the main differences between Angular and React? When would you choose one over the other?",
          answer: "Angular is a full-featured framework with many built-in tools, while React is a library focused on the view layer. Angular uses TypeScript by default and has built-in state management, routing, and form validation. React requires additional libraries for these features but offers more flexibility. Choose Angular for large enterprise applications with complex requirements and consistent patterns. Choose React for more flexibility, faster rendering, and when working with a team familiar with JavaScript.",
          technologyId: 2, // Angular
          experienceLevelId: 3, // Advanced
          questionTypeId: 3 // Framework
        },
        {
          title: "Explain Node.js Event Loop",
          content: "How does the Node.js event loop work? Why is it important for server-side applications?",
          answer: "The Node.js event loop is a mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It works by offloading operations to the system kernel whenever possible and using a queue-based system (event queue) to handle callbacks when operations complete. This is important for server-side applications because it allows Node.js to handle thousands of concurrent connections without the overhead of threading, making it highly scalable and efficient for I/O-bound applications.",
          technologyId: 4, // Node.js
          experienceLevelId: 3, // Advanced
          questionTypeId: 4 // Architecture
        }
      ];

      for (const question of sampleQuestions) {
        await db.insert(schema.questions).values(question);
      }

      // Add a sample candidate
      const johnSmith: InsertCandidate = {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "123-456-7890",
        resumeUrl: "https://example.com/resume/john-smith"
      };
      await db.insert(schema.candidates).values(johnSmith);

      // Add a sample interview
      const interview: InsertInterview = {
        title: "Senior React Developer Interview",
        candidateId: 1,
        date: new Date(),
        status: "scheduled",
        notes: null,
        technicalScore: null,
        problemSolvingScore: null,
        communicationScore: null,
        overallScore: null,
        recommendation: null
      };
      const interviewResult = await db.insert(schema.interviews).values(interview).returning();
      
      // Add sample interview questions
      const interviewQuestions = [
        {
          interviewId: interviewResult[0].id,
          questionId: 1,
          score: null,
          notes: ""
        },
        {
          interviewId: interviewResult[0].id,
          questionId: 3,
          score: null,
          notes: ""
        }
      ];

      for (const iq of interviewQuestions) {
        await db.insert(schema.interviewQuestions).values(iq);
      }

      // Add a default user
      const defaultUser: InsertUser = {
        username: "admin",
        password: "admin", // In a real app, this would be hashed
        email: "admin@example.com",
        role: "admin"
      };
      await db.insert(schema.users).values(defaultUser);

      console.log("Database initialized with sample data");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}

export const pgStorage = new PgStorage();