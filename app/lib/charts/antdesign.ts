import { WidgetConfig } from '@/lib/db/schema';

const commonConfig: WidgetConfig = { 
  autoFit: true,
  legend: {
    size: false,
    color: {
      position: 'bottom',
    },
  },
}

// Ant Design Bar Chart Config
const toAntBarConfig = (config: WidgetConfig): WidgetConfig => {
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
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  };
};
  
// Ant Design Column Chart Config 
const toAntColumnConfig = (config: WidgetConfig): WidgetConfig => {
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
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  };
};
  
// Ant Design Line Chart Config
const toAntLineConfig = (config: WidgetConfig): WidgetConfig => {
  const lc = {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    xField: config?.xField,
    yField: config?.yField,
    seriesField: config?.seriesField,
    colorField: config?.colorField,
    point: config?.point,
    interaction: config?.interaction,
    style: config?.style,
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  } as any
  if(config?.tooltip == false) {
    lc['tooltip'] = false;
  }
  return lc;
};
  
// Ant Design Area Chart Config
const toAntAreaConfig = (config: WidgetConfig): WidgetConfig => {
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
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  };
};
  
  
// Ant Design Pie Chart Config
const toAntPieConfig = (config: WidgetConfig): WidgetConfig => {
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
    // },,
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
    // legend: {
    //   color: {
    //     position: 'right',
    //     rowPadding: 5,
    //   },
    // }
  };
};
  
// Ant Design Scatter Chart Config
const toAntScatterConfig = (config: WidgetConfig): WidgetConfig => {
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
    // },,
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  };
};
  
// Ant Design Dual Axis Chart Config
const toAntDualAxisConfig = (config: WidgetConfig): WidgetConfig => {
  let legend = {
    ...commonConfig?.legend,
    ...config?.legend,
  }
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    xField: config?.xField,
    children: config?.children,
    legend: {
      ...legend,
      color: {
        ...legend.color,
        itemMarker: (v: any) => { return 'rect' }
      },
    },
  };
};
  
// Ant Design Histogram Chart Config
const toAntHistogramConfig = (config: WidgetConfig): WidgetConfig => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    binField: config?.binField,
    binWidth: config?.binWidth,
    binNumber: config?.binNumber,
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
    legend: {
      ...commonConfig?.legend,
      ...config?.legend,
    },
  };
};
  
// Ant Design Word Cloud Chart Config
const toAntWordCloudConfig = (config: WidgetConfig): WidgetConfig => {
  return {
    autoFit: commonConfig?.autoFit,
    height: config?.height,
    layout: { spiral: 'rectangular' },
    textField: config?.colorField,
    colorField: config?.colorField,
    // legend: {
    //   ...commonConfig?.legend,
    //   ...config?.legend,
    // },
  };
};
  
  
export { 
    toAntBarConfig,
    toAntColumnConfig,
    toAntLineConfig,
    toAntAreaConfig,
    toAntPieConfig,
    toAntScatterConfig,
    toAntDualAxisConfig,
    toAntHistogramConfig,
    toAntWordCloudConfig,
};