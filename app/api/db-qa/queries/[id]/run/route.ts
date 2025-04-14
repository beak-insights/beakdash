import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db/postgres";
import { runQueryOnConnection } from "@/lib/db/run-query";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const id = await params.id;
    const queryId = parseInt(id);
    
    if (isNaN(queryId)) {
      return NextResponse.json(
        { error: "Invalid query ID" },
        { status: 400 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Fetch the query
    const queryResult = await sql`
      SELECT q.*, c.config as connection_config, c.type as connection_type
      FROM db_qa_queries q
      LEFT JOIN connections c ON q.connection_id = c.id
      WHERE q.id = ${queryId}
      AND (
        q.user_id = ${userId}
        OR (
          q.space_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM space_members 
            WHERE user_id = ${userId} 
            AND space_id = q.space_id
          )
        )
      )
    `;
    
    if (queryResult.length === 0) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }
    
    const query = queryResult[0];
    
    // Run the query on the connection
    try {
      // Mock implementation - in production, this would use a real database connection
      // based on the connection type and config
      const results = await runQueryOnConnection({
        query: query.query,
        connectionConfig: query.connection_config,
        connectionType: query.connection_type
      });
      
      // Save the execution result
      await sql`
        INSERT INTO db_qa_query_runs (
          query_id, 
          user_id, 
          status, 
          results, 
          execution_time_ms
        )
        VALUES (
          ${query.id}, 
          ${userId}, 
          ${'success'}, 
          ${JSON.stringify(results)},
          ${results.executionTimeMs || 0}
        )
      `;
      
      return NextResponse.json({
        status: 'success',
        message: 'Query executed successfully',
        data: results.data,
        executedAt: new Date().toISOString(),
        executionTimeMs: results.executionTimeMs
      });
    } catch (error: any) {
      // Save the execution error
      await sql`
        INSERT INTO db_qa_query_runs (
          query_id, 
          user_id, 
          status, 
          results, 
          execution_time_ms
        )
        VALUES (
          ${query.id}, 
          ${userId}, 
          ${'error'}, 
          ${JSON.stringify({ error: error.message })},
          0
        )
      `;
      
      return NextResponse.json({
        status: 'error',
        message: 'Error executing query',
        error: error.message,
        executedAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error("Error running query:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to run query" },
      { status: 500 }
    );
  }
}