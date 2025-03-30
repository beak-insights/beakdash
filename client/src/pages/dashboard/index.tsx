import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import WidgetGrid from "@/components/widgets/widget-grid";
import WidgetEditor from "@/components/widgets/widget-editor";
import AICopilot from "@/components/ai/ai-copilot";
import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Layers, LayoutTemplate } from "lucide-react";
import { Widget } from "@shared/schema";

export default function Dashboard() {
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [copilotWidget, setCopilotWidget] = useState<Widget | null>(null);
  const [, setLocation] = useLocation();
  
  // Get dashboard ID from URL params or default to 1
  const params = useParams<{ id: string }>();
  const dashboardId = params?.id ? parseInt(params.id, 10) : 1;

  // Fetch widgets for current dashboard
  const { data: widgets = [], isLoading: isLoadingWidgets, isError: isErrorWidgets } = useQuery({
    queryKey: ['/api/widgets', dashboardId],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?dashboardId=${dashboardId}`);
      if (!res.ok) throw new Error('Failed to fetch widgets');
      return res.json();
    },
  });

  // Fetch dashboard details
  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['/api/dashboards', dashboardId],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}/${dashboardId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
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

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted">
          <div className="p-6">
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
          </div>
        </main>
      </div>

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
          widgetContext={copilotWidget ? 
            {
              id: copilotWidget.id,
              name: copilotWidget.name,
              type: copilotWidget.type,
              config: copilotWidget.config
            } : undefined}
        />
      )}
    </div>
  );
}
