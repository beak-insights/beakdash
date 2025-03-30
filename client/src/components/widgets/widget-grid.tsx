import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Widget } from "@shared/schema";
import WidgetCard from "@/components/widgets/widget-card";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, AlertCircle } from "lucide-react";

// Add required CSS for react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  widgets: Widget[];
  isLoading: boolean;
  isError: boolean;
  onEditWidget: (widget: Widget) => void;
}

export default function WidgetGrid({
  widgets,
  isLoading,
  isError,
  onEditWidget,
}: WidgetGridProps) {
  const [layout, setLayout] = useState<any[]>([]);
  
  // Initialize layout from widgets
  useEffect(() => {
    if (widgets.length) {
      const initialLayout = widgets.map((widget) => {
        // Use the widget position if available, otherwise assign default values
        const position = widget.position as any || {};
        return {
          i: widget.id.toString(),
          x: position.x || 0,
          y: position.y || 0,
          w: position.w || 2,
          h: position.h || 2,
          minW: 1,
          minH: 1,
        };
      });
      setLayout(initialLayout);
    }
  }, [widgets]);

  // Handle layout change
  const handleLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout);
    
    // TODO: In a real app, update the widget positions in the backend
    // This would typically be debounced to avoid too many API calls
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-64 animate-pulse">
            <CardContent className="p-0 h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">Loading widgets...</span>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Widgets</h3>
          <p className="text-center text-muted-foreground">
            There was a problem loading your dashboard widgets. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (widgets.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6 flex flex-col items-center justify-center h-64">
          <Bot className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Widgets Yet</h3>
          <p className="text-center text-muted-foreground mb-4">
            Your dashboard is empty. Add widgets to start visualizing your data.
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => {/* Trigger add widget modal */}}
          >
            Add Your First Widget
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      isDraggable={true}
      isResizable={true}
      onLayoutChange={handleLayoutChange}
      margin={[16, 16]}
    >
      {widgets.map((widget) => (
        <div key={widget.id.toString()}>
          <WidgetCard
            widget={widget}
            onEdit={() => onEditWidget(widget)}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
