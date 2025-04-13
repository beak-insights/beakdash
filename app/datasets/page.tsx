import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Datasets',
  description: 'Manage your datasets',
};

export default function DatasetsPage() {
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Datasets</h1>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Dataset
          </button>
        </div>

        {/* Dataset list */}
        <div className="space-y-6">
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
                <path d="M21 6v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6" />
                <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
                <path d="M12 11v4" />
                <path d="M10 13h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No datasets yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create a dataset from your connections to use in your dashboards.
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
              Create Dataset
            </button>
          </div>
        </div>

        {/* Dataset creation steps */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">How to create a dataset</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 bg-card">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-medium">
                1
              </div>
              <h3 className="text-lg font-medium mb-2">Select a Connection</h3>
              <p className="text-sm text-muted-foreground">
                Choose from your existing connections or create a new one.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 bg-card">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-medium">
                2
              </div>
              <h3 className="text-lg font-medium mb-2">Configure Query</h3>
              <p className="text-sm text-muted-foreground">
                Write a SQL query, configure API parameters, or upload a CSV file.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 bg-card">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-medium">
                3
              </div>
              <h3 className="text-lg font-medium mb-2">Transform Data</h3>
              <p className="text-sm text-muted-foreground">
                Apply transformations, filters, and aggregations to your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}