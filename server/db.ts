import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Check for required DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Connecting to database...");

// Create a connection pool with improved resilience
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Set improved connection options
  max: 5, // Reduced maximum number of clients to avoid overwhelming database
  idleTimeoutMillis: 20000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // Increased time to wait for a connection
  ssl: true, // Enable SSL for Neon database
  statement_timeout: 10000, // Limit query execution time
});

// Setup error handling for unexpected disconnects
pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
  // Don't crash the server on connection errors
  // The pool will automatically create a new connection when needed
});

// Add connection release hook to catch connection-related issues
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Database client error:', err.message);
    // The pool will handle reconnection
  });
});

// Initialize Drizzle ORM with our schema
const db = drizzle(pool, { schema });

// Function to retry database connection
const verifyConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log("Database connection established and verified");
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i+1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.warn("Database connection verification failed, but app will continue");
  return false;
};

// Initial verification
verifyConnection();

export { pool, db };
