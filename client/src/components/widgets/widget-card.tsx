import React from "react";
import { Widget, ChartType } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chart from "@/components/ui/chart";
import { 
  Pencil, 
  Trash2, 
  Save,
  Plus,
  Copy,
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateString } from "@/lib/utils";

interface WidgetCardProps {
  widget: Widget;
  onEdit: () => void;
  onDelete: () => void;
  onSaveAsTemplate: () => void;
  onAddToDashboard: () => void;
  onShareWidget?: () => void;  // New prop for sharing/attaching widgets
  isTemplate?: boolean;
  showControls?: boolean;
}

export default function WidgetCard({
  widget,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onAddToDashboard,
  onShareWidget,
  isTemplate = false,
  showControls = true
}: WidgetCardProps) {
  const getChartPreview = () => {
    // Generate sample data based on chart type
    const sampleData = getSampleDataForPreview(widget.type as ChartType);
    
    // Extract config from the widget
    const config = widget.config as Record<string, any> || {};
    
    // Create chart configuration based on chart type
    const chartConfig: Record<string, any> = {
      colors: config.colors || undefined,
      showLegend: config.showLegend !== false,
      showGrid: config.showGrid !== false,
      showTooltip: config.showTooltip !== false,
    };
    
    // Add appropriate axis configuration based on chart type
    switch (widget.type) {
      case "bar":
      case "column":
        chartConfig.xAxis = "category";
        chartConfig.yAxis = "value";
        break;
      case "line":
        chartConfig.xAxis = "x";
        chartConfig.yAxis = "y";
        chartConfig.groupBy = "series";
        break;
      case "pie":
        chartConfig.xAxis = "name";
        chartConfig.yAxis = "value";
        break;
      case "scatter":
        chartConfig.xAxis = "x";
        chartConfig.yAxis = "y";
        chartConfig.groupBy = "group";
        break;
      case "dual-axes":
        chartConfig.xAxis = "x";
        chartConfig.yAxis = "y1";
        chartConfig.y2Axis = "y2";
        break;
    }
    
    return (
      <div className="w-full h-[200px] overflow-hidden">
        <Chart
          type={widget.type as ChartType}
          data={sampleData}
          config={chartConfig}
          height="100%"
        />
      </div>
    );
  };

  const getSampleDataForPreview = (chartType: ChartType) => {
    switch (chartType) {
      case "bar":
      case "column":
        return [
          { category: "A", value: 40 },
          { category: "B", value: 60 },
          { category: "C", value: 30 },
          { category: "D", value: 70 },
          { category: "E", value: 50 },
        ];
      case "line":
        return [
          { x: "Jan", y: 10, series: "Series A" },
          { x: "Feb", y: 30, series: "Series A" },
          { x: "Mar", y: 20, series: "Series A" },
          { x: "Apr", y: 40, series: "Series A" },
          { x: "May", y: 50, series: "Series A" },
          { x: "Jan", y: 20, series: "Series B" },
          { x: "Feb", y: 15, series: "Series B" },
          { x: "Mar", y: 40, series: "Series B" },
          { x: "Apr", y: 30, series: "Series B" },
          { x: "May", y: 25, series: "Series B" },
        ];
      case "pie":
        return [
          { name: "A", value: 30 },
          { name: "B", value: 40 },
          { name: "C", value: 15 },
          { name: "D", value: 15 },
        ];
      case "scatter":
        return [
          { x: 10, y: 30, group: "A" },
          { x: 20, y: 10, group: "A" },
          { x: 30, y: 20, group: "A" },
          { x: 40, y: 40, group: "B" },
          { x: 50, y: 30, group: "B" },
          { x: 60, y: 50, group: "B" },
        ];
      case "dual-axes":
        return [
          { x: "Jan", y1: 100, y2: 5 },
          { x: "Feb", y1: 200, y2: 10 },
          { x: "Mar", y1: 150, y2: 8 },
          { x: "Apr", y1: 300, y2: 15 },
          { x: "May", y1: 250, y2: 12 },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">{truncateString(widget.name, 30)}</CardTitle>
          {showControls && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                
                {/* Share/Attach option for regular widgets (not templates) */}
                {!isTemplate && onShareWidget && (
                  <DropdownMenuItem onClick={onShareWidget}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share/Attach</span>
                  </DropdownMenuItem>
                )}
                
                {!isTemplate && (
                  <DropdownMenuItem onClick={onSaveAsTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    <span>Save as Template</span>
                  </DropdownMenuItem>
                )}
                
                {isTemplate && (
                  <DropdownMenuItem onClick={onAddToDashboard}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add to Dashboard</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 flex-1 flex flex-col">
        {getChartPreview()}
        
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Type: {widget.type}</span>
            {widget.isTemplate && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                Template
              </span>
            )}
          </div>
          
          {widget.datasetId && (
            <p>Dataset ID: {widget.datasetId}</p>
          )}
          
          {widget.customQuery && (
            <p className="truncate">Custom SQL Query</p>
          )}
        </div>
      </CardContent>
      
      {showControls && (
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1 mr-2"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          {!isTemplate ? (
            <>
              {onShareWidget ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onShareWidget}
                  className="flex-1 mr-2"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              ) : null}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSaveAsTemplate}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Template
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddToDashboard}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}