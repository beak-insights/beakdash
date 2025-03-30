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
// Import OpenAI services dynamically in the routes to avoid circular dependencies

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
  
  // Dataset data route
  app.get(`${apiPrefix}/datasets/:id/data`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dataset = await storage.getDataset(id);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      if (dataset.connectionId === null) {
        return res.status(400).json({ message: "Dataset has no associated connection" });
      }
      
      // Get the connection for this dataset
      const connection = await storage.getConnection(dataset.connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Process data based on connection type
      let data: Record<string, any>[] = [];
      
      if (connection.type === "csv") {
        // Process CSV data
        const { parseCSV } = await import("@/lib/data-adapters");
        const config = connection.config as Record<string, any>;
        
        // Check for data in either csvData or fileContent fields
        const csvContent = config?.csvData || config?.fileContent;
        if (!config || !csvContent) {
          return res.status(400).json({ message: "No CSV data found in connection" });
        }
        
        // Parse the CSV data
        data = parseCSV(csvContent, {
          delimiter: config.delimiter || ',',
          hasHeaders: config.hasHeaders !== false,
          quoteChar: config.quoteChar || '"',
          trimFields: config.trimFields !== false
        });
      } else if (connection.type === "rest") {
        // For demo purposes, we'll return mock data for REST connections
        data = [
          { id: 1, name: "Product A", category: "Electronics", price: 499.99, stock: 120 },
          { id: 2, name: "Product B", category: "Electronics", price: 299.99, stock: 85 },
          { id: 3, name: "Product C", category: "Furniture", price: 199.99, stock: 45 },
          { id: 4, name: "Product D", category: "Clothing", price: 59.99, stock: 200 },
          { id: 5, name: "Product E", category: "Home", price: 149.99, stock: 75 },
        ];
      } else if (connection.type === "sql") {
        // For demo purposes, we'll return mock data for SQL connections
        data = [
          { order_id: 1001, customer_id: 5001, product_id: 101, quantity: 2, total: 999.98, order_date: "2023-01-15" },
          { order_id: 1002, customer_id: 5002, product_id: 102, quantity: 1, total: 299.99, order_date: "2023-01-16" },
          { order_id: 1003, customer_id: 5001, product_id: 103, quantity: 3, total: 599.97, order_date: "2023-01-18" },
          { order_id: 1004, customer_id: 5003, product_id: 101, quantity: 1, total: 499.99, order_date: "2023-01-20" },
          { order_id: 1005, customer_id: 5002, product_id: 104, quantity: 2, total: 119.98, order_date: "2023-01-22" },
        ];
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Get dataset data error:", error);
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
  
  // Dashboard Widget relationship routes
  
  // Get all widgets in a dashboard
  app.get(`${apiPrefix}/dashboards/:id/widgets`, async (req, res) => {
    try {
      const dashboardId = Number(req.params.id);
      const dashboard = await storage.getDashboard(dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widgets = await storage.getDashboardWidgets(dashboardId);
      return res.status(200).json(widgets);
    } catch (error) {
      console.error("Get dashboard widgets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get all dashboards containing a widget
  app.get(`${apiPrefix}/widgets/:id/dashboards`, async (req, res) => {
    try {
      const widgetId = Number(req.params.id);
      const widget = await storage.getWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const dashboards = await storage.getWidgetDashboards(widgetId);
      return res.status(200).json(dashboards);
    } catch (error) {
      console.error("Get widget dashboards error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Add a widget to a dashboard
  app.post(`${apiPrefix}/dashboards/:dashboardId/widgets/:widgetId`, async (req, res) => {
    try {
      const dashboardId = Number(req.params.dashboardId);
      const widgetId = Number(req.params.widgetId);
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const position = req.body.position || {};
      const dashboardWidget = await storage.addWidgetToDashboard(dashboardId, widgetId, position);
      
      return res.status(201).json(dashboardWidget);
    } catch (error) {
      console.error("Add widget to dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Remove a widget from a dashboard
  app.delete(`${apiPrefix}/dashboards/:dashboardId/widgets/:widgetId`, async (req, res) => {
    try {
      const dashboardId = Number(req.params.dashboardId);
      const widgetId = Number(req.params.widgetId);
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const success = await storage.removeWidgetFromDashboard(dashboardId, widgetId);
      
      if (!success) {
        return res.status(404).json({ message: "Widget is not in the specified dashboard" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Remove widget from dashboard error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update widget position in a dashboard
  app.patch(`${apiPrefix}/dashboards/:dashboardId/widgets/:widgetId/position`, async (req, res) => {
    try {
      const dashboardId = Number(req.params.dashboardId);
      const widgetId = Number(req.params.widgetId);
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const position = req.body.position;
      if (!position) {
        return res.status(400).json({ message: "Position data is required" });
      }
      
      const updatedDashboardWidget = await storage.updateWidgetPosition(dashboardId, widgetId, position);
      
      return res.status(200).json(updatedDashboardWidget);
    } catch (error) {
      console.error("Update widget position error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Copilot route
  app.post(`${apiPrefix}/ai/copilot`, async (req, res) => {
    try {
      const { prompt, context, datasetId, chartType, widgetContext } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Import the OpenAI service dynamically
      const { generateAIResponse } = await import("./services/openai");
      
      // Generate a response from OpenAI
      const aiResponse = await generateAIResponse(
        prompt, 
        context || [], 
        datasetId, 
        chartType,
        widgetContext
      );
      
      return res.status(200).json({ 
        response: aiResponse,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("AI Copilot error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chart Recommendation route
  app.post(`${apiPrefix}/ai/chart-recommendation`, async (req, res) => {
    try {
      const { datasetId } = req.body;
      
      if (!datasetId) {
        return res.status(400).json({ message: "Dataset ID is required" });
      }

      // Check if the dataset exists
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }

      // Import the OpenAI service dynamically
      const { generateChartRecommendation } = await import("./services/openai");
      
      // Generate chart recommendations
      const recommendation = await generateChartRecommendation(datasetId);
      
      return res.status(200).json(recommendation);
    } catch (error) {
      console.error("Chart recommendation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chart Improvements route
  app.post(`${apiPrefix}/ai/chart-improvements`, async (req, res) => {
    try {
      const { widgetContext } = req.body;
      
      if (!widgetContext || !widgetContext.id || !widgetContext.type) {
        return res.status(400).json({ message: "Valid widget context is required" });
      }

      // Import the OpenAI service dynamically
      const { generateChartImprovements } = await import("./services/openai");
      
      // Generate chart improvement suggestions
      const improvements = await generateChartImprovements(widgetContext);
      
      return res.status(200).json(improvements);
    } catch (error) {
      console.error("Chart improvements error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI KPI Suggestions route
  app.post(`${apiPrefix}/ai/kpi-suggestions`, async (req, res) => {
    try {
      const { datasetId } = req.body;
      
      if (!datasetId) {
        return res.status(400).json({ message: "Dataset ID is required" });
      }

      // Check if the dataset exists
      const dataset = await storage.getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }

      // Import the OpenAI service dynamically
      const { generateKPISuggestions } = await import("./services/openai");
      
      // Generate KPI widget suggestions
      const suggestions = await generateKPISuggestions(datasetId);
      
      return res.status(200).json(suggestions);
    } catch (error) {
      console.error("KPI suggestions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get SQL Table Schema route (to retrieve column information)
  app.post(`${apiPrefix}/connections/table-schema`, async (req, res) => {
    try {
      const { connectionId, table } = req.body;
      
      if (!connectionId) {
        return res.status(400).json({ message: "Connection ID is required" });
      }
      
      if (!table || typeof table !== 'string') {
        return res.status(400).json({ message: "Table name is required" });
      }
      
      // Check if the connection exists
      const connection = await storage.getConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Get actual table schema from the database
      try {
        // Import the pool from db.ts
        const { pool } = require('./db');
        
        // Query to get column information for a specific table
        const schemaQuery = `
          SELECT 
            column_name as name, 
            data_type as type
          FROM 
            information_schema.columns 
          WHERE 
            table_name = $1
          ORDER BY 
            ordinal_position
        `;
        
        // Execute the query with the table name as a parameter
        const result = await pool.query(schemaQuery, [table]);
        
        // Return the columns
        return res.status(200).json(result.rows);
      } catch (dbError: any) {
        console.error("Get table schema error:", dbError.message);
        
        // If there's an error, return fallback columns
        const fallbackColumns = [
          { name: "id", type: "int" },
          { name: "name", type: "varchar" },
          { name: "created_at", type: "timestamp" },
          { name: "updated_at", type: "timestamp" }
        ];
        return res.status(200).json(fallbackColumns);
      }
      
    } catch (error: any) {
      console.error("Get table schema error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Get SQL Tables route (to retrieve available tables)
  app.get(`${apiPrefix}/connections/:id/tables`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Check if the connection exists
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Get actual tables from the database
      try {
        // Import the pool from db.ts
        const { pool } = require('./db');
        
        // Query to get all tables in the public schema
        const tablesQuery = `
          SELECT 
            table_name
          FROM 
            information_schema.tables 
          WHERE 
            table_schema = 'public'
            AND table_type = 'BASE TABLE'
          ORDER BY 
            table_name
        `;
        
        // Execute the query
        const result = await pool.query(tablesQuery);
        
        // Extract table names from the result
        const tables = result.rows.map((row: any) => row.table_name);
        
        // Return the table names
        return res.status(200).json(tables);
      } catch (dbError: any) {
        console.error("Get tables error:", dbError.message);
        
        // If there's an error, return default tables
        const fallbackTables = [
          "users", 
          "dashboards", 
          "connections", 
          "datasets", 
          "widgets",
          "dashboard_widgets"
        ];
        return res.status(200).json(fallbackTables);
      }
      
    } catch (error: any) {
      console.error("Get SQL tables error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Execute Custom SQL Query route
  app.post(`${apiPrefix}/connections/execute-query`, async (req, res) => {
    try {
      const { connectionId, query } = req.body;
      
      if (!connectionId) {
        return res.status(400).json({ message: "Connection ID is required" });
      }
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Valid SQL query is required" });
      }
      
      // Check if the connection exists
      const connection = await storage.getConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Execute the query on the PostgreSQL database
      // We're using the application's database connection since this is a demo
      // In a real app, you would use the connection parameters from the connection object
      try {
        // Import the pool from db.ts
        const { pool } = require('./db');
        
        // Execute the query
        const result = await pool.query(query);
        
        // Return the results
        return res.status(200).json(result.rows);
      } catch (dbError: any) {
        console.error("Database query error:", dbError.message);
        return res.status(400).json({ 
          message: "SQL query execution failed", 
          error: dbError.message 
        });
      }
    } catch (error) {
      console.error("Execute SQL query error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
