import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, parseInt(params.id)),
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
  const dashboardId = parseInt(params.id);
  
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

        {/* Dashboard widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Empty state if no widgets */}
          <div className="col-span-full border border-dashed rounded-lg p-8 bg-muted/50 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No widgets yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Add your first widget to start visualizing your data.
            </p>
            <Link
              href={`/dashboard/${dashboardId}/add-widget`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Widget
            </Link>
          </div>
        </div>

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