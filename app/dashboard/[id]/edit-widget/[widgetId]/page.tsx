import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { widgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WidgetForm } from "@/components/widgets/widget-form";
import { AppLayout } from "@/components/layout/app-layout";

interface PageProps {
  params: Promise<{
    id: string;
    widgetId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, widgetId } = await params;
  const dashboardId = parseInt(id);
  const widgetIdNum = parseInt(widgetId);
  
  const widget = await db.query.widgets.findFirst({
    where: eq(widgets.id, widgetIdNum),
  });

  return {
    title: widget ? `Edit Widget - ${widget.name}` : "Edit Widget",
    description: "Edit a dashboard widget",
  };
}

export default async function EditWidgetPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth");
  }

  const { id, widgetId } = await params;
  const dashboardId = parseInt(id);
  const widgetIdNum = parseInt(widgetId);

  if (isNaN(dashboardId) || isNaN(widgetIdNum)) {
    redirect(`/dashboard/${id}`);
  }

  // Fetch the widget to edit
  const widget = await db.query.widgets.findFirst({
    where: eq(widgets.id, widgetIdNum),
    with: {
      dataset: true,
      connection: true,
    },
  });

  if (!widget) {
    redirect(`/dashboard/${id}`);
  }

  return (
    <AppLayout>
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Widget</h1>
          <WidgetForm
            dashboardId={dashboardId}
            widget={widget}
            backUrl={`/dashboard/${dashboardId}`}
            isEditMode={true}
          />
        </div>
      </div>
    </AppLayout>
  );
}