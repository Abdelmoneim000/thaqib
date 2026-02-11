import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import type { Express, Request, Response, RequestHandler } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Extend express-session types
declare module "express-session" {
    interface SessionData {
        userId: string;
    }
}

const SALT_ROUNDS = 12;

export function setupAuth(app: Express) {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
    });

    app.set("trust proxy", 1);

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "thaqib-fallback-secret",
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: sessionTtl,
            },
        })
    );
}

export function registerAuthRoutes(app: Express) {
    // Register
    app.post("/api/auth/register", async (req: Request, res: Response) => {
        try {
            const { email, password, firstName, lastName, role, organization, skills } = req.body;

            if (!email || !password || !role) {
                return res.status(400).json({ error: "Email, password, and role are required" });
            }

            if (!["client", "analyst"].includes(role)) {
                return res.status(400).json({ error: "Role must be 'client' or 'analyst'" });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }

            // Check if email already exists
            const [existing] = await db.select().from(users).where(eq(users.email, email));
            if (existing) {
                return res.status(409).json({ error: "An account with this email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const [newUser] = await db
                .insert(users)
                .values({
                    email,
                    password: hashedPassword,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    role,
                    organization: organization || null,
                    skills: skills || null,
                })
                .returning();

            // Set session
            req.session.userId = newUser.id;

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ error: "Failed to create account" });
        }
    });

    // Login
    app.post("/api/auth/login", async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const [user] = await db.select().from(users).where(eq(users.email, email));
            if (!user || !user.password) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Set session
            req.session.userId = user.id;

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Failed to log in" });
        }
    });

    // Logout
    app.post("/api/auth/logout", (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to log out" });
            }
            res.clearCookie("connect.sid");
            res.json({ success: true });
        });
    });

    // Get current user
    app.get("/api/auth/user", async (req: Request, res: Response) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        try {
            const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Get user error:", error);
            res.status(500).json({ error: "Failed to get user" });
        }
    });

    // Update profile
    app.patch("/api/auth/profile", isAuthenticated, async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, organization, skills } = req.body;

            const [updated] = await db
                .update(users)
                .set({
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(organization !== undefined && { organization }),
                    ...(skills !== undefined && { skills }),
                    updatedAt: new Date(),
                })
                .where(eq(users.id, req.session.userId!))
                .returning();

            if (!updated) {
                return res.status(404).json({ error: "User not found" });
            }

            const { password: _, ...userWithoutPassword } = updated;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Profile update error:", error);
            res.status(500).json({ error: "Failed to update profile" });
        }
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};
