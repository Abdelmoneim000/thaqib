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
        impersonatingFrom?: string; // original admin userId when impersonating
        impersonatedUserRole?: string; // role of the impersonated user
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
            const { email, password, firstName, lastName, role, organization, skills, phone, termsAccepted } = req.body;

            if (!email || !password || !role) {
                return res.status(400).json({ error: "Email, password, and role are required" });
            }

            if (!firstName || !lastName) {
                return res.status(400).json({ error: "First name and last name are required" });
            }

            if (!termsAccepted) {
                return res.status(400).json({ error: "You must accept the terms and privacy policy" });
            }

            if (!["client", "analyst"].includes(role)) {
                return res.status(400).json({ error: "Role must be 'client' or 'analyst'" });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }

            // Check if email/identifier already exists
            const [existing] = await db.select().from(users).where(eq(users.email, email));
            if (existing) {
                return res.status(409).json({ error: "An account with this email already exists" });
            }

            // For clients registering with phone, also check phone uniqueness
            if (phone) {
                const [existingPhone] = await db.select().from(users).where(eq(users.phone, phone));
                if (existingPhone) {
                    return res.status(409).json({ error: "An account with this phone number already exists" });
                }
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
                    phone: phone || null,
                    termsAccepted: !!termsAccepted,
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
                return res.status(400).json({ error: "Credentials are required" });
            }

            // Try to find user by email first, then by phone
            let [user] = await db.select().from(users).where(eq(users.email, email));
            if (!user) {
                // Try phone lookup (clients register with phone as identifier)
                [user] = await db.select().from(users).where(eq(users.phone, email));
            }

            if (!user || !user.password) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: "Invalid credentials" });
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
            res.json({
                ...userWithoutPassword,
                isImpersonating: !!req.session.impersonatingFrom,
                impersonatingFrom: req.session.impersonatingFrom || null,
            });
        } catch (error) {
            console.error("Get user error:", error);
            res.status(500).json({ error: "Failed to get user" });
        }
    });

    // Update profile
    app.patch("/api/auth/profile", isAuthenticated, async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, organization, skills, phone } = req.body;

            const [updated] = await db
                .update(users)
                .set({
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(organization !== undefined && { organization }),
                    ...(skills !== undefined && { skills }),
                    ...(phone !== undefined && { phone }),
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

export function registerImpersonationRoutes(app: Express) {
    // Impersonate a user (admin only)
    app.post("/api/admin/impersonate/:userId", isAuthenticated, async (req: Request, res: Response) => {
        try {
            const adminId = req.session.userId!;
            const admin = await db.select().from(users).where(eq(users.id, adminId)).then(r => r[0]);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ error: "Only admins can impersonate users" });
            }

            const targetUserId = req.params.userId;
            const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));

            if (!targetUser) {
                return res.status(404).json({ error: "User not found" });
            }

            if (targetUser.role === "admin") {
                return res.status(403).json({ error: "Cannot impersonate other admins" });
            }

            // Set impersonation
            req.session.impersonatingFrom = adminId;
            req.session.impersonatedUserRole = targetUser.role;
            req.session.userId = targetUserId;

            const { password: _, ...userWithoutPassword } = targetUser;
            res.json({ ...userWithoutPassword, impersonating: true, originalAdminId: adminId });
        } catch (error) {
            console.error("Impersonation error:", error);
            res.status(500).json({ error: "Failed to impersonate user" });
        }
    });

    // Stop impersonation (return to admin)
    app.post("/api/admin/stop-impersonation", isAuthenticated, async (req: Request, res: Response) => {
        try {
            const originalAdminId = req.session.impersonatingFrom;

            if (!originalAdminId) {
                return res.status(400).json({ error: "Not currently impersonating" });
            }

            // Restore admin session
            req.session.userId = originalAdminId;
            delete req.session.impersonatingFrom;
            delete req.session.impersonatedUserRole;

            const [admin] = await db.select().from(users).where(eq(users.id, originalAdminId));
            if (!admin) {
                return res.status(404).json({ error: "Admin user not found" });
            }

            const { password: _, ...adminWithoutPassword } = admin;
            res.json(adminWithoutPassword);
        } catch (error) {
            console.error("Stop impersonation error:", error);
            res.status(500).json({ error: "Failed to stop impersonation" });
        }
    });

    // Check impersonation status
    app.get("/api/admin/impersonation-status", isAuthenticated, async (req: Request, res: Response) => {
        res.json({
            isImpersonating: !!req.session.impersonatingFrom,
            originalAdminId: req.session.impersonatingFrom || null,
        });
    });
}
