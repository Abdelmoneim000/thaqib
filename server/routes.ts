import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseCSV, inferColumnTypes } from "./csv-parser";
import { nanoid } from "nanoid";
import type { DatasetColumn } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Datasets API
  app.get("/api/datasets", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      let datasets;
      if (projectId) {
        datasets = await storage.getDatasetsByProject(projectId);
      } else {
        datasets = await storage.getAllDatasets();
      }
      const summary = datasets.map(d => ({
        id: d.id,
        name: d.name,
        projectId: d.projectId,
        fileName: d.fileName,
        rowCount: d.rowCount,
        columns: d.columns,
        createdAt: d.createdAt,
      }));
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/datasets/:id", async (req: Request, res: Response) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dataset" });
    }
  });

  app.get("/api/datasets/:id/data", async (req: Request, res: Response) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      const limit = parseInt(req.query.limit as string) || 1000;
      const offset = parseInt(req.query.offset as string) || 0;
      res.json({
        columns: dataset.columns,
        data: dataset.data.slice(offset, offset + limit),
        totalRows: dataset.data.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dataset data" });
    }
  });

  app.post("/api/datasets/upload", async (req: Request, res: Response) => {
    try {
      const { name, projectId, uploadedBy, fileName, csvContent } = req.body;
      
      if (!csvContent || !name || !projectId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const parsedData = parseCSV(csvContent);
      if (parsedData.length === 0) {
        return res.status(400).json({ error: "CSV file is empty or invalid" });
      }

      const columns = inferColumnTypes(parsedData);
      
      const dataset = await storage.createDataset({
        name,
        projectId,
        uploadedBy: uploadedBy || "anonymous",
        fileName: fileName || "uploaded.csv",
        fileSize: csvContent.length,
        rowCount: parsedData.length,
        columns,
        data: parsedData,
      });

      res.json({
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rowCount,
        columns: dataset.columns,
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Failed to upload dataset" });
    }
  });

  app.delete("/api/datasets/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteDataset(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dataset" });
    }
  });

  // Dashboards API
  app.get("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const projectId = req.query.projectId as string | undefined;
      
      let dashboards;
      if (projectId) {
        dashboards = await storage.getDashboardsByProject(projectId);
      } else if (userId) {
        dashboards = await storage.getDashboardsByUser(userId);
      } else {
        dashboards = await storage.getDashboardsByUser("analyst-1");
      }
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.get("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.post("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const { name, description, projectId, createdBy, layout } = req.body;
      const dashboard = await storage.createDashboard({
        name,
        description,
        projectId,
        createdBy: createdBy || "analyst-1",
        isPublished: false,
        layout,
      });
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  app.patch("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const dashboard = await storage.updateDashboard(req.params.id, req.body);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteDashboard(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  // Visualizations API
  app.get("/api/visualizations", async (req: Request, res: Response) => {
    try {
      const dashboardId = req.query.dashboardId as string;
      if (!dashboardId) {
        return res.status(400).json({ error: "dashboardId is required" });
      }
      const visualizations = await storage.getVisualizationsByDashboard(dashboardId);
      res.json(visualizations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visualizations" });
    }
  });

  app.get("/api/visualizations/:id", async (req: Request, res: Response) => {
    try {
      const viz = await storage.getVisualization(req.params.id);
      if (!viz) {
        return res.status(404).json({ error: "Visualization not found" });
      }
      res.json(viz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visualization" });
    }
  });

  app.post("/api/visualizations", async (req: Request, res: Response) => {
    try {
      const { name, dashboardId, datasetId, chartType, query, config, createdBy } = req.body;
      const viz = await storage.createVisualization({
        name,
        dashboardId,
        datasetId,
        chartType,
        query,
        config,
        createdBy: createdBy || "analyst-1",
      });
      res.json(viz);
    } catch (error) {
      res.status(500).json({ error: "Failed to create visualization" });
    }
  });

  app.patch("/api/visualizations/:id", async (req: Request, res: Response) => {
    try {
      const viz = await storage.updateVisualization(req.params.id, req.body);
      if (!viz) {
        return res.status(404).json({ error: "Visualization not found" });
      }
      res.json(viz);
    } catch (error) {
      res.status(500).json({ error: "Failed to update visualization" });
    }
  });

  app.delete("/api/visualizations/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteVisualization(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Visualization not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete visualization" });
    }
  });

  // Query execution endpoint
  app.post("/api/query", async (req: Request, res: Response) => {
    try {
      const { datasetId, query } = req.body;
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      let result = [...dataset.data];

      if (query.type === "visual") {
        if (query.filters && query.filters.length > 0) {
          for (const filter of query.filters) {
            result = result.filter((row: Record<string, unknown>) => {
              const value = row[filter.column];
              const filterValue = filter.value;
              switch (filter.operator) {
                case "equals": return String(value) === filterValue;
                case "contains": return String(value).includes(filterValue);
                case "greater_than": return Number(value) > Number(filterValue);
                case "less_than": return Number(value) < Number(filterValue);
                default: return true;
              }
            });
          }
        }

        if (query.groupBy && query.aggregation) {
          const grouped = new Map<string, Record<string, unknown>[]>();
          for (const row of result) {
            const key = String(row[query.groupBy]);
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(row);
          }

          result = Array.from(grouped.entries()).map(([key, rows]) => {
            const aggValue = rows.reduce((sum, row) => {
              const val = Number(row[query.aggregation.column]) || 0;
              return sum + val;
            }, 0);

            let finalValue = aggValue;
            if (query.aggregation.function === "avg") {
              finalValue = aggValue / rows.length;
            } else if (query.aggregation.function === "count") {
              finalValue = rows.length;
            } else if (query.aggregation.function === "max") {
              finalValue = Math.max(...rows.map(r => Number(r[query.aggregation.column]) || 0));
            } else if (query.aggregation.function === "min") {
              finalValue = Math.min(...rows.map(r => Number(r[query.aggregation.column]) || 0));
            }

            return {
              [query.groupBy]: key,
              [query.aggregation.column]: finalValue,
            };
          });
        }

        if (query.columns && query.columns.length > 0 && !query.groupBy) {
          result = result.map((row: Record<string, unknown>) => {
            const filtered: Record<string, unknown> = {};
            for (const col of query.columns) {
              filtered[col] = row[col];
            }
            return filtered;
          });
        }
      }

      res.json({ data: result, rowCount: result.length });
    } catch (error) {
      console.error("Query error:", error);
      res.status(500).json({ error: "Query execution failed" });
    }
  });

  // Sharing API
  app.post("/api/dashboards/:id/share", async (req: Request, res: Response) => {
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }

      const shareToken = nanoid(12);
      const { expiresInDays, allowExport } = req.body;
      
      let expiresAt = null;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      const share = await storage.createSharedDashboard({
        dashboardId: req.params.id,
        shareToken,
        expiresAt,
        allowExport: allowExport !== false,
      });

      res.json({
        shareUrl: `/shared/${shareToken}`,
        token: shareToken,
        expiresAt: share.expiresAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  app.get("/api/shared/:token", async (req: Request, res: Response) => {
    try {
      const share = await storage.getSharedDashboard(req.params.token);
      if (!share) {
        return res.status(404).json({ error: "Share link not found" });
      }

      if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
        return res.status(410).json({ error: "Share link has expired" });
      }

      const dashboard = await storage.getDashboard(share.dashboardId);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }

      const visualizations = await storage.getVisualizationsByDashboard(share.dashboardId);
      
      const vizData: Record<string, unknown[]> = {};
      for (const viz of visualizations) {
        if (viz.datasetId) {
          const dataset = await storage.getDataset(viz.datasetId);
          if (dataset) {
            vizData[viz.id] = dataset.data;
          }
        }
      }

      res.json({
        dashboard,
        visualizations,
        data: vizData,
        allowExport: share.allowExport,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shared dashboard" });
    }
  });

  // Projects API
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId as string;
      const analystId = req.query.analystId as string;
      
      let projects;
      if (clientId) {
        projects = await storage.getProjectsByClient(clientId);
      } else if (analystId) {
        projects = await storage.getProjectsByAnalyst(analystId);
      } else {
        projects = await storage.getProjectsByClient("client-1");
      }
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const role = req.query.role as string;
      
      if (!userId || !role) {
        return res.status(400).json({ error: "userId and role are required" });
      }
      
      const conversations = await storage.getConversationsByUser(userId, role);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/project/:projectId", async (req: Request, res: Response) => {
    try {
      let conversation = await storage.getConversationByProject(req.params.projectId);
      
      if (!conversation) {
        const project = await storage.getProject(req.params.projectId);
        if (!project || !project.analystId) {
          return res.status(404).json({ error: "Project not found or no analyst assigned" });
        }
        
        conversation = await storage.createConversation({
          projectId: project.id,
          clientId: project.clientId,
          analystId: project.analystId,
        });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Messages API
  app.get("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const { senderId, senderRole, content } = req.body;
      
      if (!senderId || !senderRole || !content) {
        return res.status(400).json({ error: "senderId, senderRole, and content are required" });
      }
      
      const message = await storage.createMessage({
        conversationId: req.params.conversationId,
        senderId,
        senderRole,
        content,
      });
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/conversations/:conversationId/read", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      await storage.markMessagesAsRead(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/conversations/:conversationId/unread", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const count = await storage.getUnreadCount(req.params.conversationId, userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  return httpServer;
}
