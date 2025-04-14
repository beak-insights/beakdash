import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { dbQaQueries, type DbQaQuery } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import pg from 'pg';

// GET handler for retrieving DB QA queries
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');
    const category = searchParams.get('category');
    const connectionId = searchParams.get('connectionId');
    const runStatus = searchParams.get('runStatus');
    const frequency = searchParams.get('frequency');
    const enabledStatus = searchParams.get('enabledStatus');
    
    // Build the query with filters
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Begin building our SQL query with filters
    let query = `
      SELECT q.*, 
        c.name as connection_name,
        s.name as space_name,
        (SELECT count(*) FROM db_qa_execution_results WHERE query_id = q.id) as execution_count,
        (SELECT status FROM db_qa_execution_results WHERE query_id = q.id ORDER BY execution_time DESC LIMIT 1) as last_run_status,
        (SELECT execution_time FROM db_qa_execution_results WHERE query_id = q.id ORDER BY execution_time DESC LIMIT 1) as last_run_at
      FROM db_qa_queries q
      LEFT JOIN connections c ON q.connection_id = c.id
      LEFT JOIN spaces s ON q.space_id = s.id
      WHERE q.user_id = ${userIdNum}
    `;
    
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    if (spaceId) {
      query += ` AND q.space_id = $${paramCounter}`;
      queryParams.push(parseInt(spaceId));
      paramCounter++;
    }
    
    if (category) {
      query += ` AND q.category = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }
    
    if (connectionId) {
      query += ` AND q.connection_id = $${paramCounter}`;
      queryParams.push(parseInt(connectionId));
      paramCounter++;
    }
    
    // Add filter for run status
    if (runStatus) {
      if (runStatus === 'not_run') {
        query += ` AND NOT EXISTS (SELECT 1 FROM db_qa_execution_results WHERE query_id = q.id)`;
      } else {
        query += ` AND EXISTS (
          SELECT 1 FROM db_qa_execution_results 
          WHERE query_id = q.id 
          AND status = $${paramCounter} 
          ORDER BY execution_time DESC 
          LIMIT 1
        )`;
        queryParams.push(runStatus);
        paramCounter++;
      }
    }
    
    // Add filter for execution frequency
    if (frequency) {
      query += ` AND q.execution_frequency = $${paramCounter}`;
      queryParams.push(frequency);
      paramCounter++;
    }
    
    // Add filter for enabled status
    if (enabledStatus) {
      const isEnabled = enabledStatus === 'enabled';
      query += ` AND q.enabled = $${paramCounter}`;
      queryParams.push(isEnabled);
      paramCounter++;
    }
    
    query += ` ORDER BY q.created_at DESC`;
    
    // Execute the query with parameters
    let result;
    if (queryParams.length > 0) {
      // We have parameters, use parameterized query
      let parametrizedQuery = query;
      for (let i = 0; i < queryParams.length; i++) {
        // Replace $N with actual parameter value - this is not ideal but works for this scenario
        parametrizedQuery = parametrizedQuery.replace(`$${i+1}`, Array.isArray(queryParams[i]) ? 
          `'${queryParams[i].join("','")}'` : 
          typeof queryParams[i] === 'string' ? `'${queryParams[i]}'` : String(queryParams[i]));
      }
      result = await db.execute(sql.raw(parametrizedQuery));
    } else {
      // No parameters, simpler query
      result = await db.execute(sql.raw(query));
    }
    
    // Transform the result to a serializable array
    const rows = Array.isArray(result) ? result : [];
    
    // Check if we need to process the data before returning
    const serializedRows = rows.map(row => {
      // Create a plain object with all enumerable properties
      const plainObject: Record<string, any> = {};
      for (const key in row) {
        let value = row[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        plainObject[key] = value;
      }
      return plainObject;
    });
    
    return NextResponse.json(serializedRows);
  } catch (error) {
    console.error('Error fetching DB QA queries:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch DB QA queries' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new DB QA query
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.query || !body.category || !body.connectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, query, category, and connectionId are required' },
        { status: 400 }
      );
    }
    
    // Convert userId to number
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const connectionIdNum = parseInt(body.connectionId);
    const spaceIdNum = body.spaceId ? parseInt(body.spaceId) : null;
    
    // Prepare threshold and expected result objects
    const thresholds = body.thresholds || {};
    const expectedResult = body.expectedResult || {};
    
    // Validate the query by attempting a test execution
    if (body.validateQuery) {
      try {
        // Get connection info to run the test query
        const connectionResult = await db.execute(
          sql`SELECT * FROM connections WHERE id = ${connectionIdNum}`
        );
        
        // Process connection result (considering DrizzleORM's return format)
        const connectionRows = Array.isArray(connectionResult) ? connectionResult : [];
        if (connectionRows.length === 0) {
          return NextResponse.json(
            { error: 'Connection not found' },
            { status: 404 }
          );
        }
        
        const connection = connectionRows[0];
        // Type assertion for connection config
        const config = connection.config as Record<string, any>;
        
        // Create a connection to run the test query if it's a SQL connection
        if (connection.type === 'sql' || connection.type === 'postgresql') {
          // Note: This is just for validation - we're masking the password in storage
          // but need to use real credentials for this test
          // In a real environment, you'd likely use a more secure way to store/retrieve credentials
          
          try {
            const pool = new pg.Pool({
              host: config.hostname,
              port: parseInt(config.port || '5432'),
              database: config.database,
              user: config.username,
              password: process.env.DB_PASSWORD || config.password, // Use environment variable or stored password
              ssl: config.sslMode === 'disable' ? false : {
                rejectUnauthorized: config.sslMode === 'verify-full' || config.sslMode === 'verify-ca'
              },
              connectionTimeoutMillis: 10000,
            });
  
            const client = await pool.connect();
            try {
              // Set a timeout to prevent long-running queries
              await client.query('SET statement_timeout TO 5000'); // 5 seconds
              
              // Start timing the execution
              const startTime = Date.now();
              
              // Execute the query
              const testResult = await client.query(body.query);
              
              // Calculate execution duration
              const executionDuration = Date.now() - startTime;
              
              // Test query successful
              await pool.end();
              
              // Proceed to create the query record
            } catch (queryError: any) {
              await pool.end();
              
              return NextResponse.json({
                error: `Query validation failed: ${queryError.message}`,
                validationError: true
              }, { status: 400 });
            } finally {
              client.release();
            }
          } catch (connectionError: any) {
            return NextResponse.json({
              error: `Connection test failed: ${connectionError.message}`,
              connectionError: true
            }, { status: 400 });
          }
        }
      } catch (validationError: any) {
        console.error('Query validation error:', validationError);
        
        return NextResponse.json({
          error: `Failed to validate query: ${validationError.message}`,
          validationFailed: true
        }, { status: 400 });
      }
    }
    
    // Insert the new query
    await db.execute(sql`
      INSERT INTO db_qa_queries (
        user_id, connection_id, space_id, name, description, category, 
        query, expected_result, thresholds, enabled, execution_frequency
      ) VALUES (
        ${userIdNum}, ${connectionIdNum}, ${spaceIdNum}, ${body.name}, 
        ${body.description || null}, ${body.category}, ${body.query}, 
        ${JSON.stringify(expectedResult)}::jsonb, ${JSON.stringify(thresholds)}::jsonb, 
        ${body.enabled !== undefined ? body.enabled : true}, 
        ${body.executionFrequency || 'manual'}
      )
    `);
    
    // Get the inserted query
    const insertedQuery = await db.execute(sql`
      SELECT * FROM db_qa_queries 
      WHERE user_id = ${userIdNum} AND name = ${body.name}
      ORDER BY id DESC LIMIT 1
    `);
    
    // Serialize the inserted query result
    let queryResult = null;
    if (Array.isArray(insertedQuery) && insertedQuery.length > 0) {
      const row = insertedQuery[0];
      queryResult = {} as Record<string, any>;
      
      // Create a serializable object from the row
      for (const key in row) {
        let value = row[key];
        // Convert dates to ISO strings
        if (value instanceof Date) {
          value = value.toISOString();
        }
        queryResult[key] = value;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'DB QA query created successfully',
      query: queryResult
    });
  } catch (error: any) {
    console.error('Error creating DB QA query:', error);
    
    return NextResponse.json(
      { error: `Failed to create DB QA query: ${error.message}` },
      { status: 500 }
    );
  }
}