import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Add logging to see the environment variables
console.log("Environment variables for database:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("PGHOST:", process.env.PGHOST);
console.log("PGPORT:", process.env.PGPORT);
console.log("PGUSER:", process.env.PGUSER);
console.log("PGDATABASE:", process.env.PGDATABASE);

// If DATABASE_URL is not set, construct it from individual PG* variables
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}?sslmode=require`;
  console.log("Created DATABASE_URL from PG* variables");
}

if (!databaseUrl) {
  throw new Error(
    "Database connection information is missing. Make sure DATABASE_URL or PG* environment variables are set."
  );
}

console.log("Attempting to connect to database...");
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pool, schema });
console.log("Database connection pool created successfully");

export { pool, db };
