import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Data Connections',
  description: 'Manage your data connections',
};

export default function ConnectionsPage() {
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Data Connections</h1>
          <Link 
            href="/connections/create" 
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
            New Connection
          </Link>
        </div>

        {/* Connection types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-card">
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
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
                <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">SQL Database</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to SQL databases including PostgreSQL, MySQL, and SQLite.
            </p>
            <Link href="/connections/create?type=sql" className="text-sm text-primary hover:underline">
              Connect
            </Link>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">REST API</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to REST APIs with customizable authentication and parameters.
            </p>
            <Link href="/connections/create?type=rest" className="text-sm text-primary hover:underline">
              Connect
            </Link>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">CSV Upload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and process CSV files for dashboard visualization.
            </p>
            <Link href="/connections/create?type=csv" className="text-sm text-primary hover:underline">
              Upload
            </Link>
          </div>
        </div>

        {/* Existing connections */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Connections</h2>
          
          {/* Empty state */}
          <div className="border border-dashed rounded-lg p-8 bg-muted/50 flex flex-col items-center justify-center">
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
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No connections yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Create a connection to start building dashboards with your data.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}