import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';

// Define metadata for the widgets page
export const metadata: Metadata = {
  title: 'BeakDash - Dashboard Widgets',
  description: 'Manage and customize your dashboard widgets',
};

// Widgets page component
export default function Widgets() {
  return (
    <AppLayout>
      <div className="container p-6">
        <h1 className="text-3xl font-bold mb-6">Widgets</h1>
        <p className="text-muted-foreground mb-8">
          This page is currently under development. Soon, you'll be able to manage your dashboard widgets here.
        </p>
        <div className="border border-dashed rounded-lg p-8 bg-muted/50 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
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
          <h3 className="text-lg font-medium mb-1">Widget Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mx-auto">
            Check back soon to create and manage your dashboard widgets.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}