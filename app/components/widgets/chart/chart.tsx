import React from "react";
import { Widget } from "@/lib/db/schema";
import {
  Bar,
  Column, 
  Line, 
  Area, 
  Pie,
  Scatter,
  DualAxes,
  Histogram,
  Box,
  WordCloud,
} from '@ant-design/charts';
import { makesureNumeric } from "@/lib/utils";
// Main Chart Component that renders the appropriate chart based on type
interface ChartProps {
  widget: Widget;
  width?: number | string;
  height?: number | string;
  className?: string;
}

// Render a bar chart
const renderBarChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const barConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    legend: {
      position: 'top', // or 'right', 'bottom', 'left'
    },
    xField: config?.xField,
    yField: config?.yField,
    // colorField: 'age',
    // stack: true,
    // normalize: true,
  };
  return <Bar {...barConfig} />;
};

// Render a column chart
const renderColumnChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const columnConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    yField: config?.yField,
    seriesField: config?.seriesField,
    stack: config?.stack,
    colorField: config?.colorField,
    sort: config?.sort,
    group: config?.group,
    percent: config?.percent,
    style: config?.style,
  };
  return <Column {...columnConfig} />;
};

// Render a line chart
const renderLineChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const lineConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    point: config?.point,
    interaction: config?.interaction,
    style: config?.style,
  };
  return <Line {...lineConfig} />;
};

// Render an area chart
const renderAreaChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  
  const areaConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    shapeField: config?.shapeField,
    stack: config?.stack, 
    normalize: config?.normalize,
  };
  
  return <Area {...areaConfig} />;
};

// Render a pie chart / donut chart
const renderPieChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  
  const pieConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    angleField: config?.yField,
    colorField: config?.xField,
    // innerRadius: 0.6,
    label: {
      text: config?.yField,
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    }
  };
  
  return <Pie {...pieConfig} />;
};

// Render a scatter plot
const renderScatterPlot = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const scatterConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    sizeField: config?.sizeField,
    shapeField: config?.shapeField,
  };
  return <Scatter {...scatterConfig} />;
};

// Render a dual axis chart
const renderDualAxisChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const dualAxisConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    children: [
      {
        type: 'interval',
        yField: 'waiting',
      },
      {
        type: 'line',
        yField: 'people',
        shapeField: 'smooth',
        scale: { color: { relations: [['people', '#fdae6b']] } },
        axis: { y: { position: 'right' } },
        style: { lineWidth: 2 },
      },
    ],
  };
  return <DualAxes {...dualAxisConfig} />;
};

// Render a Histogram chart
const renderHistogramChart = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const histogramConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    style: config?.style,
    binField: config?.binField,
    colorField: config?.colorField,
    stack: config?.stack,
    channel: config?.channel,
    binWidth: config?.binWidth,
    scale: config?.scale,
  };
  return <Histogram {...histogramConfig} />;
};

const renderBoxPlot = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const boxPlotConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    boxType: config?.boxType,
    legend: config?.legend,
    style: config?.style,
    scale: config?.scale,
  };
  return <Box {...boxPlotConfig} />;
};

const renderWordCloud = (widget: Widget) => {
  let { config, data } = widget;
  data = makesureNumeric(data || []);
  const wordCloudConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'center', 
    },
    layout: config?.layout,
    colorField: config?.colorField,
  };
  return <WordCloud {...wordCloudConfig} />;
};

export function Chart({
  widget,
  height = 300,
}: ChartProps) {
  // Extract common configuration
  const { data, config } = widget;
  const { chartType } = config || {};
  
  // Calculate the final height - convert string "100%" to actual numeric height
  const finalHeight = height === "100%" ? "100%" : height;
  
  // Skip data validation for text widgets as they don't require data
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }
  
  // Render the appropriate chart based on type
  switch (chartType) {
    case "bar":
      return renderBarChart(widget);
    case "column":
      return renderColumnChart(widget);
    case "line":
      return renderLineChart(widget);
    case "area":
      return renderAreaChart(widget);
    case "pie":
      return renderPieChart(widget);  
    case "scatter":
      return renderScatterPlot(widget);
    case "dual-axes":
      return renderDualAxisChart(widget);
    case "histogram":
      return renderHistogramChart(widget);
    case "box-plot":
      return renderBoxPlot(widget);
    case "word-cloud":
      return renderWordCloud(widget);
      
    default:
      return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>;
  }
}

export default Chart;
