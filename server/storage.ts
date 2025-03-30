import {
  users, type User, type InsertUser,
  dashboards, type Dashboard, type InsertDashboard,
  connections, type Connection, type InsertConnection,
  datasets, type Dataset, type InsertDataset,
  widgets, type Widget, type InsertWidget
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboards: Map<number, Dashboard>;
  private connections: Map<number, Connection>;
  private datasets: Map<number, Dataset>;
  private widgets: Map<number, Widget>;
  
  private userCounter: number;
  private dashboardCounter: number;
  private connectionCounter: number;
  private datasetCounter: number;
  private widgetCounter: number;

  constructor() {
    this.users = new Map();
    this.dashboards = new Map();
    this.connections = new Map();
    this.datasets = new Map();
    this.widgets = new Map();
    
    this.userCounter = 1;
    this.dashboardCounter = 1;
    this.connectionCounter = 1;
    this.datasetCounter = 1;
    this.widgetCounter = 1;

    // Add a default user for demo purposes
    this.createUser({
      username: "demo",
      password: "demo",
      displayName: "Demo User"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      displayName: insertUser.displayName || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }

  // Dashboard operations
  async getDashboards(userId?: number): Promise<Dashboard[]> {
    const dashboards = Array.from(this.dashboards.values());
    return userId ? dashboards.filter(d => d.userId === userId) : dashboards;
  }

  async getDashboard(id: number): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const id = this.dashboardCounter++;
    const now = new Date();
    const newDashboard: Dashboard = {
      id,
      name: dashboard.name,
      userId: dashboard.userId ?? null,
      description: dashboard.description ?? null,
      isActive: true,
      layout: dashboard.layout ?? {},
      createdAt: now,
      updatedAt: now
    };
    this.dashboards.set(id, newDashboard);
    return newDashboard;
  }

  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const existing = await this.getDashboard(id);
    if (!existing) {
      throw new Error(`Dashboard with id ${id} not found`);
    }
    
    const updated: Dashboard = {
      ...existing,
      ...dashboard,
      updatedAt: new Date()
    };
    this.dashboards.set(id, updated);
    return updated;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    return this.dashboards.delete(id);
  }

  // Connection operations
  async getConnections(userId?: number): Promise<Connection[]> {
    const connections = Array.from(this.connections.values());
    return userId ? connections.filter(c => c.userId === userId) : connections;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionCounter++;
    const now = new Date();
    const newConnection: Connection = {
      id,
      name: connection.name,
      type: connection.type,
      config: connection.config,
      userId: connection.userId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async updateConnection(id: number, connection: Partial<Connection>): Promise<Connection> {
    const existing = await this.getConnection(id);
    if (!existing) {
      throw new Error(`Connection with id ${id} not found`);
    }
    
    const updated: Connection = {
      ...existing,
      ...connection,
      updatedAt: new Date()
    };
    this.connections.set(id, updated);
    return updated;
  }

  async deleteConnection(id: number): Promise<boolean> {
    return this.connections.delete(id);
  }

  // Dataset operations
  async getDatasets(userId?: number, connectionId?: number): Promise<Dataset[]> {
    let datasets = Array.from(this.datasets.values());
    
    if (userId) {
      datasets = datasets.filter(d => d.userId === userId);
    }
    
    if (connectionId) {
      datasets = datasets.filter(d => d.connectionId === connectionId);
    }
    
    return datasets;
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const id = this.datasetCounter++;
    const now = new Date();
    const newDataset: Dataset = {
      id,
      name: dataset.name,
      userId: dataset.userId ?? null,
      connectionId: dataset.connectionId ?? null,
      query: dataset.query ?? null,
      refreshInterval: dataset.refreshInterval ?? null,
      config: dataset.config ?? {},
      createdAt: now,
      updatedAt: now
    };
    this.datasets.set(id, newDataset);
    return newDataset;
  }

  async updateDataset(id: number, dataset: Partial<Dataset>): Promise<Dataset> {
    const existing = await this.getDataset(id);
    if (!existing) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    const updated: Dataset = {
      ...existing,
      ...dataset,
      updatedAt: new Date()
    };
    this.datasets.set(id, updated);
    return updated;
  }

  async deleteDataset(id: number): Promise<boolean> {
    return this.datasets.delete(id);
  }

  // Widget operations
  async getWidgets(dashboardId?: number): Promise<Widget[]> {
    const widgets = Array.from(this.widgets.values());
    return dashboardId ? widgets.filter(w => w.dashboardId === dashboardId) : widgets;
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    return this.widgets.get(id);
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const id = this.widgetCounter++;
    const now = new Date();
    const newWidget: Widget = {
      id,
      name: widget.name,
      type: widget.type,
      dashboardId: widget.dashboardId ?? null,
      datasetId: widget.datasetId ?? null,
      position: widget.position ?? {},
      config: widget.config ?? {},
      createdAt: now,
      updatedAt: now
    };
    this.widgets.set(id, newWidget);
    return newWidget;
  }

  async updateWidget(id: number, widget: Partial<Widget>): Promise<Widget> {
    const existing = await this.getWidget(id);
    if (!existing) {
      throw new Error(`Widget with id ${id} not found`);
    }
    
    const updated: Widget = {
      ...existing,
      ...widget,
      updatedAt: new Date()
    };
    this.widgets.set(id, updated);
    return updated;
  }

  async deleteWidget(id: number): Promise<boolean> {
    return this.widgets.delete(id);
  }
}

export const storage = new MemStorage();
