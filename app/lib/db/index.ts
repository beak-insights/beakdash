import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { runMigrations } from './seeds';

// Create a PostgreSQL connection
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString, { max: 1 });

// Create a Drizzle ORM instance with all schemas
export const db = drizzle(client, { schema });

// Export the migrations function for use in initialization
export { runMigrations };