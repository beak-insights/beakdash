'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  Tooltip as RechartsTooltip,
  Legend,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  List,
  Table,
  Text,
} from 'lucide-react';
import { getRandomColor } from '@/lib/utils';

type Dataset = {
  id: number;
  name: string;
  description: string | null;
  connectionId: number | null;
  query: string | null;
  data: string | null;
  dataType: string | null;
};

type Dashboard = {
  id: number;
  name: string;
  description: string | null;
  spaceId: number | null;
  layout: string | null;
};

type WidgetType = 'bar' | 'line' | 'pie' | 'area' | 'table' | 'stat' | 'text';

interface WidgetClientProps {
  dashboard: Dashboard;
  datasets: Dataset[];
}

export function AddWidgetClient({ dashboard, datasets }: WidgetClientProps) {
  const router = useRouter();
  const [widgetType, setWidgetType] = useState<WidgetType>('bar');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM data LIMIT 10');
  const [widgetTitle, setWidgetTitle] = useState<string>('New Widget');
  const [widgetWidth, setWidgetWidth] = useState<string>('3');
  const [widgetHeight, setWidgetHeight] = useState<string>('medium');
  const [refreshInterval, setRefreshInterval] = useState<string>('0');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [dataFields, setDataFields] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState<string>('');
  const [yAxisField, setYAxisField] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Chart configuration options
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [isStacked, setIsStacked] = useState<boolean>(false);
  const [chartColors, setChartColors] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate random colors when chart type changes
    if (widgetType) {
      const colors = Array.from({ length: 10 }, (_, i) => getRandomColor(i));
      setChartColors(colors);
    }
  }, [widgetType]);

  // Simulate loading dataset data when selected
  useEffect(() => {
    if (selectedDatasetId) {
      const selectedDataset = datasets.find(d => d.id.toString() === selectedDatasetId);
      
      if (selectedDataset?.data) {
        try {
          // Parse the JSON data from the dataset
          const parsedData = JSON.parse(selectedDataset.data);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setPreviewData(parsedData.slice(0, 20)); // Limit to 20 rows for preview
            
            // Extract field names from the first object
            if (parsedData[0]) {
              const fields = Object.keys(parsedData[0]);
              setDataFields(fields);
              
              // Set default x and y axis fields if available
              if (fields.length > 0) {
                setXAxisField(fields[0]);
                if (fields.length > 1) {
                  setYAxisField(fields[1]);
                } else {
                  setYAxisField(fields[0]);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing dataset data:', error);
          setPreviewData([]);
          setDataFields([]);
        }
      } else if (selectedDataset?.query) {
        // If dataset has SQL query, use it
        setSqlQuery(selectedDataset.query);
      }
    }
  }, [selectedDatasetId, datasets]);

  // Function to generate mock data if needed
  const generateMockData = () => {
    const mockData = Array.from({ length: 7 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      value2: Math.floor(Math.random() * 800),
      value3: Math.floor(Math.random() * 600),
    }));
    
    setPreviewData(mockData);
    setDataFields(['name', 'value', 'value2', 'value3']);
    setXAxisField('name');
    setYAxisField('value');
  };

  // Process SQL query
  const processQuery = () => {
    setIsProcessing(true);
    
    // In a real implementation, this would send the SQL query to the server
    // For now, we'll just generate some mock data
    setTimeout(() => {
      if (!previewData.length) {
        generateMockData();
      }
      setIsProcessing(false);
    }, 1000);
  };

  // Handle widget creation
  const handleCreateWidget = () => {
    // In a real implementation, this would send the widget config to the server
    alert('Widget creation functionality will be implemented in the next phase.');
    router.push(`/dashboard/${dashboard.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Widget</h1>
          <p className="text-muted-foreground mt-1">
            Dashboard: {dashboard.name}
          </p>
        </div>
        
        <Link
          href={`/dashboard/${dashboard.id}`}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
        >
          Cancel
        </Link>
      </div>

      {/* Widget type selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">1. Select Widget Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bar Chart */}
          <div 
            className={`border rounded-lg p-4 bg-card cursor-pointer transition-colors ${widgetType === 'bar' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary'}`}
            onClick={() => setWidgetType('bar')}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="text-primary" />
            </div>
            <h3 className="font-medium mb-1">Bar Chart</h3>
            <p className="text-sm text-muted-foreground">
              Compare values across categories.
            </p>
          </div>
          
          {/* Line Chart */}
          <div 
            className={`border rounded-lg p-4 bg-card cursor-pointer transition-colors ${widgetType === 'line' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary'}`}
            onClick={() => setWidgetType('line')}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LineChartIcon className="text-primary" />
            </div>
            <h3 className="font-medium mb-1">Line Chart</h3>
            <p className="text-sm text-muted-foreground">
              Show trends over time or ordered categories.
            </p>
          </div>
          
          {/* Pie Chart */}
          <div 
            className={`border rounded-lg p-4 bg-card cursor-pointer transition-colors ${widgetType === 'pie' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary'}`}
            onClick={() => setWidgetType('pie')}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <PieChartIcon className="text-primary" />
            </div>
            <h3 className="font-medium mb-1">Pie Chart</h3>
            <p className="text-sm text-muted-foreground">
              Display proportions of a whole.
            </p>
          </div>
          
          {/* Table */}
          <div 
            className={`border rounded-lg p-4 bg-card cursor-pointer transition-colors ${widgetType === 'table' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary'}`}
            onClick={() => setWidgetType('table')}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Table className="text-primary" />
            </div>
            <h3 className="font-medium mb-1">Table</h3>
            <p className="text-sm text-muted-foreground">
              Display data in rows and columns.
            </p>
          </div>
        </div>
      </div>
      
      {/* Data source selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">2. Select Data Source</h2>
        
        {datasets.length === 0 ? (
          <div className="border border-dashed rounded-lg p-6 bg-muted/50 text-center">
            <h3 className="text-sm font-medium mb-2">No datasets available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a dataset to use as a data source for your widget.
            </p>
            <Link
              href="/datasets"
              className="text-sm text-primary hover:underline"
            >
              Create Dataset
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <label 
              htmlFor="dataset" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Dataset
            </label>
            <Select 
              value={selectedDatasetId} 
              onValueChange={setSelectedDatasetId}
            >
              <SelectTrigger className="w-full">
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
        )}
      </div>
      
      {/* SQL Editor */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">3. SQL Query</h2>
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-60 mb-4">
            <Editor
              height="100%"
              defaultLanguage="sql"
              defaultValue={sqlQuery}
              onChange={(value) => setSqlQuery(value || "")}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
              theme="vs-dark"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={processQuery}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Run Query'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Data Preview */}
      {previewData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">4. Data Preview</h2>
          <div className="border rounded-lg p-4 bg-card overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  {dataFields.map((field) => (
                    <th
                      key={field}
                      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {dataFields.map((field) => (
                      <td
                        key={field}
                        className="px-3 py-2 whitespace-nowrap text-sm"
                      >
                        {row[field]?.toString() || 'null'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Chart Configuration */}
      {previewData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">5. Chart Configuration</h2>
          <div className="border rounded-lg p-6 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Configuration Options */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="widgetTitle" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Widget Title
                  </label>
                  <input
                    id="widgetTitle"
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter widget title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                  />
                </div>
                
                {/* Chart axes */}
                {['bar', 'line', 'area'].includes(widgetType) && (
                  <>
                    <div className="space-y-2">
                      <label 
                        htmlFor="xAxis" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        X-Axis Field
                      </label>
                      <Select value={xAxisField} onValueChange={setXAxisField}>
                        <SelectTrigger id="xAxis">
                          <SelectValue placeholder="Select X-Axis field" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataFields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label 
                        htmlFor="yAxis" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Y-Axis Field
                      </label>
                      <Select value={yAxisField} onValueChange={setYAxisField}>
                        <SelectTrigger id="yAxis">
                          <SelectValue placeholder="Select Y-Axis field" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataFields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {/* Pie chart field select */}
                {widgetType === 'pie' && (
                  <>
                    <div className="space-y-2">
                      <label 
                        htmlFor="labelField" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Label Field
                      </label>
                      <Select value={xAxisField} onValueChange={setXAxisField}>
                        <SelectTrigger id="labelField">
                          <SelectValue placeholder="Select label field" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataFields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label 
                        htmlFor="valueField" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Value Field
                      </label>
                      <Select value={yAxisField} onValueChange={setYAxisField}>
                        <SelectTrigger id="valueField">
                          <SelectValue placeholder="Select value field" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataFields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {/* Chart display options */}
                <Tabs defaultValue="appearance">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="appearance" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showLegend"
                          checked={showLegend}
                          onChange={(e) => setShowLegend(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label 
                          htmlFor="showLegend"
                          className="text-sm font-medium"
                        >
                          Show Legend
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showTooltip"
                          checked={showTooltip}
                          onChange={(e) => setShowTooltip(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label 
                          htmlFor="showTooltip"
                          className="text-sm font-medium"
                        >
                          Show Tooltip
                        </label>
                      </div>
                      
                      {['bar', 'line', 'area'].includes(widgetType) && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showGrid"
                            checked={showGrid}
                            onChange={(e) => setShowGrid(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor="showGrid"
                            className="text-sm font-medium"
                          >
                            Show Grid
                          </label>
                        </div>
                      )}
                      
                      {['bar', 'area'].includes(widgetType) && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="stacked"
                            checked={isStacked}
                            onChange={(e) => setIsStacked(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor="stacked"
                            className="text-sm font-medium"
                          >
                            Stacked
                          </label>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="layout" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label 
                          htmlFor="widgetWidth" 
                          className="text-sm font-medium"
                        >
                          Width
                        </label>
                        <Select value={widgetWidth} onValueChange={setWidgetWidth}>
                          <SelectTrigger id="widgetWidth">
                            <SelectValue placeholder="Widget width" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Small (1/3)</SelectItem>
                            <SelectItem value="2">Medium (2/3)</SelectItem>
                            <SelectItem value="3">Full (3/3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label 
                          htmlFor="widgetHeight" 
                          className="text-sm font-medium"
                        >
                          Height
                        </label>
                        <Select value={widgetHeight} onValueChange={setWidgetHeight}>
                          <SelectTrigger id="widgetHeight">
                            <SelectValue placeholder="Widget height" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Chart Preview */}
              <div className="border rounded-lg p-4 bg-background">
                <h4 className="text-sm font-medium mb-2">{widgetTitle || 'Chart Preview'}</h4>
                <div className="h-[300px] w-full">
                  {widgetType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={previewData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis 
                          dataKey={xAxisField}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        {showTooltip && <RechartsTooltip />}
                        {showLegend && <Legend />}
                        {dataFields
                          .filter(field => field !== xAxisField)
                          .filter(field => !isNaN(Number(previewData[0]?.[field])))
                          .slice(0, 3)
                          .map((field, index) => (
                            <Bar 
                              key={field}
                              dataKey={field} 
                              fill={chartColors[index % chartColors.length]}
                              stackId={isStacked ? "stack" : undefined}
                            />
                          ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {widgetType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={previewData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis 
                          dataKey={xAxisField}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        {showTooltip && <RechartsTooltip />}
                        {showLegend && <Legend />}
                        {dataFields
                          .filter(field => field !== xAxisField)
                          .filter(field => !isNaN(Number(previewData[0]?.[field])))
                          .slice(0, 3)
                          .map((field, index) => (
                            <Line 
                              key={field}
                              type="monotone"
                              dataKey={field} 
                              stroke={chartColors[index % chartColors.length]}
                              activeDot={{ r: 8 }}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  
                  {widgetType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={previewData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          nameKey={xAxisField}
                          dataKey={yAxisField}
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {previewData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        {showTooltip && <RechartsTooltip />}
                        {showLegend && <Legend />}
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  
                  {widgetType === 'area' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={previewData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis 
                          dataKey={xAxisField}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        {showTooltip && <RechartsTooltip />}
                        {showLegend && <Legend />}
                        {dataFields
                          .filter(field => field !== xAxisField)
                          .filter(field => !isNaN(Number(previewData[0]?.[field])))
                          .slice(0, 3)
                          .map((field, index) => (
                            <Area
                              key={field}
                              type="monotone"
                              dataKey={field}
                              stackId={isStacked ? "stack" : index.toString()}
                              stroke={chartColors[index % chartColors.length]}
                              fill={chartColors[index % chartColors.length]}
                              fillOpacity={0.6}
                            />
                          ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  
                  {widgetType === 'table' && (
                    <div className="h-full overflow-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr>
                            {dataFields.slice(0, 4).map((field) => (
                              <th
                                key={field}
                                className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                {field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {previewData.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              {dataFields.slice(0, 4).map((field) => (
                                <td
                                  key={field}
                                  className="px-3 py-2 whitespace-nowrap text-sm"
                                >
                                  {row[field]?.toString() || 'null'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="border-t pt-6 flex justify-between">
        <Link
          href={`/dashboard/${dashboard.id}`}
          className="px-4 py-2 rounded-md text-sm font-medium border hover:bg-muted/50 transition-colors"
        >
          Cancel
        </Link>
        
        <div className="flex space-x-4">
          <button
            type="button"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
            onClick={processQuery}
          >
            Preview
          </button>
          
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            onClick={handleCreateWidget}
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
}