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
import { groupByField } from "@/lib/data/toolkit";
import { normalizeData } from "@/lib/data/utils";
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

  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);
  // if(!config?.group || !config?.stack) {
  //   data = groupByField(data, config?.xField!, config?.yField!, 'sum');
  // }

  const barConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'left', 
    },
    legend: {
      position: 'top', // or 'top', 'right', 'bottom', 'left'
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    stack: config?.stack,
    group: config?.group,
    normalize: config?.normalize,
    seriesField: config?.seriesField,
    interaction: {
      elementHighlight: false,
      tooltip: {
        shared: true,
      },
    },
    sort: {
      reverse: false,
    },
    paddingRight: 80,
    style: {
      // maxWidth: 50,
    },
    axis: {
      x: {
        tick: true,
        title: true,
      },
      y: {
        grid: true,
        tick: true,
        label: true,
        title: true,
      },
    },
  };
  return <Bar {...barConfig} />;
};

// Render a column chart
const renderColumnChart = (widget: Widget) => {
  let { config, data } = widget;
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);

  const columnConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'left', 
    },
    legend: {
      position: 'top', // or 'top', 'right', 'bottom', 'left'
    },
    xField: config?.xField,
    yField: config?.yField,
    seriesField: config?.seriesField,
    stack: config?.stack,
    colorField: config?.colorField,
    sort: config?.sort,
    group: config?.group,
    percent: config?.percent,
    normalize: config?.normalize,
    style: config?.style,    
    interaction: {
      elementHighlight: false,
      tooltip: {
        shared: true,
      },
    },
  };
  return <Column {...columnConfig} />;
};

// Render a line chart
const renderLineChart = (widget: Widget) => {
  let { config, data } = widget;  
  
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);
  const lineConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'left', 
    },
    xField: config?.xField,
    yField: config?.yField,
    seriesField: config?.seriesField,
    colorField: config?.colorField,
    point: config?.point,
    interaction: config?.interaction,
    style: config?.style,
    // axis: {
    //   y: { title: '↑ Change in price (%)' },
    //   x: { title: 'Years' }
    // },
  } as any;

  // TODO: Remove this once we configure this:: tooltip: { channel: 'y', valueFormatter: '.1f' },
  if(config?.tooltip == false) {
    lineConfig['tooltip'] = false;
  }

  return <Line {...lineConfig} />;
};

// Render an area chart
const renderAreaChart = (widget: Widget) => {
  let { config, data } = widget;
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  data = makesureNumeric(data || []);

  if(config?.colorField) {
    data = normalizeData(data, {
      xField: config?.xField!,
      yField: config?.yField!,
      colorField: config?.colorField!,
    });
  }

  const areaConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'left', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    shapeField: 'smooth',
    stack: config?.stack, 
    normalize: config?.normalize,
    tooltip: { channel: 'y0', valueFormatter: '.3%' },
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
      align: 'left', 
    },
    angleField: config?.yField,
    colorField: config?.colorField,
    innerRadius: config?.innerRadius,
    label: config?.label,
    // label: {
    //   text: (d: any) => `${d[config?.colorField!]}\n ${d[config?.yField!]}`, // config?.yField,
    //   position: 'inside', // 'inside', 'outside', 'spider'
    //   style: {
    //     fontWeight: 'bold',
    //   },
    // },
    legend: config?.legend,
    // legend: {
    //   color: {
    //     position: 'right',
    //     rowPadding: 5,
    //   },
    // }
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
      align: 'left', 
    },
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    sizeField: config?.sizeField,
    shapeField: config?.shapeField,
    style: { fillOpacity: 0.3, lineWidth: 1 },
    // axis: {
    //   x: { title: 'time (hours)', tickCount: 24 },
    //   y: { title: 'time (day)', grid: true },
    // },
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
      align: 'left', 
    },
    xField: config?.xField,
    children: config?.children,
    legend: {
      color: {
        itemMarker: (v: any) => { return 'rect' }
      }
    },
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
      align: 'left', 
    },
    binField: config?.binField,
    // binWidth: config?.binWidth,
    binNumber: 10,
    colorField: config?.colorField,
    channel: 'count',
    stack: {
      orderBy: 'series',
    },
    style: {
      inset: 0.5,
    },
    interaction: {
      elementHighlight: false,
      tooltip: {
        shared: true,
      },
    },
  };
  return <Histogram {...histogramConfig} />;
};

const renderWordCloud = (widget: Widget) => {
  let { config, data } = widget;
  const wordCloudConfig = {
    data,
    title: {
      title: widget?.name, // Chart title
      subtitle: widget?.description,
      align: 'left', 
    },
    autoFit: true,
    layout: { spiral: 'rectangular' },
    textField: config?.colorField,
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
    case "word-cloud":
      return renderWordCloud(widget);
      
    default:
      return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>;
  }
}

export default Chart;
