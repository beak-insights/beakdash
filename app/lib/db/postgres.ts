import postgres from 'postgres';

// Create a PostgreSQL connection using the environment variables
const connectionString = process.env.DATABASE_URL || '';

// Create a client with the connection string
export const sql = postgres(connectionString, { 
  max: 10, // Maximum number of connections
  idle_timeout: 30,
  connect_timeout: 10,
  types: {
    // Define custom types if needed
  }
});

// Export a helper function to execute a query and get the result
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    return await sql.unsafe(query, params) as T[];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}