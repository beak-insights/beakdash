import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardViewClient } from './client-page';

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
    title: `BeakDash - ${dashboard.name}`,
    description: dashboard.description || 'Dashboard view',
  };
}

export default async function DashboardViewPage({ params }: Props) {
  const { id } = await params;
  const dashboardId = parseInt(id);
  
  // Fetch the dashboard from the database
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
    with: {
      space: true,
    },
  });

  // If dashboard doesn't exist, show 404
  if (!dashboard) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/${dashboardId}/edit`}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/${dashboardId}/add-widget`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Widget
            </Link>
          </div>
        </div>

        {/* Dashboard widgets - Client component */}
        <DashboardViewClient dashboard={dashboard} />

        {/* Dashboard info */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-medium mb-4">Dashboard Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Space</h3>
              <p className="font-medium">{dashboard.space?.name || "Default Space"}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Created</h3>
              <p className="font-medium">{dashboard.createdAt 
                ? new Date(dashboard.createdAt).toLocaleDateString() 
                : "Unknown"}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Last Updated</h3>
              <p className="font-medium">{dashboard.updatedAt 
                ? new Date(dashboard.updatedAt).toLocaleDateString()
                : "Not updated yet"}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Visibility</h3>
              <p className="font-medium">{dashboard.isPublic ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}