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

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(schema.users).where(eq(schema.users.role, role));
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

  async getInterviewsByAssignee(assigneeId: number): Promise<Interview[]> {
    return await db.select().from(schema.interviews).where(eq(schema.interviews.assigneeId, assigneeId));
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
      // Get the interview with details to access question evaluation flags
      const interview = await this.getInterviewWithDetails(interviewId);
      if (!interview) {
        console.error(`Interview with ID ${interviewId} not found`);
        return undefined;
      }
      
      // Get interview questions with scores
      const questions = interview.questions;
      
      if (questions.length === 0) {
        console.error(`No questions found for interview with ID ${interviewId}`);
        return interview; // Return original interview without changes
      }
      
      // Calculate average scores by skill type
      // Only include non-skipped questions
      const scoredQuestions = questions.filter(q => q.score !== null && !q.skipped);
      const totalQuestions = scoredQuestions.length;
      
      if (totalQuestions === 0) {
        console.error(`No scored questions found for interview with ID ${interviewId}`);
        return interview; // Return original interview without changes
      }
      
      // Get questions by skill type
      const technicalQuestions = scoredQuestions.filter(
        q => q.question.evaluatesTechnical
      );
      const problemSolvingQuestions = scoredQuestions.filter(
        q => q.question.evaluatesProblemSolving
      );
      const communicationQuestions = scoredQuestions.filter(
        q => q.question.evaluatesCommunication
      );
      
      console.log(`Technical Questions: ${technicalQuestions.length}`);
      console.log(`Problem Solving Questions: ${problemSolvingQuestions.length}`);
      console.log(`Communication Questions: ${communicationQuestions.length}`);
      
      // Calculate separate scores for each skill
      const technicalScore = technicalQuestions.length > 0
        ? Math.round(technicalQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / technicalQuestions.length)
        : null;
        
      const problemSolvingScore = problemSolvingQuestions.length > 0
        ? Math.round(problemSolvingQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / problemSolvingQuestions.length)
        : null;
        
      const communicationScore = communicationQuestions.length > 0
        ? Math.round(communicationQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / communicationQuestions.length)
        : null;
      
      console.log(`Technical Score: ${technicalScore}`);
      console.log(`Problem Solving Score: ${problemSolvingScore}`);
      console.log(`Communication Score: ${communicationScore}`);
      
      // Calculate overall score using available skill scores
      const validScores = [technicalScore, problemSolvingScore, communicationScore].filter(score => score !== null) as number[];
      const overallScore = validScores.length > 0
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : null;
      
      console.log(`Overall Score: ${overallScore}`);
      
      // Generate a recommendation based on the overall score
      let recommendation: string | null = null;
      
      if (overallScore !== null) {
        if (overallScore >= 5) {
          recommendation = "strong_hire";
        } else if (overallScore >= 4) {
          recommendation = "hire";
        } else if (overallScore >= 3) {
          recommendation = "consider";
        } else {
          recommendation = "pass";
        }
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

      // Add sample questions for all technology stacks
      const sampleQuestions = [
        // React questions
        {
          title: "Explain React's Virtual DOM",
          content: "What is the Virtual DOM in React and how does it improve performance?",
          answer: "The Virtual DOM is a lightweight copy of the actual DOM in memory. React uses it to optimize rendering by comparing the virtual DOM with the actual DOM and updating only the parts that have changed, rather than re-rendering the entire DOM. This process is called reconciliation and it significantly improves performance by reducing expensive DOM operations.",
          technologyId: 1, // React
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        {
          title: "React Hooks",
          content: "Explain the purpose of useState and useEffect hooks in React. What problems do they solve?",
          answer: "useState allows functional components to have state variables, eliminating the need for class components in many cases. It returns a stateful value and a function to update it. useEffect allows performing side effects in functional components, like data fetching, subscriptions, or DOM manipulation. It serves the same purpose as lifecycle methods in class components (componentDidMount, componentDidUpdate, componentWillUnmount) but unified into a single API.",
          technologyId: 1, // React
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: false
        },
        {
          title: "React Performance Optimization",
          content: "What strategies would you use to optimize the performance of a React application with thousands of components?",
          answer: "To optimize a large React application: 1) Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders. 2) Implement code-splitting with React.lazy and Suspense to reduce initial load time. 3) Virtualize long lists with react-window or react-virtualized. 4) Use the React Profiler to identify performance bottlenecks. 5) Consider state management solutions like Context API with reducers or external libraries for more complex state. 6) Optimize images and other assets. 7) Implement progressive loading and skeleton screens.",
          technologyId: 1, // React
          experienceLevelId: 3, // Advanced
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: true
        },
        
        // Angular questions
        {
          title: "Compare Angular and React",
          content: "What are the main differences between Angular and React? When would you choose one over the other?",
          answer: "Angular is a full-featured framework with many built-in tools, while React is a library focused on the view layer. Angular uses TypeScript by default and has built-in state management, routing, and form validation. React requires additional libraries for these features but offers more flexibility. Choose Angular for large enterprise applications with complex requirements and consistent patterns. Choose React for more flexibility, faster rendering, and when working with a team familiar with JavaScript.",
          technologyId: 2, // Angular
          experienceLevelId: 3, // Advanced
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        {
          title: "Angular Change Detection",
          content: "Explain Angular's change detection mechanism. How would you optimize it in a large application?",
          answer: "Angular's change detection works by checking if the model (data) has changed since the last time detection ran, then updating the DOM if needed. By default, it uses zone.js to automatically detect asynchronous operations and trigger change detection. To optimize: 1) Use OnPush change detection strategy to only check components when inputs change. 2) Use immutable objects or observables with OnPush. 3) Detach change detection for sections not needing frequent updates. 4) Use pure pipes instead of methods in templates. 5) Break down complex components into smaller ones. 6) Optimize ngFor with trackBy.",
          technologyId: 2, // Angular 
          experienceLevelId: 3, // Advanced
          questionTypeId: 4, // Architecture
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: false
        },
        
        // Vue questions
        {
          title: "Vue.js Reactivity System",
          content: "Explain Vue's reactivity system. How does Vue track changes to data?",
          answer: "Vue's reactivity system works by intercepting property access and updates on data objects. In Vue 2, it uses Object.defineProperty to convert properties into getters/setters that notify Vue when properties are accessed or modified. In Vue 3, it uses ES6 Proxies for more efficient tracking. When a component renders, it tracks which reactive properties are accessed (dependency tracking). When a property changes, Vue notifies all components that depend on it to re-render. This system allows for automatic UI updates when the underlying data changes.",
          technologyId: 3, // Vue
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        
        // Node.js questions
        {
          title: "Explain Node.js Event Loop",
          content: "How does the Node.js event loop work? Why is it important for server-side applications?",
          answer: "The Node.js event loop is a mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It works by offloading operations to the system kernel whenever possible and using a queue-based system (event queue) to handle callbacks when operations complete. This is important for server-side applications because it allows Node.js to handle thousands of concurrent connections without the overhead of threading, making it highly scalable and efficient for I/O-bound applications.",
          technologyId: 4, // Node.js
          experienceLevelId: 3, // Advanced
          questionTypeId: 4, // Architecture
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        {
          title: "Node.js Streams",
          content: "Explain Node.js streams and give examples of when you would use them. How do they help with memory efficiency?",
          answer: "Node.js streams are collections of data that might not be available all at once. They allow processing data in chunks rather than loading the entire dataset into memory. Types include: Readable (reading data), Writable (writing data), Duplex (both reading and writing), and Transform (modifying data while reading/writing). Use streams for: 1) Processing large files 2) Network communications 3) Real-time data processing. Streams help with memory efficiency by avoiding loading entire datasets into memory, instead processing data in small chunks which allows handling files larger than the available RAM.",
          technologyId: 4, // Node.js
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: false
        },
        
        // Python questions
        {
          title: "Python Generators",
          content: "What are generators in Python and what are the advantages of using them? Provide an example.",
          answer: "Generators in Python are functions that can pause and resume their execution state between yields. They return an iterator that produces items one at a time, only when needed. Advantages: 1) Memory efficiency - only one item is in memory at a time 2) Lazy evaluation - items are only computed when requested 3) Infinite sequences - can represent infinite sequences 4) Simplified code. Example: `def fibonacci(): a, b = 0, 1; while True: yield a; a, b = b, a + b` This creates an infinite sequence of Fibonacci numbers without storing them all in memory.",
          technologyId: 5, // Python
          experienceLevelId: 2, // Intermediate
          questionTypeId: 1, // Algorithms
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: false
        },
        {
          title: "Python Concurrency",
          content: "Compare threading, multiprocessing, and asyncio in Python. When would you use each approach?",
          answer: "Threading: Uses threads for concurrency. Best for I/O-bound tasks due to the GIL (Global Interpreter Lock) which prevents true parallelism for CPU operations. Multiprocessing: Uses separate processes to bypass the GIL. Best for CPU-bound tasks as it allows true parallelism. Has higher memory overhead than threading. Asyncio: Uses a single-threaded event loop with coroutines. Best for I/O-bound tasks with many concurrent operations. Lower overhead than threading but requires async-compatible libraries. Choose threading for simple I/O tasks with existing code, multiprocessing for CPU-intensive operations, and asyncio for highly concurrent I/O operations with modern code.",
          technologyId: 5, // Python
          experienceLevelId: 3, // Advanced
          questionTypeId: 4, // Architecture
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: true
        },
        
        // .NET questions
        {
          title: ".NET Core vs .NET Framework",
          content: "What are the key differences between .NET Core and .NET Framework? What factors would influence your choice between them?",
          answer: ".NET Core (now .NET 5+) is cross-platform, open-source, and modular with better performance than .NET Framework, which is Windows-only and monolithic. Key differences: 1) Platform support: .NET Core runs on Windows, Linux, and macOS; .NET Framework is Windows-only. 2) Deployment: .NET Core supports self-contained deployments; .NET Framework requires the framework installed on the target machine. 3) Performance: .NET Core has better performance and scalability. Choose .NET Core (now .NET 5+) for new applications, cross-platform needs, microservices, and containerized deployments. Use .NET Framework for maintaining existing applications, when using technologies not yet ported to .NET Core, or for Windows-specific applications.",
          technologyId: 6, // .NET
          experienceLevelId: 2, // Intermediate
          questionTypeId: 3, // Framework
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        {
          title: "Entity Framework Performance",
          content: "What strategies would you use to optimize Entity Framework performance in a large-scale application?",
          answer: "To optimize Entity Framework performance: 1) Use AsNoTracking() for read-only queries to avoid change tracking overhead. 2) Implement proper eager loading with Include() to avoid N+1 query problems. 3) Use compiled queries for frequently executed queries. 4) Batch database operations where possible. 5) Create covering indexes for common queries. 6) Use paging for large datasets. 7) Consider raw SQL for complex queries. 8) Use database-generated values instead of client-generated. 9) Implement caching for frequently accessed data. 10) Monitor and tune database performance using tools like SQL Profiler. 11) Use appropriate isolation levels based on concurrency needs.",
          technologyId: 6, // .NET
          experienceLevelId: 3, // Advanced
          questionTypeId: 2, // Database
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: false
        },
        
        // Database questions
        {
          title: "SQL vs NoSQL Databases",
          content: "Compare SQL and NoSQL databases. When would you choose one over the other?",
          answer: "SQL databases are relational, structured, use SQL for queries, and provide ACID compliance. NoSQL databases are non-relational, schema-flexible, horizontally scalable, and come in various types (document, key-value, column, graph). Choose SQL when: 1) Data is structured and unchanging 2) Complex queries and transactions are needed 3) ACID compliance is required 4) Relationships between data entities are important. Choose NoSQL when: 1) Storing large volumes of unstructured data 2) Rapid development with evolving data models is needed 3) Horizontal scaling is required 4) High throughput with simpler queries is the priority 5) Specific data models (document, graph) better fit your use case.",
          technologyId: 5, // Using Python ID as a placeholder for general database question
          experienceLevelId: 2, // Intermediate
          questionTypeId: 2, // Database
          evaluatesTechnical: true,
          evaluatesProblemSolving: false,
          evaluatesCommunication: true
        },
        
        // Algorithm questions
        {
          title: "Time and Space Complexity",
          content: "Explain Big O notation and analyze the time and space complexity of a specific algorithm of your choice. How would you optimize it?",
          answer: "Big O notation describes the upper bound of an algorithm's time or space requirements relative to input size. For example, a binary search algorithm has O(log n) time complexity: For an array of 10 elements, we need ~3 comparisons; for 1,000 elements, only ~10 comparisons. This logarithmic growth is much more efficient than linear O(n) algorithms. Space complexity is O(1) since it only needs a few variables regardless of input size. To optimize further, we could use interpolation search which has O(log log n) time complexity for uniformly distributed data, or implement it iteratively instead of recursively to reduce call stack overhead.",
          technologyId: 4, // Using Node.js ID as a placeholder for algorithm question
          experienceLevelId: 2, // Intermediate
          questionTypeId: 1, // Algorithms
          evaluatesTechnical: true,
          evaluatesProblemSolving: true,
          evaluatesCommunication: true
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