import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDashboardSchema, 
  insertConnectionSchema, 
  insertDatasetSchema, 
  insertWidgetSchema,
  insertUserSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Handle zod validation errors
function handleZodError(error: ZodError, res: Response) {
  return res.status(400).json({ 
    message: "Validation error", 
    errors: error.errors 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

  // Auth routes
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real application, you'd use proper authentication with JWT or sessions
      return res.status(200).json({ 
        id: user.id,
        username: user.username,
        displayName: user.displayName
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const userData = insertUserSchema.safeParse(req.body);
      
      if (!userData.success) {
        return handleZodError(userData.error, res);
      }
      
      const existingUser = await storage.getUserByUsername(userData.data.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData.data);
      
      return res.status(201).json({ 
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get(`${apiPrefix}/dashboards`, async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const dashboards = await storage.getDashboards(userId);
      return res.status(200).json(dashboards);
    } catch (error) {
      console.error("Get dashboards error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/dashboards/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      return res.status(200).json(dashboard);
    } catch (error) {
      console.error("Get dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/dashboards`, async (req, res) => {
    try {
      const dashboardData = insertDashboardSchema.safeParse(req.body);
      
      if (!dashboardData.success) {
        return handleZodError(dashboardData.error, res);
      }
      
      const newDashboard = await storage.createDashboard(dashboardData.data);
      return res.status(201).json(newDashboard);
    } catch (error) {
      console.error("Create dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/dashboards/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const updatedDashboard = await storage.updateDashboard(id, req.body);
      return res.status(200).json(updatedDashboard);
    } catch (error) {
      console.error("Update dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/dashboards/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      await storage.deleteDashboard(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Connection routes
  app.get(`${apiPrefix}/connections`, async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const connections = await storage.getConnections(userId);
      return res.status(200).json(connections);
    } catch (error) {
      console.error("Get connections error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/connections/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      return res.status(200).json(connection);
    } catch (error) {
      console.error("Get connection error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/connections`, async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.safeParse(req.body);
      
      if (!connectionData.success) {
        return handleZodError(connectionData.error, res);
      }
      
      const newConnection = await storage.createConnection(connectionData.data);
      return res.status(201).json(newConnection);
    } catch (error) {
      console.error("Create connection error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/connections/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      const updatedConnection = await storage.updateConnection(id, req.body);
      return res.status(200).json(updatedConnection);
    } catch (error) {
      console.error("Update connection error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/connections/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      await storage.deleteConnection(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete connection error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dataset routes
  app.get(`${apiPrefix}/datasets`, async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const connectionId = req.query.connectionId ? Number(req.query.connectionId) : undefined;
      const datasets = await storage.getDatasets(userId, connectionId);
      return res.status(200).json(datasets);
    } catch (error) {
      console.error("Get datasets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/datasets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      return res.status(200).json(dataset);
    } catch (error) {
      console.error("Get dataset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/datasets`, async (req, res) => {
    try {
      const datasetData = insertDatasetSchema.safeParse(req.body);
      
      if (!datasetData.success) {
        return handleZodError(datasetData.error, res);
      }
      
      const newDataset = await storage.createDataset(datasetData.data);
      return res.status(201).json(newDataset);
    } catch (error) {
      console.error("Create dataset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/datasets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      const updatedDataset = await storage.updateDataset(id, req.body);
      return res.status(200).json(updatedDataset);
    } catch (error) {
      console.error("Update dataset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/datasets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      await storage.deleteDataset(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete dataset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Widget routes
  app.get(`${apiPrefix}/widgets`, async (req, res) => {
    try {
      const dashboardId = req.query.dashboardId ? Number(req.query.dashboardId) : undefined;
      const widgets = await storage.getWidgets(dashboardId);
      return res.status(200).json(widgets);
    } catch (error) {
      console.error("Get widgets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/widgets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const widget = await storage.getWidget(id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      return res.status(200).json(widget);
    } catch (error) {
      console.error("Get widget error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/widgets`, async (req, res) => {
    try {
      const widgetData = insertWidgetSchema.safeParse(req.body);
      
      if (!widgetData.success) {
        return handleZodError(widgetData.error, res);
      }
      
      const newWidget = await storage.createWidget(widgetData.data);
      return res.status(201).json(newWidget);
    } catch (error) {
      console.error("Create widget error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/widgets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const widget = await storage.getWidget(id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const updatedWidget = await storage.updateWidget(id, req.body);
      return res.status(200).json(updatedWidget);
    } catch (error) {
      console.error("Update widget error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/widgets/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const widget = await storage.getWidget(id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      await storage.deleteWidget(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete widget error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Copilot route
  app.post(`${apiPrefix}/ai/copilot`, async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Simplified AI response simulation
      // In a real application, this would integrate with an actual LLM API
      const responses = {
        "chart suggestion": "I recommend using a line chart to visualize this trend data. You can set the x-axis to time intervals and the y-axis to the metric you're tracking.",
        "need help": "I'm here to help! You can ask me about creating widgets, connecting data sources, or visualizing your data.",
        "data analysis": "Based on your data, I notice a positive correlation between these variables. Consider using a scatter plot to visualize this relationship.",
        "default": "How can I assist you with your dashboard today?"
      };
      
      let aiResponse = responses.default;
      const promptLower = prompt.toLowerCase();
      
      if (promptLower.includes("chart") || promptLower.includes("visualization")) {
        aiResponse = responses["chart suggestion"];
      } else if (promptLower.includes("help") || promptLower.includes("how to")) {
        aiResponse = responses["need help"];
      } else if (promptLower.includes("analyze") || promptLower.includes("pattern")) {
        aiResponse = responses["data analysis"];
      }
      
      // Add a small delay to simulate processing
      setTimeout(() => {
        return res.status(200).json({ 
          response: aiResponse,
          timestamp: new Date()
        });
      }, 500);
    } catch (error) {
      console.error("AI Copilot error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
