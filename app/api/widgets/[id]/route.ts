import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { widgets, dashboardWidgets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/widgets/[id]
export async function GET(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const widgetId = parseInt(id);
    
    const widget = await db.query.widgets.findFirst({
      where: eq(widgets.id, widgetId),
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
    const { id } = await params;
    const widgetId = parseInt(id);
    const { dashboardId, widget } = await request.json();
    
    // Check if widget exists
    const existingWidget = await db.query.widgets.findFirst({
      where: eq(widgets.id, widgetId),
    });
    
    if (!existingWidget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Extract dashboard-related properties
    const { position, ...widgetData } = widget;
    
    let updatedWidget = existingWidget;
    
    // Only update widget data if there are properties to update
    if (Object.keys(widgetData).length > 0) {
      // Ensure date fields are properly formatted
      const processedWidgetData = {
        ...widgetData,
        updatedAt: new Date(), // Always update the updatedAt timestamp
        createdAt: widgetData.createdAt ? new Date(widgetData.createdAt) : existingWidget.createdAt,
      };
      
      [updatedWidget] = await db
        .update(widgets)
        .set(processedWidgetData)
        .where(eq(widgets.id, widgetId))
        .returning();
    }
    
    // If dashboardId is provided, update or create the dashboard-widget relationship
    if (dashboardId) {
      // Check if dashboard-widget relationship exists
      const existingDashboardWidget = await db.query.dashboardWidgets.findFirst({
        where: (dw, { and, eq }) => 
          and(eq(dw.widgetId, widgetId), eq(dw.dashboardId, dashboardId)),
      });
      
      if (existingDashboardWidget) {
        // Update position if provided
        if (position) {
          // Ensure position has all required fields
          const validPosition = {
            x: position.x !== undefined ? position.x : 0,
            y: position.y !== undefined ? position.y : 0,
            w: position.w !== undefined ? position.w : 6,
            h: position.h !== undefined ? position.h : 4
          };
          
          // Using the correct query structure for multiple where conditions
          await db
            .update(dashboardWidgets)
            .set({ position: validPosition })
            .where(
              and(
                eq(dashboardWidgets.widgetId, widgetId),
                eq(dashboardWidgets.dashboardId, dashboardId)
              )
            );
            
          // Log the result of the update
          const updatedDashboardWidget = await db.query.dashboardWidgets.findFirst({
            where: and(
              eq(dashboardWidgets.widgetId, widgetId),
              eq(dashboardWidgets.dashboardId, dashboardId)
            )
          });
          
        }
      } else {
        // Create new dashboard-widget relationship
        await db.insert(dashboardWidgets).values({
          dashboardId,
          widgetId,
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
    const { id } = await params;
    const widgetId = parseInt(id);
    
    // Check if widget exists
    const existingWidget = await db.query.widgets.findFirst({
      where: eq(widgets.id, widgetId),
    });
    
    if (!existingWidget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    
    // First delete any dashboard-widget relationships
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.widgetId, widgetId));
    
    // Then delete the widget
    await db.delete(widgets).where(eq(widgets.id, widgetId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json({ error: "Failed to delete widget" }, { status: 500 });
  }
}