import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayIcon } from "lucide-react";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useWidgets } from "@/lib/hooks/use-widgets";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/lib/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ChartType,
  Widget,
  Dataset,
  chartTypes,
  Dashboard,
  positionSchema,
} from "@/lib/db/schema";
import { extractColumns, truncateString } from "@/lib/utils";
import Chart from "@/components/ui/chart";
import { MonacoSQLEditor } from "@/components/code/monaco-sql-editor";

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
  isTemplate = false,
}: WidgetEditorProps) {
  const [name, setName] = useState(widget?.name || "New Widget");
  const [description, setDescription] = useState(widget?.description || "");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    widget?.datasetId || null,
  );
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(
    widget?.connectionId || null,
  );
  const [chartType, setChartType] = useState<ChartType>(
    (widget?.type as ChartType) || "bar",
  );
  const [dataColumns, setDataColumns] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, any>>(
    widget?.config || {},
  );
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [currentTab, setCurrentTab] = useState("query-view");
  const [customQuery, setCustomQuery] = useState<string>(
    widget?.customQuery || "SELECT * FROM table_name LIMIT 10",
  );
  const [textContent, setTextContent] = useState<string>(
    widget?.textContent || "",
  );
  const [sqlTables, setSqlTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [widgetType, setWidgetType] = useState<"text" | "table" | "chart">(
    widget?.type === "text" 
      ? "text" 
      : widget?.type === "table" 
        ? "table" 
        : "chart"
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { dashboards } = useDashboard();

  // Use our custom hook for widget operations
  const { createWidget, updateWidget, isPending, useWidgetDashboards } =
    useWidgets();

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Fetch available connections
  const { data: connections = [] } = useQuery({
    queryKey: ["/api/connections"],
  });

  // Fetch dashboards for this widget if editing
  const { data: widgetDashboards = [] } = useWidgetDashboards(widget?.id);

  // Fetch SQL tables for selected SQL connection
  const { data: sqlTablesData } = useQuery({
    queryKey: ["/api/connections", selectedConnectionId, "tables"],
    queryFn: async ({ queryKey }) => {
      if (!selectedConnectionId) return [];

      try {
        const response = await fetch(`${queryKey[0]}/${queryKey[1]}/tables`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch SQL tables");
        }
        return response.json();
      } catch (error: any) {
        toast({
          title: "Error loading SQL tables",
          description:
            error.message || "Failed to load tables from SQL connection",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedConnectionId,
  });

  // Fetch dataset data when selected
  const { data: datasetData, isLoading: isLoadingData } = useQuery({
    queryKey: ["/api/datasets", selectedDatasetId, "data"],
    queryFn: async ({ queryKey }) => {
      if (!selectedDatasetId) return [];

      try {
        const response = await fetch(`${queryKey[0]}/${queryKey[1]}/data`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch dataset data");
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

  // Execute SQL query
  const handleExecuteQuery = async () => {
    if (!selectedConnectionId || !customQuery.trim()) {
      toast({
        title: "Error",
        description: "Please select a connection and enter a valid SQL query.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/connections/${selectedConnectionId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: customQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to execute SQL query");
      }

      const data = await response.json();
      setPreviewData(data);
      
      if (data.length > 0) {
        const columns = extractColumns(data);
        setDataColumns(columns);
        
        // Initialize default config if not already set
        if (!config.xAxis && columns.length > 0) {
          setConfig((prevConfig) => ({
            ...prevConfig,
            xAxis: columns[0],
            yAxis: columns[1] || columns[0],
          }));
        }
      }
      
      // Auto switch to table preview tab after query execution
      setCurrentTab("table-preview");
    } catch (error: any) {
      toast({
        title: "Query execution failed",
        description: error.message || "Failed to execute SQL query",
        variant: "destructive",
      });
    }
  };

  // Handle changes to dataset or chart type
  useEffect(() => {
    if (datasetData && datasetData.length > 0) {
      setPreviewData(datasetData);
      const columns = extractColumns(datasetData);
      setDataColumns(columns);

      // Initialize default config if not already set
      if (!config.xAxis && columns.length > 0) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          xAxis: columns[0],
          yAxis: columns[1] || columns[0],
        }));
      }
    }
  }, [datasetData, chartType]);

  // Update SQL tables when connection changes
  useEffect(() => {
    if (sqlTablesData) {
      setSqlTables(sqlTablesData);
    }
  }, [sqlTablesData]);

  // Handle form submission
  const handleSubmit = () => {
    // Check for required fields
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a widget name.",
        variant: "destructive",
      });
      return;
    }

    // Validate based on widget type
    if (widgetType === "text") {
      if (!textContent.trim()) {
        toast({
          title: "Error",
          description: "Please enter some text content.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!selectedConnectionId) {
        toast({
          title: "Error",
          description: "Please select a data connection.",
          variant: "destructive",
        });
        return;
      }
      
      if (!customQuery.trim()) {
        toast({
          title: "Error",
          description: "Please enter a SQL query.",
          variant: "destructive",
        });
        return;
      }
    }

    // Prepare widget data based on type
    const widgetData: any = {
      name,
      description,
      dashboardId: dashboardId || null,
      position: widget?.position || { x: 0, y: 0, w: 3, h: 2 },
      isTemplate: isTemplate,
      sourceWidgetId: widget?.sourceWidgetId || null,
    };

    // Set type-specific fields
    if (widgetType === "text") {
      Object.assign(widgetData, {
        type: "text",
        textContent: textContent,
        connectionId: null,
        datasetId: null,
        customQuery: null,
        config: {}
      });
    } else if (widgetType === "table") {
      Object.assign(widgetData, {
        type: "table",
        textContent: null,
        connectionId: selectedConnectionId,
        datasetId: null,
        customQuery: customQuery,
        config: {}
      });
    } else {
      Object.assign(widgetData, {
        type: chartType,
        textContent: null,
        connectionId: selectedConnectionId,
        datasetId: null,
        customQuery: customQuery,
        config: config
      });
    }

    // Handle save callbacks if provided
    if (onSave && widget) {
      onSave({
        ...widget,
        ...widgetData,
      });
      return;
    }

    if (onCreate && !widget) {
      onCreate();
      createWidget(widgetData);
      return;
    }

    // Default save behavior
    if (widget) {
      const widgetId = widget.id;
      if (!widgetId) {
        toast({
          title: "Error",
          description: "Widget ID is missing.",
          variant: "destructive",
        });
        return;
      }
      updateWidget({ id: widgetId, widget: widgetData });
    } else {
      createWidget(widgetData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {widget ? "Edit Widget" : "Create New Widget"}
        </h1>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {/* Title and Description Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="widget-name">Widget Title</Label>
          <Input
            id="widget-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter widget title"
          />
        </div>
        <div>
          <Label htmlFor="widget-description">Description</Label>
          <Input
            id="widget-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description"
          />
        </div>
      </div>

      {/* Widget Type Selection */}
      <div className="flex justify-between items-center">
        <Label>Widget Type</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <Button
            variant={widgetType === "text" ? "default" : "outline"}
            onClick={() => setWidgetType("text")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 7 4 4 20 4 20 7"></polyline>
              <line x1="9" y1="20" x2="15" y2="20"></line>
              <line x1="12" y1="4" x2="12" y2="20"></line>
            </svg>
          </Button>
          <Button
            variant={widgetType === "table" ? "default" : "outline"}
            onClick={() => setWidgetType("table")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </Button>
          <Button
            variant={widgetType === "chart" ? "default" : "outline"}
            onClick={() => setWidgetType("chart")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
              <line x1="2" y1="20" x2="22" y2="20"></line>
            </svg>
          </Button>
        </div>
      </div>

      {/* Widget Type Specific Content */}
      {widgetType === "text" ? (
        <div className="mt-4">
          <Label htmlFor="text-content">Text Content</Label>
          <Textarea
            id="text-content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your text content here..."
            className="min-h-[300px]"
          />
        </div>
      ) : widgetType === "table" || widgetType === "chart" ? (
        <div className="mt-4">
          {/* Data Connection Section */}
          <div className="mb-4">
            <Label>Data Connection</Label>
            <Select
              value={selectedConnectionId?.toString() || ""}
              onValueChange={(value) => setSelectedConnectionId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((connection) => (
                  <SelectItem
                    key={connection.id}
                    value={connection.id.toString()}
                  >
                    {connection.name} ({connection.type.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConnectionId && (
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="query-view">Query View</TabsTrigger>
                <TabsTrigger value="table-preview">Table Preview</TabsTrigger>
                {widgetType === "chart" && (
                  <TabsTrigger value="chart-preview">Chart Preview</TabsTrigger>
                )}
              </TabsList>

              {/* Query View Tab */}
              <TabsContent value="query-view" className="space-y-4">
                {sqlTables.length > 0 && (
                  <div>
                    <Label>Available Tables</Label>
                    <Select
                      value={selectedTable || ""}
                      onValueChange={(value) => {
                        setSelectedTable(value);
                        setCustomQuery(`SELECT * FROM ${value} LIMIT 10`);
                      }}
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
                  </div>
                )}
                <div>
                  <Label>SQL Query</Label>
                  <div className="mt-2">
                    <MonacoSQLEditor
                      value={customQuery}
                      onChange={setCustomQuery}
                      height="300px"
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={!selectedConnectionId || !customQuery.trim()}
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Execute Query
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Table Preview Tab */}
              <TabsContent value="table-preview">
                <div className="border rounded-lg p-4 h-[400px] overflow-auto">
                  {previewData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {dataColumns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, idx) => (
                          <TableRow key={idx}>
                            {dataColumns.map((column) => (
                              <TableCell key={`${idx}-${column}`}>
                                {typeof row[column] === "object"
                                  ? JSON.stringify(row[column])
                                  : String(row[column] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : isLoadingData ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="w-8 h-8 mr-2" />
                      <span>Loading data...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available. Execute a query first.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Chart Preview Tab - Only visible for Chart Widget Type */}
              {widgetType === "chart" && (
                <TabsContent value="chart-preview" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Chart Properties */}
                    <div className="lg:col-span-1 space-y-6 border rounded-lg p-4">
                      <h3 className="text-lg font-medium">Chart Properties</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Data Mapping</Label>
                          {dataColumns.length > 0 ? (
                            <AxisMapping
                              chartType={chartType}
                              columns={dataColumns}
                              config={config}
                              onChange={(newConfig) =>
                                setConfig({ ...config, ...newConfig })
                              }
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground mt-2">
                              Execute a query to map data columns
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <Label>Visual Options</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="show-legend"
                                checked={config.showLegend !== false}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    showLegend: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor="show-legend">Show Legend</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="show-grid"
                                checked={config.showGrid !== false}
                                onChange={(e) =>
                                  setConfig({ ...config, showGrid: e.target.checked })
                                }
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor="show-grid">Show Grid</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="show-tooltip"
                                checked={config.showTooltip !== false}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    showTooltip: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor="show-tooltip">Show Tooltip</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Custom Colors</Label>
                          <Input
                            value={config.colors?.join(", ") || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                colors: e.target.value
                                  ? e.target.value.split(",").map((c) => c.trim())
                                  : undefined,
                              })
                            }
                            placeholder="E.g., #3B82F6, #10B981, #F59E0B"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Comma-separated list of colors (hex codes)
                          </p>
                        </div>
                        
                        <ChartConfig
                          chartType={chartType}
                          config={config}
                          onChange={(newConfig) =>
                            setConfig({ ...config, ...newConfig })
                          }
                        />
                      </div>
                    </div>
                    
                    {/* Right Column - Chart Preview */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Chart Preview</h3>
                        <div className="h-[300px]">
                          {previewData.length > 0 ? (
                            <Chart
                              type={chartType}
                              data={previewData}
                              config={config}
                              height="100%"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              No data available for preview
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Chart Type Selector */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Chart Type</h3>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {chartTypes.filter((type) => !['text', 'table'].includes(type)).map((type) => (
                            <Button
                              key={type}
                              variant={chartType === type ? "default" : "outline"}
                              className="flex flex-col items-center justify-center h-16 p-2"
                              onClick={() => setChartType(type)}
                            >
                              {getChartTypeIcon(type)}
                              <span className="text-xs mt-1">
                                {getChartTypeDisplayName(type)}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !name.trim() ||
            (widgetType === "text" && !textContent.trim()) ||
            ((widgetType === "table" || widgetType === "chart") && 
              (!selectedConnectionId || !customQuery.trim())) ||
            isPending
          }
        >
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : widget ? (
            "Update Widget"
          ) : (
            "Create Widget"
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper function to get display name for chart type
function getChartTypeDisplayName(type: ChartType): string {
  const displayNames: Record<ChartType, string> = {
    bar: "Bar",
    column: "Column",
    line: "Line",
    pie: "Pie",
    scatter: "Scatter",
    "dual-axes": "Dual Axes",
    counter: "Counter",
    "stat-card": "Stats",
    table: "Table",
    text: "Text"
  };
  return displayNames[type] || type;
}

// Helper function to render chart type icons
function getChartTypeIcon(type: ChartType) {
  switch (type) {
    case "bar":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="7" y="7" width="3" height="9"></rect>
          <rect x="14" y="7" width="3" height="5"></rect>
        </svg>
      );
    case "column":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="18" y="3" width="3" height="18"></rect>
          <rect x="10.5" y="8" width="3" height="13"></rect>
          <rect x="3" y="13" width="3" height="8"></rect>
        </svg>
      );
    case "pie":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
      );
    case "line":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      );
    case "scatter":
   return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="2"></circle>
          <circle cx="16" cy="16" r="2"></circle>
          <circle cx="8" cy="16" r="2"></circle>
          <circle cx="16" cy="8" r="2"></circle>
        </svg>
      );
    case "dual-axes":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
          <path d="M12 12h.01"></path>
          <path d="M12 12V8"></path>
          <path d="M16 12h.01"></path>
          <path d="M8 12h.01"></path>
        </svg>
      );
    case "stat-card":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 3v4"></path>
          <path d="M8 3v4"></path>
          <path d="M7 15h0"></path>
          <path d="M12 15h0"></path>
          <path d="M17 15h0"></path>
          <path d="M7 11h10"></path>
        </svg>
      );
    case "table":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
      );
    case "text":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      );
    default:
      return null;
  }
}