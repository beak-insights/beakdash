import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { dashboardWidgets, dashboards, widgets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/dashboards/[id]/widgets
export async function GET(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const dashboardId = parseInt(id);
    
    // Check if dashboard exists
    const dashboard = await db.query.dashboards.findFirst({
      where: eq(dashboards.id, dashboardId),
    });
    
    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }
    
    // Log the dashboard ID we're fetching for
    console.log(`Fetching widgets for dashboard ID: ${dashboardId}`);
    
    // Get all widgets for this dashboard with explicit join to ensure position data
    const dashboardWidgetsList = await db.query.dashboardWidgets.findMany({
      where: eq(dashboardWidgets.dashboardId, dashboardId),
      with: {
        widget: {
          with: {
            dataset: true,
            connection: true,
          },
        },
      },
    });
    
    // Log the raw response
    console.log(`Found ${dashboardWidgetsList.length} widgets for dashboard ${dashboardId}`);
    dashboardWidgetsList.forEach((dw, index) => {
      console.log(`Widget ${index + 1}:`, {
        id: dw.widget.id,
        name: dw.widget.name,
        position: dw.position
      });
    });
    
    // Transform to include position information with the widget
    const widgetsList = dashboardWidgetsList.map((dw) => {
      console.log("Dashboard Widget position:", dw.position);
      return {
        ...dw.widget,
        position: dw.position,
      };
    });
    
    console.log("Sending widgets with positions:", widgetsList.map(w => ({ id: w.id, position: w.position })));
    return NextResponse.json({ widgets: widgetsList });
  } catch (error) {
    console.error("Error fetching dashboard widgets:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard widgets" }, { status: 500 });
  }
}

// POST /api/dashboards/[id]/widgets
export async function POST(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const dashboardId = parseInt(id);
    const json = await request.json();
    
    // Check if dashboard exists
    const dashboard = await db.query.dashboards.findFirst({
      where: eq(dashboards.id, dashboardId),
    });
    
    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }
    
    // If widgetId is provided, add existing widget to dashboard
    if (json.widgetId) {
      const widgetId = json.widgetId;
      
      // Check if widget exists
      const widget = await db.query.widgets.findFirst({
        where: eq(widgets.id, widgetId),
      });
      
      if (!widget) {
        return NextResponse.json({ error: "Widget not found" }, { status: 404 });
      }
      
      // Check if widget is already added to this dashboard
      const existingDashboardWidget = await db.query.dashboardWidgets.findFirst({
        where: (dw, { and, eq }) => 
          and(eq(dw.widgetId, widgetId), eq(dw.dashboardId, dashboardId)),
      });
      
      if (existingDashboardWidget) {
        return NextResponse.json({ error: "Widget already added to this dashboard" }, { status: 400 });
      }
      
      // Add widget to dashboard
      await db.insert(dashboardWidgets).values({
        dashboardId,
        widgetId,
        position: json.position || { x: 0, y: 0, w: 6, h: 4 },
      });
      
      return NextResponse.json({ success: true, widget });
    } 
    // Otherwise, create a new widget and add it to dashboard
    else {
      // Set the spaceId from the dashboard if not provided
      if (!json.spaceId && dashboard.spaceId) {
        json.spaceId = dashboard.spaceId;
      }
      
      // Create new widget
      const [newWidget] = await db.insert(widgets).values(json).returning();
      
      // Add widget to dashboard
      await db.insert(dashboardWidgets).values({
        dashboardId,
        widgetId: newWidget.id,
        position: json.position || { x: 0, y: 0, w: 6, h: 4 },
      });
      
      return NextResponse.json({ success: true, widget: newWidget });
    }
  } catch (error) {
    console.error("Error adding widget to dashboard:", error);
    return NextResponse.json({ error: "Failed to add widget to dashboard" }, { status: 500 });
  }
}