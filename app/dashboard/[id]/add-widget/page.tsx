import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { AddWidgetClient } from './client-page';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
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
  const id = params.id;
  const dashboardId = parseInt(id);
  
  // Fetch the dashboard from the database
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
  });

  // If dashboard doesn't exist, show 404
  if (!dashboard) {
    notFound();
  }

  // Fetch available datasets
  const datasets = await db.query.datasets.findMany({
    orderBy: (datasets, { asc }) => [asc(datasets.name)],
    limit: 10,
  });

  return (
    <AppLayout>
      <AddWidgetClient dashboard={dashboard} datasets={datasets} />
    </AppLayout>
  );
}