import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/lib/hooks/use-toast";
import { Dashboard, InsertDashboard } from "@/lib/db/schema";
import { useSpaceStore } from "@/lib/hooks/use-spaces";

/**
 * Hook for dashboard-related operations
 */
export function useDashboard(id?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentSpaceId } = useSpaceStore();

  // Fetch all dashboards, filtered by space if a space is selected
  const dashboardsQuery = useQuery({
    queryKey: ['/api/dashboards', { spaceId: currentSpaceId }],
    queryFn: async () => {
      // If no space is selected, fetch all dashboards (no filter)
      const url = currentSpaceId 
        ? `/api/dashboards?spaceId=${currentSpaceId}` 
        : '/api/dashboards';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch dashboards');
      return res.json();
    },
  });

  // Fetch a specific dashboard if ID is provided
  const dashboardQuery = useQuery({
    queryKey: ['/api/dashboards', id],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: !!id,
  });

  // Create a new dashboard
  const createDashboard = useMutation({
    mutationFn: async (dashboard: InsertDashboard) => {
      // Require a space to be selected before creating a dashboard
      if (!currentSpaceId) {
        throw new Error("Please select a space first to create a dashboard");
      }
      
      // Ensure the dashboard is created in the current space
      const dashboardWithSpace = {
        ...dashboard,
        spaceId: currentSpaceId
      };
      
      // Make the API request
      const response = await apiRequest('POST', '/api/dashboards', dashboardWithSpace);
      // Parse the response to get the new dashboard
      const newDashboard = await response.json();
      return newDashboard;
    },
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', { spaceId: currentSpaceId }] });
      toast({
        title: "Dashboard created",
        description: "Your dashboard has been successfully created.",
      });
      
      return dashboard;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create dashboard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a dashboard
  const updateDashboard = useMutation({
    mutationFn: async ({ id, dashboard }: { id: number; dashboard: Partial<Dashboard> }) => {
      return apiRequest('PUT', `/api/dashboards/${id}`, dashboard);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', { spaceId: currentSpaceId }] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', variables.id] });
      toast({
        title: "Dashboard updated",
        description: "Your dashboard has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update dashboard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a dashboard
  const deleteDashboard = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/dashboards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', { spaceId: currentSpaceId }] });
      toast({
        title: "Dashboard deleted",
        description: "Your dashboard has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete dashboard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update dashboard layout (widget positions)
  const updateLayout = useMutation({
    mutationFn: async ({ id, layout }: { id: number; layout: any }) => {
      return apiRequest('PUT', `/api/dashboards/${id}`, { layout });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', variables.id] });
    },
    // No toast for layout updates to avoid spamming the user
  });

  return {
    dashboards: dashboardsQuery.data || [],
    dashboard: dashboardQuery.data,
    isLoading: dashboardsQuery.isLoading || dashboardQuery.isLoading,
    isError: dashboardsQuery.isError || dashboardQuery.isError,
    createDashboard: createDashboard.mutate,
    updateDashboard: updateDashboard.mutate,
    deleteDashboard: deleteDashboard.mutate,
    updateLayout: updateLayout.mutate,
    isPending: 
      createDashboard.isPending || 
      updateDashboard.isPending || 
      deleteDashboard.isPending || 
      updateLayout.isPending
  };
}

export default useDashboard;
