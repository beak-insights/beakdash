import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { dashboardWidgets, dashboards, widgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: { id: string };
}

// Helper function to get dashboard data by ID
async function getDashboardById(dashboardId: number) {
  return await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
  });
}

// Helper function to get widget data by ID
async function getWidgetById(widgetId: number) {
  return await db.query.widgets.findFirst({
    where: eq(widgets.id, widgetId),
  });
}

// Helper function to check if widget is already in dashboard
async function getDashboardWidget(dashboardId: number, widgetId: number) {
  return await db.query.dashboardWidgets.findFirst({
    where: (dw, { and, eq }) => 
      and(eq(dw.widgetId, widgetId), eq(dw.dashboardId, dashboardId)),
  });
}

// GET /api/dashboards/[id]/widgets
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely access params
    const id = String(params.id);
    const dashboardId = parseInt(id);
    
    if (isNaN(dashboardId)) {
      return NextResponse.json({ error: "Invalid dashboard ID" }, { status: 400 });
    }
    
    // Check if dashboard exists
    const dashboard = await getDashboardById(dashboardId);
    
    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }
    
    // Get all widgets for this dashboard
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
    
    // Transform to include position information with the widget
    const widgetsList = dashboardWidgetsList.map((dw) => ({
      ...dw.widget,
      position: dw.position,
    }));
    
    return NextResponse.json({ widgets: widgetsList });
  } catch (error) {
    console.error("Error fetching dashboard widgets:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard widgets" }, { status: 500 });
  }
}

// POST /api/dashboards/[id]/widgets
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Safely access params
    const id = String(params.id);
    const dashboardId = parseInt(id);
    
    if (isNaN(dashboardId)) {
      return NextResponse.json({ error: "Invalid dashboard ID" }, { status: 400 });
    }
    
    const json = await request.json();
    
    // Check if dashboard exists
    const dashboard = await getDashboardById(dashboardId);
    
    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }
    
    // If widgetId is provided, add existing widget to dashboard
    if (json.widgetId) {
      const widgetId = json.widgetId;
      
      // Check if widget exists
      const widget = await getWidgetById(widgetId);
      
      if (!widget) {
        return NextResponse.json({ error: "Widget not found" }, { status: 404 });
      }
      
      // Check if widget is already added to this dashboard
      const existingDashboardWidget = await getDashboardWidget(dashboardId, widgetId);
      
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