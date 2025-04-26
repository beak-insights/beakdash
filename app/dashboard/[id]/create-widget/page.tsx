import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateWidgetClient } from "./create-widget-client";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Create New Widget",
    description: "Create a new dashboard widget",
  };
}

export default async function CreateWidgetPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth");
  }

  const dashboardId = parseInt(params.id);
  if (isNaN(dashboardId)) {
    redirect("/dashboard");
  }

  return <CreateWidgetClient dashboardId={dashboardId} />;
} 