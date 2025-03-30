import React from "react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  ComposedChart, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend,
  LabelList, ReferenceLine
} from "recharts";
import { ChartType } from "@shared/schema";
import { cn, getRandomColor } from "@/lib/utils";
import CounterWidget from "@/components/widgets/counter-widget";
import StatCardWidget from "@/components/widgets/stat-card-widget";

type CommonChartProps = {
  data: Record<string, any>[];
  width?: number | string;
  height?: number | string;
  className?: string;
};

type AxisChartProps = CommonChartProps & {
  xAxis: string;
  yAxis: string;
  y2Axis?: string;
  groupBy?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  stacked?: boolean;
};

type PieChartProps = CommonChartProps & {
  valueField: string;
  nameField: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
};

type ScatterChartProps = CommonChartProps & {
  xAxis: string;
  yAxis: string;
  zAxis?: string;
  nameField: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
};

// Bar Chart Component
export function BarChartComponent({
  data,
  xAxis,
  yAxis,
  groupBy,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  colors = [],
  stacked = false,
  width = "100%",
  height = 300,
  className,
}: AxisChartProps) {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  // Extract unique group values if groupBy is provided
  const groups = groupBy
    ? Array.from(new Set(data.map((item) => item[groupBy])))
    : [yAxis];

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxis} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          
          {groups.map((group, index) => (
            <Bar 
              key={index}
              dataKey={groupBy ? (item: any) => (item[groupBy] === group ? item[yAxis] : 0) : yAxis}
              name={groupBy ? String(group) : yAxis}
              stackId={stacked ? "stack" : undefined}
              fill={colors[index] || getRandomColor(index)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart Component
export function LineChartComponent({
  data,
  xAxis,
  yAxis,
  groupBy,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  colors = [],
  width = "100%",
  height = 300,
  className,
}: AxisChartProps) {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  // Extract unique group values if groupBy is provided
  const groups = groupBy
    ? Array.from(new Set(data.map((item) => item[groupBy])))
    : [yAxis];

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxis} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          
          {groups.map((group, index) => (
            <Line 
              key={index}
              type="monotone"
              dataKey={groupBy ? (item: any) => (item[groupBy] === group ? item[yAxis] : null) : yAxis}
              name={groupBy ? String(group) : yAxis}
              stroke={colors[index] || getRandomColor(index)}
              activeDot={{ r: 8 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pie Chart Component
export function PieChartComponent({
  data,
  valueField,
  nameField,
  showLegend = true,
  showTooltip = true,
  colors = [],
  innerRadius = 0,
  outerRadius = 80,
  width = "100%",
  height = 300,
  className,
}: PieChartProps) {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey={valueField}
            nameKey={nameField}
            label
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index] || getRandomColor(index)} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Scatter Chart Component
export function ScatterChartComponent({
  data,
  xAxis,
  yAxis,
  zAxis,
  nameField,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  colors = [],
  width = "100%",
  height = 300,
  className,
}: ScatterChartProps) {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  // Extract unique name values
  const names = Array.from(new Set(data.map((item) => item[nameField])));

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxis} type="number" name={xAxis} />
          <YAxis dataKey={yAxis} type="number" name={yAxis} />
          {zAxis && <ZAxis dataKey={zAxis} type="number" range={[60, 400]} name={zAxis} />}
          {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
          {showLegend && <Legend />}
          
          {names.map((name, index) => (
            <Scatter
              key={index}
              name={String(name)}
              data={data.filter(item => item[nameField] === name)}
              fill={colors[index] || getRandomColor(index)}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Dual Axes Chart Component
export function DualAxesChartComponent({
  data,
  xAxis,
  yAxis,
  y2Axis,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  colors = [],
  width = "100%",
  height = 300,
  className,
}: AxisChartProps) {
  if (!data || !data.length || !y2Axis) {
    return <div className="flex items-center justify-center h-full">No data available or secondary axis not specified</div>;
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxis} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          
          <Bar
            yAxisId="left"
            dataKey={yAxis}
            name={yAxis}
            fill={colors[0] || getRandomColor(0)}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={y2Axis}
            name={y2Axis}
            stroke={colors[1] || getRandomColor(1)}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Column Chart Component (essentially a rotated Bar Chart)
export function ColumnChartComponent(props: AxisChartProps) {
  // Column chart is the same as bar chart but with horizontal layout
  return <BarChartComponent {...props} />;
}

// Main Chart Component that renders the appropriate chart based on type
interface ChartProps {
  type: ChartType;
  data: Record<string, any>[];
  config: Record<string, any>;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Chart({
  type,
  data,
  config,
  width = "100%",
  height = 300,
  className,
}: ChartProps) {
  // Extract common configuration
  const { xAxis, yAxis, y2Axis, groupBy, showLegend, showGrid, showTooltip, colors } = config;
  
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }
  
  // Render the appropriate chart based on type
  switch (type) {
    case "bar":
      return (
        <BarChartComponent
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          groupBy={groupBy}
          showLegend={showLegend}
          showGrid={showGrid}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "column":
      return (
        <ColumnChartComponent
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          groupBy={groupBy}
          showLegend={showLegend}
          showGrid={showGrid}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "line":
      return (
        <LineChartComponent
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          groupBy={groupBy}
          showLegend={showLegend}
          showGrid={showGrid}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "pie":
      return (
        <PieChartComponent
          data={data}
          valueField={yAxis}
          nameField={xAxis}
          showLegend={showLegend}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "scatter":
      return (
        <ScatterChartComponent
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          nameField={groupBy || "name"}
          showLegend={showLegend}
          showGrid={showGrid}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "dual-axes":
      return (
        <DualAxesChartComponent
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          y2Axis={y2Axis}
          showLegend={showLegend}
          showGrid={showGrid}
          showTooltip={showTooltip}
          colors={colors}
          width={width}
          height={height}
          className={className}
        />
      );
    case "counter":
      return (
        <CounterWidget
          data={data}
          config={config}
          className={className}
        />
      );
    case "stat-card":
      return (
        <StatCardWidget
          data={data}
          config={config}
          className={className}
        />
      );
    default:
      return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>;
  }
}

export default Chart;
