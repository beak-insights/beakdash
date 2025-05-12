import { WidgetConfig } from '@/lib/db/schema';

const commonConfig = { 
  autoFit: true,
  legend: {
      position: 'top',
  },
}

// Ant Design Bar Chart Config
const getBarConfig = (config: WidgetConfig) => {
  return  {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
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
};
  
// Ant Design Column Chart Config 
const getColumnConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
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
};
  
// Ant Design Line Chart Config
const getLineConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    xField: config?.xField,
    yField: config?.yField,
    seriesField: config?.seriesField,
    colorField: config?.colorField,
    point: config?.point,
    interaction: config?.interaction,
    style: config?.style,
  }
};
  
// Ant Design Area Chart Config
const getAreaConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    xField: config?.xField,
    yField: config?.yField,
    colorField: config?.colorField,
    shapeField: 'smooth',
    stack: config?.stack, 
    normalize: config?.normalize,
    tooltip: { channel: 'y0', valueFormatter: '.3%' },
  };
};
  
  
// Ant Design Pie Chart Config
const getPieConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
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
};
  
// Ant Design Scatter Chart Config
const getScatterConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
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
};
  
// Ant Design Dual Axis Chart Config
const getDualAxisConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    xField: config?.xField,
    children: config?.children,
    legend: {
      color: {
        itemMarker: (v: any) => { return 'rect' }
      },
      ...config?.legend,
    },
  };
};
  
// Ant Design Histogram Chart Config
const getHistogramConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
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
};
  
// Ant Design Word Cloud Chart Config
const getWordCloudConfig = (config: WidgetConfig) => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    layout: { spiral: 'rectangular' },
    textField: config?.colorField,
    colorField: config?.colorField,
  };
};
  
  
export { 
    getBarConfig,
    getColumnConfig,
    getLineConfig,
    getAreaConfig,
    getPieConfig,
    getScatterConfig,
    getDualAxisConfig,
    getHistogramConfig,
    getWordCloudConfig,
};