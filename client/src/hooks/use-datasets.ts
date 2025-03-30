import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dataset, InsertDataset } from "@shared/schema";

/**
 * Hook for dataset-related operations
 */
export function useDatasets(connectionId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all datasets with optional connectionId filter
  const datasetsQuery = useQuery({
    queryKey: ['/api/datasets', { connectionId }],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      if (connectionId) params.append('connectionId', connectionId.toString());
      
      const res = await fetch(`${queryKey[0]}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch datasets');
      return res.json();
    },
  });

  // Fetch a specific dataset
  const useDataset = (id?: number) => useQuery({
    queryKey: ['/api/datasets', id],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}`);
      if (!res.ok) throw new Error('Failed to fetch dataset');
      return res.json();
    },
    enabled: !!id,
  });

  // Fetch data for a dataset
  const useDatasetData = (id?: number) => useQuery({
    queryKey: ['/api/datasets', id, 'data'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(`${queryKey[0]}/${queryKey[1]}/data`);
        if (!res.ok) throw new Error('Failed to fetch dataset data');
        return res.json();
      } catch (error) {
        // For demo purposes, return sample data
        return getSampleData();
      }
    },
    enabled: !!id,
  });

  // Create a new dataset
  const createDataset = useMutation({
    mutationFn: async (dataset: InsertDataset) => {
      return apiRequest('POST', '/api/datasets', dataset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      toast({
        title: "Dataset created",
        description: "Your dataset has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create dataset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a dataset
  const updateDataset = useMutation({
    mutationFn: async ({ id, dataset }: { id: number; dataset: Partial<Dataset> }) => {
      return apiRequest('PUT', `/api/datasets/${id}`, dataset);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/datasets', variables.id] });
      toast({
        title: "Dataset updated",
        description: "Your dataset has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update dataset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a dataset
  const deleteDataset = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/datasets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      toast({
        title: "Dataset deleted",
        description: "Your dataset has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete dataset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Helper function for sample data
  const getSampleData = () => [
    { month: "Jan", region: "North", sales: 120, revenue: 12450, profit: 4320 },
    { month: "Jan", region: "South", sales: 95, revenue: 9820, profit: 3150 },
    { month: "Feb", region: "North", sales: 145, revenue: 15230, profit: 5450 },
    { month: "Feb", region: "South", sales: 110, revenue: 11500, profit: 3900 },
    { month: "Mar", region: "North", sales: 170, revenue: 17800, profit: 6200 },
  ];

  // Execute query (for REST, SQL, etc.)
  const executeQuery = useMutation({
    mutationFn: async ({ id, query }: { id: number; query: string }) => {
      return apiRequest('POST', `/api/datasets/${id}/execute`, { query });
    },
    onSuccess: (data) => {
      toast({
        title: "Query executed",
        description: "The query has been successfully executed.",
      });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to execute query: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    datasets: datasetsQuery.data || [],
    isLoading: datasetsQuery.isLoading,
    isError: datasetsQuery.isError,
    useDataset,
    useDatasetData,
    createDataset: createDataset.mutate,
    updateDataset: updateDataset.mutate,
    deleteDataset: deleteDataset.mutate,
    executeQuery: executeQuery.mutate,
    isPending: 
      createDataset.isPending || 
      updateDataset.isPending || 
      deleteDataset.isPending || 
      executeQuery.isPending
  };
}

export default useDatasets;
