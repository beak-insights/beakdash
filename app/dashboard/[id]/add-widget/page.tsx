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
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, parseInt(params.id)),
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
  const dashboardId = parseInt(params.id);
  
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboards
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <Link href={`/dashboard/${dashboardId}`} className="text-sm text-muted-foreground hover:text-foreground">
                {dashboard.name}
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm">Add Widget</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Add Widget</h1>
          </div>
          
          <Link
            href={`/dashboard/${dashboardId}`}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </Link>
        </div>

        {/* Widget type selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">1. Select Widget Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chart Widget */}
            <div className="border rounded-lg p-4 bg-card cursor-pointer hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  className="text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Chart</h3>
              <p className="text-sm text-muted-foreground">
                Bar, line, and pie charts for data visualization.
              </p>
            </div>
            
            {/* Stat Card Widget */}
            <div className="border rounded-lg p-4 bg-card cursor-pointer hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  className="text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Stat Card</h3>
              <p className="text-sm text-muted-foreground">
                Display key metrics with comparison to previous periods.
              </p>
            </div>
            
            {/* Table Widget */}
            <div className="border rounded-lg p-4 bg-card cursor-pointer hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  className="text-primary"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Table</h3>
              <p className="text-sm text-muted-foreground">
                Display data in rows and columns with sorting and filtering.
              </p>
            </div>
            
            {/* Text Widget */}
            <div className="border rounded-lg p-4 bg-card cursor-pointer hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  className="text-primary"
                >
                  <path d="M4 7V4h16v3" />
                  <path d="M9 20h6" />
                  <path d="M12 4v16" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Text</h3>
              <p className="text-sm text-muted-foreground">
                Add formatted text, markdown, or titles to your dashboard.
              </p>
            </div>
          </div>
        </div>
        
        {/* Data source selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">2. Select Data Source</h2>
          
          {datasets.length === 0 ? (
            <div className="border border-dashed rounded-lg p-6 bg-muted/50 text-center">
              <h3 className="text-sm font-medium mb-2">No datasets available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a dataset to use as a data source for your widget.
              </p>
              <Link
                href="/datasets"
                className="text-sm text-primary hover:underline"
              >
                Create Dataset
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <label 
                htmlFor="dataset" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Dataset
              </label>
              <select
                id="dataset"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Configuration */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">3. Configure Widget</h2>
          
          <div className="border rounded-lg p-6 bg-card space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="widgetTitle" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Widget Title
              </label>
              <input
                id="widgetTitle"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter widget title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  htmlFor="widgetWidth" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Width
                </label>
                <select
                  id="widgetWidth"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="1">Small (1/3)</option>
                  <option value="2">Medium (2/3)</option>
                  <option value="3" selected>Full (3/3)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="widgetHeight" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Height
                </label>
                <select
                  id="widgetHeight"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="small">Small</option>
                  <option value="medium" selected>Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="widgetRefresh" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Refresh Interval
              </label>
              <select
                id="widgetRefresh"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="0">Never</option>
                <option value="60">Every minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="1800">Every 30 minutes</option>
                <option value="3600">Every hour</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Preview & Actions */}
        <div className="border-t pt-6 flex justify-between">
          <Link
            href={`/dashboard/${dashboardId}`}
            className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Link>
          
          <div className="flex space-x-4">
            <button
              type="button"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
            >
              Preview
            </button>
            
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Widget
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}