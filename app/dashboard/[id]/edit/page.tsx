import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/db';
import { dashboards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await params.id;
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, parseInt(id)),
  });

  if (!dashboard) {
    return {
      title: 'Dashboard Not Found',
    };
  }

  return {
    title: `Edit - ${dashboard.name}`,
    description: `Edit dashboard: ${dashboard.name}`,
  };
}

export default async function EditDashboardPage({ params }: Props) {
  const id = await params.id;
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

  // Fetch spaces for the dropdown
  const spaces = await db.query.spaces.findMany({
    orderBy: (spaces, { asc }) => [asc(spaces.name)],
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Editing: {dashboard.name}
            </p>
          </div>
          
          <Link
            href={`/dashboard/${dashboardId}`}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <form className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Dashboard Name
              </label>
              <input
                id="name"
                type="text"
                defaultValue={dashboard.name}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter dashboard name"
              />
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="description" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                defaultValue={dashboard.description || ''}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter dashboard description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="space" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Space
              </label>
              <select
                id="space"
                defaultValue={dashboard.spaceId}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
                {spaces.length === 0 && (
                  <option value={dashboard.spaceId || 0}>
                    {dashboard.space?.name || 'Default Space'}
                  </option>
                )}
              </select>
              <p className="text-xs text-muted-foreground">
                The space this dashboard belongs to.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  defaultChecked={dashboard.isPublic}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <label htmlFor="is_public" className="text-sm font-medium leading-none">
                  Make dashboard public
                </label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Public dashboards can be viewed by anyone with the link.
              </p>
            </div>
            
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-sm font-medium border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                Delete Dashboard
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href={`/dashboard/${dashboardId}`}
                  className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}