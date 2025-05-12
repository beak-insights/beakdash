import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';
import { DatasetsClient } from './client-page';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'BeakDash - Datasets',
  description: 'Manage your datasets',
};

export default function DatasetsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <Header title="Datasets" description="">
          <Link
            href="/datasets/create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            New Dataset
          </Link>
        </Header>

        {/* Dataset list */}
        <div className="p-4">
          <DatasetsClient />
        </div>

        {/* Dataset creation steps */}
        <div className="p-4">
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