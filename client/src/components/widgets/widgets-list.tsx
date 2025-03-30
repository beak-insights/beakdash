import React from "react";
import { Widget } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  LineChart,
  Pencil,
  Trash2,
  Copy,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";

interface WidgetsListProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: number) => void;
  onSaveAsTemplate: (widget: Widget) => void;
  onAddToDashboard: (widget: Widget) => void;
  isTemplate?: boolean;
}

export default function WidgetsList({
  widgets,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onAddToDashboard,
  isTemplate = false,
}: WidgetsListProps) {
  // Get chart icon based on chart type
  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
      case "column":
        return <BarChart3 className="h-10 w-10 text-primary" />;
      case "pie":
        return <PieChart className="h-10 w-10 text-primary" />;
      case "line":
      case "scatter":
      case "dual-axes":
        return <LineChart className="h-10 w-10 text-primary" />;
      default:
        return <BarChart3 className="h-10 w-10 text-primary" />;
    }
  };

  if (!widgets.length) {
    return (
      <div className="p-8 text-center bg-muted/40 rounded-md">
        <p className="text-muted-foreground mb-2">
          {isTemplate
            ? "No widget templates found. Save widgets as templates to reuse them across dashboards."
            : "No widgets found. Create a widget to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <Card key={widget.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold truncate">{widget.name}</CardTitle>
              <Badge variant={isTemplate ? "outline" : "secondary"}>
                {widget.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 bg-muted/10">
            {getChartIcon(widget.type)}
            <div className="mt-3 text-sm text-muted-foreground">
              {isTemplate ? "Template Widget" : `Dashboard: ${widget.dashboardId || "None"}`}
            </div>
            {widget.customQuery && (
              <Badge variant="outline" className="mt-2 text-xs">
                Custom Query
              </Badge>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-card pt-3 pb-3">
            <div className="text-xs text-muted-foreground">
              {formatDate(widget.updatedAt || widget.createdAt || new Date(), {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </div>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(widget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDelete(widget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>

                {!isTemplate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSaveAsTemplate(widget)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save as Template</TooltipContent>
                  </Tooltip>
                )}

                {isTemplate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onAddToDashboard(widget)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to Dashboard</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}