import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon database
neonConfig.webSocketConstructor = ws;

// Check for required DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Connecting to database...");

// Create a connection pool with optional parameters
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Set additional connection options if needed
  max: 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
});

// Initialize Drizzle ORM with our schema
const db = drizzle({ client: pool, schema });

// Verify connection by executing a simple query
pool.query('SELECT NOW()').then(() => {
  console.log("Database connection established and verified");
}).catch(err => {
  console.error("Database connection error:", err.message);
});

export { pool, db };
