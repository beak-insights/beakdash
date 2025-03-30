import { useState } from "react";
import { Widget, ChartType } from "@shared/schema";
import Chart from "@/components/ui/chart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Maximize, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WidgetCardProps {
  widget: Widget;
  onEdit: () => void;
}

export default function WidgetCard({ widget, onEdit }: WidgetCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data for this widget
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/datasets', widget.datasetId],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(`${queryKey[0]}/${widget.datasetId}/data`);
        if (!response.ok) {
          throw new Error('Failed to fetch dataset data');
        }
        return response.json();
      } catch (error) {
        // For demo purposes, return sample data
        return getSampleData(widget.type as ChartType);
      }
    },
  });

  // Delete widget mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/widgets/${widget.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      toast({
        title: "Widget deleted",
        description: "The widget has been successfully deleted.",
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle widget deletion
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this widget?")) {
      deleteMutation.mutate();
    }
  };
  
  // Generate sample data based on chart type
  const getSampleData = (chartType: ChartType) => {
    switch (chartType) {
      case "bar":
      case "column":
        return [
          { month: "Jan", sales: 120 },
          { month: "Feb", sales: 150 },
          { month: "Mar", sales: 180 },
          { month: "Apr", sales: 110 },
          { month: "May", sales: 200 },
        ];
      case "line":
        return [
          { quarter: "Q1", organic: 120, paid: 80 },
          { quarter: "Q2", organic: 150, paid: 100 },
          { quarter: "Q3", organic: 180, paid: 120 },
          { quarter: "Q4", organic: 200, paid: 160 },
          { quarter: "Q5", organic: 250, paid: 200 },
        ];
      case "pie":
        return [
          { region: "North America", value: 35 },
          { region: "Europe", value: 25 },
          { region: "Asia", value: 20 },
          { region: "South America", value: 10 },
          { region: "Africa", value: 5 },
          { region: "Oceania", value: 5 },
        ];
      case "scatter":
        return [
          { x: 10, y: 30, category: "A", size: 5 },
          { x: 30, y: 40, category: "A", size: 10 },
          { x: 45, y: 35, category: "A", size: 15 },
          { x: 20, y: 60, category: "B", size: 12 },
          { x: 35, y: 50, category: "B", size: 8 },
          { x: 55, y: 25, category: "B", size: 5 },
        ];
      case "dual-axes":
        return [
          { month: "Jan", revenue: 12450, profit: 4320 },
          { month: "Feb", revenue: 15230, profit: 5450 },
          { month: "Mar", revenue: 17800, profit: 6200 },
          { month: "Apr", revenue: 14300, profit: 4900 },
          { month: "May", revenue: 22100, profit: 7800 },
        ];
      default:
        return [];
    }
  };

  // Extract chart config
  const chartConfig = widget.config || {};
  const chartType = widget.type as ChartType;

  // Prepare config for the chart component based on chart type
  const prepareChartConfig = () => {
    const config: Record<string, any> = {
      colors: chartConfig.colors || undefined,
      showLegend: chartConfig.showLegend !== false,
      showGrid: chartConfig.showGrid !== false,
      showTooltip: chartConfig.showTooltip !== false,
    };

    switch (chartType) {
      case "bar":
      case "column":
        config.xAxis = chartConfig.xAxis || "month";
        config.yAxis = chartConfig.yAxis || "sales";
        config.groupBy = chartConfig.groupBy;
        break;
      case "line":
        config.xAxis = chartConfig.xAxis || "quarter";
        config.yAxis = chartConfig.yAxis || "organic";
        config.groupBy = chartConfig.groupBy;
        break;
      case "pie":
        config.xAxis = chartConfig.xAxis || "region";
        config.yAxis = chartConfig.yAxis || "value";
        break;
      case "scatter":
        config.xAxis = chartConfig.xAxis || "x";
        config.yAxis = chartConfig.yAxis || "y";
        config.groupBy = chartConfig.groupBy || "category";
        break;
      case "dual-axes":
        config.xAxis = chartConfig.xAxis || "month";
        config.yAxis = chartConfig.yAxis || "revenue";
        config.y2Axis = chartConfig.y2Axis || "profit";
        break;
    }

    return config;
  };

  // Determine fullscreen classes
  const fullscreenClasses = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : "h-full";

  return (
    <Card className={`${fullscreenClasses} flex flex-col overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
        <CardTitle className="text-base font-medium">{widget.name}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-4/5 w-4/5 rounded-md" />
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">Failed to load data</p>
          </div>
        ) : (
          <Chart
            type={chartType}
            data={data}
            config={prepareChartConfig()}
            height="100%"
          />
        )}
      </CardContent>
    </Card>
  );
}
