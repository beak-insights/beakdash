'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { 
  Column, Line, Area, Pie, DualAxes, Scatter, 
  Rose, Radar, Gauge, Waterfall, WordCloud 
} from '@ant-design/charts';
import { EditOutlined, DeleteOutlined, AppstoreOutlined, SaveOutlined } from '@ant-design/icons';
import GridLayout, { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridLayoutProps {
  widgets: Widget[];
  dashboardId: number;
  onRenderWidget: (widget: Widget) => React.ReactNode;
}

function GridLayoutComponent({ widgets, dashboardId, onRenderWidget }: GridLayoutProps) {
  // Convert widgets to layout items
  const [layouts, setLayouts] = useState(() => {
    // Debug log for widget positions
    console.log("Initial widget positions:", widgets.map(w => ({ id: w.id, position: w.position })));
    
    const layoutItems = widgets.map(widget => {
      // Only use default values if position is completely missing
      const position = widget.position || {};
      
      const item = {
        i: widget.id.toString(),
        x: position.x !== undefined ? position.x : 0,
        y: position.y !== undefined ? position.y : 0,
        w: position.w !== undefined ? position.w : 6,
        h: position.h !== undefined ? position.h : 4,
        minW: 2,
        minH: 2,
      };
      
      console.log(`Widget ${widget.id} layout:`, item);
      return item;
    });
    
    return { lg: layoutItems, md: layoutItems, sm: layoutItems };
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Setup auto-save debounce timer 
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Save updated layout positions to database
  const saveLayout = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      // For each widget, update its position in the database
      const updatePromises = widgets.map(widget => {
        const layoutItem = layouts.lg.find(item => item.i === widget.id.toString());
        
        if (layoutItem) {
          const position = {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          };
          
          return fetch(`/api/widgets/${widget.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dashboardId,
              position
            })
          });
        }
        
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      setSaveMessage('Layout saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving layout:', error);
      setSaveMessage('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle layout change with auto-save
  const onLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    
    // Set new timer for auto-save with debounce
    const newTimer = setTimeout(() => {
      saveLayout();
    }, 2000); // 2 second debounce
    
    setSaveTimer(newTimer);
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-end mb-4">
        <button 
          onClick={saveLayout}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
        >
          <SaveOutlined style={{ marginRight: 8 }} />
          {isSaving ? 'Saving...' : 'Save Layout'}
        </button>
        {saveMessage && (
          <div className={`ml-4 px-4 py-2 rounded-md text-sm ${saveMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage}
          </div>
        )}
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        containerPadding={[15, 15]}
        margin={[15, 15]}
        onLayoutChange={onLayoutChange}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
        isBounded={false}
        draggableHandle=".drag-handle"
      >
        {widgets.map(widget => (
          <div
            key={widget.id.toString()}
            className="border rounded-lg overflow-hidden bg-card shadow-sm"
          >
            <div className="p-4 border-b flex items-center justify-between drag-handle cursor-move">
              <div>
                <h3 className="font-medium">{widget.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Edit widget"
                >
                  <EditOutlined />
                </button>
                <button 
                  className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive"
                  aria-label="Delete widget"
                >
                  <DeleteOutlined />
                </button>
              </div>
            </div>
            
            <div className="overflow-auto" style={{ height: 'calc(100% - 57px)' }}>
              {onRenderWidget(widget)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
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
    
    const barConfig = {
      data,
      xField: config.xAxis || 'name',
      yField: config.yAxis || 'value',
      seriesField: config.groupBy,
      isStack: config.isStacked,
      label: config.showLabel ? {} : undefined,
      color: config.colors || chartColors,
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      legend: {
        visible: config.showLegend !== false,
      },
      xAxis: {
        title: { text: config.xAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      yAxis: {
        title: { text: config.yAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      tooltip: {
        showContent: config.showTooltip !== false,
      },
    };
    
    return <Column {...barConfig} />;
  };
  
  // Render a line chart
  const renderLineChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    const lineConfig = {
      data,
      xField: config.xAxis || 'date',
      yField: config.yAxis || 'value',
      seriesField: config.groupBy,
      smooth: true,
      color: config.colors || chartColors,
      lineStyle: { lineWidth: 2 },
      point: {
        size: 5,
        shape: 'circle',
        style: { fillOpacity: 0.8 },
      },
      legend: {
        visible: config.showLegend !== false,
      },
      xAxis: {
        title: { text: config.xAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      yAxis: {
        title: { text: config.yAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      tooltip: {
        showContent: config.showTooltip !== false,
      },
    };
    
    return <Line {...lineConfig} />;
  };
  
  // Render an area chart
  const renderAreaChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    const areaConfig = {
      data,
      xField: config.xAxis || 'date',
      yField: config.yAxis || 'value',
      seriesField: config.groupBy,
      isStack: config.isStacked,
      smooth: true,
      color: config.colors || chartColors,
      areaStyle: { fillOpacity: 0.6 },
      legend: {
        visible: config.showLegend !== false,
      },
      xAxis: {
        title: { text: config.xAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      yAxis: {
        title: { text: config.yAxisLabel || '' },
        grid: { line: { style: { stroke: config.showGrid ? '#d9d9d9' : 'transparent' } } },
      },
      tooltip: {
        showContent: config.showTooltip !== false,
      },
    };
    
    return <Area {...areaConfig} />;
  };
  
  // Render a pie chart
  const renderPieChart = (widget: Widget, data: any[]) => {
    const { config } = widget;
    
    const pieConfig = {
      data,
      angleField: config.yAxis || 'value',
      colorField: config.xAxis || 'name',
      color: config.colors || chartColors,
      radius: 0.8,
      innerRadius: config.innerRadius || 0,
      label: {
        type: 'outer',
        content: config.showLabel !== false ? '{name}: {percentage}' : '',
      },
      legend: {
        visible: config.showLegend !== false,
      },
      tooltip: {
        showContent: config.showTooltip !== false,
      },
      interactions: [{ type: 'element-active' }],
    };
    
    return <Pie {...pieConfig} />;
  };
  
  // Sample data for testing - replace with real data loading
  const getSampleData = (widget: Widget) => {
    const sampleDataMap = {
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
    return sampleDataMap[chartType] || [];
  };
  
  // Render widget based on type
  const renderWidget = (widget: Widget) => {
    const { type, config = {} } = widget;
    
    // For text widget type
    if (type === 'text') {
      return (
        <div className="h-full p-4 overflow-auto">
          <div className="prose max-w-none">
            {config.textContent?.split('\n').map((line: string, i: number) => (
              <p key={i}>{line || <br />}</p>
            )) || (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>
        </div>
      );
    }
    
    // For chart widget type
    if (type === 'chart') {
      const chartType = config.chartType || 'bar';
      const sampleData = getSampleData(widget);
      
      // Set chart height to fill container with some padding
      const chartContainerStyle = { 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' as const,
        padding: '8px'
      };
      
      // Render different chart types
      return (
        <div style={chartContainerStyle}>
          {(() => {
            switch (chartType) {
              case 'bar':
                return renderBarChart(widget, sampleData);
              case 'line':
                return renderLineChart(widget, sampleData);
              case 'area':
                return renderAreaChart(widget, sampleData);
              case 'pie':
                return renderPieChart(widget, sampleData);
              default:
                return (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <p>Unsupported chart type: {chartType}</p>
                    </div>
                  </div>
                );
            }
          })()}
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
          <p>Unsupported widget type: {type}</p>
        </div>
      </div>
    );
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
        <GridLayoutComponent widgets={widgets} dashboardId={dashboard.id} onRenderWidget={renderWidget} />
      )}
    </>
  );
}