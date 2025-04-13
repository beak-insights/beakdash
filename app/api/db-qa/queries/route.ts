import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { dbQaQueries, connections, insertDbQaQuerySchema } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";

// GET /api/db-qa/queries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");
    const connectionId = searchParams.get("connectionId");
    const category = searchParams.get("category");
    
    // Build query conditions
    let conditions = [eq(dbQaQueries.userId, Number(session.user.id))];
    
    // Apply space filter
    if (spaceId) {
      conditions.push(eq(dbQaQueries.spaceId, Number(spaceId)));
    } else if (spaceId === null) {
      // Explicitly filter for NULL spaceId (global queries)
      conditions.push(isNull(dbQaQueries.spaceId));
    }
    
    // Add connection filter if specified
    if (connectionId) {
      conditions.push(eq(dbQaQueries.connectionId, Number(connectionId)));
    }
    
    // Add category filter if specified
    if (category) {
      conditions.push(eq(dbQaQueries.category, category));
    }
    
    const queries = await db.query.dbQaQueries.findMany({
      where: and(...conditions),
      with: {
        connection: true,
        space: true,
        executionResults: {
          orderBy: (executionResults, { desc }) => [desc(executionResults.executionTime)],
          limit: 1,
        },
      },
      orderBy: (dbQaQueries, { desc }) => [desc(dbQaQueries.updatedAt)],
    });
    
    return NextResponse.json(queries);
  } catch (error) {
    console.error("Error fetching DB QA queries:", error);
    return NextResponse.json({ error: "Failed to fetch DB QA queries" }, { status: 500 });
  }
}

// POST /api/db-qa/queries
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate using insertDbQaQuerySchema
    const validatedData = insertDbQaQuerySchema.parse({
      ...body,
      userId: Number(session.user.id),
    });
    
    // Check if the connection exists and user has access to it
    const connection = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, validatedData.connectionId),
        eq(connections.userId, Number(session.user.id))
      ),
    });
    
    if (!connection) {
      return NextResponse.json({ error: "Connection not found or access denied" }, { status: 404 });
    }
    
    // Insert the DB QA query
    const [createdQuery] = await db.insert(dbQaQueries).values(validatedData).returning();
    
    return NextResponse.json(createdQuery);
  } catch (error) {
    console.error("Error creating DB QA query:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.format() }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to create DB QA query" }, { status: 500 });
  }
}