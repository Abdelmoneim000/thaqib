import { 
  type User, type InsertUser,
  type Project, type InsertProject,
  type Dataset, type InsertDataset,
  type Dashboard, type InsertDashboard,
  type Visualization, type InsertVisualization,
  type SharedDashboard, type InsertSharedDashboard,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  getProjectsByAnalyst(analystId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  getDataset(id: string): Promise<Dataset | undefined>;
  getDatasetsByProject(projectId: string): Promise<Dataset[]>;
  getAllDatasets(): Promise<Dataset[]>;
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
  getConversationsByUser(userId: string, role: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private datasets: Map<string, Dataset>;
  private dashboards: Map<string, Dashboard>;
  private visualizations: Map<string, Visualization>;
  private sharedDashboards: Map<string, SharedDashboard>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.datasets = new Map();
    this.dashboards = new Map();
    this.visualizations = new Map();
    this.sharedDashboards = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    
    this.seedSampleData();
  }

  private seedSampleData() {
    const clientId = "client-1";
    const analystId = "analyst-1";
    
    this.users.set(clientId, { id: clientId, username: "demo-client", password: "demo", role: "client" });
    this.users.set(analystId, { id: analystId, username: "demo-analyst", password: "demo", role: "analyst" });
    
    const projectId = "project-1";
    this.projects.set(projectId, {
      id: projectId,
      title: "TechCorp Sales Analytics",
      description: "Comprehensive sales data analysis for Q1-Q4",
      clientId,
      analystId,
      status: "active",
      budget: 5000,
      createdAt: new Date(),
    });
    
    const salesDatasetId = "dataset-sales";
    this.datasets.set(salesDatasetId, {
      id: salesDatasetId,
      name: "Sales Data Q1-Q4",
      projectId,
      uploadedBy: clientId,
      fileName: "sales_data.csv",
      fileSize: 45000,
      rowCount: 200,
      columns: [
        { name: "date", type: "date", sampleValues: ["2024-01-15", "2024-02-20", "2024-03-10"] },
        { name: "region", type: "string", sampleValues: ["North", "South", "East", "West"] },
        { name: "product", type: "string", sampleValues: ["Widget A", "Widget B"] },
        { name: "revenue", type: "number", sampleValues: [12500, 8900, 15600] },
        { name: "profit", type: "number", sampleValues: [3200, 2100, 4500] },
        { name: "units_sold", type: "number", sampleValues: [150, 89, 210] },
      ],
      data: this.generateSalesData(),
      createdAt: new Date(),
    });
    
    const customerDatasetId = "dataset-customers";
    this.datasets.set(customerDatasetId, {
      id: customerDatasetId,
      name: "Customer Analytics",
      projectId,
      uploadedBy: clientId,
      fileName: "customers.csv",
      fileSize: 32000,
      rowCount: 150,
      columns: [
        { name: "customer_id", type: "string", sampleValues: ["C001", "C002", "C003"] },
        { name: "segment", type: "string", sampleValues: ["Enterprise", "SMB", "Consumer"] },
        { name: "lifetime_value", type: "number", sampleValues: [15000, 4500, 890] },
        { name: "orders", type: "number", sampleValues: [12, 5, 2] },
        { name: "join_date", type: "date", sampleValues: ["2022-03-15", "2023-01-20", "2024-02-10"] },
      ],
      data: this.generateCustomerData(),
      createdAt: new Date(),
    });
    
    const dashboardId = "dashboard-1";
    this.dashboards.set(dashboardId, {
      id: dashboardId,
      name: "Sales Performance Dashboard",
      description: "Key metrics and trends for sales performance",
      projectId,
      createdBy: analystId,
      isPublished: true,
      layout: {
        items: [
          { id: "item-1", visualizationId: "viz-1", x: 0, y: 0, width: 6, height: 2 },
          { id: "item-2", visualizationId: "viz-2", x: 6, y: 0, width: 6, height: 2 },
          { id: "item-3", visualizationId: "viz-3", x: 0, y: 2, width: 6, height: 2 },
          { id: "item-4", visualizationId: "viz-4", x: 6, y: 2, width: 6, height: 2 },
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    this.visualizations.set("viz-1", {
      id: "viz-1",
      name: "Revenue by Region",
      dashboardId,
      datasetId: salesDatasetId,
      chartType: "bar",
      query: { type: "visual", columns: ["region", "revenue"], groupBy: "region", aggregation: { column: "revenue", function: "sum" } },
      config: { xAxis: "region", yAxis: "revenue", categoryField: "region", valueField: "revenue" },
      createdBy: analystId,
      createdAt: new Date(),
    });
    
    this.visualizations.set("viz-2", {
      id: "viz-2",
      name: "Monthly Revenue Trend",
      dashboardId,
      datasetId: salesDatasetId,
      chartType: "line",
      query: { type: "visual", columns: ["date", "revenue"], groupBy: "date" },
      config: { xAxis: "date", yAxis: "revenue" },
      createdBy: analystId,
      createdAt: new Date(),
    });
    
    this.visualizations.set("viz-3", {
      id: "viz-3",
      name: "Product Mix",
      dashboardId,
      datasetId: salesDatasetId,
      chartType: "donut",
      query: { type: "visual", columns: ["product", "revenue"], groupBy: "product", aggregation: { column: "revenue", function: "sum" } },
      config: { categoryField: "product", valueField: "revenue" },
      createdBy: analystId,
      createdAt: new Date(),
    });
    
    this.visualizations.set("viz-4", {
      id: "viz-4",
      name: "Customer Segments",
      dashboardId,
      datasetId: customerDatasetId,
      chartType: "table",
      query: { type: "visual", columns: ["segment", "lifetime_value", "orders"] },
      config: {},
      createdBy: analystId,
      createdAt: new Date(),
    });
  }

  private generateSalesData(): Record<string, unknown>[] {
    const regions = ["North", "South", "East", "West"];
    const products = ["Widget A", "Widget B"];
    const data: Record<string, unknown>[] = [];
    
    for (let month = 1; month <= 4; month++) {
      for (const region of regions) {
        for (const product of products) {
          const revenue = Math.floor(Math.random() * 20000) + 10000;
          const profit = Math.floor(revenue * (0.2 + Math.random() * 0.15));
          data.push({
            date: `2024-0${month}-15`,
            region,
            product,
            revenue,
            profit,
            units_sold: Math.floor(revenue / 100),
          });
        }
      }
    }
    return data;
  }

  private generateCustomerData(): Record<string, unknown>[] {
    const segments = ["Enterprise", "SMB", "Consumer"];
    const data: Record<string, unknown>[] = [];
    
    for (let i = 0; i < 50; i++) {
      const segment = segments[i % 3];
      const baseValue = segment === "Enterprise" ? 10000 : segment === "SMB" ? 3000 : 500;
      data.push({
        customer_id: `C${String(i + 1).padStart(3, "0")}`,
        segment,
        lifetime_value: baseValue + Math.floor(Math.random() * baseValue),
        orders: segment === "Enterprise" ? 10 + Math.floor(Math.random() * 20) : 1 + Math.floor(Math.random() * 10),
        join_date: `202${2 + Math.floor(Math.random() * 3)}-0${1 + Math.floor(Math.random() * 9)}-${10 + Math.floor(Math.random() * 18)}`,
      });
    }
    return data;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { id, role: "analyst", ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.clientId === clientId);
  }

  async getProjectsByAnalyst(analystId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.analystId === analystId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = { 
      id, 
      createdAt: new Date(), 
      status: project.status || "open",
      description: project.description || null,
      analystId: project.analystId || null,
      budget: project.budget || null,
      ...project 
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async getDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async getDatasetsByProject(projectId: string): Promise<Dataset[]> {
    return Array.from(this.datasets.values()).filter(d => d.projectId === projectId);
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const id = randomUUID();
    const newDataset: Dataset = { 
      id, 
      createdAt: new Date(),
      fileSize: dataset.fileSize || null,
      rowCount: dataset.rowCount || null,
      name: dataset.name,
      projectId: dataset.projectId,
      uploadedBy: dataset.uploadedBy,
      fileName: dataset.fileName,
      columns: dataset.columns as any,
      data: dataset.data as Record<string, unknown>[],
    };
    this.datasets.set(id, newDataset);
    return newDataset;
  }

  async deleteDataset(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async getDashboardsByUser(userId: string): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(d => d.createdBy === userId);
  }

  async getDashboardsByProject(projectId: string): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(d => d.projectId === projectId);
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const id = randomUUID();
    const now = new Date();
    const newDashboard: Dashboard = { 
      id, 
      createdAt: now, 
      updatedAt: now,
      name: dashboard.name,
      createdBy: dashboard.createdBy,
      description: dashboard.description || null,
      projectId: dashboard.projectId || null,
      isPublished: dashboard.isPublished || false,
      layout: (dashboard.layout as any) || null,
    };
    this.dashboards.set(id, newDashboard);
    return newDashboard;
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;
    const updated = { ...dashboard, ...updates, updatedAt: new Date() };
    this.dashboards.set(id, updated);
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    return this.dashboards.delete(id);
  }

  async getVisualization(id: string): Promise<Visualization | undefined> {
    return this.visualizations.get(id);
  }

  async getVisualizationsByDashboard(dashboardId: string): Promise<Visualization[]> {
    return Array.from(this.visualizations.values()).filter(v => v.dashboardId === dashboardId);
  }

  async createVisualization(viz: InsertVisualization): Promise<Visualization> {
    const id = randomUUID();
    const newViz: Visualization = { 
      id, 
      createdAt: new Date(),
      name: viz.name,
      chartType: viz.chartType,
      createdBy: viz.createdBy,
      dashboardId: viz.dashboardId || null,
      datasetId: viz.datasetId || null,
      query: (viz.query as any) || null,
      config: (viz.config as any) || null,
    };
    this.visualizations.set(id, newViz);
    return newViz;
  }

  async updateVisualization(id: string, updates: Partial<Visualization>): Promise<Visualization | undefined> {
    const viz = this.visualizations.get(id);
    if (!viz) return undefined;
    const updated = { ...viz, ...updates };
    this.visualizations.set(id, updated);
    return updated;
  }

  async deleteVisualization(id: string): Promise<boolean> {
    return this.visualizations.delete(id);
  }

  async getSharedDashboard(token: string): Promise<SharedDashboard | undefined> {
    return Array.from(this.sharedDashboards.values()).find(s => s.shareToken === token);
  }

  async createSharedDashboard(share: InsertSharedDashboard): Promise<SharedDashboard> {
    const id = randomUUID();
    const newShare: SharedDashboard = { 
      id, 
      createdAt: new Date(),
      dashboardId: share.dashboardId,
      shareToken: share.shareToken,
      expiresAt: share.expiresAt || null,
      allowExport: share.allowExport ?? true,
    };
    this.sharedDashboards.set(id, newShare);
    return newShare;
  }

  async deleteSharedDashboard(id: string): Promise<boolean> {
    return this.sharedDashboards.delete(id);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByProject(projectId: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(c => c.projectId === projectId);
  }

  async getConversationsByUser(userId: string, role: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => 
      role === "client" ? c.clientId === userId : c.analystId === userId
    );
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const newConversation: Conversation = {
      id,
      projectId: conversation.projectId,
      clientId: conversation.clientId,
      analystId: conversation.analystId,
      lastMessageAt: now,
      createdAt: now,
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const newMessage: Message = {
      id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      isRead: false,
      createdAt: now,
    };
    this.messages.set(id, newMessage);
    
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      this.conversations.set(message.conversationId, { ...conversation, lastMessageAt: now });
    }
    
    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    for (const [id, message] of this.messages.entries()) {
      if (message.conversationId === conversationId && message.senderId !== userId && !message.isRead) {
        this.messages.set(id, { ...message, isRead: true });
      }
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId && m.senderId !== userId && !m.isRead)
      .length;
  }
}

export const storage = new MemStorage();
