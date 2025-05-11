"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import { DbQaAlertFilters, DbQaAlertFrontend } from "./use-db-qa-alerts";

/**
 * Hook for managing database quality alerts using React Query
 */
export function useDbQaAlertsQuery(filters: DbQaAlertFilters = {}) {
  const queryClient = useQueryClient();
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.spaceId) queryParams.append('spaceId', filters.spaceId);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.severity) queryParams.append('severity', filters.severity);
  
  const queryKey = ['db-qa-alerts', filters.spaceId, filters.status, filters.severity];
  
  // Query for fetching alerts list
  const alertsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const url = `/api/db-qa/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json() as Promise<DbQaAlertFrontend[]>;
    },
    // Add staleTime to prevent too frequent refetching
    staleTime: 5000, // 5 seconds
  });
  
  // Mutation for toggling alert status
  const toggleAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/db-qa/alerts/${alertId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle alert status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate alerts query to refetch data
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success",
        description: "Alert status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle alert status",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting an alert
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/db-qa/alerts/${alertId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate alerts query to refetch data
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert",
        variant: "destructive",
      });
    },
  });
  
  return {
    // Alerts data and loading state
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    isError: alertsQuery.isError,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
    
    // Mutations
    toggleAlert: toggleAlertMutation.mutate,
    isTogglingAlert: toggleAlertMutation.isPending,
    
    deleteAlert: deleteAlertMutation.mutate,
    isDeletingAlert: deleteAlertMutation.isPending,
  };
}