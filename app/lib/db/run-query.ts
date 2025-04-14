import { sql } from "@/lib/db/postgres";

interface RunQueryOptions {
  query: string;
  connectionConfig: any;
  connectionType: string;
}

/**
 * Run a query on a database connection
 * 
 * @param options Object containing query, connection config, and connection type
 * @returns Query results
 */
export async function runQueryOnConnection(options: RunQueryOptions): Promise<any> {
  const { query, connectionConfig, connectionType } = options;
  const startTime = Date.now();
  
  try {
    // For PostgreSQL connections, use our built-in PostgreSQL connection
    if (connectionType.toLowerCase() === 'postgresql') {
      try {
        // Execute the query on the PostgreSQL instance
        const result = await sql.unsafe(query);
        
        const executionTimeMs = Date.now() - startTime;
        return {
          data: result,
          executionTimeMs,
        };
      } catch (error: any) {
        throw new Error(`PostgreSQL Error: ${error.message}`);
      }
    } 
    // For MySQL connections
    else if (connectionType.toLowerCase() === 'mysql') {
      // In a real app, we would connect to MySQL using the configuration
      // For now, return a mock response
      throw new Error('MySQL connections are not yet supported');
    }
    // For other connection types
    else {
      throw new Error(`Connection type ${connectionType} is not supported`);
    }
  } catch (error: any) {
    console.error('Error running query:', error);
    throw error;
  }
}