import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, USER_ROLES, UserRole } from "@shared/schema";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes('.')) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create session store
const MemorySessionStore = MemoryStore(session);
const sessionStore = new MemorySessionStore({
  checkPeriod: 86400000, // Prune expired entries every 24h
});

// Role-based access control middleware
export function checkRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!allowedRoles.includes(req.user!.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
}

export function setupAuth(app: Express) {
  // Set up session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "interview-assistant-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: '/'
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if user account is active
        if (!user.active) {
          return done(null, false, { message: "Account is inactive. Please contact an administrator." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user with inactive status by default
      // Only admin can activate the account later
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        active: false, // Set to inactive by default
        role: USER_ROLES.TECHNICAL_INTERVIEWER, // Default role, can be changed by admin
      });

      // Return success but don't log the user in
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({
        ...userWithoutPassword,
        message: "Registration successful. Your account is pending activation by an administrator."
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      

      // Verify current password
      const user = await storage.getUser(req.user!.id);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.get("/api/auth/user", (req, res) => {
    try {
      if (!req.user || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      // Don't send password to client
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Initialize user data with default accounts if they don't exist
  initializeDefaultUsers();

  return { checkRole };
}

// Create default users if they don't exist
async function initializeDefaultUsers() {
  try {
    // Create admin user first
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      const user = await storage.createUser({
        username: "admin",
        password: await hashPassword("admin_password"),
        name: "System Administrator",
        email: "admin@example.com",
        role: USER_ROLES.ADMIN,
        active: true
      });
      console.log("Created default System Administrator user");
    }
    
    const hrUser = await storage.getUserByUsername("hr_admin");
    if (!hrUser) {
      const user = await storage.createUser({
        username: "hr_admin",
        password: await hashPassword("hr_password"),
        name: "HR Administrator",
        email: "hr@example.com",
        role: USER_ROLES.HR,
      });
      
      // Manually set active to true for HR user
      await storage.updateUser(user.id, { active: true });
      console.log("Created default HR admin user");
    }

    const techUser = await storage.getUserByUsername("tech_interviewer");
    if (!techUser) {
      const user = await storage.createUser({
        username: "tech_interviewer",
        password: await hashPassword("tech_password"),
        name: "Technical Interviewer",
        email: "tech@example.com",
        role: USER_ROLES.TECHNICAL_INTERVIEWER,
      });
      
      // Manually set active to true for tech interviewer
      await storage.updateUser(user.id, { active: true });
      console.log("Created default Technical Interviewer user");
    }

    const directorUser = await storage.getUserByUsername("director");
    if (!directorUser) {
      const user = await storage.createUser({
        username: "director",
        password: await hashPassword("director_password"),
        name: "Director",
        email: "director@example.com",
        role: USER_ROLES.DIRECTOR,
      });
      
      // Manually set active to true for director
      await storage.updateUser(user.id, { active: true });
      console.log("Created default Director user");
    }
  } catch (error) {
    console.error("Error creating default users:", error);
  }
}