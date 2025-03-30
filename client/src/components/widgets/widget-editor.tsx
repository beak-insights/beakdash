import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ChartConfig from "./chart-config";
import AxisMapping from "./axis-mapping";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChartType, Widget, Dataset, chartTypes } from "@shared/schema";
import { extractColumns } from "@/lib/utils";
import Chart from "@/components/ui/chart";

interface WidgetEditorProps {
  dashboardId: number;
  widget?: Widget | null;
  onClose: () => void;
}

export default function WidgetEditor({ 
  dashboardId, 
  widget, 
  onClose 
}: WidgetEditorProps) {
  const [name, setName] = useState(widget?.name || "New Widget");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(widget?.datasetId || null);
  const [chartType, setChartType] = useState<ChartType>(widget?.type as ChartType || "bar");
  const [dataColumns, setDataColumns] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, any>>(widget?.config || {});
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [currentTab, setCurrentTab] = useState("chart-type");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
  });

  // Fetch dataset data when selected
  const { data: datasetData, isLoading: isLoadingData } = useQuery({
    queryKey: ['/api/datasets', selectedDatasetId, 'data'],
    queryFn: async ({ queryKey }) => {
      if (!selectedDatasetId) return [];
      
      try {
        const response = await fetch(`${queryKey[0]}/${queryKey[1]}/data`);
        if (!response.ok) throw new Error('Failed to fetch dataset data');
        return response.json();
      } catch (error) {
        // For demonstration, return sample data
        return getSampleData(chartType);
      }
    },
    enabled: !!selectedDatasetId,
  });

  // Create new widget mutation
  const createMutation = useMutation({
    mutationFn: async (newWidget: any) => {
      return apiRequest('POST', '/api/widgets', newWidget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      toast({
        title: "Widget created",
        description: "New widget has been added to the dashboard.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create widget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update widget mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedWidget: any) => {
      return apiRequest('PUT', `/api/widgets/${widget?.id}`, updatedWidget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
      toast({
        title: "Widget updated",
        description: "Widget has been successfully updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update widget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle changes to dataset or chart type
  useEffect(() => {
    if (datasetData && datasetData.length > 0) {
      setPreviewData(datasetData);
      const columns = extractColumns(datasetData);
      setDataColumns(columns);
      
      // Initialize default config if not already set
      if (!config.xAxis && columns.length > 0) {
        setConfig(prevConfig => ({
          ...prevConfig,
          xAxis: columns[0],
          yAxis: columns[1] || columns[0],
        }));
      }
    }
  }, [datasetData, chartType]);

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

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedDatasetId) {
      toast({
        title: "Error",
        description: "Please select a dataset.",
        variant: "destructive",
      });
      return;
    }

    const widgetData = {
      name,
      dashboardId,
      datasetId: selectedDatasetId,
      type: chartType,
      config,
      position: widget?.position || { x: 0, y: 0, w: 3, h: 2 },
    };

    if (widget) {
      updateMutation.mutate(widgetData);
    } else {
      createMutation.mutate(widgetData);
    }
  };

  // Helper function to get display name for chart type
  const getChartTypeDisplayName = (type: ChartType): string => {
    const displayNames: Record<ChartType, string> = {
      "bar": "Bar Chart",
      "column": "Column Chart",
      "line": "Line Chart",
      "pie": "Pie Chart",
      "scatter": "Scatter Plot",
      "dual-axes": "Dual Axes Chart"
    };
    return displayNames[type] || type;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[900px] h-[85vh] max-h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{widget ? "Edit Widget" : "Create New Widget"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden gap-4">
          {/* Left Panel */}
          <div className="w-1/3 border-r border-border overflow-y-auto p-4">
            <div className="mb-4">
              <Label htmlFor="widget-name" className="mb-1 block">Widget Name</Label>
              <Input
                id="widget-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter widget name"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="dataset" className="mb-1 block">Data Source</Label>
              <Select 
                value={selectedDatasetId?.toString() || "0"} 
                onValueChange={(value) => setSelectedDatasetId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id.toString()}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="chart-type">Chart Type</TabsTrigger>
                <TabsTrigger value="data-mapping">Data</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Chart Type Tab */}
              <TabsContent value="chart-type" className="mt-2">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {chartTypes.map((type) => (
                    <Button
                      key={type}
                      variant={chartType === type ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-16 p-2"
                      onClick={() => setChartType(type)}
                    >
                      {getChartTypeIcon(type)}
                      <span className="text-xs mt-1">{getChartTypeDisplayName(type)}</span>
                    </Button>
                  ))}
                </div>
                <ChartConfig 
                  chartType={chartType} 
                  config={config} 
                  onChange={(newConfig) => setConfig({...config, ...newConfig})}
                />
              </TabsContent>

              {/* Data Mapping Tab */}
              <TabsContent value="data-mapping" className="mt-2">
                {selectedDatasetId ? (
                  <AxisMapping
                    chartType={chartType}
                    columns={dataColumns}
                    config={config}
                    onChange={(newConfig) => setConfig({...config, ...newConfig})}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Please select a dataset first
                  </div>
                )}
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="mt-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="show-legend" className="mb-1 block">Visual Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="show-legend"
                          checked={config.showLegend !== false}
                          onChange={(e) => setConfig({...config, showLegend: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="show-legend">Show Legend</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="show-grid"
                          checked={config.showGrid !== false}
                          onChange={(e) => setConfig({...config, showGrid: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="show-grid">Show Grid</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="show-tooltip"
                          checked={config.showTooltip !== false}
                          onChange={(e) => setConfig({...config, showTooltip: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="show-tooltip">Show Tooltip</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="chart-colors" className="mb-1 block">Custom Colors</Label>
                    <Input
                      id="chart-colors"
                      value={config.colors?.join(', ') || ''}
                      onChange={(e) => setConfig({...config, colors: e.target.value ? e.target.value.split(',').map(c => c.trim()) : undefined})}
                      placeholder="E.g., #3B82F6, #10B981, #F59E0B"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated list of colors (hex codes)</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 bg-muted border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              {isLoadingData && <p className="text-xs text-muted-foreground">Loading data...</p>}
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              {previewData.length > 0 ? (
                <Chart
                  type={chartType}
                  data={previewData}
                  config={config}
                  height="100%"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {isLoadingData ? "Loading data..." : "No data available for preview"}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedDatasetId || !name || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 
              "Saving..." : 
              widget ? "Update Widget" : "Create Widget"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render chart type icons
function getChartTypeIcon(type: ChartType) {
  switch (type) {
    case "bar":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="7" y="7" width="3" height="9"></rect>
          <rect x="14" y="7" width="3" height="5"></rect>
        </svg>
      );
    case "column":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="3" width="3" height="18"></rect>
          <rect x="10.5" y="8" width="3" height="13"></rect>
          <rect x="3" y="13" width="3" height="8"></rect>
        </svg>
      );
    case "pie":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
      );
    case "line":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      );
    case "scatter":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="2"></circle>
          <circle cx="16" cy="16" r="2"></circle>
          <circle cx="8" cy="16" r="2"></circle>
          <circle cx="16" cy="8" r="2"></circle>
        </svg>
      );
    case "dual-axes":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 3v18"></path>
          <polyline points="16 8 21 3 21 8"></polyline>
          <path d="M3 21h18"></path>
          <polyline points="8 16 3 21 8 21"></polyline>
          <path d="M3 7l7 7"></path>
          <path d="M14 10l7 7"></path>
        </svg>
      );
    default:
      return null;
  }
}
