import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: { id?: string };
};

export const metadata: Metadata = {
  title: 'BeakDash - Dashboard',
  description: 'View your dashboard',
};

async function getDashboardData(id: string) {
  const dashboardId = parseInt(id);
  
  if (isNaN(dashboardId)) {
    return null;
  }
  
  return await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
    with: {
      space: true,
    },
  });
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // If no ID provided, redirect to dashboards list
  if (!searchParams.id) {
    return (
      <AppLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Dashboards</h1>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/dashboard/create" 
              className="border border-dashed p-6 rounded-lg text-center hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center min-h-[180px]"
            >
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
                className="mb-4"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Create New Dashboard</span>
            </Link>
            
            {/* We can fetch and display existing dashboards here */}
          </div>
        </div>
      </AppLayout>
    );
  }

  try {
    const dashboard = await getDashboardData(searchParams.id);

    // If dashboard doesn't exist, show 404
    if (!dashboard) {
      return (
        <AppLayout>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Dashboard not found. The dashboard may have been deleted or you don't have permission to view it.
          </div>
        </AppLayout>
      );
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
                href={`/dashboard?id=${dashboard.id}&mode=edit`}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
              >
                Edit
              </Link>
              <Link
                href={`/dashboard/add-widget?dashboardId=${dashboard.id}`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Widget
              </Link>
            </div>
          </div>

          {/* Dashboard widgets - This would be a client component */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">Sample Widget</h3>
              <div className="h-[200px] mt-2 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Widget Content</p>
              </div>
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
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <AppLayout>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          An error occurred while loading this dashboard. Please try again later.
        </div>
      </AppLayout>
    );
  }
}