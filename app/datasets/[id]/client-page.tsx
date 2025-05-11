'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Database, RefreshCw, Edit2, Download, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Dataset {
  id: number;
  name: string;
  query: string;
  refresh_interval: string;
  connection_id: number;
  user_id: number;
  config: any;
  created_at: string;
  updated_at: string;
}

interface Connection {
  id: number;
  name: string;
  type: string;
}

export function DatasetDetailClient({ id }: { id: string }) {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch dataset
  const {
    data: dataset,
    isLoading: datasetLoading,
    isError: datasetError,
  } = useQuery<Dataset>({
    queryKey: [`/api/datasets/${id}`],
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch connections to get names for the dataset
  const {
    data: connections = [],
    isLoading: connectionsLoading,
  } = useQuery<Connection[]>({
    queryKey: ['/api/connections'],
    refetchOnWindowFocus: false,
  });

  // Get connection name
  const getConnectionName = (connectionId: number) => {
    const connection = connections.find(c => c.id === connectionId);
    return connection ? connection.name : 'Unknown Connection';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Refresh dataset
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast({
      title: 'Refreshing dataset',
      description: 'Executing query and updating data...',
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Mock preview data (this would actually come from an API call)
      const mockData = [
        { id: 1, name: 'Sample 1', value: 42, created: new Date().toISOString() },
        { id: 2, name: 'Sample 2', value: 78, created: new Date().toISOString() },
        { id: 3, name: 'Sample 3', value: 15, created: new Date().toISOString() },
      ];
      
      setPreviewData(mockData);
      
      toast({
        title: 'Dataset refreshed',
        description: 'Latest data has been loaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'There was an error refreshing the dataset',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (datasetLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/datasets">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-7 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (datasetError || !dataset) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/datasets">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Dataset Not Found</h1>
        </div>
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Dataset not found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                The dataset you are looking for does not exist or you do not have permission to view it.
              </p>
              <Button asChild>
                <Link href="/datasets">Return to Datasets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/datasets">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{dataset.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/datasets/${dataset.id}/edit`}>
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">{getConnectionName(dataset.connection_id)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refresh Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium capitalize">
                {dataset.refresh_interval === 'manual' ? 'Manual Refresh' : dataset.refresh_interval}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">{formatDate(dataset.updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="preview">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Preview</CardTitle>
              <CardDescription>
                A preview of the dataset results. Click refresh to update.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0]).map(key => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, i) => (
                            <TableCell key={i}>
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No data preview available. Click refresh to load the latest data.
                  </p>
                  <Button onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing first 100 rows
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Download Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Query</CardTitle>
              <CardDescription>
                The query used to generate this dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-4 overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">{dataset.query}</pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/datasets/${dataset.id}/edit`}>
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  Edit Query
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dataset Settings</CardTitle>
              <CardDescription>
                Configuration settings for this dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Dataset ID</h3>
                  <p className="text-sm text-muted-foreground">{dataset.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Created</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(dataset.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Query Type</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {dataset.config?.queryType || 'SQL'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Last Refresh</h3>
                  <p className="text-sm text-muted-foreground">
                    {dataset.config?.lastRefresh ? formatDate(dataset.config.lastRefresh) : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Advanced Configuration</h3>
                <div className="bg-muted rounded-md p-4 overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(dataset.config, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/datasets/${dataset.id}/edit`}>
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  Edit Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}