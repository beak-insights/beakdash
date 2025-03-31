import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { 
  insertDashboardSchema, 
  insertConnectionSchema, 
  insertDatasetSchema, 
  insertWidgetSchema,
  insertUserSchema,
  chartTypes
} from "@shared/schema";
import { ZodError } from "zod";
import { WebSocketServer, WebSocket } from "ws";

// Extended WebSocket interface with additional properties
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}
// Import OpenAI services dynamically in the routes to avoid circular dependencies

// Handle zod validation errors
function handleZodError(error: ZodError, res: Response) {
  return res.status(400).json({ 
    message: "Validation error", 
    errors: error.errors 
  });
}

// Helper function to build PostgreSQL connection string
function buildPgConnectionString(config: Record<string, any>): string | null {
  const host = config.host || 'localhost';
  const port = config.port || config.dbPort || 5432;
  const database = config.database;
  // Support both user and username properties for better compatibility
  const user = config.user || config.username;
  const password = config.password;
  
  if (!database || !user) {
    return null;
  }
  
  return `postgres://${user}:${password}@${host}:${port}/${database}`;
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
      
      // Update last login time
      await storage.updateLastLogin(user.id);
      
      // In a real application, you'd use proper authentication with JWT or sessions
      return res.status(200).json({ 
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        theme: user.theme,
        language: user.language,
        timeZone: user.timeZone,
        role: user.role,
        avatarUrl: user.avatarUrl
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
      
      // Set the last login time for the new user
      await storage.updateLastLogin(newUser.id);
      
      return res.status(201).json({ 
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email,
        theme: newUser.theme,
        language: newUser.language,
        timeZone: newUser.timeZone,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user profile
  app.get(`${apiPrefix}/user/profile/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        theme: user.theme,
        language: user.language,
        timeZone: user.timeZone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Get user profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update user profile
  app.put(`${apiPrefix}/user/profile/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        theme: updatedUser.theme,
        language: updatedUser.language,
        timeZone: updatedUser.timeZone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error("Update user profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user settings
  app.get(`${apiPrefix}/user/settings/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const settings = await storage.getUserSettings(id);
      
      if (!settings) {
        return res.status(404).json({ message: "User settings not found" });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Get user settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update user settings
  app.put(`${apiPrefix}/user/settings/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, {
        settings: req.body
      });
      
      return res.status(200).json(updatedUser.settings);
    } catch (error) {
      console.error("Update user settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get(`${apiPrefix}/dashboards`, async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const spaceId = req.query.spaceId ? Number(req.query.spaceId) : undefined;
      const dashboards = await storage.getDashboards(userId, spaceId);
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
      const spaceId = req.query.spaceId ? Number(req.query.spaceId) : undefined;
      const connections = await storage.getConnections(userId, spaceId);
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
      const spaceId = req.query.spaceId ? Number(req.query.spaceId) : undefined;
      
      // First get connections if spaceId is specified but connectionId is not
      if (spaceId && !connectionId) {
        // Get all connections for this space
        const spaceConnections = await storage.getConnections(userId, spaceId);
        // Extract connection IDs
        const connectionIds = spaceConnections.map(conn => conn.id);
        // Get datasets for these connections
        if (connectionIds.length > 0) {
          // For simplicity, we'll get datasets for the first connection only
          // In a production app, you might want to get for all connections and merge
          const datasets = await storage.getDatasets(userId, connectionIds[0]);
          return res.status(200).json(datasets);
        }
        // No connections in this space
        return res.status(200).json([]);
      } else {
        // Normal case - get datasets directly
        const datasets = await storage.getDatasets(userId, connectionId);
        return res.status(200).json(datasets);
      }
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
  
  // Execute query against a dataset
  app.post(`${apiPrefix}/datasets/:id/execute`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Valid SQL query is required" });
      }
      
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
      
      // Only SQL connections supported for custom queries
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Custom queries are only supported for SQL connections" });
      }
      
      try {
        // Extract connection configuration
        const config = connection.config as Record<string, any>;
        if (!config) {
          return res.status(400).json({ message: "Connection configuration is missing" });
        }
        
        // Create a temporary connection to the target database
        const pg = await import('pg');
        
        // Build connection string from config
        let connectionString = '';
        if (config.connectionString) {
          connectionString = config.connectionString;
        } else {
          const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;
        }
        
        // Create temporary connection pool
        const tempPool = new pg.default.Pool({ connectionString });
        
        try {
          // If the dataset has a defined query, use it as a CTE (Common Table Expression)
          let sqlQuery = query;
          
          if (dataset.query) {
            // Wrap the dataset query in a CTE and use the user's query against it
            sqlQuery = `WITH dataset_${dataset.id} AS (${dataset.query}) ${query}`;
          }
          
          console.log(`Executing custom SQL query against dataset ID ${dataset.id}: ${sqlQuery}`);
          
          // Execute the query using the connection-specific pool
          const result = await tempPool.query(sqlQuery);
          
          // Return the results
          return res.status(200).json(result.rows);
        } finally {
          // Always close the temporary pool
          await tempPool.end();
        }
      } catch (dbError: any) {
        console.error("Database query error:", dbError.message);
        return res.status(400).json({ 
          message: "SQL query execution failed", 
          error: dbError.message 
        });
      }
    } catch (error) {
      console.error("Execute dataset query error:", error);
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
        try {
          // Get the connection config
          const config = connection.config as Record<string, any>;
          if (!config || !config.url) {
            return res.status(400).json({ message: "REST connection URL is missing" });
          }
          
          // Create fetch options with headers if provided
          const fetchOptions: RequestInit = {};
          if (config.headers) {
            fetchOptions.headers = config.headers;
          }
          
          // Add authentication if provided
          if (config.auth) {
            if (config.auth.type === 'basic') {
              const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
              fetchOptions.headers = {
                ...fetchOptions.headers,
                'Authorization': `Basic ${credentials}`
              };
            } else if (config.auth.type === 'bearer' && config.auth.token) {
              fetchOptions.headers = {
                ...fetchOptions.headers,
                'Authorization': `Bearer ${config.auth.token}`
              };
            }
          }
          
          // Set the method (default to GET)
          fetchOptions.method = config.method || 'GET';
          
          // Add body for POST, PUT, PATCH methods
          if (fetchOptions.method && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method) && config.body) {
            fetchOptions.body = JSON.stringify(config.body);
            fetchOptions.headers = {
              ...fetchOptions.headers,
              'Content-Type': 'application/json'
            };
          }
          
          console.log(`Making REST API request to: ${config.url}`);
          
          // Make the request
          const response = await fetch(config.url, fetchOptions);
          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
          }
          
          // Parse the response
          const jsonResponse = await response.json();
          
          // Extract data using the result path if provided
          const { extractRESTData } = await import("@/lib/data-adapters");
          data = extractRESTData(jsonResponse, {
            resultPath: config.resultPath
          });
        } catch (apiError: any) {
          console.error("REST API request error:", apiError.message);
          return res.status(400).json({ 
            message: "REST API request failed", 
            error: apiError.message 
          });
        }
      } else if (connection.type === "sql") {
        try {
          // Extract connection configuration
          const config = connection.config as Record<string, any>;
          if (!config) {
            return res.status(400).json({ message: "Connection configuration is missing" });
          }
          
          // Create a temporary connection to the target database
          const pg = await import('pg');
          
          // Build connection string from config
          let connectionString = '';
          if (config.connectionString) {
            connectionString = config.connectionString;
          } else {
            const host = config.host || 'localhost';
            const port = config.port || config.dbPort || 5432;
            const database = config.database;
            // Support both user and username properties
            const user = config.user || config.username;
            const password = config.password;
            
            if (!database || !user) {
              return res.status(400).json({ 
                message: "Connection configuration is incomplete. Database and user are required."
              });
            }
            
            connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
          }
          
          // Create temporary connection pool
          const tempPool = new pg.default.Pool({ connectionString });
          
          try {
            // Determine which query to execute
            let sqlQuery = "SELECT * FROM users LIMIT 100"; // Default query as fallback
            
            // Check if the dataset has a custom query
            if (dataset.query) {
              sqlQuery = dataset.query;
            } else if (dataset.config && typeof dataset.config === 'object') {
              // If there's a table specified in the config
              const datasetConfig = dataset.config as Record<string, any>;
              if (datasetConfig.table) {
                sqlQuery = `SELECT * FROM ${datasetConfig.table} LIMIT 100`;
              }
            }
            
            // Check for widget customQuery if provided in the request
            const { customQuery } = req.query;
            if (customQuery && typeof customQuery === 'string') {
              sqlQuery = customQuery;
            }
            
            console.log(`Executing SQL query on connection ID ${connection.id}: ${sqlQuery}`);
            
            // Execute the query using the connection-specific pool  
            const result = await tempPool.query(sqlQuery);
            
            // Return the actual data from the database
            data = result.rows;
          } finally {
            // Always close the temporary pool
            await tempPool.end();
          }
        } catch (dbError: any) {
          console.error("Database query error:", dbError.message);
          return res.status(400).json({ 
            message: "SQL query execution failed", 
            error: dbError.message 
          });
        }
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
      const spaceId = req.query.spaceId ? Number(req.query.spaceId) : undefined;
      
      // If spaceId is provided but dashboardId is not, get all widgets associated with dashboards in this space
      if (spaceId && !dashboardId) {
        // Get all dashboards for this space
        const dashboards = await storage.getDashboards(undefined, spaceId);
        
        if (dashboards.length > 0) {
          // Get all widgets for the first dashboard (simplified approach)
          // In a production app, you might want to get widgets for all dashboards and merge
          const widgets = await storage.getWidgets(dashboards[0].id);
          return res.status(200).json(widgets);
        }
        // No dashboards in this space
        return res.status(200).json([]);
      } else {
        // Normal case - get widgets directly by dashboard ID
        const widgets = await storage.getWidgets(dashboardId);
        return res.status(200).json(widgets);
      }
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
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid widget ID" });
      }
      
      const widget = await storage.getWidget(id);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Handle the case where we're switching between dataset and custom query
      const updateData = { ...req.body };
      
      // If we're using a custom query, make sure datasetId is null and vice versa
      if (updateData.customQuery && updateData.customQuery.trim() !== '') {
        // Using custom query - ensure proper fields are set
        if (updateData.connectionId === undefined && widget.connectionId) {
          // Keep existing connectionId if not provided
          updateData.connectionId = widget.connectionId;
        }
        // Ensure datasetId is null when using custom query
        updateData.datasetId = null;
      } else if (updateData.datasetId) {
        // Using dataset - ensure proper fields are set
        updateData.customQuery = null;
        updateData.connectionId = null;
      }
      
      // Ensure type is one of the allowed chart types
      if (updateData.type && !chartTypes.includes(updateData.type)) {
        return res.status(400).json({ 
          message: "Invalid chart type", 
          allowedTypes: chartTypes 
        });
      }
      
      console.log("Updating widget with data:", updateData);
      const updatedWidget = await storage.updateWidget(id, updateData);
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
      
      // Validate numeric parameters
      if (isNaN(dashboardId) || dashboardId <= 0) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      if (isNaN(widgetId) || widgetId <= 0) {
        return res.status(400).json({ message: "Invalid widget ID" });
      }
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Ensure we have a valid position object
      const position = req.body.position || { x: 0, y: 0, w: 3, h: 2 };
      
      try {
        const dashboardWidget = await storage.addWidgetToDashboard(dashboardId, widgetId, position);
        return res.status(201).json(dashboardWidget);
      } catch (storageError: any) {
        console.error("Storage error when adding widget to dashboard:", storageError);
        return res.status(400).json({ 
          message: "Failed to add widget to dashboard",
          details: storageError.message || "Unknown error" 
        });
      }
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
      
      // Validate numeric parameters
      if (isNaN(dashboardId) || dashboardId <= 0) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      if (isNaN(widgetId) || widgetId <= 0) {
        return res.status(400).json({ message: "Invalid widget ID" });
      }
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      try {
        const success = await storage.removeWidgetFromDashboard(dashboardId, widgetId);
        
        if (!success) {
          return res.status(404).json({ message: "Widget is not in the specified dashboard" });
        }
        
        return res.status(204).send();
      } catch (storageError: any) {
        console.error("Storage error when removing widget from dashboard:", storageError);
        return res.status(400).json({ 
          message: "Failed to remove widget from dashboard",
          details: storageError.message || "Unknown error" 
        });
      }
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
      
      // Validate numeric parameters
      if (isNaN(dashboardId) || dashboardId <= 0) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      if (isNaN(widgetId) || widgetId <= 0) {
        return res.status(400).json({ message: "Invalid widget ID" });
      }
      
      const dashboard = await storage.getDashboard(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const widget = await storage.getWidget(widgetId);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const position = req.body.position || { x: 0, y: 0, w: 3, h: 2 };
      
      try {
        const updatedDashboardWidget = await storage.updateWidgetPosition(dashboardId, widgetId, position);
        return res.status(200).json(updatedDashboardWidget);
      } catch (storageError: any) {
        console.error("Storage error when updating widget position:", storageError);
        return res.status(400).json({ 
          message: "Failed to update widget position",
          details: storageError.message || "Unknown error"
        });
      }
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
      
      // Validate numeric parameters
      const connId = Number(connectionId);
      if (isNaN(connId) || connId <= 0) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      if (!table || typeof table !== 'string') {
        return res.status(400).json({ message: "Table name is required" });
      }
      
      // Check if the connection exists
      const connection = await storage.getConnection(connId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Get actual table schema from the connection's database
      try {
        // Extract connection configuration
        const config = connection.config as Record<string, any>;
        if (!config) {
          return res.status(400).json({ message: "Connection configuration is missing" });
        }
        
        // Create a temporary connection to the target database
        const pg = await import('pg');
        
        // Build connection string from config
        let connectionString = '';
        if (config.connectionString) {
          connectionString = config.connectionString;
        } else {
          const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;
        }
        
        // Create temporary connection pool
        const tempPool = new pg.default.Pool({ connectionString });
        
        try {
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
          const result = await tempPool.query(schemaQuery, [table]);
          
          // Return the columns
          return res.status(200).json(result.rows);
        } finally {
          // Always close the temporary pool
          await tempPool.end();
        }
      } catch (dbError: any) {
        console.error("Get table schema error:", dbError.message);
        return res.status(400).json({ 
          message: "Failed to retrieve table schema", 
          error: dbError.message 
        });
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
      
      // Validate numeric parameters
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      // Check if the connection exists
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Get actual tables from the connection's database
      try {
        // Extract connection configuration
        const config = connection.config as Record<string, any>;
        if (!config) {
          return res.status(400).json({ message: "Connection configuration is missing" });
        }
        
        // Create a temporary connection to the target database
        const pg = await import('pg');
        
        // Build connection string from config
        let connectionString = '';
        if (config.connectionString) {
          connectionString = config.connectionString;
        } else {
          const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;
        }
        
        // Create temporary connection pool
        const tempPool = new pg.default.Pool({ connectionString });
        
        try {
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
          const result = await tempPool.query(tablesQuery);
          
          // Extract table names from the result
          const tables = result.rows.map((row: any) => row.table_name);
          
          // Return the table names
          return res.status(200).json(tables);
        } finally {
          // Always close the temporary pool
          await tempPool.end();
        }
      } catch (dbError: any) {
        console.error("Get tables error:", dbError.message);
        return res.status(400).json({ 
          message: "Failed to retrieve database tables", 
          error: dbError.message 
        });
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
      
      // Validate numeric parameters
      const connId = Number(connectionId);
      if (isNaN(connId) || connId <= 0) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Valid SQL query is required" });
      }
      
      // Check if the connection exists
      const connection = await storage.getConnection(connId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Execute the query on the connection's database
      try {
        // Extract connection configuration
        const config = connection.config as Record<string, any>;
        if (!config) {
          return res.status(400).json({ message: "Connection configuration is missing" });
        }
        
        // Create a temporary connection to the target database
        const pg = await import('pg');
        
        // Build connection string from config
        let connectionString = '';
        if (config.connectionString) {
          connectionString = config.connectionString;
        } else {
          const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;
        }
        
        // Create temporary connection pool
        const tempPool = new pg.default.Pool({ connectionString });
        
        try {
          console.log(`Executing SQL query on connection ${connId}: ${query}`);
          
          // Execute the query
          const result = await tempPool.query(query);
          
          // Return the results
          return res.status(200).json(result.rows);
        } finally {
          // Always close the temporary pool
          await tempPool.end();
        }
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
  
  // Setup WebSocket server on a distinct path to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Add connection timeout
    clientTracking: true,
    // Add error handlers
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Below options are passed to zlib for efficiency
      concurrencyLimit: 10,
      threshold: 1024 // Only compress messages larger than 1KB
    }
  });
  
  // Handle server-level errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
    // Prevent server crash by catching all errors
  });
  
  // Setup ping interval to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000); // Send ping every 30 seconds
  
  wss.on('connection', async (rawSocket, req) => {
    console.log('WebSocket client connected');
    
    // Type cast to our extended WebSocket interface
    const socket = rawSocket as ExtendedWebSocket;
    
    // Set a timeout to ensure connections don't stay open indefinitely without activity
    socket.isAlive = true;
    
    // Monitor pong responses to detect dead connections
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    
    // Import the OpenAI service to register the socket
    const { registerWebSocketClient, unregisterWebSocketClient } = await import("./services/openai");
    
    // Initialize the "isAlive" property required by the ExtendedWebSocket interface
    socket.isAlive = true;
    
    // Register this socket with the OpenAI service for broadcasting
    registerWebSocketClient(socket);
    
    // Send welcome message
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ 
        type: 'connection',
        message: 'Connected to BeakDash WebSocket server',
        timestamp: new Date().toISOString()
      }));
    }
    
    // Handle messages from clients
    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
        
        // Handle ping messages for connection latency measurement
        if (message.type === 'ping') {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString(),
              pingTime: message.timestamp
            }));
            return;
          }
        }
        
        // Handle space-related messages
        if (message.type === 'space_switch') {
          // Client is switching to a different space
          const { userId, spaceId } = message;
          
          if (userId && spaceId) {
            try {
              // Verify user has access to this space
              const hasAccess = await storage.isUserInSpace(userId, spaceId);
              
              if (hasAccess) {
                // Get space details
                const space = await storage.getSpace(spaceId);
                
                if (space) {
                  // Send space data back to client
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                      type: 'space_switch_success',
                      space,
                      timestamp: new Date().toISOString()
                    }));
                  }
                  return;
                }
              }
              
              // Space not found or user doesn't have access
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'space_switch_error',
                  message: 'Space not found or access denied',
                  timestamp: new Date().toISOString()
                }));
              }
              return;
            } catch (error) {
              console.error('Error processing space switch:', error);
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'space_switch_error',
                  message: 'Failed to switch space',
                  timestamp: new Date().toISOString()
                }));
              }
              return;
            }
          }
        }
        
        // Echo other messages back to the client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'echo',
            data: message,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      }
    });
    
    // Handle client disconnection with proper cleanup
    socket.on('close', () => {
      console.log('WebSocket client disconnected');
      // Clean up by unregistering the client
      unregisterWebSocketClient(socket);
      socket.isAlive = false;
    });
    
    // Handle errors with logging and cleanup
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Clean up when error occurs
      unregisterWebSocketClient(socket);
      socket.isAlive = false;
      // Attempt to close the socket if not already closed
      if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
        socket.terminate();
      }
    });
  });
  
  return httpServer;
}
