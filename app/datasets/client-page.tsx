'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, DatabaseIcon, RefreshCwIcon, FileTextIcon, ClockIcon, Trash2Icon, EditIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export function DatasetsClient() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);

  // Fetch datasets
  const {
    data: datasets = [],
    isLoading: datasetsLoading,
    isError: datasetsError,
    refetch: refetchDatasets,
  } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch connections to get names for datasets
  const {
    data: connections = [],
    isLoading: connectionsLoading,
  } = useQuery<Connection[]>({
    queryKey: ['/api/connections'],
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Handle dataset deletion
  const handleDeleteClick = (dataset: Dataset) => {
    setDatasetToDelete(dataset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;

    try {
      const response = await fetch(`/api/datasets/${datasetToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dataset');
      }

      toast({
        title: 'Dataset deleted',
        description: `${datasetToDelete.name} has been deleted successfully.`,
      });

      // Refetch datasets
      refetchDatasets();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete dataset',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
    }
  };

  // Find connection name by ID
  const getConnectionName = (connectionId: number) => {
    const connection = connections.find(c => c.id === connectionId);
    return connection ? connection.name : 'Unknown Connection';
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Loading state
  if (datasetsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-20 mr-2" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (datasetsError) {
    return (
      <div className="border border-red-200 rounded-lg p-8 bg-red-50 flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-1 text-red-600">Error loading datasets</h3>
        <p className="text-sm text-red-500 text-center max-w-sm mb-4">
          There was a problem loading your datasets. Please try again.
        </p>
        <Button onClick={() => refetchDatasets()} variant="outline" className="flex items-center">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Dataset list */}
      <div className="space-y-6">
        {datasets.length === 0 ? (
          // Empty state
          <div className="border border-dashed rounded-lg p-8 bg-muted/50 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileTextIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No datasets yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create a dataset from your connections to use in your dashboards.
            </p>
            <Button asChild>
              <Link href="/datasets/create">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Dataset
              </Link>
            </Button>
          </div>
        ) : (
          // Dataset cards
          datasets.map(dataset => (
            <Card key={dataset.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{dataset.name}</CardTitle>
                    <CardDescription>
                      Connection: {getConnectionName(dataset.connection_id)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/datasets/${dataset.id}/edit`}>
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(dataset)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="flex items-center">
                    <DatabaseIcon className="h-3 w-3 mr-1" />
                    {dataset.config.queryType || 'SQL'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {dataset.refresh_interval === 'manual' ? 'Manual refresh' : dataset.refresh_interval}
                  </Badge>
                </div>
                <div className="bg-muted p-3 rounded-md overflow-x-auto max-h-24">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{dataset.query}</pre>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Created: {formatDate(dataset.created_at)}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <Button variant="outline" size="sm" className="mr-2">
                  <RefreshCwIcon className="h-3.5 w-3.5 mr-1.5" />
                  Refresh Data
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/datasets/${dataset.id}`}>
                    View Dataset
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{datasetToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}