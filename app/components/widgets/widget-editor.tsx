import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  isTemplate = false,
}: WidgetEditorProps) {
  const [name, setName] = useState(widget?.name || "New Widget");
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
  const [currentTab, setCurrentTab] = useState("chart-type");
  const [customQuery, setCustomQuery] = useState<string>(
    widget?.customQuery || "SELECT * FROM table_name LIMIT 10",
  );
  const [useCustomQuery, setUseCustomQuery] = useState<boolean>(
    !!widget?.customQuery,
  );
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(
    dashboardId || null,
  );
  const [sqlTables, setSqlTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");

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
    enabled: !!selectedConnectionId && useCustomQuery,
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

    // Make sure we explicitly set the fields that should be null
    const widgetData = {
      name,
      dashboardId: selectedDashboardId,
      type: chartType,
      config,
      position: widget?.position || { x: 0, y: 0, w: 3, h: 2 },
      isTemplate: isTemplate,
      sourceWidgetId: widget?.sourceWidgetId || null,
    };
    
    // When using custom query, explicitly set these fields
    if (useCustomQuery) {
      Object.assign(widgetData, {
        datasetId: null,
        connectionId: selectedConnectionId,
        customQuery: customQuery
      });
    } else {
      Object.assign(widgetData, {
        datasetId: selectedDatasetId,
        connectionId: null,
        customQuery: null
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <Label htmlFor="widget-name">Widget Name</Label>
            <Input
              id="widget-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter widget name"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Data Source</Label>
              <Select
                value={selectedConnectionId?.toString() || "0"}
                onValueChange={(value) => {
                  const connectionId = Number(value);
                  setSelectedConnectionId(connectionId);
                  setSelectedDatasetId(null);
                  if (connectionId) {
                    const connection = connections.find(
                      (c) => c.id === connectionId,
                    );
                    if (connection?.type === "sql") {
                      setUseCustomQuery(true);
                    } else {
                      setUseCustomQuery(false);
                    }
                  }
                }}
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Query Type</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="dataset-source"
                        checked={!useCustomQuery}
                        onChange={() => setUseCustomQuery(false)}
                        className="rounded-full"
                        disabled={
                          connections.find(
                            (c) => c.id === selectedConnectionId,
                          )?.type !== "sql"
                        }
                      />
                      <Label htmlFor="dataset-source">Dataset</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="sql-source"
                        checked={useCustomQuery}
                        onChange={() => setUseCustomQuery(true)}
                        className="rounded-full"
                        disabled={
                          connections.find(
                            (c) => c.id === selectedConnectionId,
                          )?.type !== "sql"
                        }
                      />
                      <Label htmlFor="sql-source">Custom SQL</Label>
                    </div>
                  </div>
                </div>

                {!useCustomQuery ? (
                  <div>
                    <Label>Dataset</Label>
                    <Select
                      value={selectedDatasetId?.toString() || "0"}
                      onValueChange={(value) =>
                        setSelectedDatasetId(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets
                          .filter(
                            (dataset) =>
                              dataset.connectionId === selectedConnectionId,
                          )
                          .map((dataset) => (
                            <SelectItem
                              key={dataset.id}
                              value={dataset.id.toString()}
                            >
                              {dataset.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    {sqlTables.length > 0 && (
                      <div className="mb-4">
                        <Label>Table</Label>
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
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>SQL Query</Label>
                      <MonacoSQLEditor
                        value={customQuery}
                        onChange={setCustomQuery}
                        height="200px"
                      />
                      <Button
                        size="sm"
                        onClick={handleExecuteQuery}
                        disabled={!selectedConnectionId || !customQuery.trim()}
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Run Query
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="chart-type">Chart Type</TabsTrigger>
              <TabsTrigger value="data-mapping">Data</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="chart-type" className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {chartTypes.map((type) => (
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
              <div className="mt-4">
                <ChartConfig
                  chartType={chartType}
                  config={config}
                  onChange={(newConfig) =>
                    setConfig({ ...config, ...newConfig })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="data-mapping" className="mt-4">
              {selectedDatasetId ? (
                <AxisMapping
                  chartType={chartType}
                  columns={dataColumns}
                  config={config}
                  onChange={(newConfig) =>
                    setConfig({ ...config, ...newConfig })
                  }
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  Please select a dataset first
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Visual Options</Label>
                  <div className="space-y-2">
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
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated list of colors (hex codes)
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Preview</Label>
              {previewData.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={!showDataPreview ? "default" : "outline"}
                    onClick={() => setShowDataPreview(false)}
                  >
                    Chart
                  </Button>
                  <Button
                    size="sm"
                    variant={showDataPreview ? "default" : "outline"}
                    onClick={() => setShowDataPreview(true)}
                  >
                    Data Table
                  </Button>
                </div>
              )}
            </div>

            <div className="h-[400px]">
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
                                {typeof row[column] === "object"
                                  ? JSON.stringify(row[column])
                                  : String(row[column] ?? "")}
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
                  {isLoadingData
                    ? "Loading data..."
                    : "No data available for preview"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            (!useCustomQuery && !selectedDatasetId) ||
            (useCustomQuery && (!selectedConnectionId || !customQuery.trim())) ||
            !name ||
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
    bar: "Bar Chart",
    column: "Column Chart",
    line: "Line Chart",
    pie: "Pie Chart",
    scatter: "Scatter Plot",
    "dual-axes": "Dual Axes Chart",
    counter: "Counter",
    "stat-card": "Stat Card",
    table: "Data Table",
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
    default:
      return null;
  }
}
