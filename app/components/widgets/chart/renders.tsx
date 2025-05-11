import React from "react";
import { Widget, WidgetConfig } from "@/lib/db/schema";
import {
  Bar,
  Column, 
  Line, 
  Area, 
  Pie,
  Scatter,
  DualAxes,
  Histogram,
  WordCloud,
} from '@ant-design/charts';
import { makesureNumeric } from "@/lib/utils";
import { normalizeData } from "@/lib/data/utils";


interface ChartWidgetProps {
  widget: Widget;
}

export function ChartWidget({ widget }: ChartWidgetProps) {
  // Extract common configuration
  const { data, config, config: { chartType } = {} } = widget;
  
  // Skip data validation for text widgets as they don't require data
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }

  // Render the appropriate chart based on type
  switch (chartType) {
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


// Render a bar chart
const renderBarChart = (config: WidgetConfig, data: Record<string, any>[]) => {
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);

  const barConfig = {
    data,
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
const renderColumnChart = (config: WidgetConfig, data: Record<string, any>[]) => {
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);

  const columnConfig = {
    data,
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
const renderLineChart = (config: WidgetConfig, data: Record<string, any>[]) => {  
  
  if(!config?.xField || !config?.yField) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Configure Chart!!</div>;
  }
  
  data = makesureNumeric(data || []);
  const lineConfig = {
    data,
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
const renderAreaChart = (config: WidgetConfig, data: Record<string, any>[]) => {
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
const renderPieChart = (config: WidgetConfig, data: Record<string, any>[]) => {
  data = makesureNumeric(data || []);
  
  const pieConfig = {
    data,
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
const renderScatterPlot = (config: WidgetConfig, data: Record<string, any>[]) => {
  data = makesureNumeric(data || []);
  const scatterConfig = {
    data,
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
const renderDualAxisChart = (config: WidgetConfig, data: Record<string, any>[]) => {
  data = makesureNumeric(data || []);
  const dualAxisConfig = {
    data,
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
const renderHistogramChart = (config: WidgetConfig, data: Record<string, any>[]) => {
  data = makesureNumeric(data || []);
  const histogramConfig = {
    data,
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

const renderWordCloud = (config: WidgetConfig, data: Record<string, any>[]) => {
  const wordCloudConfig = {
    data,
    autoFit: true,
    layout: { spiral: 'rectangular' },
    textField: config?.colorField,
    colorField: config?.colorField,
  };
  return <WordCloud {...wordCloudConfig} />;
};


