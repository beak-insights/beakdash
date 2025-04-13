import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { dbQaQueries, dbQaExecutionResults, connections } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

// POST /api/db-qa/queries/[id]/run
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid query ID" }, { status: 400 });
    }
    
    // Get the query with its connection
    const query = await db.query.dbQaQueries.findFirst({
      where: and(
        eq(dbQaQueries.id, id),
        eq(dbQaQueries.userId, Number(session.user.id))
      ),
      with: {
        connection: true,
      },
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    // Start execution timer
    const startTime = Date.now();
    
    let queryResult = null;
    let queryError = null;
    let queryStatus = "success";
    
    try {
      // Execute the DB QA query against the data source
      // For now, we'll use the pg client to execute SQL queries
      // In a real-world scenario, you'd have different adapters for different connection types
      
      if (query.connection.type === "sql") {
        // Get the connection config
        const connConfig = query.connection.config as any;
        
        // Create a PostgreSQL connection pool
        const pool = new Pool({
          user: connConfig.user || process.env.PGUSER,
          host: connConfig.host || process.env.PGHOST,
          database: connConfig.database || process.env.PGDATABASE,
          password: connConfig.password || process.env.PGPASSWORD,
          port: connConfig.port || Number(process.env.PGPORT || 5432),
          ssl: connConfig.ssl || false,
        });
        
        // Execute the query
        const result = await pool.query(query.query);
        
        // Close the pool
        await pool.end();
        
        queryResult = {
          rows: result.rows,
          rowCount: result.rowCount,
          fields: result.fields.map(f => ({
            name: f.name,
            dataTypeID: f.dataTypeID,
          })),
        };
        
        // Check against expected result if defined
        if (query.expectedResult && Object.keys(query.expectedResult).length > 0) {
          // Implement logic to compare actual result with expected result
          // This would check thresholds, data quality rules, etc.
          
          // For now, a simple check on row count as an example
          const expectedRowCount = query.expectedResult.rowCount;
          
          if (expectedRowCount !== undefined && queryResult.rowCount !== expectedRowCount) {
            queryStatus = "warning";
          }
        }
      } else {
        // For now, we only support SQL connections
        return NextResponse.json(
          { error: `Connection type ${query.connection.type} not supported` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error("Error executing DB QA query:", error);
      queryError = error.message || "Error executing query";
      queryStatus = "error";
    }
    
    // Calculate execution duration
    const executionDuration = Date.now() - startTime;
    
    // Create an execution result
    const [executionResult] = await db.insert(dbQaExecutionResults).values({
      queryId: id,
      executionTime: new Date(),
      status: queryStatus,
      result: queryResult || {},
      metrics: {
        executionDuration,
        rowCount: queryResult?.rowCount || 0,
      },
      executionDuration: Math.floor(executionDuration),
      errorMessage: queryError,
    }).returning();
    
    // Update the query's last execution time
    await db.update(dbQaQueries)
      .set({
        lastExecutionTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dbQaQueries.id, id));
    
    // Return the execution result
    return NextResponse.json(executionResult);
  } catch (error) {
    console.error("Error running DB QA query:", error);
    return NextResponse.json({ error: "Failed to run DB QA query" }, { status: 500 });
  }
}