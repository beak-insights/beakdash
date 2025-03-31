import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  theme: text("theme").default("light"),
  language: text("language").default("en"),
  timeZone: text("time_zone"),
  settings: jsonb("settings").default({}),
  role: text("role").default("user"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarUrl: true,
  email: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  avatarUrl: true,
  email: true,
  theme: true,
  language: true,
  timeZone: true,
  settings: true,
});

// Dashboards schema
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  layout: jsonb("layout").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  description: true,
  layout: true,
});

// Connection types
export const connectionTypes = ["csv", "rest", "sql"] as const;
export const connectionTypeSchema = z.enum(connectionTypes);

// Connections schema
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
});

// Datasets schema
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  connectionId: integer("connection_id").references(() => connections.id),
  name: text("name").notNull(),
  query: text("query"),
  refreshInterval: text("refresh_interval").default("manual"),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDatasetSchema = createInsertSchema(datasets).pick({
  userId: true,
  connectionId: true,
  name: true,
  query: true,
  refreshInterval: true,
  config: true,
});

// Widget types
export const chartTypes = ["bar", "column", "line", "pie", "scatter", "dual-axes", "counter", "stat-card", "table"] as const;
export const chartTypeSchema = z.enum(chartTypes);

// Widgets schema
// Define a forward reference for widgets table
const widgetsRef: any = {};

export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id),
  connectionId: integer("connection_id").references(() => connections.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").default({}),
  customQuery: text("custom_query"),
  isTemplate: boolean("is_template").default(false),
  sourceWidgetId: integer("source_widget_id").references((): any => widgets.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard Widgets join table for many-to-many relationship
export const dashboardWidgets = pgTable("dashboard_widgets", {
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id),
  widgetId: integer("widget_id").notNull().references(() => widgets.id),
  position: jsonb("position").default({}),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.dashboardId, table.widgetId] }),
  };
});

export const insertWidgetSchema = createInsertSchema(widgets).pick({
  datasetId: true,
  connectionId: true,
  name: true,
  type: true,
  config: true,
  customQuery: true,
  isTemplate: true,
  sourceWidgetId: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetId: true,
  position: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type ConnectionType = z.infer<typeof connectionTypeSchema>;

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type ChartType = z.infer<typeof chartTypeSchema>;

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

// Schema for position data
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

// Schema for chart configuration
export const chartConfigSchema = z.object({
  chartType: chartTypeSchema,
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  y2Axis: z.string().optional(),
  groupBy: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc", "none"]).optional(),
  limit: z.number().optional(),
  colors: z.array(z.string()).optional(),
  showLegend: z.boolean().optional(),
  labelFormat: z.string().optional(),
  filters: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains"]),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
  ).optional(),
});

// Define relationships between tables
import { relations } from "drizzle-orm";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  dashboards: many(dashboards),
  connections: many(connections),
  datasets: many(datasets),
}));

// Dashboard relations
export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
  dashboardWidgets: many(dashboardWidgets),
}));

// Connection relations
export const connectionsRelations = relations(connections, ({ one, many }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
  datasets: many(datasets),
  widgets: many(widgets),
}));

// Dataset relations
export const datasetsRelations = relations(datasets, ({ one, many }) => ({
  user: one(users, {
    fields: [datasets.userId],
    references: [users.id],
  }),
  connection: one(connections, {
    fields: [datasets.connectionId],
    references: [connections.id],
  }),
  widgets: many(widgets),
}));

// Widget relations
export const widgetsRelations = relations(widgets, ({ one, many }) => {
  return {
    dataset: one(datasets, {
      fields: [widgets.datasetId],
      references: [datasets.id],
    }),
    connection: one(connections, {
      fields: [widgets.connectionId],
      references: [connections.id],
    }),
    sourceWidget: one(widgets, {
      fields: [widgets.sourceWidgetId],
      references: [widgets.id],
    }),
    dashboardWidgets: many(dashboardWidgets),
  };
});

// DashboardWidget relations
export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
  }),
  widget: one(widgets, {
    fields: [dashboardWidgets.widgetId],
    references: [widgets.id],
  }),
}));
