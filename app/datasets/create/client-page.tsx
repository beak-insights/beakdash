'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type definition for connections
interface Connection {
  id: number;
  name: string;
  type: string;
  config: any;
  user_id: number;
  space_id: number | null;
  created_at: string;
  updated_at: string;
}

// Dataset form data type
interface DatasetFormData {
  name: string;
  description: string;
  refreshFrequency: string;
  connectionId: string;
  queryType: string;
  sqlQuery: string;
}

export function CreateDatasetClient() {
  const { toast } = useToast();
  
  // Initialize form state
  const [formData, setFormData] = useState<DatasetFormData>({
    name: '',
    description: '',
    refreshFrequency: 'manual',
    connectionId: '',
    queryType: 'sql',
    sqlQuery: 'SELECT * FROM ',
  });
  
  // Fetch connections with React Query
  const { data: connections = [], isLoading: connectionsLoading, isError: connectionsError } = useQuery<Connection[]>({
    queryKey: ['/api/connections'],
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  // Handle input changes
  const handleInputChange = (field: keyof DatasetFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.connectionId) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Creating dataset',
      description: 'Your dataset is being created...',
    });
    
    try {
      // Send data to API endpoint
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dataset');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Dataset created successfully',
      });
      
      // Redirect to datasets page
      window.location.href = '/datasets';
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dataset. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
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
      
      <form onSubmit={handleSubmit}>
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
                <Label htmlFor="dataset-name">Dataset Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="dataset-name" 
                  placeholder="My Dataset" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataset-description">Description (optional)</Label>
                <Textarea 
                  id="dataset-description" 
                  placeholder="A brief description of what this dataset contains and how it will be used" 
                  className="min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh-frequency">Refresh Frequency</Label>
                <Select 
                  value={formData.refreshFrequency}
                  onValueChange={(value) => handleInputChange('refreshFrequency', value)}
                >
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
                  Select Data Connection <span className="text-red-500">*</span>
                </Label>
                
                {connectionsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading connections...</p>
                ) : connectionsError ? (
                  <p className="text-sm text-red-500">Error loading connections. Please try again later.</p>
                ) : connections.length === 0 ? (
                  <div className="border rounded-md p-4 border-dashed text-center">
                    <p className="text-sm text-muted-foreground mb-2">No connections available</p>
                    <Link href="/connections/create" className="text-sm text-primary hover:underline">
                      + Create a Connection First
                    </Link>
                  </div>
                ) : (
                  <>
                    <Select 
                      value={formData.connectionId}
                      onValueChange={(value) => handleInputChange('connectionId', value)}
                    >
                      <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Select a connection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Connections</SelectLabel>
                          {connections.map(connection => (
                            <SelectItem key={connection.id} value={connection.id.toString()}>
                              {connection.name} ({connection.type})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {connections.map(connection => (
                        <div 
                          key={connection.id}
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${formData.connectionId === connection.id.toString() ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
                          onClick={() => handleInputChange('connectionId', connection.id.toString())}
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
                  </>
                )}
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
                <Select 
                  value={formData.queryType}
                  onValueChange={(value) => handleInputChange('queryType', value)}
                >
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
                  value={formData.sqlQuery}
                  onChange={(e) => handleInputChange('sqlQuery', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" className="flex items-center">
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
              <Button type="button" variant="outline">Save as Draft</Button>
              <Button type="submit">Create Dataset</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}