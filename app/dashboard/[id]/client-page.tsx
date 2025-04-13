'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { 
  CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

// Define widget type
interface Widget {
  id: number;
  name: string;
  type: string;
  config: any;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface Dashboard {
  id: number;
  name: string;
  description: string | null;
  space: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

interface DashboardPageProps {
  dashboard: Dashboard;
}

export function DashboardViewClient({ dashboard }: DashboardPageProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define chart colors
  const chartColors = [
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', 
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107'
  ];
  
  // Fetch widgets for this dashboard
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboards/${dashboard.id}/widgets`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch widgets');
        }
        
        const data = await response.json();
        setWidgets(data.widgets || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching widgets:', err);
        setError('Failed to load widgets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWidgets();
  }, [dashboard.id]);
  
  // Render a bar chart
  const renderBarChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={config.xAxis} />
          <YAxis />
          {config.showTooltip && <RechartsTooltip />}
          {config.showLegend && <Legend />}
          <Bar 
            dataKey={config.yAxis} 
            fill={config.colors?.[0] || chartColors[0]} 
            stackId={config.isStacked ? 'stack' : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render a line chart
  const renderLineChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={config.xAxis} />
          <YAxis />
          {config.showTooltip && <RechartsTooltip />}
          {config.showLegend && <Legend />}
          <Line 
            type="monotone" 
            dataKey={config.yAxis} 
            stroke={config.colors?.[0] || chartColors[0]} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Render an area chart
  const renderAreaChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={config.xAxis} />
          <YAxis />
          {config.showTooltip && <RechartsTooltip />}
          {config.showLegend && <Legend />}
          <Area 
            type="monotone" 
            dataKey={config.yAxis} 
            fill={config.colors?.[0] || chartColors[0]} 
            stroke={config.colors?.[0] || chartColors[0]} 
            stackId={config.isStacked ? 'stack' : undefined}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  // Render a pie chart
  const renderPieChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={config.yAxis}
            nameKey={config.xAxis}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={config.colors?.[index % config.colors.length] || chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          {config.showTooltip && <RechartsTooltip />}
          {config.showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Mock data for testing - replace with real data loading
  const getMockData = (widget: Widget) => {
    const mockDataMap = {
      bar: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 }
      ],
      line: [
        { date: 'Jan', value: 400 },
        { date: 'Feb', value: 300 },
        { date: 'Mar', value: 600 },
        { date: 'Apr', value: 800 },
        { date: 'May', value: 500 }
      ],
      pie: [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 }
      ],
      area: [
        { date: 'Jan', value: 400 },
        { date: 'Feb', value: 300 },
        { date: 'Mar', value: 600 },
        { date: 'Apr', value: 800 },
        { date: 'May', value: 500 }
      ],
      text: []
    };
    
    const config = widget.config || {};
    const chartType = config.chartType || 'bar';
    return mockDataMap[chartType] || [];
  };
  
  // Render widget based on type
  const renderWidget = (widget: Widget) => {
    const { type, config = {} } = widget;
    
    // For text widget type
    if (type === 'text') {
      return (
        <div className="h-full p-4 overflow-auto">
          <div className="prose max-w-none">
            {config.textContent.split('\n').map((line: string, i: number) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      );
    }
    
    // For chart widget type
    if (type === 'chart') {
      const chartType = config.chartType || 'bar';
      const mockData = getMockData(widget);
      
      switch (chartType) {
        case 'bar':
          return renderBarChart(widget, mockData);
        case 'line':
          return renderLineChart(widget, mockData);
        case 'area':
          return renderAreaChart(widget, mockData);
        case 'pie':
          return renderPieChart(widget, mockData);
        default:
          return <div className="p-4">Unsupported chart type: {chartType}</div>;
      }
    }
    
    return <div className="p-4">Unsupported widget type: {type}</div>;
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      ) : widgets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full border border-dashed rounded-lg p-8 bg-muted/50 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
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
                className="text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No widgets yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Add your first widget to start visualizing your data.
            </p>
            <a
              href={`/dashboard/${dashboard.id}/add-widget`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
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
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Widget
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <div 
              key={widget.id} 
              className="border rounded-lg overflow-hidden bg-card shadow-sm"
              style={{
                gridColumn: `span ${widget.position?.w || 1} / span ${widget.position?.w || 1}`,
                gridRow: `span ${widget.position?.h || 1} / span ${widget.position?.h || 1}`,
              }}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{widget.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="Edit widget"
                  >
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button 
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive"
                    aria-label="Delete widget"
                  >
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
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="h-64">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}