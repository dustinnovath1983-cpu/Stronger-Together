import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertChatSessionSchema, insertAssessmentResultSchema } from "@shared/schema";
import { generateCoachingResponse, analyzeAssessmentAnswers } from "./services/openai";
import bcrypt from "bcrypt";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'relationship-wise-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Learning modules routes
  app.get("/api/modules", requireAuth, async (req, res) => {
    try {
      const modules = await storage.getLearningModules();
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/modules/:id", requireAuth, async (req, res) => {
    try {
      const module = await storage.getLearningModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User progress routes
  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.session.userId!);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress", requireAuth, async (req, res) => {
    try {
      const progressData = {
        ...req.body,
        userId: req.session.userId!
      };
      
      const progress = await storage.createOrUpdateProgress(progressData);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chats", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserChatSessions(req.session.userId!);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chats", requireAuth, async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId: req.session.userId!
      });
      
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/chats/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chats/:id/messages", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.session.userId) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      // Get user context
      const user = await storage.getUser(req.session.userId!);
      const userContext = user ? { age: user.age, preferences: user.preferences } : undefined;

      // Add user message
      const newMessages = [
        ...(session.messages || []),
        {
          role: "user" as const,
          content: message,
          timestamp: new Date().toISOString()
        }
      ];

      // Generate AI response
      const coachingResponse = await generateCoachingResponse(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        userContext
      );

      // Add AI response
      newMessages.push({
        role: "assistant" as const,
        content: coachingResponse.response,
        timestamp: new Date().toISOString()
      });

      // Update session
      const updatedSession = await storage.updateChatSession(req.params.id, {
        messages: newMessages
      });

      res.json({ 
        session: updatedSession, 
        suggestions: coachingResponse.suggestions,
        feedback: coachingResponse.feedback 
      });
    } catch (error: any) {
      console.error("Chat message error:", error);
      res.status(500).json({ message: "Failed to process message. Please try again." });
    }
  });

  // Assessment routes
  app.get("/api/assessments", requireAuth, async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments/:id", requireAuth, async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/:id/submit", requireAuth, async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers) {
        return res.status(400).json({ message: "Answers are required" });
      }

      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Analyze answers with AI
      const analysis = await analyzeAssessmentAnswers(assessment.questions, answers);

      // Save results
      const result = await storage.createAssessmentResult({
        userId: req.session.userId!,
        assessmentId: req.params.id,
        answers,
        scores: analysis.scores,
        recommendations: analysis.recommendations
      });

      res.json(result);
    } catch (error: any) {
      console.error("Assessment submission error:", error);
      res.status(500).json({ message: "Failed to submit assessment. Please try again." });
    }
  });

  app.get("/api/assessment-results", requireAuth, async (req, res) => {
    try {
      const results = await storage.getUserAssessmentResults(req.session.userId!);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
