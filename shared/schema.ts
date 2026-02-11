import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Applications table — analyst applies to projects
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  analystId: varchar("analyst_id").notNull(),
  coverLetter: text("cover_letter"),
  proposedBudget: integer("proposed_budget"),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  clientId: varchar("client_id").notNull(),
  analystId: varchar("analyst_id"),
  status: text("status").notNull().default("open"),
  budget: integer("budget"),
  platformFee: integer("platform_fee").default(0),
  deadline: timestamp("deadline"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  projectId: varchar("project_id").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  rowCount: integer("row_count"),
  columns: jsonb("columns").$type<DatasetColumn[]>().notNull(),
  data: jsonb("data").$type<Record<string, unknown>[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface DatasetColumn {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  sampleValues: unknown[];
}

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
});

export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;

export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  projectId: varchar("project_id"),
  createdBy: varchar("created_by").notNull(),
  isPublished: boolean("is_published").default(false),
  layout: jsonb("layout").$type<DashboardLayout>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export interface DashboardLayout {
  items: DashboardLayoutItem[];
}

export interface DashboardLayoutItem {
  id: string;
  visualizationId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export const visualizations = pgTable("visualizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dashboardId: varchar("dashboard_id"),
  datasetId: varchar("dataset_id"),
  chartType: text("chart_type").notNull(),
  query: jsonb("query").$type<VisualizationQuery>(),
  config: jsonb("config").$type<VisualizationConfig>(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface VisualizationQuery {
  type: "visual" | "sql";
  columns?: string[];
  filters?: QueryFilter[];
  aggregation?: { column: string; function: string };
  groupBy?: string;
  sql?: string;
}

export interface QueryFilter {
  column: string;
  operator: string;
  value: string;
}

export interface VisualizationConfig {
  xAxis?: string;
  yAxis?: string;
  categoryField?: string;
  valueField?: string;
  colors?: { primary: string; palette: string[] };
  formatting?: {
    numberFormat?: string;
    decimals?: number;
    showGrid?: boolean;
    showLegend?: boolean;
    showLabels?: boolean;
  };
}

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
});

export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = typeof visualizations.$inferSelect;

export const sharedDashboards = pgTable("shared_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").notNull(),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  allowExport: boolean("allow_export").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSharedDashboardSchema = createInsertSchema(sharedDashboards).omit({
  id: true,
  createdAt: true,
});

export type InsertSharedDashboard = z.infer<typeof insertSharedDashboardSchema>;
export type SharedDashboard = typeof sharedDashboards.$inferSelect;

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id"),
  clientId: varchar("client_id").notNull(),
  analystId: varchar("analyst_id").notNull(),
  analystName: text("analyst_name"),
  isAdminChat: boolean("is_admin_chat").default(false),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessagePreview: text("last_message_preview"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
  lastMessagePreview: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
