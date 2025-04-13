import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/lib/hooks/use-toast";
import { Connection, InsertConnection } from "@/lib/db/schema";

/**
 * Hook for connection-related operations
 */
export function useConnections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all connections
  const connectionsQuery = useQuery({
    queryKey: ['/api/connections'],
  });

  // Fetch a specific connection
  const useConnection = (id?: number) => useQuery({
    queryKey: ['/api/connections', id],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}`);
      if (!res.ok) throw new Error('Failed to fetch connection');
      return res.json();
    },
    enabled: !!id,
  });

  // Create a new connection
  const createConnection = useMutation({
    mutationFn: async (connection: InsertConnection) => {
      return apiRequest('POST', '/api/connections', connection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection created",
        description: "Your connection has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a connection
  const updateConnection = useMutation({
    mutationFn: async ({ id, connection }: { id: number; connection: Partial<Connection> }) => {
      return apiRequest('PUT', `/api/connections/${id}`, connection);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/connections', variables.id] });
      toast({
        title: "Connection updated",
        description: "Your connection has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a connection
  const deleteConnection = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection deleted",
        description: "Your connection has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Test a connection
  const testConnection = useMutation({
    mutationFn: async (connection: InsertConnection) => {
      return apiRequest('POST', '/api/connections/test', connection);
    },
    onSuccess: () => {
      toast({
        title: "Connection test succeeded",
        description: "The connection test was successful.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection test failed",
        description: `Test failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    connections: connectionsQuery.data || [],
    isLoading: connectionsQuery.isLoading,
    isError: connectionsQuery.isError,
    useConnection,
    createConnection: createConnection.mutate,
    updateConnection: updateConnection.mutate,
    deleteConnection: deleteConnection.mutate,
    testConnection: testConnection.mutate,
    isPending: 
      createConnection.isPending || 
      updateConnection.isPending || 
      deleteConnection.isPending || 
      testConnection.isPending
  };
}

export default useConnections;
