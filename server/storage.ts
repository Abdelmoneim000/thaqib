import { 
  type User,
  type Project, type InsertProject,
  type Dataset, type InsertDataset,
  type Dashboard, type InsertDashboard,
  type Visualization, type InsertVisualization,
  type SharedDashboard, type InsertSharedDashboard,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  users as usersTable,
  projects as projectsTable,
  datasets as datasetsTable,
  dashboards as dashboardsTable,
  visualizations as visualizationsTable,
  sharedDashboards as sharedDashboardsTable,
  conversations as conversationsTable,
  messages as messagesTable
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, ne, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  getProjectsByAnalyst(analystId: string): Promise<Project[]>;
  getAllOpenProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  getDataset(id: string): Promise<Dataset | undefined>;
  getDatasetsByProject(projectId: string): Promise<Dataset[]>;
  getAllDatasets(): Promise<Dataset[]>;
  getDatasetsByUser(userId: string): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  deleteDataset(id: string): Promise<boolean>;
  
  getDashboard(id: string): Promise<Dashboard | undefined>;
  getDashboardsByUser(userId: string): Promise<Dashboard[]>;
  getDashboardsByProject(projectId: string): Promise<Dashboard[]>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string): Promise<boolean>;
  
  getVisualization(id: string): Promise<Visualization | undefined>;
  getVisualizationsByDashboard(dashboardId: string): Promise<Visualization[]>;
  createVisualization(viz: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: string, updates: Partial<Visualization>): Promise<Visualization | undefined>;
  deleteVisualization(id: string): Promise<boolean>;
  
  getSharedDashboard(token: string): Promise<SharedDashboard | undefined>;
  createSharedDashboard(share: InsertSharedDashboard): Promise<SharedDashboard>;
  deleteSharedDashboard(id: string): Promise<boolean>;
  
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationByProject(projectId: string): Promise<Conversation | undefined>;
  getConversationByUsers(clientId: string, analystId: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string, role: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    return project;
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return db.select().from(projectsTable).where(eq(projectsTable.clientId, clientId));
  }

  async getProjectsByAnalyst(analystId: string): Promise<Project[]> {
    return db.select().from(projectsTable).where(eq(projectsTable.analystId, analystId));
  }

  async getAllOpenProjects(): Promise<Project[]> {
    return db.select().from(projectsTable).where(eq(projectsTable.status, "open"));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projectsTable).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, id))
      .returning();
    return project;
  }

  async getDataset(id: string): Promise<Dataset | undefined> {
    const [dataset] = await db.select().from(datasetsTable).where(eq(datasetsTable.id, id));
    return dataset;
  }

  async getDatasetsByProject(projectId: string): Promise<Dataset[]> {
    return db.select().from(datasetsTable).where(eq(datasetsTable.projectId, projectId));
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return db.select().from(datasetsTable);
  }

  async getDatasetsByUser(userId: string): Promise<Dataset[]> {
    return db.select().from(datasetsTable).where(eq(datasetsTable.uploadedBy, userId));
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const [newDataset] = await db.insert(datasetsTable).values(dataset as any).returning();
    return newDataset;
  }

  async deleteDataset(id: string): Promise<boolean> {
    const result = await db.delete(datasetsTable).where(eq(datasetsTable.id, id)).returning();
    return result.length > 0;
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboardsTable).where(eq(dashboardsTable.id, id));
    return dashboard;
  }

  async getDashboardsByUser(userId: string): Promise<Dashboard[]> {
    return db.select().from(dashboardsTable).where(eq(dashboardsTable.createdBy, userId));
  }

  async getDashboardsByProject(projectId: string): Promise<Dashboard[]> {
    return db.select().from(dashboardsTable).where(eq(dashboardsTable.projectId, projectId));
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const [newDashboard] = await db.insert(dashboardsTable).values(dashboard as any).returning();
    return newDashboard;
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .update(dashboardsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardsTable.id, id))
      .returning();
    return dashboard;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const result = await db.delete(dashboardsTable).where(eq(dashboardsTable.id, id)).returning();
    return result.length > 0;
  }

  async getVisualization(id: string): Promise<Visualization | undefined> {
    const [viz] = await db.select().from(visualizationsTable).where(eq(visualizationsTable.id, id));
    return viz;
  }

  async getVisualizationsByDashboard(dashboardId: string): Promise<Visualization[]> {
    return db.select().from(visualizationsTable).where(eq(visualizationsTable.dashboardId, dashboardId));
  }

  async createVisualization(viz: InsertVisualization): Promise<Visualization> {
    const [newViz] = await db.insert(visualizationsTable).values(viz as any).returning();
    return newViz;
  }

  async updateVisualization(id: string, updates: Partial<Visualization>): Promise<Visualization | undefined> {
    const [viz] = await db
      .update(visualizationsTable)
      .set(updates)
      .where(eq(visualizationsTable.id, id))
      .returning();
    return viz;
  }

  async deleteVisualization(id: string): Promise<boolean> {
    const result = await db.delete(visualizationsTable).where(eq(visualizationsTable.id, id)).returning();
    return result.length > 0;
  }

  async getSharedDashboard(token: string): Promise<SharedDashboard | undefined> {
    const [share] = await db.select().from(sharedDashboardsTable).where(eq(sharedDashboardsTable.shareToken, token));
    return share;
  }

  async createSharedDashboard(share: InsertSharedDashboard): Promise<SharedDashboard> {
    const [newShare] = await db.insert(sharedDashboardsTable).values(share).returning();
    return newShare;
  }

  async deleteSharedDashboard(id: string): Promise<boolean> {
    const result = await db.delete(sharedDashboardsTable).where(eq(sharedDashboardsTable.id, id)).returning();
    return result.length > 0;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    return conversation;
  }

  async getConversationByProject(projectId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.projectId, projectId));
    return conversation;
  }

  async getConversationByUsers(clientId: string, analystId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(and(eq(conversationsTable.clientId, clientId), eq(conversationsTable.analystId, analystId)));
    return conversation;
  }

  async getConversationsByUser(userId: string, role: string): Promise<Conversation[]> {
    if (role === "client") {
      return db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.clientId, userId))
        .orderBy(desc(conversationsTable.lastMessageAt));
    } else {
      return db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.analystId, userId))
        .orderBy(desc(conversationsTable.lastMessageAt));
    }
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversationsTable).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversationsTable)
      .set(updates)
      .where(eq(conversationsTable.id, id))
      .returning();
    return conversation;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, id));
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messagesTable).values(message).returning();
    
    await db
      .update(conversationsTable)
      .set({ 
        lastMessageAt: new Date(), 
        lastMessagePreview: message.content.substring(0, 100) 
      })
      .where(eq(conversationsTable.id, message.conversationId));
    
    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messagesTable)
      .set({ isRead: true })
      .where(and(
        eq(messagesTable.conversationId, conversationId),
        ne(messagesTable.senderId, userId),
        eq(messagesTable.isRead, false)
      ));
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const messages = await db
      .select()
      .from(messagesTable)
      .where(and(
        eq(messagesTable.conversationId, conversationId),
        ne(messagesTable.senderId, userId),
        eq(messagesTable.isRead, false)
      ));
    return messages.length;
  }
}

export const storage = new DatabaseStorage();
