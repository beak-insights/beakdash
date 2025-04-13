import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Database, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Dataset - BeakDash',
  description: 'Create a new dataset',
};

export default function CreateDatasetPage() {
  // Mock connections that would be fetched from API
  const connections = [
    { id: 'c1', name: 'PostgreSQL Production', type: 'postgresql' },
    { id: 'c2', name: 'REST API Service', type: 'rest' },
    { id: 'c3', name: 'Sales Data CSV', type: 'csv' },
  ];
  
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/datasets">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create Dataset</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Information</CardTitle>
              <CardDescription>
                Basic information about your dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input id="dataset-name" placeholder="My Dataset" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataset-description">Description (optional)</Label>
                <Textarea 
                  id="dataset-description" 
                  placeholder="A brief description of what this dataset contains and how it will be used" 
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh-frequency">Refresh Frequency</Label>
                <Select defaultValue="manual">
                  <SelectTrigger id="refresh-frequency">
                    <SelectValue placeholder="Select refresh frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Refresh</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="connection" className="block mb-2">
                  Select Data Connection
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map(connection => (
                    <div 
                      key={connection.id}
                      className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Database className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {connection.type} connection
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Link href="/connections/create" className="block border rounded-md p-4 border-dashed text-center hover:border-primary transition-colors">
                    <p className="text-sm">+ Create New Connection</p>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Query Configuration</CardTitle>
              <CardDescription>
                Define how to extract data from your connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query-type">Query Type</Label>
                <Select defaultValue="sql">
                  <SelectTrigger id="query-type">
                    <SelectValue placeholder="Select query type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sql">SQL Query</SelectItem>
                    <SelectItem value="table">Table Selection</SelectItem>
                    <SelectItem value="api">API Endpoint</SelectItem>
                    <SelectItem value="custom">Custom Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sql-query">SQL Query</Label>
                <Textarea 
                  id="sql-query" 
                  placeholder="SELECT * FROM users WHERE created_at > '2025-01-01'" 
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Preview Results
                </Button>
              </div>
              
              {/* Preview Results Area (would be populated after clicking Preview) */}
              <div className="rounded-md border p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Query Results Preview</h3>
                  <p className="text-xs text-muted-foreground">Showing first 5 rows</p>
                </div>
                <div className="overflow-x-auto">
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Click "Preview Results" to see data
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Create Dataset</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}