import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import WidgetGrid from "@/components/widgets/widget-grid";
import WidgetEditor from "@/components/widgets/widget-editor";
import AICopilot from "@/components/ai/ai-copilot";
import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Layers, LayoutTemplate, ArrowLeft } from "lucide-react";
import { Widget, InsertDashboard } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/hooks/use-toast";
import useDashboard from "@/lib/hooks/use-dashboard";
import { useSpaces } from "@/lib/hooks/use-spaces";

export default function Dashboard() {
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [copilotWidget, setCopilotWidget] = useState<Widget | null>(null);
  const [, setLocation] = useLocation();
  const [newDashboard, setNewDashboard] = useState<InsertDashboard>({
    name: '',
    description: ''
  });
  
  // Get dashboard ID from URL params
  const params = useParams<{ id: string }>();
  const isNewDashboard = params?.id === 'new';
  const dashboardId = params?.id && !isNewDashboard ? parseInt(params.id, 10) : 0;
  
  // Get our dashboard hooks
  const { createDashboard, isPending } = useDashboard();
  const { currentSpace } = useSpaces();
  
  // Check if we are in creation mode and there's no space selected
  useEffect(() => {
    if (isNewDashboard && !currentSpace) {
      toast({
        title: "Space Required",
        description: "Please select a space before creating a dashboard.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [isNewDashboard, currentSpace, setLocation]);

  // Fetch widgets for current dashboard (only if not in creation mode)
  const { data: widgets = [], isLoading: isLoadingWidgets, isError: isErrorWidgets } = useQuery({
    queryKey: ['/api/widgets', dashboardId],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?dashboardId=${dashboardId}`);
      if (!res.ok) throw new Error('Failed to fetch widgets');
      return res.json();
    },
    enabled: !isNewDashboard && dashboardId > 0,
  });

  // Fetch dashboard details (only if not in creation mode)
  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['/api/dashboards', dashboardId],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${dashboardId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: !isNewDashboard && dashboardId > 0,
  });

  const handleAddWidget = () => {
    setEditingWidget(null);
    setIsWidgetEditorOpen(true);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setIsWidgetEditorOpen(true);
  };

  const handleCloseWidgetEditor = () => {
    setIsWidgetEditorOpen(false);
    setEditingWidget(null);
  };

  const handleToggleAICopilot = () => {
    setCopilotWidget(null); // Reset the widget context
    setIsAICopilotOpen(!isAICopilotOpen);
  };
  
  const handleOpenCopilotWithWidget = (widget: Widget) => {
    setCopilotWidget(widget);
    setIsAICopilotOpen(true);
  };

  const getWidgetContext = () => {
    if (!copilotWidget) return undefined;
    
    return {
      id: copilotWidget.id,
      name: copilotWidget.name,
      type: copilotWidget.type,
      config: copilotWidget.config
    };
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDashboard.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Dashboard name is required",
        variant: "destructive",
      });
      return;
    }
    
    // Success and error handling are in the hook
    createDashboard(newDashboard, {
      onSuccess: (dashboard) => {
        // Navigate to the new dashboard
        setTimeout(() => {
          setLocation(`/dashboard/${dashboard.id}`);
        }, 500);
      }
    });
  };
  
  // Render new dashboard form if in creation mode
  if (isNewDashboard) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboards
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Dashboard</CardTitle>
            <CardDescription>
              {currentSpace ? 
                `Creating a dashboard in ${currentSpace.name} space` : 
                "Please select a space before creating a dashboard"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter dashboard name"
                  value={newDashboard.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter dashboard description"
                  value={newDashboard.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !currentSpace}>
                {isPending ? "Creating..." : "Create Dashboard"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  // Render existing dashboard view
  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {isLoadingDashboard ? "Loading..." : dashboard?.name || "Dashboard"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            <span>Options</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation("/widgets")}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            <span>Widgets</span>
          </Button>
          <Button variant="default" size="sm" onClick={handleToggleAICopilot}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>AI Copilot</span>
          </Button>
          <Button variant="default" size="sm" onClick={handleAddWidget}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Widget</span>
          </Button>
        </div>
      </div>

      <WidgetGrid 
        widgets={widgets} 
        isLoading={isLoadingWidgets}
        isError={isErrorWidgets}
        onEditWidget={handleEditWidget}
        onOpenCopilot={handleOpenCopilotWithWidget}
      />

      {/* Widget Editor Modal */}
      {isWidgetEditorOpen && (
        <WidgetEditor
          dashboardId={dashboardId}
          widget={editingWidget}
          onClose={handleCloseWidgetEditor}
        />
      )}

      {/* AI Copilot Chat */}
      {isAICopilotOpen && (
        <AICopilot 
          onClose={() => setIsAICopilotOpen(false)} 
          activeDatasetId={copilotWidget?.datasetId || editingWidget?.datasetId || undefined}
          activeChartType={copilotWidget?.type || editingWidget?.type}
          widgetContext={getWidgetContext()}
        />
      )}
    </div>
  );
}