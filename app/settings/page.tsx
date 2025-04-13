import React from 'react';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeakDash - Settings',
  description: 'Configure your application settings',
};

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings sidebar */}
          <div className="col-span-1 space-y-1">
            <button
              className="w-full text-left px-4 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm"
            >
              General
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-sm"
            >
              Appearance
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-sm"
            >
              Notifications
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-sm"
            >
              Privacy & Security
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-sm"
            >
              API Keys
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-sm"
            >
              Integrations
            </button>
          </div>

          {/* Settings content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            <div className="border rounded-lg p-6 bg-card space-y-4">
              <h2 className="text-lg font-medium">General Settings</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="timezone" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="UTC"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST/EDT)</option>
                    <option value="CST">Central Time (CST/CDT)</option>
                    <option value="MST">Mountain Time (MST/MDT)</option>
                    <option value="PST">Pacific Time (PST/PDT)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="language" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="date-format" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Date Format
                  </label>
                  <select
                    id="date-format"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="MM/DD/YYYY"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-card space-y-4">
              <h2 className="text-lg font-medium">Default Dashboard Settings</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-refresh Dashboards
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      id="auto-refresh"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      defaultChecked
                    />
                    <label 
                      htmlFor="auto-refresh" 
                      className="text-sm text-muted-foreground"
                    >
                      Automatically refresh dashboard data
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="refresh-interval" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Refresh Interval (minutes)
                  </label>
                  <input
                    id="refresh-interval"
                    type="number"
                    defaultValue="5"
                    min="1"
                    max="60"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="default-chart-theme" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Default Chart Theme
                  </label>
                  <select
                    id="default-chart-theme"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="light"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">Match System Theme</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}