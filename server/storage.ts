import {
  users, type User, type InsertUser, type UpdateUser,
  spaces, type Space, type InsertSpace, type UpdateSpace,
  userSpaces, type UserSpace, type InsertUserSpace,
  dashboards, type Dashboard, type InsertDashboard,
  connections, type Connection, type InsertConnection,
  datasets, type Dataset, type InsertDataset,
  widgets, type Widget, type InsertWidget,
  dashboardWidgets, type DashboardWidget, type InsertDashboardWidget
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, inArray } from "drizzle-orm";

// Extended interface for Widget with dashboard-related properties
interface ExtendedWidget extends Widget {
  dashboardId?: number;
  position?: Record<string, any>;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<UpdateUser>): Promise<User>;
  updateLastLogin(id: number): Promise<boolean>;
  getUserSettings(id: number): Promise<Record<string, any> | undefined>;
  
  // Space operations
  getSpaces(): Promise<Space[]>;
  getSpace(id: number): Promise<Space | undefined>;
  getUserSpaces(userId: number): Promise<Space[]>;
  createSpace(space: InsertSpace): Promise<Space>;
  updateSpace(id: number, space: Partial<UpdateSpace>): Promise<Space>;
  deleteSpace(id: number): Promise<boolean>;
  joinSpace(userId: number, spaceId: number, role?: string): Promise<void>;
  leaveSpace(userId: number, spaceId: number): Promise<boolean>;
  isUserInSpace(userId: number, spaceId: number): Promise<boolean>;

  // Dashboard operations
  getDashboards(userId?: number, spaceId?: number): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard>;
  deleteDashboard(id: number): Promise<boolean>;

  // Connection operations
  getConnections(userId?: number, spaceId?: number): Promise<Connection[]>;
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
  getWidgets(dashboardId?: number, userId?: number, spaceId?: number): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, widget: Partial<Widget>): Promise<Widget>;
  deleteWidget(id: number): Promise<boolean>;
  
  // Dashboard Widget operations (for many-to-many relationship)
  getDashboardWidgets(dashboardId: number): Promise<Widget[]>;
  getWidgetDashboards(widgetId: number): Promise<Dashboard[]>;
  addWidgetToDashboard(dashboardId: number, widgetId: number, position?: any): Promise<DashboardWidget>;
  removeWidgetFromDashboard(dashboardId: number, widgetId: number): Promise<boolean>;
  updateWidgetPosition(dashboardId: number, widgetId: number, position: any): Promise<DashboardWidget>;
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
      avatarUrl: insertUser.avatarUrl || null,
      email: insertUser.email || null
    }).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<UpdateUser>): Promise<User> {
    const result = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async updateLastLogin(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({
        lastLogin: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async getUserSettings(id: number): Promise<Record<string, any> | undefined> {
    const result = await db.select({
      settings: users.settings
    })
    .from(users)
    .where(eq(users.id, id));
    
    if (result.length === 0) {
      return undefined;
    }
    
    return result[0].settings as Record<string, any>;
  }
  
  // Space operations
  async getSpaces(): Promise<Space[]> {
    return await db.select().from(spaces).orderBy(desc(spaces.createdAt));
  }
  
  async getSpace(id: number): Promise<Space | undefined> {
    const result = await db.select().from(spaces).where(eq(spaces.id, id));
    return result[0];
  }
  
  async getUserSpaces(userId: number): Promise<Space[]> {
    const result = await db
      .select({
        space: spaces
      })
      .from(userSpaces)
      .innerJoin(spaces, eq(userSpaces.spaceId, spaces.id))
      .where(eq(userSpaces.userId, userId))
      .orderBy(desc(spaces.createdAt));
    
    return result.map(row => row.space);
  }
  
  async createSpace(space: InsertSpace): Promise<Space> {
    const result = await db.insert(spaces).values({
      name: space.name,
      description: space.description || null,
      slug: space.slug,
      logoUrl: space.logoUrl || null,
      settings: space.settings || {},
      isPrivate: space.isPrivate || false
    }).returning();
    
    return result[0];
  }
  
  async updateSpace(id: number, space: Partial<UpdateSpace>): Promise<Space> {
    const result = await db.update(spaces)
      .set({
        ...space,
        updatedAt: new Date()
      })
      .where(eq(spaces.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Space with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteSpace(id: number): Promise<boolean> {
    const result = await db.delete(spaces).where(eq(spaces.id, id)).returning();
    return result.length > 0;
  }
  
  async joinSpace(userId: number, spaceId: number, role: string = "member"): Promise<void> {
    // Check if already joined
    const existingMembership = await db
      .select()
      .from(userSpaces)
      .where(
        and(
          eq(userSpaces.userId, userId),
          eq(userSpaces.spaceId, spaceId)
        )
      );
    
    if (existingMembership.length === 0) {
      await db.insert(userSpaces).values({
        userId,
        spaceId,
        role
      });
    }
  }
  
  async leaveSpace(userId: number, spaceId: number): Promise<boolean> {
    const result = await db
      .delete(userSpaces)
      .where(
        and(
          eq(userSpaces.userId, userId),
          eq(userSpaces.spaceId, spaceId)
        )
      )
      .returning();
    
    return result.length > 0;
  }
  
  async isUserInSpace(userId: number, spaceId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(userSpaces)
      .where(
        and(
          eq(userSpaces.userId, userId),
          eq(userSpaces.spaceId, spaceId)
        )
      );
    
    return result.length > 0;
  }

  // Dashboard operations
  async getDashboards(userId?: number, spaceId?: number): Promise<Dashboard[]> {
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(dashboards.userId, userId));
    }
    
    if (spaceId) {
      conditions.push(eq(dashboards.spaceId, spaceId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(dashboards).where(and(...conditions)).orderBy(desc(dashboards.createdAt));
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
      spaceId: dashboard.spaceId || null,
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
  async getConnections(userId?: number, spaceId?: number): Promise<Connection[]> {
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(connections.userId, userId));
    }
    
    if (spaceId) {
      conditions.push(eq(connections.spaceId, spaceId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(connections).where(and(...conditions)).orderBy(desc(connections.createdAt));
    }
    
    return await db.select().from(connections).orderBy(desc(connections.createdAt));
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const result = await db.select().from(connections).where(eq(connections.id, id));
    return result[0];
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const values = {
      name: connection.name,
      type: connection.type,
      config: connection.config,
      userId: connection.userId || null,
      spaceId: connection.spaceId || null
    };
    const result = await db.insert(connections).values(values as any).returning();
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
  async getWidgets(dashboardId?: number, userId?: number, spaceId?: number): Promise<Widget[]> {
    if (dashboardId) {
      // Use the many-to-many relationship through dashboardWidgets
      return this.getDashboardWidgets(dashboardId);
    }
    
    // Build conditions for filtering widgets
    const conditions = [];
    
    if (spaceId) {
      // For a specific space, get widgets that belong to this space OR are global
      conditions.push(
        or(
          eq(widgets.spaceId, spaceId),
          eq(widgets.isGlobal, true)
        )
      );
    }
    
    if (userId && !spaceId) {
      // If we have a userId but no spaceId, 
      // get global widgets OR widgets from spaces the user has access to
      const userSpaces = await this.getUserSpaces(userId);
      const spaceIds = userSpaces.map(space => space.id);
      
      if (spaceIds.length > 0) {
        conditions.push(
          or(
            eq(widgets.isGlobal, true),
            inArray(widgets.spaceId, spaceIds)
          )
        );
      } else {
        // If user is not in any spaces, only show global widgets
        conditions.push(eq(widgets.isGlobal, true));
      }
    }
    
    // Execute the query with conditions
    const baseQuery = db.select().from(widgets);
    
    if (conditions.length > 0) {
      const result = await baseQuery.where(and(...conditions)).orderBy(desc(widgets.createdAt));
      return result;
    }
    
    const result = await baseQuery.orderBy(desc(widgets.createdAt));
    return result;
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    const result = await db.select().from(widgets).where(eq(widgets.id, id));
    return result[0] as Widget | undefined;
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    // Create widget using the values from InsertWidget
    if (!widget) {
      throw new Error('Widget data is required');
    }
    
    // Cast the widget to the proper type using type assertion to avoid errors
    const typedWidget = widget as any;
    
    const values = {
      name: typedWidget.name,
      type: typedWidget.type,
      datasetId: typedWidget.datasetId || null,
      connectionId: typedWidget.connectionId || null,
      spaceId: typedWidget.spaceId || null, // Add spaceId support
      config: typedWidget.config || {},
      customQuery: typedWidget.customQuery || null,
      isTemplate: typedWidget.isTemplate || false,
      sourceWidgetId: typedWidget.sourceWidgetId || null,
      isGlobal: typedWidget.isGlobal || false // Add isGlobal support
    };
    
    // Ensure mutual exclusivity: a widget can't be both global and belong to a space
    if (values.isGlobal && values.spaceId) {
      values.spaceId = null; // If marked as global, remove space association
    }
    
    const result = await db.insert(widgets).values(values).returning();
    
    if ((result as any[]).length === 0) {
      throw new Error('Failed to create widget');
    }
    
    return (result as any[])[0] as Widget;
  }

  async updateWidget(id: number, widget: Partial<Widget>): Promise<Widget> {
    // Update the widget properties
    const result = await db.update(widgets)
      .set({
        ...widget,
        updatedAt: new Date()
      })
      .where(eq(widgets.id, id))
      .returning();
    
    if ((result as any[]).length === 0) {
      throw new Error(`Widget with id ${id} not found`);
    }
    
    return (result as any[])[0] as Widget;
  }

  async deleteWidget(id: number): Promise<boolean> {
    // First delete any dashboard-widget relationships
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.widgetId, id));
    
    // Then delete the widget
    const result = await db.delete(widgets).where(eq(widgets.id, id)).returning();
    return (result as any[]).length > 0;
  }
  
  // Dashboard Widget operations (many-to-many relationship)
  async getDashboardWidgets(dashboardId: number): Promise<Widget[]> {
    const result = await db
      .select({
        widget: widgets
      })
      .from(dashboardWidgets)
      .innerJoin(widgets, eq(dashboardWidgets.widgetId, widgets.id))
      .where(eq(dashboardWidgets.dashboardId, dashboardId))
      .orderBy(desc(widgets.createdAt));
    
    return result.map(row => row.widget) as Widget[];
  }
  
  async getWidgetDashboards(widgetId: number): Promise<Dashboard[]> {
    const result = await db
      .select({
        dashboard: dashboards
      })
      .from(dashboardWidgets)
      .innerJoin(dashboards, eq(dashboardWidgets.dashboardId, dashboards.id))
      .where(eq(dashboardWidgets.widgetId, widgetId))
      .orderBy(desc(dashboards.createdAt));
    
    return result.map(row => row.dashboard) as Dashboard[];
  }
  
  async addWidgetToDashboard(dashboardId: number, widgetId: number, position: any = {}): Promise<DashboardWidget> {
    // Check if relation already exists
    const existingRelation = await db
      .select()
      .from(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.dashboardId, dashboardId),
          eq(dashboardWidgets.widgetId, widgetId)
        )
      );
    
    if ((existingRelation as any[]).length > 0) {
      // Update position if relation exists
      const result = await db
        .update(dashboardWidgets)
        .set({
          position
        })
        .where(
          and(
            eq(dashboardWidgets.dashboardId, dashboardId),
            eq(dashboardWidgets.widgetId, widgetId)
          )
        )
        .returning();
      
      return result[0] as DashboardWidget;
    }
    
    // Create new relation
    const result = await db
      .insert(dashboardWidgets)
      .values({
        dashboardId,
        widgetId,
        position
      })
      .returning();
    
    return result[0] as DashboardWidget;
  }
  
  async removeWidgetFromDashboard(dashboardId: number, widgetId: number): Promise<boolean> {
    const result = await db
      .delete(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.dashboardId, dashboardId),
          eq(dashboardWidgets.widgetId, widgetId)
        )
      )
      .returning();
    
    return (result as any[]).length > 0;
  }
  
  async updateWidgetPosition(dashboardId: number, widgetId: number, position: any): Promise<DashboardWidget> {
    const result = await db
      .update(dashboardWidgets)
      .set({
        position
      })
      .where(
        and(
          eq(dashboardWidgets.dashboardId, dashboardId),
          eq(dashboardWidgets.widgetId, widgetId)
        )
      )
      .returning();
    
    if ((result as any[]).length === 0) {
      throw new Error(`Widget position not found for dashboard ${dashboardId} and widget ${widgetId}`);
    }
    
    return result[0] as DashboardWidget;
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
