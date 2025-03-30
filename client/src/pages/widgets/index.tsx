import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  PlusCircle, 
  AlertCircle, 
  Layers,
  LayoutTemplate as LayoutTemplateIcon
} from "lucide-react";
import LayoutTemplate from "@/components/layout/layout-template";
import WidgetsList from "@/components/widgets/widgets-list";
import WidgetEditor from "@/components/widgets/widget-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWidgets } from "@/hooks/use-widgets";
import { useDashboard } from "@/hooks/use-dashboard";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Widget } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WidgetsPage() {
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState<"all" | "templates">("all");
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAddToDashboardDialog, setShowAddToDashboardDialog] = useState(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);
  
  // Fetch widgets data
  const { widgets, isLoading, isError, deleteWidget } = useWidgets();
  
  // Get dashboard data (for the add to dashboard dialog)
  const { dashboards } = useDashboard();
  
  // Handle widget edit
  const handleEditWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setShowEditor(true);
  };
  
  // Handle widget delete
  const handleDeleteWidget = async (widgetId: number) => {
    if (!window.confirm("Are you sure you want to delete this widget?")) {
      return;
    }
    
    try {
      await deleteWidget(widgetId);
      toast({
        title: "Widget deleted",
        description: "Widget was successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete widget.",
        variant: "destructive",
      });
    }
  };
  
  // Handle save as template
  const handleSaveAsTemplate = async (widget: Widget) => {
    try {
      const templateWidget = {
        ...widget,
        id: undefined, // Remove ID so it creates a new widget
        isTemplate: true,
        dashboardId: null, // Templates aren't associated with a dashboard
      };
      
      await apiRequest({
        method: "POST",
        url: "/api/widgets",
        data: templateWidget,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
      
      toast({
        title: "Widget saved as template",
        description: "Widget was successfully saved as a template.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save widget as template.",
        variant: "destructive",
      });
    }
  };
  
  // Handle add widget to dashboard
  const handleAddToDashboard = (widget: Widget) => {
    setSelectedWidget(widget);
    setShowAddToDashboardDialog(true);
  };
  
  // Confirm adding widget to dashboard
  const confirmAddToDashboard = async () => {
    if (!selectedWidget || !selectedDashboardId) return;
    
    try {
      const newWidget = {
        ...selectedWidget,
        id: undefined, // Remove ID so it creates a new widget
        dashboardId: selectedDashboardId,
        isTemplate: false,
        sourceWidgetId: selectedWidget.id, // Reference the original template
      };
      
      await apiRequest({
        method: "POST",
        url: "/api/widgets",
        data: newWidget,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", selectedDashboardId] });
      
      toast({
        title: "Widget added",
        description: "Widget was successfully added to the dashboard.",
      });
      
      setShowAddToDashboardDialog(false);
      setSelectedWidget(null);
      setSelectedDashboardId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add widget to dashboard.",
        variant: "destructive",
      });
    }
  };
  
  // Close widget editor
  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedWidget(null);
  };
  
  // Filter widgets based on current tab
  const filteredWidgets = widgets?.filter((widget: Widget) => 
    currentTab === "all" 
      ? !widget.isTemplate
      : !!widget.isTemplate
  ) || [];
  
  return (
    <LayoutTemplate>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Widgets</h1>
            <p className="text-muted-foreground">
              Manage widgets and widget templates for your dashboards
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation("/")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Dashboards
            </Button>
            
            <Button onClick={() => setShowEditor(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Widget
            </Button>
          </div>
        </div>
      
      {isError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Failed to load widgets. Please try again.</span>
        </div>
      )}
      
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "all" | "templates")}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="flex items-center">
            <Layers className="mr-2 h-4 w-4" />
            Dashboard Widgets
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <LayoutTemplateIcon className="mr-2 h-4 w-4" />
            Widget Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading widgets...</p>
            </div>
          ) : (
            <WidgetsList
              widgets={filteredWidgets}
              onEdit={handleEditWidget}
              onDelete={handleDeleteWidget}
              onSaveAsTemplate={handleSaveAsTemplate}
              onAddToDashboard={() => {}}
            />
          )}
        </TabsContent>
        
        <TabsContent value="templates">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : (
            <WidgetsList
              widgets={filteredWidgets}
              onEdit={handleEditWidget}
              onDelete={handleDeleteWidget}
              onSaveAsTemplate={handleSaveAsTemplate}
              onAddToDashboard={handleAddToDashboard}
              isTemplate
            />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Widget Editor Dialog */}
      {showEditor && (
        <WidgetEditor
          widget={selectedWidget || undefined}
          onClose={handleCloseEditor}
          onCreate={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
            handleCloseEditor();
          }}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
            handleCloseEditor();
          }}
          isTemplate={currentTab === "templates"}
        />
      )}
      
      {/* Add to Dashboard Dialog */}
      <Dialog open={showAddToDashboardDialog} onOpenChange={setShowAddToDashboardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget to Dashboard</DialogTitle>
            <DialogDescription>
              Select a dashboard to add this widget to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select 
              value={selectedDashboardId?.toString() || ""} 
              onValueChange={(value) => setSelectedDashboardId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a dashboard" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(dashboards) ? dashboards.map((dashboard: { id: number; name: string }) => (
                  <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                    {dashboard.name}
                  </SelectItem>
                )) : (
                  <SelectItem value="" disabled>No dashboards available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddToDashboardDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAddToDashboard}
              disabled={!selectedDashboardId}
            >
              Add to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </LayoutTemplate>
  );
}