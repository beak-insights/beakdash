import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Widget, InsertWidget } from "@shared/schema";

/**
 * Hook for widget-related operations
 */
export function useWidgets(dashboardId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all widgets for a dashboard
  const widgetsQuery = useQuery({
    queryKey: ['/api/widgets', dashboardId],
    queryFn: async ({ queryKey }) => {
      const url = dashboardId 
        ? `/api/widgets?dashboardId=${dashboardId}` 
        : '/api/widgets';
        
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch widgets');
      return res.json();
    },
    // We want to fetch widgets even when dashboardId is not provided (for the widgets page)
  });

  // Fetch a specific widget
  const useWidget = (id?: number) => useQuery({
    queryKey: ['/api/widgets', id],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}`);
      if (!res.ok) throw new Error('Failed to fetch widget');
      return res.json();
    },
    enabled: !!id,
  });

  // Create a new widget
  const createWidget = useMutation({
    mutationFn: async (widget: InsertWidget) => {
      return apiRequest('POST', '/api/widgets', widget);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets', dashboardId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      }
      toast({
        title: "Widget created",
        description: "Your widget has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create widget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a widget
  const updateWidget = useMutation({
    mutationFn: async ({ id, widget }: { id: number; widget: Partial<Widget> }) => {
      return apiRequest('PUT', `/api/widgets/${id}`, widget);
    },
    onSuccess: (_, variables) => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets', dashboardId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', variables.id] });
      toast({
        title: "Widget updated",
        description: "Your widget has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update widget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a widget
  const deleteWidget = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/widgets/${id}`);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets', dashboardId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      }
      toast({
        title: "Widget deleted",
        description: "Your widget has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete widget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update widget positions in bulk
  const updateWidgetPositions = useMutation({
    mutationFn: async (widgets: { id: number; position: any }[]) => {
      // Create a batch update request
      const promises = widgets.map(({ id, position }) => 
        apiRequest('PUT', `/api/widgets/${id}`, { position })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/widgets', dashboardId] });
      }
    },
    // No toast for position updates to avoid spamming
  });

  return {
    widgets: widgetsQuery.data || [],
    isLoading: widgetsQuery.isLoading,
    isError: widgetsQuery.isError,
    useWidget,
    createWidget: createWidget.mutate,
    updateWidget: updateWidget.mutate,
    deleteWidget: deleteWidget.mutate,
    updateWidgetPositions: updateWidgetPositions.mutate,
    isPending: 
      createWidget.isPending || 
      updateWidget.isPending || 
      deleteWidget.isPending ||
      updateWidgetPositions.isPending
  };
}

export default useWidgets;
