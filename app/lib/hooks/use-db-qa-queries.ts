"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, get, post, put, del } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";
import { DbQaQueryItem } from "@/components/db-qa/query-list";

interface UseDbQaQueriesOptions {
  spaceId?: number | string | null;
  category?: string | null;
  connectionId?: number | string | null;
  enabled?: boolean;
}

export function useDbQaQueries(options: UseDbQaQueriesOptions = {}) {
  const queryClient = useQueryClient();
  const { spaceId, category, connectionId, enabled = true } = options;

  // Build query string for filtering
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (spaceId) params.append("spaceId", String(spaceId));
    if (category && category !== "all") params.append("category", category);
    if (connectionId) params.append("connectionId", String(connectionId));
    return params.toString();
  };

  const queryKey = ["db-qa-queries", spaceId, category, connectionId];

  // Fetch queries with optional filtering
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const qs = buildQueryString();
      return apiRequest<DbQaQueryItem[]>(`/api/db-qa/queries${qs ? `?${qs}` : ""}`, {
        method: 'GET'
      });
    },
    enabled,
  });

  // Delete a query
  const deleteQuery = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/db-qa/queries/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Query deleted",
        description: "The query has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting query:", error);
      toast({
        title: "Error",
        description: `Failed to delete query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Run a query
  const runQuery = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/db-qa/queries/${id}/run`, { method: "POST" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Query executed",
        description: data.success ? "Query executed successfully." : "Query executed with warnings.",
      });
    },
    onError: (error: any) => {
      console.error("Error running query:", error);
      toast({
        title: "Error",
        description: `Failed to run query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  return {
    queries: data || [],
    isLoading,
    error,
    refetch,
    deleteQuery: deleteQuery.mutate,
    isDeleting: deleteQuery.isPending,
    runQuery: runQuery.mutate,
    isRunning: runQuery.isPending,
  };
}

// Hook to fetch a single query by ID
export function useDbQaQuery(id: number | string | null) {
  const queryClient = useQueryClient();

  const queryKey = ["db-qa-query", id];

  // Fetch query by ID
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!id) throw new Error("Query ID is required");
      return apiRequest(`/api/db-qa/queries/${id}`, {
        method: 'GET'
      });
    },
    enabled: !!id,
  });

  // Update a query
  const updateQuery = useMutation({
    mutationFn: async (queryData: any) => {
      if (!id) throw new Error("Query ID is required");
      return apiRequest(`/api/db-qa/queries/${id}`, {
        method: "PUT",
        body: queryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["db-qa-queries"] });
      toast({
        title: "Query updated",
        description: "The query has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating query:", error);
      toast({
        title: "Error",
        description: `Failed to update query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Run a query
  const runQuery = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Query ID is required");
      return apiRequest(`/api/db-qa/queries/${id}/run`, { 
        method: "POST" 
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["db-qa-queries"] });
      toast({
        title: "Query executed",
        description: data.success ? "Query executed successfully." : "Query executed with warnings.",
      });
    },
    onError: (error: any) => {
      console.error("Error running query:", error);
      toast({
        title: "Error",
        description: `Failed to run query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  return {
    query: data,
    isLoading,
    error,
    refetch,
    updateQuery: updateQuery.mutate,
    isUpdating: updateQuery.isPending,
    runQuery: runQuery.mutate,
    isRunning: runQuery.isPending,
  };
}