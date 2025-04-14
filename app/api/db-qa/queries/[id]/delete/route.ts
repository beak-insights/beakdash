import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db/postgres";

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
    
    // Check if query exists and belongs to the user
    const queryResult = await sql`
      SELECT q.*, s.name as space_name
      FROM db_qa_queries q
      LEFT JOIN spaces s ON q.space_id = s.id
      WHERE q.id = ${queryId}
      AND (
        q.user_id = ${userId}
        OR (
          q.space_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM space_members 
            WHERE user_id = ${userId} 
            AND space_id = q.space_id
            AND role = 'admin'
          )
        )
      )
    `;
    
    if (queryResult.length === 0) {
      return NextResponse.json(
        { error: "Query not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }
    
    // Delete the query
    await sql`
      DELETE FROM db_qa_queries
      WHERE id = ${queryId}
    `;
    
    return NextResponse.json({
      success: true,
      message: "Query deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting query:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to delete query" },
      { status: 500 }
    );
  }
}