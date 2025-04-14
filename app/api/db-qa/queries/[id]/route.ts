import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db/postgres";

export async function GET(
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

    // Parse query ID
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
    
    // Fetch query with additional info
    const result = await sql`
      SELECT 
        q.*,
        c.name as connection_name,
        c.type as connection_type,
        s.name as space_name
      FROM 
        db_qa_queries q
      LEFT JOIN 
        connections c ON q.connection_id = c.id
      LEFT JOIN 
        spaces s ON q.space_id = s.id
      WHERE 
        q.id = ${queryId}
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
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }
    
    // Format the response
    const query = result[0];
    
    // Add formatted connection and space data
    const formattedQuery = {
      ...query,
      connection: query.connection_name ? {
        name: query.connection_name,
        type: query.connection_type
      } : null,
      space: query.space_name ? {
        name: query.space_name
      } : null
    };
    
    return NextResponse.json(formattedQuery);
  } catch (error: any) {
    console.error("Error fetching query:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch query" },
      { status: 500 }
    );
  }
}