import {
  Technology,
  ExperienceLevel,
  QuestionType,
  Question,
  Candidate,
  Interview,
  InterviewQuestion,
  InsertQuestion,
  InsertCandidate,
  InsertInterview,
  InsertInterviewQuestion,
  User,
  InsertUser,
  QuestionFilter,
  InterviewWithDetails,
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Technology methods
  getTechnologies(): Promise<Technology[]>;
  getTechnology(id: number): Promise<Technology | undefined>;
  
  // Experience level methods
  getExperienceLevels(): Promise<ExperienceLevel[]>;
  getExperienceLevel(id: number): Promise<ExperienceLevel | undefined>;
  
  // Question type methods
  getQuestionTypes(): Promise<QuestionType[]>;
  getQuestionType(id: number): Promise<QuestionType | undefined>;
  
  // Question methods
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  getFilteredQuestions(filter: QuestionFilter): Promise<Question[]>;
  
  // Candidate methods
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<Candidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Interview methods
  getInterviews(): Promise<Interview[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<Interview>): Promise<Interview | undefined>;
  deleteInterview(id: number): Promise<boolean>;
  getInterviewWithDetails(id: number): Promise<InterviewWithDetails | undefined>;
  
  // Interview Question methods
  getInterviewQuestions(interviewId: number): Promise<InterviewQuestion[]>;
  getInterviewQuestion(id: number): Promise<InterviewQuestion | undefined>;
  createInterviewQuestion(interviewQuestion: InsertInterviewQuestion): Promise<InterviewQuestion>;
  updateInterviewQuestion(id: number, interviewQuestion: Partial<InterviewQuestion>): Promise<InterviewQuestion | undefined>;
  deleteInterviewQuestion(id: number): Promise<boolean>;
  
  // Specialized methods
  getRandomQuestions(filter: QuestionFilter): Promise<Question[]>;
  generateInterviewSummary(interviewId: number): Promise<Interview | undefined>;
}

export class MemStorage implements IStorage {
  private technologies: Map<number, Technology>;
  private experienceLevels: Map<number, ExperienceLevel>;
  private questionTypes: Map<number, QuestionType>;
  private questions: Map<number, Question>;
  private candidates: Map<number, Candidate>;
  private interviews: Map<number, Interview>;
  private interviewQuestions: Map<number, InterviewQuestion>;
  private users: Map<number, User>;
  
  private technologyId: number;
  private experienceLevelId: number;
  private questionTypeId: number;
  private questionId: number;
  private candidateId: number;
  private interviewId: number;
  private interviewQuestionId: number;
  private userId: number;

