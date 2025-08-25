import { 
  type User, 
  type InsertUser, 
  type ChatSession, 
  type InsertChatSession,
  type LearningModule,
  type UserProgress,
  type InsertUserProgress,
  type Assessment,
  type AssessmentResult,
  type InsertAssessmentResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;

  // Learning modules
  getLearningModules(): Promise<LearningModule[]>;
  getLearningModule(id: string): Promise<LearningModule | undefined>;

  // User progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressBySkill(userId: string, skillType: string): Promise<UserProgress | undefined>;
  createOrUpdateProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Assessments
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult>;
  getUserAssessmentResults(userId: string): Promise<AssessmentResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private learningModules: Map<string, LearningModule> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private assessments: Map<string, Assessment> = new Map();
  private assessmentResults: Map<string, AssessmentResult> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize learning modules
    const modules: LearningModule[] = [
      {
        id: "1",
        title: "Active Listening Skills",
        description: "Learn how to truly listen and understand others in conversations. Practice techniques for better engagement.",
        difficulty: "Beginner",
        duration: 25,
        exercises: 5,
        content: {
          lessons: [
            {
              title: "Introduction to Active Listening",
              content: "Active listening is a fundamental skill for healthy relationships...",
              exercises: [
                { question: "What are the key components of active listening?", type: "multiple_choice" }
              ]
            }
          ]
        },
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      },
      {
        id: "2",
        title: "Emotional Intelligence",
        description: "Understand and manage emotions effectively in relationships. Learn to recognize emotional patterns.",
        difficulty: "Intermediate",
        duration: 40,
        exercises: 8,
        content: {
          lessons: [
            {
              title: "Understanding Emotions",
              content: "Emotional intelligence involves recognizing and managing emotions...",
              exercises: [
                { question: "Identify the emotion in this scenario", type: "multiple_choice" }
              ]
            }
          ]
        },
        imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      },
      {
        id: "3",
        title: "Conflict Resolution",
        description: "Navigate disagreements constructively and find mutually beneficial solutions in relationships.",
        difficulty: "Advanced",
        duration: 35,
        exercises: 6,
        content: {
          lessons: [
            {
              title: "Understanding Conflict",
              content: "Conflict is a natural part of relationships when handled properly...",
              exercises: [
                { question: "What is the first step in resolving conflict?", type: "text" }
              ]
            }
          ]
        },
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      },
      {
        id: "4",
        title: "Building Trust",
        description: "Learn the fundamentals of building and maintaining trust in personal and professional relationships.",
        difficulty: "Beginner",
        duration: 30,
        exercises: 7,
        content: {
          lessons: [
            {
              title: "Trust Foundations",
              content: "Trust is built through consistent actions and honest communication...",
              exercises: [
                { question: "What actions build trust?", type: "multiple_choice" }
              ]
            }
          ]
        },
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      }
    ];

    modules.forEach(module => this.learningModules.set(module.id, module));

    // Initialize assessments
    const assessments: Assessment[] = [
      {
        id: "1",
        title: "Communication Style",
        description: "Discover your natural communication patterns and learn how to adapt them for better relationships.",
        duration: 15,
        questions: [
          {
            id: "1",
            question: "When someone disagrees with you, you typically:",
            type: "multiple_choice",
            options: [
              "Listen to their perspective first",
              "Defend your position immediately",
              "Try to find common ground",
              "Avoid the conversation"
            ],
            category: "communication"
          }
        ]
      },
      {
        id: "2",
        title: "Social Awareness",
        description: "Evaluate your ability to read social cues and understand others' emotions and intentions.",
        duration: 20,
        questions: [
          {
            id: "1",
            question: "How well can you tell when someone is uncomfortable in a social situation?",
            type: "scale",
            category: "social_awareness"
          }
        ]
      },
      {
        id: "3",
        title: "Conflict Resolution",
        description: "Assess your approach to handling disagreements and your skills in finding solutions.",
        duration: 18,
        questions: [
          {
            id: "1",
            question: "Describe how you would handle a disagreement with a close friend:",
            type: "text",
            category: "conflict_resolution"
          }
        ]
      }
    ];

    assessments.forEach(assessment => this.assessments.set(assessment.id, assessment));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      preferences: insertUser.preferences || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      messages: insertSession.messages || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values());
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    return this.learningModules.get(id);
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async getUserProgressBySkill(userId: string, skillType: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(p => p.userId === userId && p.skillType === skillType);
  }

  async createOrUpdateProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgressBySkill(insertProgress.userId, insertProgress.skillType);
    
    if (existing) {
      const updated = { 
        ...existing, 
        ...insertProgress, 
        completedExercises: insertProgress.completedExercises || [],
        lastActivity: new Date() 
      };
      this.userProgress.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const progress: UserProgress = {
      ...insertProgress,
      id,
      progress: insertProgress.progress || 0,
      completedExercises: insertProgress.completedExercises || [],
      lastActivity: new Date()
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async createAssessmentResult(insertResult: InsertAssessmentResult): Promise<AssessmentResult> {
    const id = randomUUID();
    const result: AssessmentResult = {
      ...insertResult,
      id,
      recommendations: insertResult.recommendations || [],
      completedAt: new Date()
    };
    this.assessmentResults.set(id, result);
    return result;
  }

  async getUserAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    return Array.from(this.assessmentResults.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }
}

export const storage = new MemStorage();
