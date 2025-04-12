import React from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'BeakDash - Dashboards',
  description: 'View and manage your dashboards',
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Dashboard
          </button>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Empty state */}
          <div className="col-span-full flex flex-col items-center justify-center border border-dashed rounded-lg p-8 bg-muted/50">
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
                <path d="M5 3a2 2 0 0 0-2 2" />
                <path d="M19 3a2 2 0 0 1 2 2" />
                <path d="M21 19a2 2 0 0 1-2 2" />
                <path d="M5 21a2 2 0 0 1-2-2" />
                <path d="M9 3h1" />
                <path d="M9 21h1" />
                <path d="M14 3h1" />
                <path d="M14 21h1" />
                <path d="M3 9v1" />
                <path d="M21 9v1" />
                <path d="M3 14v1" />
                <path d="M21 14v1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No dashboards yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create your first dashboard to start visualizing your data.
            </p>
            <button
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
              Create Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}