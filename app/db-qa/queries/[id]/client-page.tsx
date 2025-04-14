'use client';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ArrowLeft, Check, Clock, Play, PenLine, Trash } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ViewQueryClientProps {
  id: string;
}

export function ViewQueryClient({ id }: ViewQueryClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [runningQuery, setRunningQuery] = useState(false);
  const [queryResults, setQueryResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fetch the query details
  const {
    data: query,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/db-qa/queries', id],
    queryFn: () => get(`/api/db-qa/queries/${id}`),
  });
  
  // Fetch execution history
  const {
    data: executionHistory = [],
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: ['/api/db-qa/queries', id, 'history'],
    queryFn: () => get(`/api/db-qa/queries/${id}/history`),
  });

  // Mutation for running query
  const runQueryMutation = useMutation({
    mutationFn: () => post(`/api/db-qa/queries/${id}/run`, {}),
    onSuccess: (data) => {
      setQueryResults(data);
      setActiveTab("results");
      toast({
        title: "Query executed successfully",
        description: "View the results in the Results tab",
      });
      
      // Refresh execution history
      queryClient.invalidateQueries({ 
        queryKey: ['/api/db-qa/queries', id, 'history']
      });
      
      // Refresh query details
      queryClient.invalidateQueries({ 
        queryKey: ['/api/db-qa/queries', id]
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error running query",
        description: error.message || "Failed to execute query",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setRunningQuery(false);
    }
  });

  // Delete query mutation
  const deleteQueryMutation = useMutation({
    mutationFn: () => post(`/api/db-qa/queries/${id}/delete`, {}),
    onSuccess: () => {
      toast({
        title: "Query deleted",
        description: "The query has been deleted successfully",
      });
      
      // Redirect back to queries list
      router.push("/db-qa/queries");
      
      // Invalidate queries list
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/queries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting query",
        description: error.message || "Failed to delete query",
        variant: "destructive",
      });
    }
  });

  // Handle run query click
  const handleRunQuery = () => {
    setRunningQuery(true);
    runQueryMutation.mutate();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading query details...</span>
      </div>
    );
  }

  // Show error state
  if (error || !query) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50 text-red-800">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Query not found</h3>
        </div>
        <p className="mb-4">
          The requested database quality check could not be found or you may not have permission to access it.
        </p>
        <Button 
          onClick={() => router.push('/db-qa/queries')}
          variant="outline"
        >
          Return to Queries
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/db-qa/queries')} 
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queries
          </Button>
          <h1 className="text-2xl font-bold">{query.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/db-qa/queries/${id}/edit`)}
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  query and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteQueryMutation.mutate()}>
                  {deleteQueryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Query metadata */}
      <div className="flex items-center space-x-2 flex-wrap">
        <Badge variant="outline" className="text-blue-600 bg-blue-50">
          {formatCategoryName(query.category)}
        </Badge>
        <Badge variant={query.enabled ? "success" : "secondary"}>
          {query.enabled ? "Enabled" : "Disabled"}
        </Badge>
        <Badge variant="outline" className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {query.executionFrequency}
        </Badge>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Details</CardTitle>
              <CardDescription>
                Information about this database quality check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {query.description && (
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{query.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(query.created_at || query.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(query.updated_at || query.updatedAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    {query.connection?.name || `Connection ID: ${query.connectionId || query.connection_id}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Space</h3>
                  <p className="text-sm text-muted-foreground">
                    {query.space?.name || query.spaceId ? `Space ID: ${query.spaceId || query.space_id}` : 'No space'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SQL Query</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-md overflow-x-auto text-sm font-mono">
                {query.query}
              </pre>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleRunQuery} 
                disabled={runningQuery}
              >
                {runningQuery ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Query Now
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Query Results</CardTitle>
              <CardDescription>
                Results from the most recent execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queryResults ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={queryResults.status === 'success' ? 'success' : 'destructive'} 
                      className="px-2 py-1"
                    >
                      {queryResults.status === 'success' ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Error
                        </>
                      )}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Executed at: {queryResults.executedAt ? formatDate(queryResults.executedAt) : 'Just now'}
                    </span>
                  </div>
                  
                  {queryResults.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                      <h3 className="font-medium mb-1">Error executing query</h3>
                      <pre className="whitespace-pre-wrap text-sm">{queryResults.error}</pre>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Data</h3>
                      {queryResults.data && queryResults.data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800">
                                {Object.keys(queryResults.data[0]).map((key) => (
                                  <th key={key} className="px-4 py-2 text-left text-sm font-medium">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResults.data.map((row: any, i: number) => (
                                <tr 
                                  key={i} 
                                  className="border-b border-slate-200 dark:border-slate-700"
                                >
                                  {Object.values(row).map((value: any, j: number) => (
                                    <td key={j} className="px-4 py-2 text-sm">
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value) 
                                        : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          The query executed successfully but returned no data.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No results available yet. Run the query to see results.
                  </p>
                  <Button 
                    onClick={handleRunQuery} 
                    disabled={runningQuery}
                  >
                    {runningQuery ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Query Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Past execution results of this query
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading execution history...</span>
                </div>
              ) : historyError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">Error loading history</h3>
                  </div>
                  <p className="text-sm">
                    Failed to load execution history. Please try again.
                  </p>
                </div>
              ) : executionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No execution history found for this query.
                  </p>
                  <Button 
                    onClick={handleRunQuery} 
                    disabled={runningQuery}
                  >
                    {runningQuery ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Query Now
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                          <th className="px-4 py-2 text-left text-sm font-medium">Date & Time</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Duration</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Rows</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {executionHistory.map((execution: any) => (
                          <tr 
                            key={execution.id} 
                            className="border-b border-slate-200 dark:border-slate-700"
                          >
                            <td className="px-4 py-3 text-sm">
                              {formatDate(execution.execution_time)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge 
                                variant={
                                  execution.status === 'success' 
                                    ? 'success' 
                                    : execution.status === 'warning'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {execution.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {execution.execution_duration ? `${(execution.execution_duration / 1000).toFixed(2)}s` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {execution.result_summary?.data?.length ?? 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => {
                                  // Set query results to show the details
                                  setQueryResults({
                                    status: execution.status,
                                    executedAt: execution.execution_time,
                                    data: execution.result_summary?.data || [],
                                    error: execution.error_message,
                                    metrics: execution.metrics
                                  });
                                  setActiveTab('results');
                                }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Showing the last {executionHistory.length} executions
                    </p>
                    <Button 
                      onClick={handleRunQuery} 
                      disabled={runningQuery}
                      size="sm"
                    >
                      {runningQuery ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Query Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}