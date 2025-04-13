import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { widgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditWidgetForm } from "../../../../components/widgets/edit-widget-form";

export const metadata: Metadata = {
  title: "Edit Widget",
  description: "Edit a dashboard widget",
};

interface PageProps {
  params: {
    id: string;
    widgetId: string;
  };
}

export default async function EditWidgetPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth");
  }

  const dashboardId = parseInt(params.id);
  const widgetId = parseInt(params.widgetId);

  if (isNaN(dashboardId) || isNaN(widgetId)) {
    redirect(`/dashboard/${params.id}`);
  }

  // Fetch the widget to edit
  const widget = await db.query.widgets.findFirst({
    where: eq(widgets.id, widgetId),
    with: {
      dataset: true,
      connection: true,
    },
  });

  if (!widget) {
    redirect(`/dashboard/${params.id}`);
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Widget</h1>
        <EditWidgetForm
          dashboardId={dashboardId}
          widget={widget}
          backUrl={`/dashboard/${dashboardId}`}
        />
      </div>
    </div>
  );
}