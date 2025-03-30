import { ChartType } from "@shared/schema";
import { Label } from "@/components/ui/label";

interface ChartConfigProps {
  chartType: ChartType;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function ChartConfig({ 
  chartType, 
  config, 
  onChange 
}: ChartConfigProps) {
  
  const updateConfig = (key: string, value: any) => {
    onChange({ [key]: value });
  };
  
  return (
    <div className="space-y-4">
      {/* Chart type specific options */}
      {chartType === "bar" || chartType === "column" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Bar/Column Options</h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stacked"
                  checked={config.stacked === true}
                  onChange={(e) => updateConfig("stacked", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="stacked">Stacked</Label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {chartType === "pie" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Pie Chart Options</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="innerRadius" className="text-xs">Inner Radius (Donut)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="innerRadius"
                  min="0"
                  max="80"
                  step="5"
                  value={config.innerRadius || 0}
                  onChange={(e) => updateConfig("innerRadius", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs w-6">{config.innerRadius || 0}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="outerRadius" className="text-xs">Outer Radius</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="outerRadius"
                  min="50"
                  max="100"
                  step="5"
                  value={config.outerRadius || 80}
                  onChange={(e) => updateConfig("outerRadius", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs w-6">{config.outerRadius || 80}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showLabel"
                checked={config.showLabel !== false}
                onChange={(e) => updateConfig("showLabel", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showLabel">Show Labels</Label>
            </div>
          </div>
        </div>
      )}
      
      {chartType === "line" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Line Chart Options</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="connectNulls"
                checked={config.connectNulls !== false}
                onChange={(e) => updateConfig("connectNulls", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="connectNulls">Connect Nulls</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="area"
                checked={config.area === true}
                onChange={(e) => updateConfig("area", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="area">Show Area</Label>
            </div>
            <div>
              <Label htmlFor="lineType" className="text-xs">Line Type</Label>
              <select 
                id="lineType"
                value={config.lineType || "monotone"}
                onChange={(e) => updateConfig("lineType", e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              >
                <option value="monotone">Smooth (monotone)</option>
                <option value="linear">Straight (linear)</option>
                <option value="step">Step</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {chartType === "scatter" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Scatter Plot Options</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showBubble"
                checked={config.showBubble === true}
                onChange={(e) => updateConfig("showBubble", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showBubble">Show as Bubble Chart (size-dependent)</Label>
            </div>
          </div>
        </div>
      )}
      
      {chartType === "dual-axes" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Dual Axes Options</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="leftAxisType" className="text-xs">Left Axis Type</Label>
              <select 
                id="leftAxisType"
                value={config.leftAxisType || "bar"}
                onChange={(e) => updateConfig("leftAxisType", e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rightAxisType" className="text-xs">Right Axis Type</Label>
              <select 
                id="rightAxisType"
                value={config.rightAxisType || "line"}
                onChange={(e) => updateConfig("rightAxisType", e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Common chart options */}
      <div>
        <h3 className="text-sm font-medium mb-2">General Chart Options</h3>
        <div className="space-y-2">
          <div>
            <Label htmlFor="chartTitle" className="text-xs">Chart Title</Label>
            <input
              type="text"
              id="chartTitle"
              value={config.chartTitle || ""}
              onChange={(e) => updateConfig("chartTitle", e.target.value)}
              placeholder="Optional chart title"
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
            />
          </div>
          <div>
            <Label htmlFor="xAxisLabel" className="text-xs">X-Axis Label</Label>
            <input
              type="text"
              id="xAxisLabel"
              value={config.xAxisLabel || ""}
              onChange={(e) => updateConfig("xAxisLabel", e.target.value)}
              placeholder="Optional X-axis label"
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
            />
          </div>
          <div>
            <Label htmlFor="yAxisLabel" className="text-xs">Y-Axis Label</Label>
            <input
              type="text"
              id="yAxisLabel"
              value={config.yAxisLabel || ""}
              onChange={(e) => updateConfig("yAxisLabel", e.target.value)}
              placeholder="Optional Y-axis label"
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
