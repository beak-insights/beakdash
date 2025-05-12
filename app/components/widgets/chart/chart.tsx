import React from 'react';
import { Widget, WidgetConfig } from "@/lib/db/schema";
 import { 
  renderBarChart, 
  renderColumnChart, 
  renderLineChart, 
  renderAreaChart, 
  renderPieChart, 
  renderScatterPlot, 
  renderDualAxisChart, 
  renderHistogramChart, 
  renderWordCloud 
} from './renders';


interface ChartWidgetProps {
  widget: Widget;
  dimensions: {
    width: number;
    height: number;
  };
}

export function ChartWidget({ widget, dimensions }: ChartWidgetProps) {
  // Extract common configuration
  let { data, config } = widget;
  
  // Skip data validation for text widgets as they don't require data
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }

  // Common responsive configuration for all charts
  const commonConfig = {

    height: dimensions.height,
    width: dimensions.width,
  };
  config = { ...commonConfig, ...config } as WidgetConfig;

  // Render the appropriate chart based on type
  switch (config.chartType) {
    case "bar":
      return renderBarChart(config, data);
    case "column":
      return renderColumnChart(config, data);
    case "line":
      return renderLineChart(config, data);
    case "area":
      return renderAreaChart(config, data);
    case "pie":
      return renderPieChart(config, data);  
    case "scatter":
      return renderScatterPlot(config, data);
    case "dual-axes":
      return renderDualAxisChart(config, data);
    case "histogram":
      return renderHistogramChart(config, data);
    case "word-cloud":
      return renderWordCloud(config, data);
    default:
      return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>;
  }
}
export default ChartWidget;
