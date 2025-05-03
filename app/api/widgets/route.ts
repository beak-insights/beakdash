import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { widgets, insertWidgetSchema, dashboardWidgets } from "@/lib/db/schema";
import { z } from "zod";

// GET /api/widgets
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get("dashboardId");
    const spaceId = searchParams.get("spaceId");
    
    let widgetsList = [];
    
    if (dashboardId) {
      // Get widgets for a specific dashboard
      const dashboardWidgetsList = await db.query.dashboardWidgets.findMany({
        where: (dw, { eq }) => eq(dw.dashboardId, parseInt(dashboardId)),
        with: {
          widget: true,
        },
      });
      
      widgetsList = dashboardWidgetsList.map((dw) => ({
        ...dw.widget,
        position: dw.position,
      }));
    } else if (spaceId) {
      // Get widgets for a specific space
      widgetsList = await db.query.widgets.findMany({
        where: (w, { eq }) => eq(w.spaceId, parseInt(spaceId)),
      });
    } else {
      // Get all widgets
      widgetsList = await db.query.widgets.findMany();
    }
    
    return NextResponse.json({ widgets: widgetsList });
  } catch (error) {
    console.error("Error fetching widgets:", error);
    return NextResponse.json({ error: "Failed to fetch widgets" }, { status: 500 });
  }
}

// Define a schema for widget creation that includes the dashboard ID
const createWidgetSchema = insertWidgetSchema.extend({
  dashboardId: z.number().optional(),
  position: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    w: z.number().default(6),
    h: z.number().default(4),
  }).optional(),
});

// POST /api/widgets
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dashboardId, widget } = await request.json();
    const { position, ...widgetData } = createWidgetSchema.parse(widget);
    
    // Create the widget
    const [newWidget] = await db.insert(widgets).values(widgetData).returning();
    
    // If dashboardId is provided, create the dashboard-widget relationship
    if (dashboardId) {
      await db.insert(dashboardWidgets).values({
        dashboardId,
        widgetId: newWidget.id,
        position: position || { x: 0, y: 0, w: 6, h: 4 },
      });
    }
    
    return NextResponse.json({ widget: newWidget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error creating widget:", error);
    return NextResponse.json({ error: "Failed to create widget" }, { status: 500 });
  }
}