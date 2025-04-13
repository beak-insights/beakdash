import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { dbQaQueries, insertDbQaQuerySchema } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";

// GET /api/db-qa/queries/[id]
export async function GET(
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
    
    const query = await db.query.dbQaQueries.findFirst({
      where: and(
        eq(dbQaQueries.id, id),
        eq(dbQaQueries.userId, Number(session.user.id))
      ),
      with: {
        connection: true,
        space: true,
        executionResults: {
          orderBy: (executionResults, { desc }) => [desc(executionResults.executionTime)],
          limit: 10,
        },
      },
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    return NextResponse.json(query);
  } catch (error) {
    console.error("Error fetching DB QA query:", error);
    return NextResponse.json({ error: "Failed to fetch DB QA query" }, { status: 500 });
  }
}

// PUT /api/db-qa/queries/[id]
export async function PUT(
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
    
    // Check if the query exists and belongs to the user
    const existingQuery = await db.query.dbQaQueries.findFirst({
      where: and(
        eq(dbQaQueries.id, id),
        eq(dbQaQueries.userId, Number(session.user.id))
      ),
    });
    
    if (!existingQuery) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Don't allow changing the user ID
    delete body.userId;
    
    // Update the query
    const [updatedQuery] = await db.update(dbQaQueries)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(dbQaQueries.id, id))
      .returning();
    
    return NextResponse.json(updatedQuery);
  } catch (error) {
    console.error("Error updating DB QA query:", error);
    return NextResponse.json({ error: "Failed to update DB QA query" }, { status: 500 });
  }
}

// DELETE /api/db-qa/queries/[id]
export async function DELETE(
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
    
    // Check if the query exists and belongs to the user
    const query = await db.query.dbQaQueries.findFirst({
      where: and(
        eq(dbQaQueries.id, id),
        eq(dbQaQueries.userId, Number(session.user.id))
      ),
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    // Delete the query - this should cascade to related entities like execution results
    const [deletedQuery] = await db.delete(dbQaQueries)
      .where(eq(dbQaQueries.id, id))
      .returning();
    
    return NextResponse.json({ message: "Query deleted successfully", query: deletedQuery });
  } catch (error) {
    console.error("Error deleting DB QA query:", error);
    return NextResponse.json({ error: "Failed to delete DB QA query" }, { status: 500 });
  }
}