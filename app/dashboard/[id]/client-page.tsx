'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

import { Widget } from '@/lib/db/schema';
import { GridLayoutComponent } from './grid-layout';
interface Dashboard {
  id: number;
  name: string;
  description: string | null;
  space: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

interface DashboardPageProps {
  dashboard: Dashboard;
}


export function DashboardViewClient({ dashboard }: DashboardPageProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch widgets for this dashboard
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/widgets?dashboardId=${dashboard.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch widgets');
        }
        
        const data = await response.json();
        setWidgets(data.widgets || []);
        setError(null);
      } catch (err) {
        setError('Failed to load widgets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWidgets();
  }, [dashboard.id]);


  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      ) : widgets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <a
              href={`/dashboard/${dashboard.id}/add-widget`}
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
            </a>
          </div>
        </div>
      ) : (
        <GridLayoutComponent widgets={widgets} dashboardId={dashboard.id} />
      )}
    </>
  );
}