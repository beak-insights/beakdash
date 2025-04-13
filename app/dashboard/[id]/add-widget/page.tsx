import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { WidgetForm } from '@/components/widgets/widget-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dashboardId = parseInt(id);
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
  });

  if (!dashboard) {
    return {
      title: 'Dashboard Not Found',
    };
  }

  return {
    title: `Add Widget - ${dashboard.name}`,
    description: `Add a widget to ${dashboard.name} dashboard`,
  };
}

export default async function AddWidgetPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth");
  }

  const { id } = await params;
  const dashboardId = parseInt(id);
  
  // Fetch the dashboard from the database
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
  });

  // If dashboard doesn't exist, show 404
  if (!dashboard) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Add Widget to {dashboard.name}</h1>
          <WidgetForm
            dashboardId={dashboardId}
            backUrl={`/dashboard/${dashboardId}`}
            isEditMode={false}
          />
        </div>
      </div>
    </AppLayout>
  );
}