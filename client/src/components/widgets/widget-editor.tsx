import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
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
import { useDashboard } from "@/hooks/use-dashboard";
import { useWidgets } from "@/hooks/use-widgets";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ChartConfig from "./chart-config";
import AxisMapping from "./axis-mapping";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChartType, Widget, Dataset, chartTypes, Dashboard, positionSchema } from "@shared/schema";
import { extractColumns, truncateString } from "@/lib/utils";
import Chart from "@/components/ui/chart";
import { MonacoSQLEditor } from "@/components/ui/monaco-sql-editor";

interface WidgetEditorProps {
  dashboardId?: number;
  widget?: Widget | null;
  onClose: () => void;
  onSave?: (widget: Widget) => void;
  onCreate?: () => void;
  isCreating?: boolean;
  isTemplate?: boolean;
}

export default function WidgetEditor({ 
  dashboardId, 
  widget, 
  onClose,
  onSave,
  onCreate,
  isCreating = false,
  isTemplate = false
}: WidgetEditorProps) {
  const [name, setName] = useState(widget?.name || "New Widget");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(widget?.datasetId || null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(widget?.connectionId || null);
  const [chartType, setChartType] = useState<ChartType>(widget?.type as ChartType || "bar");
  const [dataColumns, setDataColumns] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, any>>(widget?.config || {});
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [currentTab, setCurrentTab] = useState("chart-type");
  const [customQuery, setCustomQuery] = useState<string>(widget?.customQuery || "");
  const [useCustomQuery, setUseCustomQuery] = useState<boolean>(!!widget?.customQuery);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(dashboardId || null);
  const [sqlTables, setSqlTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { dashboards } = useDashboard();
  
  // Use our custom hook for widget operations
  const { 
    createWidget, 
    updateWidget, 
    isPending,
    useWidgetDashboards
  } = useWidgets();

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
  });
  
  // Fetch available connections
  const { data: connections = [] } = useQuery({
    queryKey: ['/api/connections'],
  });
  
  // Fetch dashboards for this widget if editing
  const { data: widgetDashboards = [] } = useWidgetDashboards(widget?.id);

  // Fetch SQL tables for selected SQL connection
  const { data: sqlTablesData } = useQuery({
    queryKey: ['/api/connections', selectedConnectionId, 'tables'],
    queryFn: async ({ queryKey }) => {
      if (!selectedConnectionId) return [];
      
      try {
        const response = await fetch(`${queryKey[0]}/${queryKey[1]}/tables`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch SQL tables');
        }
        return response.json();
      } catch (error: any) {
        toast({
          title: "Error loading SQL tables",
          description: error.message || "Failed to load tables from SQL connection",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedConnectionId && useCustomQuery,
  });

  // Fetch SQL table schema when a table is selected
  const tableSchemaQuery = useMutation({
    mutationFn: async (data: { connectionId: number; table: string }) => {
      return apiRequest('POST', '/api/connections/table-schema', data);
    },
    onSuccess: (data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        // Extract column names from the schema
        const columns = data.map(col => col.name);
        setDataColumns(columns);
        
        // Generate a sample SELECT query
        const tableQuery = `SELECT * FROM ${selectedTable} LIMIT 10`;
        setCustomQuery(tableQuery);
        
        // Execute the query to get the actual data
        if (selectedConnectionId) {
          executeCustomQueryMutation.mutate({
            connectionId: selectedConnectionId,
            query: tableQuery
          });
        }
      } else {
        toast({
          title: "Schema information",
          description: "No columns found for the selected table",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Schema error",
        description: `Failed to load schema: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Fetch dataset data when selected
  const { data: datasetData, isLoading: isLoadingData } = useQuery({
    queryKey: ['/api/datasets', selectedDatasetId, 'data'],
    queryFn: async ({ queryKey }) => {
      if (!selectedDatasetId) return [];
      
      try {
        const response = await fetch(`${queryKey[0]}/${queryKey[1]}/data`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dataset data');
        }
        return response.json();
      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message || "Failed to load dataset data",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedDatasetId,
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
  
  // Update tables dropdown when SQL connection changes
  useEffect(() => {
    if (sqlTablesData && Array.isArray(sqlTablesData)) {
      setSqlTables(sqlTablesData);
      
      // If there are tables, select the first one by default
      if (sqlTablesData.length > 0 && !selectedTable) {
        setSelectedTable(sqlTablesData[0]);
      }
    }
  }, [sqlTablesData]);
  
  // Get schema when a table is selected
  useEffect(() => {
    if (selectedConnectionId && selectedTable && useCustomQuery) {
      tableSchemaQuery.mutate({
        connectionId: selectedConnectionId,
        table: selectedTable
      });
    }
  }, [selectedTable, selectedConnectionId, useCustomQuery]);

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
      case "counter":
        return [
          { value: 2450, label: "Total Orders" }
        ];
      case "stat-card":
        return [
          { current: 12750, previous: 10800, period: "May", label: "Monthly Sales" }
        ];
      default:
        return [];
    }
  };

  // Execute custom SQL query
  const executeCustomQueryMutation = useMutation({
    mutationFn: async (queryData: { connectionId: number, query: string }) => {
      return apiRequest('POST', '/api/connections/execute-query', queryData);
    },
    onSuccess: (data: any) => {
      if (Array.isArray(data)) {
        setPreviewData(data);
        const columns = extractColumns(data);
        setDataColumns(columns);
        
        if (!config.xAxis && columns.length > 0) {
          setConfig(prevConfig => ({
            ...prevConfig,
            xAxis: columns[0],
            yAxis: columns[1] || columns[0],
          }));
        }
        
        setShowDataPreview(true);
        toast({
          title: "Query executed",
          description: "SQL query executed successfully.",
        });
      } else {
        toast({
          title: "Query executed",
          description: "Query executed but returned no data or invalid format.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Query error",
        description: `Failed to execute query: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Execute custom query
  const handleExecuteQuery = () => {
    if (!selectedConnectionId || !customQuery.trim()) {
      toast({
        title: "Error",
        description: "Please select a connection and enter a SQL query.",
        variant: "destructive",
      });
      return;
    }
    
    executeCustomQueryMutation.mutate({
      connectionId: selectedConnectionId,
      query: customQuery
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Check for required fields
    if (!useCustomQuery && !selectedDatasetId) {
      toast({
        title: "Error",
        description: "Please select a dataset.",
        variant: "destructive",
      });
      return;
    }
    
    if (useCustomQuery && (!selectedConnectionId || !customQuery.trim())) {
      toast({
        title: "Error",
        description: "Please select a connection and enter a SQL query.",
        variant: "destructive",
      });
      return;
    }
    
    // Create widget data object
    const widgetData = {
      name,
      dashboardId: selectedDashboardId,
      datasetId: useCustomQuery ? null : selectedDatasetId,
      connectionId: useCustomQuery ? selectedConnectionId : null,
      customQuery: useCustomQuery ? customQuery : null,
      type: chartType,
      config,
      position: widget?.position || { x: 0, y: 0, w: 3, h: 2 },
      isTemplate: isTemplate,
      sourceWidgetId: widget?.sourceWidgetId || null,
    };
    
    // Handle save callbacks if provided
    if (onSave && widget) {
      onSave({
        ...widget,
        ...widgetData
      });
      onClose();
      return;
    }
    
    if (onCreate && !widget) {
      onCreate();
      createWidget(widgetData);
      return;
    }
    
    // Default save behavior
    if (widget) {
      updateWidget({ id: widget.id, widget: widgetData });
    } else {
      createWidget(widgetData);
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
      "dual-axes": "Dual Axes Chart",
      "counter": "Counter",
      "stat-card": "Stat Card"
    };
    return displayNames[type] || type;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[900px] h-[85vh] max-h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{widget ? "Edit Widget" : "Create New Widget"}</DialogTitle>
          <DialogDescription>
            Configure your widget settings, data source, and visualization options.
          </DialogDescription>
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="data-source-type" className="text-sm font-medium">Data Source Type</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      id="dataset-source"
                      checked={!useCustomQuery}
                      onChange={() => setUseCustomQuery(false)}
                      className="rounded-full"
                    />
                    <Label htmlFor="dataset-source" className="text-sm">Dataset</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      id="sql-source"
                      checked={useCustomQuery}
                      onChange={() => setUseCustomQuery(true)}
                      className="rounded-full"
                    />
                    <Label htmlFor="sql-source" className="text-sm">Custom SQL</Label>
                  </div>
                </div>
              </div>
              
              {!useCustomQuery ? (
                <div className="mt-2">
                  <Label htmlFor="dataset" className="mb-1 block">Dataset</Label>
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
              ) : (
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="connection" className="mb-1 block">SQL Connection</Label>
                    <Select 
                      value={selectedConnectionId?.toString() || "0"} 
                      onValueChange={(value) => setSelectedConnectionId(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a connection" />
                      </SelectTrigger>
                      <SelectContent>
                        {connections
                          .filter(conn => conn.type === 'sql')
                          .map((connection) => (
                            <SelectItem key={connection.id} value={connection.id.toString()}>
                              {connection.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedConnectionId && sqlTables.length > 0 && (
                    <div>
                      <Label htmlFor="sql-table" className="mb-1 block">Table</Label>
                      <Select 
                        value={selectedTable || ""} 
                        onValueChange={(value) => setSelectedTable(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                        <SelectContent>
                          {sqlTables.map((table) => (
                            <SelectItem key={table} value={table}>
                              {table}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          {tableSchemaQuery.isPending 
                            ? "Loading table schema..." 
                            : dataColumns.length > 0 
                              ? `${dataColumns.length} columns loaded` 
                              : "Select a table to load columns"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="custom-query" className="block">SQL Query</Label>
                    </div>
                    <MonacoSQLEditor
                      value={customQuery}
                      onChange={setCustomQuery}
                      onExecute={handleExecuteQuery}
                      height="200px"
                      loading={executeCustomQueryMutation.isPending}
                      executeLabel="Run Query"
                      showExecuteButton={true}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
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
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium">Preview</h3>
                {useCustomQuery && previewData.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={!showDataPreview ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowDataPreview(false)}
                    >
                      Chart
                    </Button>
                    <Button
                      size="sm"
                      variant={showDataPreview ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowDataPreview(true)}
                    >
                      Data Table
                    </Button>
                  </div>
                )}
              </div>
              {isLoadingData && <p className="text-xs text-muted-foreground">Loading data...</p>}
              {executeCustomQueryMutation.isPending && <p className="text-xs text-muted-foreground">Executing query...</p>}
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              {previewData.length > 0 ? (
                showDataPreview ? (
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {dataColumns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(0, 50).map((row, idx) => (
                          <TableRow key={idx}>
                            {dataColumns.map((column) => (
                              <TableCell key={`${idx}-${column}`}>
                                {typeof row[column] === 'object' 
                                  ? JSON.stringify(row[column]) 
                                  : String(row[column] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewData.length > 50 && (
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        Showing 50 of {previewData.length} rows
                      </div>
                    )}
                  </div>
                ) : (
                  <Chart
                    type={chartType}
                    data={previewData}
                    config={config}
                    height="100%"
                  />
                )
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {executeCustomQueryMutation.isPending || isLoadingData 
                    ? "Loading data..." 
                    : "No data available for preview"}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex-col sm:flex-row gap-4 items-stretch">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Label htmlFor="dashboard-selector" className="whitespace-nowrap">Add to Dashboard:</Label>
            <Select 
              value={selectedDashboardId?.toString() || "0"} 
              onValueChange={(value) => setSelectedDashboardId(Number(value) || null)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select dashboard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                {dashboards.map((dashboard) => (
                  <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                    {dashboard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 w-full sm:w-auto ml-auto">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={
                (!useCustomQuery && !selectedDatasetId) || 
                (useCustomQuery && (!selectedConnectionId || !customQuery.trim())) || 
                !name || 
                isPending
              }
            >
              {isPending ? 
                "Saving..." : 
                widget ? "Update Widget" : "Create Widget"
              }
            </Button>
          </div>
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
    case "counter":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
          <path d="M12 12h.01"></path>
          <path d="M12 12V8"></path>
          <path d="M16 12h.01"></path>
          <path d="M8 12h.01"></path>
        </svg>
      );
    case "stat-card":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 3v4"></path>
          <path d="M8 3v4"></path>
          <path d="M7 15h0"></path>
          <path d="M12 15h0"></path>
          <path d="M17 15h0"></path>
          <path d="M7 11h10"></path>
        </svg>
      );
    default:
      return null;
  }
}