  constructor() {
    this.technologies = new Map();
    this.experienceLevels = new Map();
    this.questionTypes = new Map();
    this.questions = new Map();
    this.candidates = new Map();
    this.interviews = new Map();
    this.interviewQuestions = new Map();
    this.users = new Map();
    
    this.technologyId = 1;
    this.experienceLevelId = 1;
    this.questionTypeId = 1;
    this.questionId = 1;
    this.candidateId = 1;
    this.interviewId = 1;
    this.interviewQuestionId = 1;
    this.userId = 1;

    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Add experience levels
    const beginner: ExperienceLevel = {
      id: this.experienceLevelId++,
      name: "beginner",
      description: "0-2 years of experience"
    };
    const intermediate: ExperienceLevel = {
      id: this.experienceLevelId++,
      name: "intermediate",
      description: "2-5 years of experience"
    };
    const advanced: ExperienceLevel = {
      id: this.experienceLevelId++,
      name: "advanced",
      description: "5+ years of experience"
    };
    this.experienceLevels.set(beginner.id, beginner);
    this.experienceLevels.set(intermediate.id, intermediate);
    this.experienceLevels.set(advanced.id, advanced);

    // Add technologies
    const react: Technology = {
      id: this.technologyId++,
      name: "React",
      description: "A JavaScript library for building user interfaces"
    };
    const angular: Technology = {
      id: this.technologyId++,
      name: "Angular",
      description: "Platform for building mobile and desktop web applications"
    };
    const vue: Technology = {
      id: this.technologyId++,
      name: "Vue",
      description: "Progressive JavaScript Framework"
    };
    const node: Technology = {
      id: this.technologyId++,
      name: "Node.js",
      description: "JavaScript runtime built on Chrome's V8 JavaScript engine"
    };
    const python: Technology = {
      id: this.technologyId++,
      name: "Python",
      description: "High-level programming language"
    };
    const dotnet: Technology = {
      id: this.technologyId++,
      name: ".NET",
      description: "Developer platform for building all types of applications"
    };
    
    this.technologies.set(react.id, react);
    this.technologies.set(angular.id, angular);
    this.technologies.set(vue.id, vue);
    this.technologies.set(node.id, node);
    this.technologies.set(python.id, python);
    this.technologies.set(dotnet.id, dotnet);

    // Add question types
    const algorithms: QuestionType = {
      id: this.questionTypeId++,
      name: "algorithms",
      description: "Questions about data structures and algorithms"
    };
    const database: QuestionType = {
      id: this.questionTypeId++,
      name: "database",
      description: "Questions about database design and queries"
    };
    const framework: QuestionType = {
      id: this.questionTypeId++,
      name: "framework",
      description: "Questions specific to frameworks"
    };
    const architecture: QuestionType = {
      id: this.questionTypeId++,
      name: "architecture",
      description: "Questions about software architecture"
    };
    
    this.questionTypes.set(algorithms.id, algorithms);
    this.questionTypes.set(database.id, database);
    this.questionTypes.set(framework.id, framework);
    this.questionTypes.set(architecture.id, architecture);

    // Add sample questions
    const reactQuestions = [
      {
        title: "Explain React's Virtual DOM and its benefits",
        content: "Ask the candidate to explain what the Virtual DOM is in React, how it differs from the actual DOM, and what performance benefits it provides.",
        answer: "The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes in a React component:\n1. React creates a new Virtual DOM representation\n2. Compares it with the previous Virtual DOM (diffing)\n3. Calculates the minimal operations needed to update the real DOM\n4. Updates only the necessary parts of the actual DOM\n\nBenefits:\n- Improved performance by reducing direct DOM manipulations\n- Batch updates to minimize reflows and repaints\n- Cross-platform compatibility (can be used with non-browser environments)\n- Simplified programming model with declarative updates\n\nA good candidate should also mention that the Virtual DOM is not always faster for every use case, especially for simple or highly optimized applications.",
        technologyId: react.id,
        experienceLevelId: intermediate.id,
        questionTypeId: framework.id
      },
      {
        title: "Implement a custom useDebounce hook in React",
        content: "Ask the candidate to implement a custom useDebounce hook that takes a value and a delay, and returns a debounced version of the value that only updates after the specified delay has passed since the last change.",
        answer: "```jsx\n// Implementation of useDebounce hook\nimport { useState, useEffect } from 'react';\n\nfunction useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  \n  useEffect(() => {\n    // Set up timeout to update debounced value\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n    \n    // Clean up timeout if value changes\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n  \n  return debouncedValue;\n}\n\nexport default useDebounce;\n\n// Example usage:\n// const [searchTerm, setSearchTerm] = useState('');\n// const debouncedSearchTerm = useDebounce(searchTerm, 500);\n// \n// useEffect(() => {\n//   // Only search when debounced value changes\n//   if (debouncedSearchTerm) {\n//     searchAPI(debouncedSearchTerm);\n//   }\n// }, [debouncedSearchTerm]);\n```\n\nA good candidate should explain:\n- The purpose of debouncing (preventing excessive function calls)\n- How the cleanup function in useEffect prevents multiple timers\n- Common use cases like search inputs or window resize handlers\n- Potentially mention throttling as an alternative technique",
        technologyId: react.id,
        experienceLevelId: intermediate.id,
        questionTypeId: framework.id
      },
      {
        title: "Explain React's Context API and when to use it",
        content: "Ask the candidate to explain React's Context API, how it helps solve prop drilling, and scenarios where it should and shouldn't be used.",
        answer: "React's Context API provides a way to share values between components without explicitly passing props through every level of the component tree.\n\nKey Components:\n- `React.createContext`: Creates a Context object\n- `Context.Provider`: Provides values to consuming components\n- `Context.Consumer`: Legacy way to consume context values\n- `useContext` hook: Modern way to consume context in functional components\n\nWhen to use Context:\n- Global state that many components need (themes, user data, localization)\n- When prop drilling becomes cumbersome (passing props through many layers)\n- For infrequently updated data that affects many components\n\nWhen NOT to use Context:\n- For high-frequency updates (can lead to performance issues)\n- When component composition can solve the problem\n- For small applications where prop drilling is manageable\n- When a more robust state management solution like Redux is already in place\n\nA strong candidate will also mention how Context API works with React's rendering optimization and potential performance considerations.",
        technologyId: react.id,
        experienceLevelId: intermediate.id,
        questionTypeId: framework.id
      }
    ];

    // Add React questions
    reactQuestions.forEach(q => {
      const question: Question = {
        id: this.questionId++,
        ...q
      };
      this.questions.set(question.id, question);
    });

    // Add sample candidate
    const johnSmith: Candidate = {
      id: this.candidateId++,
      name: "John Smith",
      email: "john.smith@example.com",
      notes: "Senior React Developer candidate"
    };
    this.candidates.set(johnSmith.id, johnSmith);

    // Add sample interview
    const currentDate = new Date();
    const interviewDate = currentDate.toISOString();
    
    const interview: Interview = {
      id: this.interviewId++,
      title: "Senior React Developer Interview",
      candidateId: johnSmith.id,
      date: interviewDate,
      status: "in_progress",
      notes: "Initial interview for senior React developer position",
      overallScore: null,
      technicalScore: null,
      problemSolvingScore: null,
      communicationScore: null,
      recommendation: null
    };
    this.interviews.set(interview.id, interview);

    // Add interview questions
    const interviewQuestionsData = [
      {
        interviewId: interview.id,
        questionId: 1,
        score: 1,
        notes: ""
      },
      {
        interviewId: interview.id,
        questionId: 2,
        score: 3,
        notes: ""
      },
      {
        interviewId: interview.id,
        questionId: 3,
        score: 4,
        notes: "Good understanding of Context API use cases"
      }
    ];

    interviewQuestionsData.forEach(iq => {
      const interviewQuestion: InterviewQuestion = {
        id: this.interviewQuestionId++,
        ...iq
      };
      this.interviewQuestions.set(interviewQuestion.id, interviewQuestion);
    });

    // Add a default user
    const defaultUser: User = {
      id: this.userId++,
      username: "admin",
      password: "password" // In a real app, this would be hashed
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Technology methods
  async getTechnologies(): Promise<Technology[]> {
    return Array.from(this.technologies.values());
  }

  async getTechnology(id: number): Promise<Technology | undefined> {
    return this.technologies.get(id);
  }

  // Experience level methods
  async getExperienceLevels(): Promise<ExperienceLevel[]> {
    return Array.from(this.experienceLevels.values());
  }

  async getExperienceLevel(id: number): Promise<ExperienceLevel | undefined> {
    return this.experienceLevels.get(id);
  }

  // Question type methods
  async getQuestionTypes(): Promise<QuestionType[]> {
    return Array.from(this.questionTypes.values());
  }

  async getQuestionType(id: number): Promise<QuestionType | undefined> {
    return this.questionTypes.get(id);
  }

  // Question methods
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async updateQuestion(id: number, question: Partial<Question>): Promise<Question | undefined> {
    const existingQuestion = this.questions.get(id);
    if (!existingQuestion) return undefined;

    const updatedQuestion = { ...existingQuestion, ...question };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }

  async getFilteredQuestions(filter: QuestionFilter): Promise<Question[]> {
    let filteredQuestions = Array.from(this.questions.values());

    if (filter.experienceLevelId) {
      filteredQuestions = filteredQuestions.filter(q => q.experienceLevelId === filter.experienceLevelId);
    }

    if (filter.technologyId) {
      filteredQuestions = filteredQuestions.filter(q => q.technologyId === filter.technologyId);
    }

    if (filter.questionTypeId) {
      filteredQuestions = filteredQuestions.filter(q => q.questionTypeId === filter.questionTypeId);
    }

    return filteredQuestions;
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateId++;
    const newCandidate: Candidate = { ...candidate, id };
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<Candidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    if (!existingCandidate) return undefined;

    const updatedCandidate = { ...existingCandidate, ...candidate };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  // Interview methods
  async getInterviews(): Promise<Interview[]> {
    return Array.from(this.interviews.values());
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const id = this.interviewId++;
    const newInterview: Interview = { ...interview, id };
    this.interviews.set(id, newInterview);
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<Interview>): Promise<Interview | undefined> {
    const existingInterview = this.interviews.get(id);
    if (!existingInterview) return undefined;

    const updatedInterview = { ...existingInterview, ...interview };
    this.interviews.set(id, updatedInterview);
    return updatedInterview;
  }

  async deleteInterview(id: number): Promise<boolean> {
    return this.interviews.delete(id);
  }

  async getInterviewWithDetails(id: number): Promise<InterviewWithDetails | undefined> {
    const interview = this.interviews.get(id);
    if (!interview) return undefined;

    const candidate = this.candidates.get(interview.candidateId);
    if (!candidate) return undefined;

    const interviewQuestionsArray = Array.from(this.interviewQuestions.values())
      .filter(iq => iq.interviewId === id);

    const questionsWithDetails = await Promise.all(
      interviewQuestionsArray.map(async iq => {
        const question = this.questions.get(iq.questionId);
        if (!question) return null;

        const technology = this.technologies.get(question.technologyId);
        const experienceLevel = this.experienceLevels.get(question.experienceLevelId);
        const questionType = this.questionTypes.get(question.questionTypeId);

        return {
          ...iq,
          question: {
            ...question,
            technology: technology!,
            experienceLevel: experienceLevel!,
            questionType: questionType!
          }
        };
      })
    );

    const filteredQuestionsWithDetails = questionsWithDetails.filter(q => q !== null) as (InterviewQuestion & {
      question: Question & {
        technology: Technology;
        experienceLevel: ExperienceLevel;
        questionType: QuestionType;
      };
    })[];

    return {
      ...interview,
      candidate,
      questions: filteredQuestionsWithDetails
    };
  }

  // Interview Question methods
  async getInterviewQuestions(interviewId: number): Promise<InterviewQuestion[]> {
    return Array.from(this.interviewQuestions.values())
      .filter(iq => iq.interviewId === interviewId);
  }

  async getInterviewQuestion(id: number): Promise<InterviewQuestion | undefined> {
    return this.interviewQuestions.get(id);
  }

  async createInterviewQuestion(interviewQuestion: InsertInterviewQuestion): Promise<InterviewQuestion> {
    const id = this.interviewQuestionId++;
    const newInterviewQuestion: InterviewQuestion = { ...interviewQuestion, id };
    this.interviewQuestions.set(id, newInterviewQuestion);
    return newInterviewQuestion;
  }

  async updateInterviewQuestion(id: number, interviewQuestion: Partial<InterviewQuestion>): Promise<InterviewQuestion | undefined> {
    const existingInterviewQuestion = this.interviewQuestions.get(id);
    if (!existingInterviewQuestion) return undefined;

    const updatedInterviewQuestion = { ...existingInterviewQuestion, ...interviewQuestion };
    this.interviewQuestions.set(id, updatedInterviewQuestion);
    return updatedInterviewQuestion;
  }

  async deleteInterviewQuestion(id: number): Promise<boolean> {
    return this.interviewQuestions.delete(id);
  }

  // Specialized methods
  async getRandomQuestions(filter: QuestionFilter): Promise<Question[]> {
    const filteredQuestions = await this.getFilteredQuestions(filter);
    
    // Shuffle array and take the first n elements
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, filter.count);
  }

  async generateInterviewSummary(interviewId: number): Promise<Interview | undefined> {
    const interview = this.interviews.get(interviewId);
    if (!interview) return undefined;

    const interviewQuestions = Array.from(this.interviewQuestions.values())
      .filter(iq => iq.interviewId === interviewId);

    if (interviewQuestions.length === 0) return interview;

    // Calculate average scores
    const scores = interviewQuestions
      .filter(iq => iq.score !== null && iq.score !== undefined)
      .map(iq => iq.score as number);

    if (scores.length === 0) return interview;

    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = Math.round((sum / scores.length) * 10) / 10; // Round to 1 decimal place

    // Update interview with scores
    const updatedInterview: Interview = {
      ...interview,
      overallScore: average,
      // For simplicity, use the same average for all scores
      // In a real app, these would be calculated separately
      technicalScore: average,
      problemSolvingScore: average,
      communicationScore: average
    };

    this.interviews.set(interviewId, updatedInterview);
    return updatedInterview;
  }
}

// Import PgStorage
import { pgStorage } from "./pg-storage";

// Export the appropriate storage implementation based on environment
// Use PostgreSQL storage when DATABASE_URL is available, otherwise use memory storage
// Use database storage if DATABASE_URL is available, otherwise fallback to memory storage
export const storage = process.env.DATABASE_URL ? pgStorage : new MemStorage();
