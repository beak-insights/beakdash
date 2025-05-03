import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import ChartConfig from "./chart/config";
import AxisMapping from "./chart/axis-mapping";
import { useToast } from "@/lib/hooks/use-toast";
import {
  ChartType,
  Widget,
  Dataset,
  chartTypes,
  Connection,
  WidgetType,
  WidgetConfig,
  InsertWidget,
} from "@/lib/db/schema";
import { extractColumns } from "@/lib/utils";
import Chart from "@/components/widgets/chart/chart";
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

interface SchemaInfo {
  [schemaName: string]: {
    [tableName: string]: {
      column: string;
      type: string;
    }[];
  };
}

export default function WidgetEditor({
  dashboardId,
  widget,
  onClose,
}: WidgetEditorProps) {
  const [name, setName] = useState(widget?.name || "New Widget");
  const [description, setDescription] = useState(widget?.description || "");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    widget?.datasetId || null,
  );
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(
    widget?.connectionId || null,
  );
  const [config, setConfig] = useState<WidgetConfig>(
    widget?.config || {},
  );
  const [previewData, setPreviewData] = useState<Record<string, any>[]>(
    widget?.data || []
  );
  const [dataColumns, setDataColumns] = useState<{ string: string[], numeric: string[], all: string[] }>({ string: [], numeric: [], all: [] });

  const [currentTab, setCurrentTab] = useState("query-view");
  const [previewTab, setPreviewTab] = useState("data-mapping");
  const [customQuery, setCustomQuery] = useState<string>(
    widget?.customQuery || "SELECT * FROM table_name LIMIT 10",
  );
  const [textContent, setTextContent] = useState<string>(
    widget?.config?.textContent || "",
  );
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [widgetType, setWidgetType] = useState<WidgetType>(
    widget?.type === "text" 
      ? "text" 
      : widget?.type === "table" 
        ? "table" 
        : "chart"
  );
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo>({});

  const { addToast } = useToast();

  // Use our custom hook for widget operations
  const { createWidget, updateWidget, isPending } = useWidgets();

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Fetch available connections
  const { data: connections = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
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
        addToast({
          title: "Error",
          message: "Failed to load dataset data",
          type: "error",
        });
        return [];
      }
    },
    enabled: !!selectedDatasetId,
  });

  useEffect(() => {
    const columns = extractColumns(previewData);
    setDataColumns(columns);
  }, [previewData]);

  // Fetch schema info when connection changes
  useEffect(() => {
    const fetchSchemaInfo = async () => {
      if (!selectedConnectionId) {
        setSchemaInfo({});
        setSelectedSchema("");
        setSelectedTable("");
        return;
      }

      try {
        const response = await fetch(`/api/connections/${selectedConnectionId}/schema-info`);
        if (!response.ok) {
          throw new Error('Failed to fetch schema info');
        }
        const data = await response.json();
        setSchemaInfo(data);
        
        // Set the first schema as selected if none is selected
        if (!selectedSchema && Object.keys(data).length > 0) {
          setSelectedSchema(Object.keys(data)[0]);
        }
      } catch (error) {
        console.error('Error fetching schema info:', error);
        addToast({
          title: "Error",
          message: "Failed to fetch schema information",
          type: "error",
        });
      }
    };

    fetchSchemaInfo();
  }, [selectedConnectionId]);

  // Update available tables when schema changes
  useEffect(() => {
    if (!selectedSchema || !schemaInfo[selectedSchema]) {
      setSelectedTable("");
      return;
    }

    // Get available tables for the selected schema
    const tables = Object.keys(schemaInfo[selectedSchema]);
    
    // Set the first table as selected if none is selected
    if (!selectedTable && tables.length > 0) {
      setSelectedTable(tables[0]);
    }
  }, [selectedSchema, schemaInfo]);

  // Handle changes to dataset or chart type
  useEffect(() => {
    if (datasetData && datasetData.length > 0) {
      const columns = extractColumns(datasetData);
      setDataColumns(columns);
      setPreviewData(datasetData.map((row: any) => {
        for(const col in columns.numeric) {
          row[col] = Number(row[col]);
        }
        return row;
      }));

      // Initialize default config if not already set
      if (!config.xField && columns.string.length > 0) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          xField: columns.string[0],
          yField: columns.numeric[0] || columns.string[0],
        }));
      }
    }
  }, [datasetData, config?.chartType]);

  // Execute SQL query
  const handleExecuteQuery = async () => {
    if (!selectedConnectionId || !customQuery.trim()) {
      addToast({
        title: "Error",
        message: "Please select a connection and enter a valid SQL query.",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetch(`/api/connections/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: customQuery,
          connectionId: selectedConnectionId
        }),
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
        if (!config.xField && columns.string.length > 0) {
          setConfig((prevConfig) => ({
            ...prevConfig,
            xField: columns.string[0],
            yField: columns.numeric[0] || columns.string[0],
          }));
        }
      }
      
      // Auto switch to table preview tab after query execution
      setCurrentTab("table-preview");
    } catch (error: any) {
      addToast({
        title: "Query execution failed",
        message: error.message || "Failed to execute SQL query",
        type: "error",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check for required fields
    if (!name.trim()) {
      addToast({
        title: "Error",
        message: "Please enter a widget name.",
        type: "error",
      });
      return;
    }

    // Validate based on widget type
    if (widgetType === "text") {
      if (!textContent.trim()) {
        addToast({
          title: "Error",
          message: "Please enter some text content.",
          type: "error",
        });
        return;
      }
    } else {
      if (!selectedConnectionId) {
        addToast({
          title: "Error",
          message: "Please select a data connection.",
          type: "error",
        });
        return;
      }
      
      if (!customQuery.trim()) {
        addToast({
          title: "Error",
          message: "Please enter a SQL query.",
          type: "error",
        });
        return;
      }
    }

    // Prepare widget data based on type
    const widgetData = {
      name,
      description,// TODO: Add position to widget based on dashboard
    } as InsertWidget;

    // Set type-specific fields
    if (widgetType === "text") {
      Object.assign(widgetData, {
        type: "text",
        config: {
          chartType: "text",
          textContent: textContent,
        },
        connectionId: null,
        datasetId: null,
        customQuery: null,
        data: [],
      });
    } else if (widgetType === "table") {
      Object.assign(widgetData, {
        type: "table",
        data: previewData,
        connectionId: selectedConnectionId,
        datasetId: null,
        customQuery: customQuery,
        config: { chartType: "table" }
      });
    } else {
      Object.assign(widgetData, {
        type: widgetType,
        data: previewData,
        connectionId: selectedConnectionId,
        datasetId: null,
        customQuery: customQuery,
        config
      });
    }

    try {
      // save / edit widget
      if (widget) {
        const widgetId = widget.id;
        if (!widgetId) {
          addToast({
            title: "Error",
            message: "Widget ID is missing.",
            type: "error",
          });
          return;
        }
        await updateWidget({ 
          id: widgetId, 
          widget: widgetData,
          dashboardId: dashboardId
        });
      } else {
        await createWidget({
          widget: widgetData, 
          dashboardId: dashboardId
        });
      }
      
      // Only close on success
      onClose();
    } catch (error) {
      addToast({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to save widget",
        type: "error",
      });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="widget-name">Widget Title</Label>
          <Input
            id="widget-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter widget title"
          />
        </div>
        <div className="col-span-2">
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
          {/* Data Connection Sections */}
          <div className="grid grid-cols-4 gap-4">
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
            <div className="mb-4">
              <Label>Dataset</Label>
              <Select
                value={selectedDatasetId?.toString() || ""}
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
            <div className="mb-4">
              <Label>Schema</Label>
              <Select
                value={selectedSchema}
                onValueChange={(value) => {
                  setSelectedSchema(value);
                  setSelectedTable("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a schema" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(schemaInfo).map((schema) => (
                    <SelectItem key={schema} value={schema}>
                      {schema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label>Table</Label>
              <Select
                value={selectedTable}
                onValueChange={(value) => setSelectedTable(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(schemaInfo[selectedSchema] || {}).map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <div>
                  <Label>SQL Query</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">

                    <MonacoSQLEditor
                      value={customQuery}
                      onChange={setCustomQuery}
                      height="300px"
                    />

                    {/* Add table columns display */}
                    {selectedTable && selectedSchema && schemaInfo[selectedSchema]?.[selectedTable] && (
                      <div style={{height: "300px", overflowY: "auto", maxHeight: "300px"}}>
                        <div className="p-4 border rounded-lg">
                          <div>
                            <div className="grid grid-cols-2 gap-x-4">
                              {schemaInfo[selectedSchema][selectedTable].map((column, index) => (
                                <div key={index} className="-mt-1 flex justify-between">
                                  <span className="font-bold">{column.column}</span>
                                  <span className="text-muted-foreground text-right italic" >{column.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                          {dataColumns.all.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, idx) => (
                          <TableRow key={idx}>
                            {dataColumns.all.map((column) => (
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
                  <div className="grid grid-cols-4 gap-6">
                    {/* Left Column - Chart Properties */}
                    <div className="col-span-2 space-y-6 border rounded-lg p-4">
                      <Tabs value={previewTab} onValueChange={setPreviewTab}>
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
                          <TabsTrigger value="chart-settings">Chart Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="data-mapping" className="space-y-4">
                          {dataColumns.all.length > 0 ? (
                            <AxisMapping
                              chartType={config?.chartType || "bar"}
                              columns={dataColumns}
                              config={config}
                              onChange={(newConfig) =>
                                setConfig(newConfig)
                              }
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground mt-2">
                              Execute a query to map data columns
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="chart-settings" className="space-y-4">
                          <ChartConfig
                            chartType={config?.chartType || "bar"}
                            config={config}
                            onChange={(newConfig) =>
                              setConfig({ ...config, ...newConfig })
                            }
                          />
                        </TabsContent>
                      </Tabs>   
                    </div>
                    
                    {/* Right Column - Chart Preview */}
                    <div className="col-span-2 space-y-6">
                      <div className="border rounded-lg">
                        <div className="h-[300px]">
                          {previewData.length > 0 ? (
                            <Chart
                              widget={{
                                ...widget,
                                // override the type, data and config
                                type: widgetType,
                                data:previewData,
                                config
                              } as Widget}
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
                      <div className="">
                        <div className="grid grid-cols-8 gap-2">
                          {chartTypes.map((type) => (
                            <Button
                              key={type}
                              variant={config?.chartType === type ? "default" : "outline"}
                              className="flex flex-col items-center justify-center h-16 p-2"
                              onClick={() => setConfig({ ...config, chartType: type })}
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
    area: "Area",
    scatter: "Scatter",
    "dual-axes": "Dual Axes",
    counter: "Counter",
    "stat-card": "Stats",
    "box-plot": "Box Plot",
    histogram: "Histogram",
    "word-cloud": "Word Cloud"
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
    // case "table":
    //   return (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       width="16"
    //       height="16"
    //       viewBox="0 0 24 24"
    //       fill="none"
    //       stroke="currentColor"
    //       strokeWidth="2"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //     >
    //       <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    //       <line x1="3" y1="9" x2="21" y2="9"></line>
    //       <line x1="3" y1="15" x2="21" y2="15"></line>
    //       <line x1="9" y1="3" x2="9" y2="21"></line>
    //       <line x1="15" y1="3" x2="15" y2="21"></line>
    //     </svg>
    //   );
    // case "text":
    //   return (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       width="16"
    //       height="16"
    //       viewBox="0 0 24 24"
    //       fill="none"
    //       stroke="currentColor"
    //       strokeWidth="2"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //     >
    //       <polyline points="4 7 4 4 20 4 20 7"></polyline>
    //       <line x1="9" y1="20" x2="15" y2="20"></line>
    //       <line x1="12" y1="4" x2="12" y2="20"></line>
    //     </svg>
    //   );
    default:
      return null;
  }
}