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
    
    // Build the query with filters
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Begin building our SQL query with filters
    let query = `
      SELECT q.*, 
        c.name as connection_name,
        s.name as space_name,
        (SELECT count(*) FROM db_qa_execution_results WHERE query_id = q.id) as execution_count,
        (SELECT status FROM db_qa_execution_results WHERE query_id = q.id ORDER BY execution_time DESC LIMIT 1) as last_status
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
    
    query += ` ORDER BY q.created_at DESC`;
    
    // Execute the query
    const result = await db.execute(sql.raw(query, ...(queryParams as [any])));
    
    return NextResponse.json((result as any).rows);
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
        
        if (!connectionResult.rows.length) {
          return NextResponse.json(
            { error: 'Connection not found' },
            { status: 404 }
          );
        }
        
        const connection = connectionResult.rows[0];
        const config = connection.config;
        
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
    
    return NextResponse.json({
      success: true,
      message: 'DB QA query created successfully',
      query: insertedQuery.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating DB QA query:', error);
    
    return NextResponse.json(
      { error: `Failed to create DB QA query: ${error.message}` },
      { status: 500 }
    );
  }
}