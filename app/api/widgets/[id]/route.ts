import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { widgets, dashboardWidgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: { id: string };
}

// GET /api/widgets/[id]
export async function GET(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    const widget = await db.query.widgets.findFirst({
      where: eq(widgets.id, id),
      with: {
        dashboardWidgets: {
          with: {
            dashboard: true,
          },
        },
        dataset: true,
        connection: true,
      },
    });
    
    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    
    return NextResponse.json({ widget });
  } catch (error) {
    console.error("Error fetching widget:", error);
    return NextResponse.json({ error: "Failed to fetch widget" }, { status: 500 });
  }
}

// PUT /api/widgets/[id]
export async function PUT(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const json = await request.json();
    
    // Check if widget exists
    const existingWidget = await db.query.widgets.findFirst({
      where: eq(widgets.id, id),
    });
    
    if (!existingWidget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    
    // Extract dashboard-related properties
    const { dashboardId, position, ...widgetData } = json;
    
    // Update the widget
    const [updatedWidget] = await db
      .update(widgets)
      .set(widgetData)
      .where(eq(widgets.id, id))
      .returning();
    
    // If dashboardId is provided, update or create the dashboard-widget relationship
    if (dashboardId) {
      // Check if dashboard-widget relationship exists
      const existingDashboardWidget = await db.query.dashboardWidgets.findFirst({
        where: (dw, { and, eq }) => 
          and(eq(dw.widgetId, id), eq(dw.dashboardId, dashboardId)),
      });
      
      if (existingDashboardWidget) {
        // Update position if provided
        if (position) {
          await db
            .update(dashboardWidgets)
            .set({ position })
            .where(eq(dashboardWidgets.widgetId, id))
            .where(eq(dashboardWidgets.dashboardId, dashboardId));
        }
      } else {
        // Create new dashboard-widget relationship
        await db.insert(dashboardWidgets).values({
          dashboardId,
          widgetId: id,
          position: position || { x: 0, y: 0, w: 6, h: 4 },
        });
      }
    }
    
    return NextResponse.json({ widget: updatedWidget });
  } catch (error) {
    console.error("Error updating widget:", error);
    return NextResponse.json({ error: "Failed to update widget" }, { status: 500 });
  }
}

// DELETE /api/widgets/[id]
export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    // Check if widget exists
    const existingWidget = await db.query.widgets.findFirst({
      where: eq(widgets.id, id),
    });
    
    if (!existingWidget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    
    // First delete any dashboard-widget relationships
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.widgetId, id));
    
    // Then delete the widget
    await db.delete(widgets).where(eq(widgets.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json({ error: "Failed to delete widget" }, { status: 500 });
  }
}