import {
  users, type User, type InsertUser,
  dashboards, type Dashboard, type InsertDashboard,
  connections, type Connection, type InsertConnection,
  datasets, type Dataset, type InsertDataset,
  widgets, type Widget, type InsertWidget
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Dashboard operations
  getDashboards(userId?: number): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard>;
  deleteDashboard(id: number): Promise<boolean>;

  // Connection operations
  getConnections(userId?: number): Promise<Connection[]>;
  getConnection(id: number): Promise<Connection | undefined>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, connection: Partial<Connection>): Promise<Connection>;
  deleteConnection(id: number): Promise<boolean>;

  // Dataset operations
  getDatasets(userId?: number, connectionId?: number): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: number, dataset: Partial<Dataset>): Promise<Dataset>;
  deleteDataset(id: number): Promise<boolean>;

  // Widget operations
  getWidgets(dashboardId?: number): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, widget: Partial<Widget>): Promise<Widget>;
  deleteWidget(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName || null,
      avatarUrl: insertUser.avatarUrl || null
    }).returning();
    return result[0];
  }

  // Dashboard operations
  async getDashboards(userId?: number): Promise<Dashboard[]> {
    if (userId) {
      return await db.select().from(dashboards).where(eq(dashboards.userId, userId)).orderBy(desc(dashboards.createdAt));
    }
    return await db.select().from(dashboards).orderBy(desc(dashboards.createdAt));
  }

  async getDashboard(id: number): Promise<Dashboard | undefined> {
    const result = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return result[0];
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const result = await db.insert(dashboards).values({
      name: dashboard.name,
      userId: dashboard.userId || null,
      description: dashboard.description || null,
      layout: dashboard.layout || {}
    }).returning();
    return result[0];
  }

  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const result = await db.update(dashboards)
      .set({
        ...dashboard,
        updatedAt: new Date()
      })
      .where(eq(dashboards.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Dashboard with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteDashboard(id: number): Promise<boolean> {
    const result = await db.delete(dashboards).where(eq(dashboards.id, id)).returning();
    return result.length > 0;
  }

  // Connection operations
  async getConnections(userId?: number): Promise<Connection[]> {
    if (userId) {
      return await db.select().from(connections).where(eq(connections.userId, userId)).orderBy(desc(connections.createdAt));
    }
    return await db.select().from(connections).orderBy(desc(connections.createdAt));
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const result = await db.select().from(connections).where(eq(connections.id, id));
    return result[0];
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const result = await db.insert(connections).values({
      name: connection.name,
      type: connection.type,
      config: connection.config,
      userId: connection.userId || null
    }).returning();
    return result[0];
  }

  async updateConnection(id: number, connection: Partial<Connection>): Promise<Connection> {
    const result = await db.update(connections)
      .set({
        ...connection,
        updatedAt: new Date()
      })
      .where(eq(connections.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Connection with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteConnection(id: number): Promise<boolean> {
    const result = await db.delete(connections).where(eq(connections.id, id)).returning();
    return result.length > 0;
  }

  // Dataset operations
  async getDatasets(userId?: number, connectionId?: number): Promise<Dataset[]> {
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(datasets.userId, userId));
    }
    
    if (connectionId) {
      conditions.push(eq(datasets.connectionId, connectionId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(datasets).where(and(...conditions)).orderBy(desc(datasets.createdAt));
    }
    
    return await db.select().from(datasets).orderBy(desc(datasets.createdAt));
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const result = await db.select().from(datasets).where(eq(datasets.id, id));
    return result[0];
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const result = await db.insert(datasets).values({
      name: dataset.name,
      userId: dataset.userId || null,
      connectionId: dataset.connectionId || null,
      query: dataset.query || null,
      refreshInterval: dataset.refreshInterval || null,
      config: dataset.config || {}
    }).returning();
    return result[0];
  }

  async updateDataset(id: number, dataset: Partial<Dataset>): Promise<Dataset> {
    const result = await db.update(datasets)
      .set({
        ...dataset,
        updatedAt: new Date()
      })
      .where(eq(datasets.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteDataset(id: number): Promise<boolean> {
    const result = await db.delete(datasets).where(eq(datasets.id, id)).returning();
    return result.length > 0;
  }

  // Widget operations
  async getWidgets(dashboardId?: number): Promise<Widget[]> {
    if (dashboardId) {
      return await db.select().from(widgets).where(eq(widgets.dashboardId, dashboardId)).orderBy(desc(widgets.createdAt));
    }
    return await db.select().from(widgets).orderBy(desc(widgets.createdAt));
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    const result = await db.select().from(widgets).where(eq(widgets.id, id));
    return result[0];
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const result = await db.insert(widgets).values({
      name: widget.name,
      type: widget.type,
      dashboardId: widget.dashboardId || null,
      datasetId: widget.datasetId || null,
      position: widget.position || {},
      config: widget.config || {}
    }).returning();
    return result[0];
  }

  async updateWidget(id: number, widget: Partial<Widget>): Promise<Widget> {
    const result = await db.update(widgets)
      .set({
        ...widget,
        updatedAt: new Date()
      })
      .where(eq(widgets.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Widget with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteWidget(id: number): Promise<boolean> {
    const result = await db.delete(widgets).where(eq(widgets.id, id)).returning();
    return result.length > 0;
  }
}

// Create a demo user if it doesn't exist
async function setupDemoUser() {
  try {
    const existingUser = await db.select().from(users).where(eq(users.username, "demo"));
    if (existingUser.length === 0) {
      await db.insert(users).values({
        username: "demo",
        password: "demo",
        displayName: "Demo User"
      });
      console.log("Demo user created successfully");
    } else {
      console.log("Demo user already exists");
    }
  } catch (err) {
    const error = err as Error;
    console.error("Error during demo user setup:", error.message || "Unknown error");
  }
}

// Initialize with database storage
export const storage = new DatabaseStorage();

// Setup the demo user (will be executed when the module is imported)
setupDemoUser();
