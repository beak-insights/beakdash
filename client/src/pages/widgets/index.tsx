import { useState } from "react";
import { useWidgets } from "@/hooks/use-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, List, Plus, Search } from "lucide-react";
import WidgetCard from "@/components/widgets/widget-card";
import WidgetsList from "@/components/widgets/widgets-list";
import { Widget } from "@shared/schema";
import WidgetEditor from "@/components/widgets/widget-editor";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboards } from "@/hooks/use-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WidgetsRepository() {
  const { data: widgets = [], isLoading, createWidget, updateWidget, deleteWidget } = useWidgets();
  const { data: dashboards = [] } = useDashboards();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyTemplates, setShowOnlyTemplates] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [isAddToDashboardOpen, setIsAddToDashboardOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("");
  const { toast } = useToast();

  const filteredWidgets = widgets.filter(widget => {
    if (showOnlyTemplates && !widget.isTemplate) return false;
    return widget.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddWidgetToDashboard = async () => {
    if (!selectedWidget || !selectedDashboardId) return;

    try {
      await createWidget({
        name: `${selectedWidget.name} (Copy)`,
        type: selectedWidget.type,
        datasetId: selectedWidget.datasetId,
        connectionId: selectedWidget.connectionId,
        customQuery: selectedWidget.customQuery,
        dashboardId: parseInt(selectedDashboardId),
        config: selectedWidget.config,
        position: { x: 0, y: 0, w: 6, h: 4 },
        sourceWidgetId: selectedWidget.id,
        isTemplate: false,
      });

      toast({
        title: "Widget added to dashboard",
        description: `The widget was successfully added to the dashboard.`,
      });

      setIsAddToDashboardOpen(false);
      setSelectedWidget(null);
      setSelectedDashboardId("");
    } catch (error) {
      toast({
        title: "Error adding widget",
        description: "There was an error adding the widget to the dashboard.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsTemplate = async (widget: Widget) => {
    try {
      await createWidget({
        name: `${widget.name} (Template)`,
        type: widget.type,
        datasetId: widget.datasetId,
        connectionId: widget.connectionId,
        customQuery: widget.customQuery,
        config: widget.config,
        sourceWidgetId: widget.id,
        isTemplate: true,
      });

      toast({
        title: "Template created",
        description: "The widget was saved as a template.",
      });
    } catch (error) {
      toast({
        title: "Error creating template",
        description: "There was an error saving the widget as a template.",
        variant: "destructive",
      });
    }
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
  };

  const handleCloseWidgetEditor = () => {
    setEditingWidget(null);
    setIsCreatingWidget(false);
  };

  const handleCreateWidget = () => {
    setIsCreatingWidget(true);
  };

  const handleDeleteWidget = async (widgetId: number) => {
    try {
      await deleteWidget(widgetId);
      toast({
        title: "Widget deleted",
        description: "The widget was successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting widget",
        description: "There was an error deleting the widget.",
        variant: "destructive",
      });
    }
  };

  const handleWidgetUpdated = (updatedWidget: Widget) => {
    updateWidget(updatedWidget.id, updatedWidget);
    setEditingWidget(null);
  };

  const handleWidgetCreated = () => {
    setIsCreatingWidget(false);
    toast({
      title: "Widget created",
      description: "The widget was successfully created.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Widgets Repository</h1>
        <Button onClick={handleCreateWidget}>
          <Plus className="h-4 w-4 mr-2" />
          Create Widget
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setShowOnlyTemplates(false)}>All Widgets</TabsTrigger>
          <TabsTrigger value="templates" onClick={() => setShowOnlyTemplates(true)}>Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-1 bg-muted rounded-md p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/80 h-40" />
              <CardContent className="pt-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No widgets found</CardTitle>
            <CardDescription>
              {searchQuery
                ? "Try adjusting your search query"
                : showOnlyTemplates
                ? "No template widgets found. Save widgets as templates to see them here."
                : "Create your first widget to get started"}
            </CardDescription>
            {!searchQuery && !showOnlyTemplates && (
              <Button className="mt-4" onClick={handleCreateWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWidgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onEdit={() => handleEditWidget(widget)}
              onDelete={() => handleDeleteWidget(widget.id)}
              onSaveAsTemplate={() => handleSaveAsTemplate(widget)}
              onAddToDashboard={() => {
                setSelectedWidget(widget);
                setIsAddToDashboardOpen(true);
              }}
              isTemplate={Boolean(widget.isTemplate)}
              showControls={true}
            />
          ))}
        </div>
      ) : (
        <WidgetsList
          widgets={filteredWidgets}
          onEdit={handleEditWidget}
          onDelete={handleDeleteWidget}
          onSaveAsTemplate={handleSaveAsTemplate}
          onAddToDashboard={(widget) => {
            setSelectedWidget(widget);
            setIsAddToDashboardOpen(true);
          }}
        />
      )}

      {(editingWidget || isCreatingWidget) && (
        <WidgetEditor
          widget={editingWidget}
          isCreating={isCreatingWidget}
          onSave={handleWidgetUpdated}
          onCreate={handleWidgetCreated}
          onClose={handleCloseWidgetEditor}
          isTemplate={showOnlyTemplates}
        />
      )}

      <Dialog open={isAddToDashboardOpen} onOpenChange={setIsAddToDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget to Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Dashboard</p>
              <Select
                value={selectedDashboardId}
                onValueChange={setSelectedDashboardId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map((dashboard) => (
                    <SelectItem
                      key={dashboard.id}
                      value={dashboard.id.toString()}
                    >
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddToDashboardOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWidgetToDashboard}
              disabled={!selectedDashboardId}
            >
              Add to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}