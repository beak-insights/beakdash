import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarUrl: true,
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
export const chartTypes = ["bar", "column", "line", "pie", "scatter", "dual-axes"] as const;
export const chartTypeSchema = z.enum(chartTypes);

// Widgets schema
export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  datasetId: integer("dataset_id").references(() => datasets.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  position: jsonb("position").default({}),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWidgetSchema = createInsertSchema(widgets).pick({
  dashboardId: true,
  datasetId: true,
  name: true,
  type: true,
  position: true,
  config: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
