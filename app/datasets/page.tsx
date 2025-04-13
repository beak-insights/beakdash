import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { DatasetsClient } from './client-page';

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
          <Button asChild>
            <Link href="/datasets/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Dataset
            </Link>
          </Button>
        </div>

        {/* Dataset list */}
        <DatasetsClient />

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