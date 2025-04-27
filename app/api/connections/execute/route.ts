import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connections } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { SQLConnectionConfig } from '@/types/datasource';
import { Client } from 'pg';

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

    const { query, connectionId } = body;

    // Get connection details
    const connection = await db.query.connections.findFirst({
      where: eq(connections.id, connectionId)
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    const config = connection.config as unknown as any;

    // Get execution results
    const results = await getExecutionResults({...config, user: config.username} as SQLConnectionConfig, query);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('sql execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}

async function getExecutionResults(config: SQLConnectionConfig, query: string) {
  switch (config.type) {
    case 'postgresql':
      return await executePostgresQuery(config, query);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

async function executePostgresQuery(config: SQLConnectionConfig, query: string) {
    // Create a new pool for this specific request
    const client = new Client({
      ...config,
      statement_timeout: 5000,
      connectionTimeoutMillis: 5000,
    });
     
    try {
      // Execute query
      await client.connect();
      const result = await client.query(query);
      
      // Important: Close the pool after use
      await client.end();
      return result.rows;
    } catch (dbError) {
      // Make sure to close the pool even if query fails
      await client.end();
      throw dbError;
    }
}
