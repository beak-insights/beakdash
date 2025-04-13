import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Create Space',
  description: 'Create a new space',
};

export default function CreateSpacePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create Space</h1>
          <Link
            href="/spaces"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <form className="space-y-6" action="/api/spaces" method="POST">
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Space Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter space name"
                required
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
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter space description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <label htmlFor="isDefault" className="text-sm font-medium leading-none">
                  Make this the default space
                </label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                The default space is used when creating new dashboards.
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                href="/spaces"
                className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-muted/50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Space
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}