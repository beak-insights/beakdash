import { ChartType } from "@schema";
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

      {chartType === "counter" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Counter Widget Options</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="valueField" className="text-xs">Value Field</Label>
              <input
                type="text"
                id="valueField"
                value={config.valueField || ""}
                onChange={(e) => updateConfig("valueField", e.target.value)}
                placeholder="Column name for value"
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div>
              <Label htmlFor="format" className="text-xs">Value Format</Label>
              <select
                id="format"
                value={config.format || "number"}
                onChange={(e) => updateConfig("format", e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              >
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="prefix" className="text-xs">Prefix</Label>
                <input
                  type="text"
                  id="prefix"
                  value={config.prefix || ""}
                  onChange={(e) => updateConfig("prefix", e.target.value)}
                  placeholder="e.g. $"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="suffix" className="text-xs">Suffix</Label>
                <input
                  type="text"
                  id="suffix"
                  value={config.suffix || ""}
                  onChange={(e) => updateConfig("suffix", e.target.value)}
                  placeholder="e.g. kg"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="decimals" className="text-xs">Decimal Places</Label>
              <input
                type="number"
                id="decimals"
                min="0"
                max="10"
                value={config.decimals || 0}
                onChange={(e) => updateConfig("decimals", parseInt(e.target.value, 10))}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showIcon"
                checked={config.showIcon !== false}
                onChange={(e) => updateConfig("showIcon", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showIcon">Show Icon</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="colorCode"
                checked={config.colorCode !== false}
                onChange={(e) => updateConfig("colorCode", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="colorCode">Color Based on Value</Label>
            </div>
          </div>
        </div>
      )}

      {chartType === "stat-card" && (
        <div>
          <h3 className="text-sm font-medium mb-2">Stat Card Widget Options</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="primaryValueField" className="text-xs">Primary Value Field</Label>
              <input
                type="text"
                id="primaryValueField"
                value={config.primaryValueField || ""}
                onChange={(e) => updateConfig("primaryValueField", e.target.value)}
                placeholder="Column name for primary value"
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div>
              <Label htmlFor="secondaryValueField" className="text-xs">Secondary Value Field (Optional)</Label>
              <input
                type="text"
                id="secondaryValueField"
                value={config.secondaryValueField || ""}
                onChange={(e) => updateConfig("secondaryValueField", e.target.value)}
                placeholder="Column name for comparison"
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div>
              <Label htmlFor="compareField" className="text-xs">Compare Field (e.g. date)</Label>
              <input
                type="text"
                id="compareField"
                value={config.compareField || ""}
                onChange={(e) => updateConfig("compareField", e.target.value)}
                placeholder="Field for trend comparison"
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div>
              <Label htmlFor="format" className="text-xs">Value Format</Label>
              <select
                id="format"
                value={config.format || "number"}
                onChange={(e) => updateConfig("format", e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              >
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="prefix" className="text-xs">Prefix</Label>
                <input
                  type="text"
                  id="prefix"
                  value={config.prefix || ""}
                  onChange={(e) => updateConfig("prefix", e.target.value)}
                  placeholder="e.g. $"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="suffix" className="text-xs">Suffix</Label>
                <input
                  type="text"
                  id="suffix"
                  value={config.suffix || ""}
                  onChange={(e) => updateConfig("suffix", e.target.value)}
                  placeholder="e.g. kg"
                  className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="decimals" className="text-xs">Decimal Places</Label>
              <input
                type="number"
                id="decimals"
                min="0"
                max="10"
                value={config.decimals || 0}
                onChange={(e) => updateConfig("decimals", parseInt(e.target.value, 10))}
                className="w-full mt-1 px-2 py-1 text-sm rounded border border-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showIcon"
                checked={config.showIcon !== false}
                onChange={(e) => updateConfig("showIcon", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showIcon">Show Icon</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showChange"
                checked={config.showChange !== false}
                onChange={(e) => updateConfig("showChange", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showChange">Show Change Indicator</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="colorCodeChange"
                checked={config.colorCodeChange !== false}
                onChange={(e) => updateConfig("colorCodeChange", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="colorCodeChange">Color Code Change</Label>
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
