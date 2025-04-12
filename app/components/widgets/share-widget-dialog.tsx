import React, { useState, useEffect } from "react";
import { Widget, Dashboard } from "@/lib/db/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useWidgets } from "@/hooks/use-widgets";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareWidgetDialogProps {
  widget: Widget;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareWidgetDialog({
  widget,
  isOpen,
  onClose,
}: ShareWidgetDialogProps) {
  const { dashboards = [] } = useDashboard();
  const { useWidgetDashboards, addWidgetToDashboard, removeWidgetFromDashboard, isPending } = useWidgets();
  
  // Get the list of dashboards this widget is currently attached to
  const { data: widgetDashboards, isLoading } = useWidgetDashboards(widget.id);
  
  // Track selected dashboards in state
  const [selectedDashboards, setSelectedDashboards] = useState<Set<number>>(new Set());
  
  // Initialize selected dashboards when widget dashboards data is loaded
  useEffect(() => {
    if (widgetDashboards && !isLoading) {
      const dashboardIds = new Set(widgetDashboards.map(d => d.id));
      setSelectedDashboards(dashboardIds);
    }
  }, [widgetDashboards, isLoading]);
  
  // Handle checkbox change for a dashboard
  const handleDashboardToggle = (dashboardId: number) => {
    setSelectedDashboards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dashboardId)) {
        newSet.delete(dashboardId);
      } else {
        newSet.add(dashboardId);
      }
      return newSet;
    });
  };
  
  // Submit changes 
  const handleSubmit = async () => {
    if (!widget || !widgetDashboards) return;
    
    try {
      // Get current dashboard IDs
      const currentDashboardIds = new Set(widgetDashboards.map(d => d.id));
      
      // Determine which dashboards to add and which to remove
      const dashboardsToAdd = Array.from(selectedDashboards)
        .filter(id => !currentDashboardIds.has(id));
      
      const dashboardsToRemove = Array.from(currentDashboardIds)
        .filter(id => !selectedDashboards.has(id));
      
      // Add widget to new dashboards
      const addPromises = dashboardsToAdd.map(dashboardId => 
        addWidgetToDashboard({ widgetId: widget.id, dashboardId })
      );
      
      // Remove widget from deselected dashboards
      const removePromises = dashboardsToRemove.map(dashboardId => 
        removeWidgetFromDashboard({ widgetId: widget.id, dashboardId })
      );
      
      // Wait for all operations to complete
      await Promise.all([...addPromises, ...removePromises]);
      
      toast({
        title: "Widget shared",
        description: "Widget dashboard attachments updated successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget dashboard attachments.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Widget</DialogTitle>
          <DialogDescription>
            Select the dashboards where this widget should appear.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-4">Loading dashboards...</div>
          ) : Array.isArray(dashboards) && dashboards.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {dashboards.map((dashboard: Dashboard) => (
                <div key={dashboard.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`dashboard-${dashboard.id}`}
                    checked={selectedDashboards.has(dashboard.id)}
                    onCheckedChange={() => handleDashboardToggle(dashboard.id)}
                  />
                  <Label 
                    htmlFor={`dashboard-${dashboard.id}`}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {dashboard.name}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No dashboards available.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}