import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

// Session storage table for express-session with connect-pg-simple
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),  // bcrypt hash — nullable for legacy users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("analyst"),
  organization: varchar("organization"),  // for clients
  skills: text("skills"),  // comma-separated, for analysts
  // Public Profile Fields
  isPublic: boolean("is_public").default(false),
  bio: text("bio"),
  title: text("title"),
  phone: varchar("phone"),
  termsAccepted: boolean("terms_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
