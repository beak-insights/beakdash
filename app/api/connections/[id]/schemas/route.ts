import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbSchemas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const connectionId = parseInt(params.id);
    if (isNaN(connectionId)) {
      return new NextResponse("Invalid connection ID", { status: 400 });
    }

    const schemas = await db
      .select()
      .from(dbSchemas)
      .where(eq(dbSchemas.connectionId, connectionId));

    return NextResponse.json(schemas);
  } catch (error) {
    console.error("[SCHEMAS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 