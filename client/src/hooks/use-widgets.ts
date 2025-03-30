import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Widget, InsertWidget, Dashboard } from "@shared/schema";

/**
 * Hook for widget-related operations
 */
export function useWidgets(dashboardId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all widgets for a dashboard using the new API endpoint
  const widgetsQuery = useQuery({
    queryKey: ['/api/widgets', dashboardId],
    queryFn: async ({ queryKey }) => {
      const url = dashboardId 
        ? `/api/dashboards/${dashboardId}/widgets` // New endpoint for fetching widgets for a dashboard 
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

  // Fetch dashboards for a widget
  const useWidgetDashboards = (widgetId?: number) => useQuery({
    queryKey: ['/api/widgets', widgetId, 'dashboards'],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${queryKey[1]}/dashboards`);
      if (!res.ok) throw new Error('Failed to fetch widget dashboards');
      return res.json() as Promise<Dashboard[]>;
    },
    enabled: !!widgetId,
  });

  // Create a new widget
  const createWidget = useMutation({
    mutationFn: async (widget: InsertWidget) => {
      // Extract dashboardId from widget data to handle it separately if provided
      const { dashboardId: targetDashboardId, ...widgetData } = widget as any;
      
      // Create the widget
      const createdWidget = await apiRequest('POST', '/api/widgets', widgetData);
      
      // If dashboardId is provided, add the widget to that dashboard
      if (targetDashboardId) {
        await apiRequest('POST', `/api/dashboards/${targetDashboardId}/widgets/${createdWidget.id}`, {
          position: widget.position || {}
        });
      }
      
      return createdWidget;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'widgets'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      
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
      // Extract position and dashboardId if present to handle them separately
      const { position, dashboardId: targetDashboardId, ...widgetData } = widget as any;
      
      // Update the widget properties
      const updatedWidget = await apiRequest('PUT', `/api/widgets/${id}`, widgetData);
      
      // If position and dashboardId are provided, update the widget position in that dashboard
      if (position && targetDashboardId) {
        await apiRequest('PATCH', `/api/dashboards/${targetDashboardId}/widgets/${id}/position`, {
          position
        });
      }
      
      return updatedWidget;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'widgets'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', variables.id, 'dashboards'] });
      
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
      // Invalidate relevant queries
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'widgets'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      
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

  // Add a widget to a dashboard
  const addWidgetToDashboard = useMutation({
    mutationFn: async ({ widgetId, dashboardId, position }: { widgetId: number; dashboardId: number; position?: any }) => {
      return apiRequest('POST', `/api/dashboards/${dashboardId}/widgets/${widgetId}`, { position });
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', variables.dashboardId, 'widgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', variables.widgetId, 'dashboards'] });
      
      toast({
        title: "Widget added",
        description: "Widget has been added to the dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add widget to dashboard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Remove a widget from a dashboard
  const removeWidgetFromDashboard = useMutation({
    mutationFn: async ({ widgetId, dashboardId }: { widgetId: number; dashboardId: number }) => {
      return apiRequest('DELETE', `/api/dashboards/${dashboardId}/widgets/${widgetId}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', variables.dashboardId, 'widgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', variables.widgetId, 'dashboards'] });
      
      toast({
        title: "Widget removed",
        description: "Widget has been removed from the dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove widget from dashboard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update widget positions in bulk
  const updateWidgetPositions = useMutation({
    mutationFn: async (widgets: { id: number; position: any }[]) => {
      if (!dashboardId) throw new Error("Dashboard ID is required to update positions");
      
      // Create a batch update request for the new endpoint
      const promises = widgets.map(({ id, position }) => 
        apiRequest('PATCH', `/api/dashboards/${dashboardId}/widgets/${id}/position`, { position })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'widgets'] });
      }
    },
    // No toast for position updates to avoid spamming
  });

  return {
    widgets: widgetsQuery.data || [],
    isLoading: widgetsQuery.isLoading,
    isError: widgetsQuery.isError,
    useWidget,
    useWidgetDashboards,
    createWidget: createWidget.mutate,
    updateWidget: updateWidget.mutate,
    deleteWidget: deleteWidget.mutate,
    addWidgetToDashboard: addWidgetToDashboard.mutate,
    removeWidgetFromDashboard: removeWidgetFromDashboard.mutate,
    updateWidgetPositions: updateWidgetPositions.mutate,
    isPending: 
      createWidget.isPending || 
      updateWidget.isPending || 
      deleteWidget.isPending ||
      addWidgetToDashboard.isPending ||
      removeWidgetFromDashboard.isPending ||
      updateWidgetPositions.isPending
  };
}

export default useWidgets;
