'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { del } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Types for the connections
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

export function ConnectionsClient() {
  const { toast } = useToast();
  
  // Fetch connections with proper error handling
  const { data: connections = [], isLoading, isError, refetch } = useQuery<Connection[]>({
    queryKey: ['/api/connections'],
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const handleDeleteConnection = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        await del(`/api/connections/${id}`);
        
        toast({
          title: 'Connection deleted',
          description: 'The connection has been successfully deleted.',
        });
        
        // Refresh the connections list
        refetch();
      } catch (error) {
        console.error('Error deleting connection:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete the connection. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'sql':
      case 'postgresql':
        return <Database className="h-6 w-6 text-blue-500" />;
      default:
        return <LinkIcon className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Data Connections</h1>
        <Link 
          href="/connections/create" 
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
          New Connection
        </Link>
      </div>

      {/* Connection types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
              className="text-primary"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
              <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">SQL Database</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect to SQL databases including PostgreSQL, MySQL, and SQLite.
          </p>
          <Link href="/connections/create?type=sql" className="text-sm text-primary hover:underline">
            Connect
          </Link>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
              className="text-primary"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">REST API</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect to REST APIs with customizable authentication and parameters.
          </p>
          <Link href="/connections/create?type=rest" className="text-sm text-primary hover:underline">
            Connect
          </Link>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
              className="text-primary"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">CSV Upload</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload and process CSV files for dashboard visualization.
          </p>
          <Link href="/connections/create?type=csv" className="text-sm text-primary hover:underline">
            Upload
          </Link>
        </div>
      </div>

      {/* Existing connections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Connections</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted"></CardHeader>
                <CardContent className="h-20 bg-muted mt-4"></CardContent>
                <CardFooter className="h-12 bg-muted mt-4"></CardFooter>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="border rounded-lg p-8 bg-destructive/10 text-center">
            <h3 className="text-lg font-medium mb-2 text-destructive">Error loading connections</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem loading your connections. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : connections.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 bg-muted/50 flex flex-col items-center justify-center">
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
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No connections yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Create a connection to start building dashboards with your data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      {getConnectionIcon(connection.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{connection.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {connection.type} connection
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-2 text-sm">
                    {connection.type === 'sql' || connection.type === 'postgresql' ? (
                      <>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Host:</span> {connection.config?.hostname || 'Not specified'}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Database:</span> {connection.config?.database || 'Not specified'}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Created:</span> {formatDate(new Date(connection.created_at), { dateStyle: 'medium' })}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800/50 pt-2">
                  <Link href={`/connections/edit/${connection.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}