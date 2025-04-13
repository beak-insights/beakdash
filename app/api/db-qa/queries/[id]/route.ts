import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET handler for retrieving a single DB QA query
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const queryId = parseInt(params.id);
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Retrieve the query with details from related tables
    const result = await db.execute(sql`
      SELECT q.*, 
        c.name as connection_name,
        c.type as connection_type,
        s.name as space_name,
        (SELECT count(*) FROM db_qa_execution_results WHERE query_id = q.id) as execution_count,
        (
          SELECT json_build_object(
            'id', r.id,
            'execution_time', r.execution_time,
            'status', r.status,
            'result', r.result,
            'metrics', r.metrics,
            'execution_duration', r.execution_duration,
            'error_message', r.error_message
          )
          FROM db_qa_execution_results r
          WHERE r.query_id = q.id
          ORDER BY r.execution_time DESC
          LIMIT 1
        ) as last_execution
      FROM db_qa_queries q
      LEFT JOIN connections c ON q.connection_id = c.id
      LEFT JOIN spaces s ON q.space_id = s.id
      WHERE q.id = ${queryId} AND q.user_id = ${userIdNum}
    `);
    
    if (!result.rows.length) {
      return NextResponse.json(
        { error: 'Query not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching DB QA query:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch DB QA query' },
      { status: 500 }
    );
  }
}

// PUT handler for updating an existing DB QA query
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const queryId = parseInt(params.id);
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Check if the query exists and belongs to the user
    const existingQuery = await db.execute(sql`
      SELECT * FROM db_qa_queries WHERE id = ${queryId} AND user_id = ${userIdNum}
    `);
    
    if (!existingQuery.rows.length) {
      return NextResponse.json(
        { error: 'Query not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.query || !body.category || !body.connectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, query, category, and connectionId are required' },
        { status: 400 }
      );
    }
    
    // Convert data types
    const connectionIdNum = parseInt(body.connectionId);
    const spaceIdNum = body.spaceId ? parseInt(body.spaceId) : null;
    
    // Prepare threshold and expected result objects
    const thresholds = body.thresholds || {};
    const expectedResult = body.expectedResult || {};
    
    // Update the query
    await db.execute(sql`
      UPDATE db_qa_queries SET
        connection_id = ${connectionIdNum},
        space_id = ${spaceIdNum},
        name = ${body.name},
        description = ${body.description || null},
        category = ${body.category},
        query = ${body.query},
        expected_result = ${JSON.stringify(expectedResult)}::jsonb,
        thresholds = ${JSON.stringify(thresholds)}::jsonb,
        enabled = ${body.enabled !== undefined ? body.enabled : true},
        execution_frequency = ${body.executionFrequency || 'manual'},
        updated_at = NOW()
      WHERE id = ${queryId} AND user_id = ${userIdNum}
    `);
    
    // Get the updated query
    const updatedQuery = await db.execute(sql`
      SELECT * FROM db_qa_queries 
      WHERE id = ${queryId}
    `);
    
    return NextResponse.json({
      success: true,
      message: 'DB QA query updated successfully',
      query: updatedQuery.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating DB QA query:', error);
    
    return NextResponse.json(
      { error: `Failed to update DB QA query: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a DB QA query
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const queryId = parseInt(params.id);
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Check if the query exists and belongs to the user
    const existingQuery = await db.execute(sql`
      SELECT * FROM db_qa_queries WHERE id = ${queryId} AND user_id = ${userIdNum}
    `);
    
    if (!existingQuery.rows.length) {
      return NextResponse.json(
        { error: 'Query not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Delete the query and its related data
    // First delete any dashboard-query relationships
    await db.execute(sql`
      DELETE FROM db_qa_dashboard_queries WHERE query_id = ${queryId}
    `);
    
    // Then delete any alerts related to this query
    const alertIds = await db.execute(sql`
      SELECT id FROM db_qa_alerts WHERE query_id = ${queryId}
    `);
    
    for (const row of alertIds.rows) {
      const alertId = row.id;
      // Delete notifications for each alert
      await db.execute(sql`
        DELETE FROM db_qa_alert_notifications WHERE alert_id = ${alertId}
      `);
    }
    
    await db.execute(sql`
      DELETE FROM db_qa_alerts WHERE query_id = ${queryId}
    `);
    
    // Delete execution results
    await db.execute(sql`
      DELETE FROM db_qa_execution_results WHERE query_id = ${queryId}
    `);
    
    // Finally delete the query itself
    await db.execute(sql`
      DELETE FROM db_qa_queries WHERE id = ${queryId} AND user_id = ${userIdNum}
    `);
    
    return NextResponse.json({
      success: true,
      message: 'DB QA query deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting DB QA query:', error);
    
    return NextResponse.json(
      { error: `Failed to delete DB QA query: ${error.message}` },
      { status: 500 }
    );
  }
}