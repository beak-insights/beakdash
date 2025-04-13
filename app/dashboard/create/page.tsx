import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Create Dashboard',
  description: 'Create a new dashboard',
};

export default function CreateDashboardPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create Dashboard</h1>
          <Link
            href="/dashboard"
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="1">Default Space</option>
                <option value="2">Personal Analytics</option>
                <option value="3">Team Projects</option>
              </select>
              <p className="text-xs text-muted-foreground">
                The space this dashboard belongs to.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Layout
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors flex flex-col items-center">
                  <div className="w-full h-24 bg-muted/50 rounded-md mb-2 flex flex-col">
                    <div className="h-1/2 border-b border-border"></div>
                    <div className="grid grid-cols-2 h-1/2">
                      <div className="border-r border-border"></div>
                    </div>
                  </div>
                  <span className="text-sm">Standard</span>
                </div>
                
                <div className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors flex flex-col items-center">
                  <div className="w-full h-24 bg-muted/50 rounded-md mb-2 flex flex-col">
                    <div className="h-1/3 border-b border-border"></div>
                    <div className="grid grid-cols-3 h-2/3">
                      <div className="border-r border-border"></div>
                      <div className="border-r border-border"></div>
                    </div>
                  </div>
                  <span className="text-sm">Analytics</span>
                </div>
                
                <div className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors flex flex-col items-center">
                  <div className="w-full h-24 bg-muted/50 rounded-md mb-2 grid grid-cols-4 grid-rows-3 gap-1">
                    <div className="bg-border rounded-sm col-span-4"></div>
                    <div className="bg-border rounded-sm col-span-2 row-span-2"></div>
                    <div className="bg-border rounded-sm col-span-2"></div>
                    <div className="bg-border rounded-sm col-span-2"></div>
                  </div>
                  <span className="text-sm">Custom</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
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
            
            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-muted/50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}