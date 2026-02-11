import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseCSV, inferColumnTypes } from "./csv-parser";
import { nanoid } from "nanoid";
import type { DatasetColumn } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  setupAuth(app);
  registerAuthRoutes(app);

  // Helper function to get authenticated user ID
  const getUserId = (req: Request): string | null => {
    return req.session.userId || null;
  };

  // Role selection endpoint
  app.patch("/api/auth/role", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { role } = req.body;
      if (!role || !["client", "analyst"].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'client' or 'analyst'" });
      }

      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // Datasets API
  app.get("/api/datasets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const projectId = req.query.projectId as string | undefined;
      let datasets: Awaited<ReturnType<typeof storage.getDatasetsByProject>> = [];
      if (projectId) {
        datasets = await storage.getDatasetsByProject(projectId);
      } else if (userId) {
        datasets = await storage.getDatasetsByUser(userId);
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

  app.get("/api/datasets/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.get("/api/datasets/:id/data", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/datasets/upload", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { name, projectId, fileName, csvContent } = req.body;

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
        uploadedBy: userId || "anonymous",
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

  app.delete("/api/datasets/:id", isAuthenticated, async (req: Request, res: Response) => {
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
  app.get("/api/dashboards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const projectId = req.query.projectId as string | undefined;

      let dashboards: Awaited<ReturnType<typeof storage.getDashboardsByProject>> = [];
      if (projectId) {
        dashboards = await storage.getDashboardsByProject(projectId);
      } else if (userId) {
        dashboards = await storage.getDashboardsByUser(userId);
      }
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.get("/api/dashboards/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/dashboards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { name, description, projectId, layout } = req.body;
      const dashboard = await storage.createDashboard({
        name,
        description,
        projectId,
        createdBy: userId!,
        isPublished: false,
        layout,
      });
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  app.patch("/api/dashboards/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.delete("/api/dashboards/:id", isAuthenticated, async (req: Request, res: Response) => {
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
  app.get("/api/visualizations", isAuthenticated, async (req: Request, res: Response) => {
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

  app.get("/api/visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/visualizations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { name, dashboardId, datasetId, chartType, query, config } = req.body;
      const viz = await storage.createVisualization({
        name,
        dashboardId,
        datasetId,
        chartType,
        query,
        config,
        createdBy: userId!,
      });
      res.json(viz);
    } catch (error) {
      res.status(500).json({ error: "Failed to create visualization" });
    }
  });

  app.patch("/api/visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.delete("/api/visualizations/:id", isAuthenticated, async (req: Request, res: Response) => {
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
  app.get("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId!);
      const status = req.query.status as string | undefined;

      let projectsList: Awaited<ReturnType<typeof storage.getProjectsByClient>> = [];
      if (user?.role === "client") {
        projectsList = await storage.getProjectsByClient(userId!);
      } else if (user?.role === "analyst") {
        let projects: any[] = [];
        if (status === "open") {
          projects = await storage.getAllOpenProjects();
        } else {
          projects = await storage.getProjectsByAnalyst(userId!);
        }

        const enriched = await Promise.all(projects.map(async (p) => {
          let clientName = "Unknown Client";
          if (p.clientId) {
            const client = await storage.getUser(p.clientId);
            // Use safe access for user properties
            if (client) clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || "Unknown Client";
          }

          // Fetch counts
          const datasets = await storage.getDatasetsByProject(p.id);
          const dashboards = await storage.getDashboardsByProject(p.id);

          return {
            ...p,
            clientName,
            datasetsCount: datasets.length,
            dashboardsCount: dashboards.length
          };
        }));
        return res.json(enriched);
      } else if (user?.role === "admin") {
        projectsList = await storage.getAllProjects();
      }
      res.json(projectsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { title, description, budget, deadline } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const project = await storage.createProject({
        title,
        description,
        budget,
        deadline: deadline ? new Date(deadline) : null,
        clientId: userId!,
        status: "open",
      });

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Enrich with client details
      let clientName = "Unknown Client";
      if (project.clientId) {
        const client = await storage.getUser(project.clientId);
        if (client) clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || "Unknown Client";
      }

      // Fetch counts or list
      const datasets = await storage.getDatasetsByProject(project.id);
      const dashboards = await storage.getDashboardsByProject(project.id);

      res.json({
        ...project,
        clientName,
        datasetsCount: datasets.length,
        dashboardsCount: dashboards.length,
        // Include full lists if needed, but for now just counts unless UI uses them
        // UI uses tabs for datasets/dashboards which probably fetch their own data via separate API calls?
        // Checking UI: it has tabs. Tabs usually have content.
        // The UI currently just shows placeholders.
        // I will let UI fetch datasets/dashboards separately or use these if implemented.
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Datasets API
  app.get("/api/datasets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const projectId = req.query.projectId as string | undefined;

      let datasets: Awaited<ReturnType<typeof storage.getDatasetsByProject>> = [];
      if (projectId) {
        datasets = await storage.getDatasetsByProject(projectId);
      } else {
        datasets = await storage.getDatasetsByUser(userId!);
      }
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.post("/api/datasets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const dataset = req.body;
      const newDataset = await storage.createDataset({
        ...dataset,
        uploadedBy: userId!,
      });
      res.status(201).json(newDataset);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dataset" });
    }
  });

  // Dashboards API
  app.get("/api/dashboards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const projectId = req.query.projectId as string | undefined;

      let dashboards: Awaited<ReturnType<typeof storage.getDashboardsByProject>> = [];
      if (projectId) {
        dashboards = await storage.getDashboardsByProject(projectId);
      } else {
        dashboards = await storage.getDashboardsByUser(userId!);
      }
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.post("/api/dashboards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { name, description, projectId } = req.body;
      const newDashboard = await storage.createDashboard({
        name,
        description,
        projectId: projectId || null,
        createdBy: userId!,
        layout: { items: [] }, // Initialize with empty layout
        isPublished: false,
      });
      res.status(201).json(newDashboard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  // Visualizations API
  app.get("/api/visualizations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // In a real app, we might filter by user or dashboard.
      // For now, let's fetch all dashboards for the user, then get visualizations for those dashboards.
      // Or if we had a direct 'createdBy' on visualizations.
      // Looking at schema, visualization has dashboardId.
      const userId = getUserId(req);
      const dashboards = await storage.getDashboardsByUser(userId!);
      const dashboardIds = dashboards.map(d => d.id);

      let allViz: any[] = [];
      for (const id of dashboardIds) {
        const vizs = await storage.getVisualizationsByDashboard(id);
        allViz = [...allViz, ...vizs.map(v => ({ ...v, dashboardName: dashboards.find(d => d.id === id)?.name }))];
      }

      res.json(allViz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visualizations" });
    }
  });

  // Applications API
  app.get("/api/applications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId!);
      const projectId = req.query.projectId as string | undefined;

      if (projectId) {
        // Get applications for a specific project (client or admin view)
        const apps = await storage.getApplicationsByProject(projectId);
        // Enrich with analyst info
        const enriched = await Promise.all(
          apps.map(async (app) => {
            const analyst = await storage.getUser(app.analystId);
            return {
              ...app,
              analystName: analyst ? `${analyst.firstName || ''} ${analyst.lastName || ''}`.trim() : 'Unknown',
              analystEmail: analyst?.email || '',
              analystSkills: analyst?.skills || '',
            };
          })
        );
        return res.json(enriched);
      }

      if (user?.role === "analyst") {
        // Get analyst's own applications
        const apps = await storage.getApplicationsByAnalyst(userId!);
        // Enrich with project info
        const enriched = await Promise.all(
          apps.map(async (app) => {
            const project = await storage.getProject(app.projectId);
            let clientName = "Unknown Client";
            if (project?.clientId) {
              const client = await storage.getUser(project.clientId);
              if (client) clientName = `${client.firstName} ${client.lastName}`;
            }

            return {
              ...app,
              projectTitle: project?.title || 'Unknown Project',
              projectBudget: project?.budget,
              projectStatus: project?.status,
              projectDeadline: project?.deadline,
              clientName,
            };
          })
        );
        return res.json(enriched);
      }

      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { projectId, coverLetter, proposedBudget } = req.body;

      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }

      // Check if already applied
      const existing = await storage.getApplicationsByAnalyst(userId!);
      if (existing.some(a => a.projectId === projectId)) {
        return res.status(409).json({ error: "You have already applied to this project" });
      }

      const application = await storage.createApplication({
        projectId,
        analystId: userId!,
        coverLetter: coverLetter || null,
        proposedBudget: proposedBudget || null,
        status: "pending",
      });

      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
      }

      const application = await storage.updateApplication(req.params.id, { status });
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // If accepted, assign analyst to project and update project status
      if (status === "accepted") {
        await storage.updateProject(application.projectId, {
          analystId: application.analystId,
          status: "in_progress",
        });

        // Reject all other pending applications for this project
        const otherApps = await storage.getApplicationsByProject(application.projectId);
        for (const app of otherApps) {
          if (app.id !== application.id && app.status === "pending") {
            await storage.updateApplication(app.id, { status: "rejected" });
          }
        }
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Conversations API
  app.get("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId!);

      if (!userId || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const conversations = await storage.getConversationsByUser(userId, user.role);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId!);
      const { otherUserId, analystName } = req.body;

      if (!otherUserId) {
        return res.status(400).json({ error: "otherUserId is required" });
      }

      const clientId = user?.role === "client" ? userId : otherUserId;
      const analystId = user?.role === "analyst" ? userId : otherUserId;

      let conversation = await storage.getConversationByUsers(clientId!, analystId!);

      if (!conversation) {
        conversation = await storage.createConversation({
          clientId: clientId!,
          analystId: analystId!,
          analystName: analystName || null,
        });
      }

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/project/:projectId", isAuthenticated, async (req: Request, res: Response) => {
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
  app.get("/api/conversations/:conversationId/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId!);
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "content is required" });
      }

      const message = await storage.createMessage({
        conversationId: req.params.conversationId,
        senderId: userId!,
        senderRole: user?.role || "client",
        content,
      });

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/conversations/:conversationId/read", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await storage.markMessagesAsRead(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/conversations/:conversationId/unread", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const count = await storage.getUnreadCount(req.params.conversationId, userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // Admin middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
  };

  // Admin API endpoints
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getAllUsers(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, role } = req.body;
      if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
      }
      const user = await storage.createUser({
        id: nanoid(),
        email,
        firstName,
        lastName,
        role,
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { role, firstName, lastName } = req.body;
      const user = await storage.updateUser(req.params.id, { role, firstName, lastName });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/projects", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const allProjects = await storage.getAllProjects();
      res.json(allProjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.patch("/api/admin/projects/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { analystId, status } = req.body;
      const project = await storage.updateProject(req.params.id, { analystId, status });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.get("/api/admin/datasets", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const allDatasets = await storage.getAllDatasets();
      res.json(allDatasets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/admin/dashboards", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const allDashboards = await storage.getAllDashboards();
      res.json(allDashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  // Admin chat endpoints
  app.get("/api/admin/conversations", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getAdminConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin conversations" });
    }
  });

  app.post("/api/admin/conversations", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const adminUserId = getUserId(req);
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const conversation = await storage.createAdminConversation(adminUserId!, userId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create admin conversation" });
    }
  });

  // Admin Stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Users List (Admin only)
  app.get("/api/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getAllUsers(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });



  return httpServer;
}
