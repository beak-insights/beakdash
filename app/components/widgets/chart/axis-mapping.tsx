import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChartType, WidgetConfig } from "@/lib/db/schema";

interface AxisMappingProps {
  chartType: ChartType;
  columns: { string: string[], numeric: string[], all: string[] };
  config: WidgetConfig;
  onChange: (config: Partial<WidgetConfig>) => void;
}

export default function AxisMapping({ 
  chartType, 
  columns, 
  config, 
  onChange 
}: AxisMappingProps) {
  
  if (!columns || columns.all.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No columns available for mapping. Please ensure your dataset contains data.
      </div>
    );
  }

  const handleChange = (key: keyof WidgetConfig, value: any) => {
    const newConfig = { ...config };
    if (value === undefined && key in newConfig) {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }
    onChange(newConfig);
  };

  // Helper function to update child configs for dual-axes
  const updateChildConfig = (index: number, key: string, value: any) => {
    const children = [...(config.children || [])];
    
    // Initialize child if needed
    if (!children[index]) {
      children[index] = { 
        type: index === 0 ? 'line' : 'interval',
        yField: value,
        axis: {
          y: {
            position: index === 0 ? 'left' : 'right',
            title: `Series ${index + 1}`
          }
        }
      };
    } else {
      // Update existing child
      children[index] = { 
        ...children[index],
        [key]: value 
      };
    }
    
    onChange({ ...config, children });
  };

  const addDualAxisSeries = () => {
    const children = [...(config.children || [])];
    const newIndex = children.length;
    
    // Default colors for series
    const colors = ["#5470C6", "#91CC75", "#EE6666", "#73C0DE", "#3BA272", "#FC8452"];
    
    // Create new series with defaults
    children.push({
      type: newIndex === 0 ? 'line' : (newIndex === 1 ? 'interval' : 'line'),
      yField: columns.numeric[Math.min(newIndex + 1, columns.numeric.length - 1)],
      colorField: colors[newIndex % colors.length],
      axis: {
        y: {
          position: newIndex === 0 ? 'left' : 'right',
          title: columns.numeric[Math.min(newIndex + 1, columns.numeric.length - 1)]
        }
      }
    });
    
    onChange({ ...config, children });
  };

  return (
    <div className="space-y-4">
      {/* Common X-Axis field for all chart types */}
      <div>
        <Label htmlFor="xField" className="block mb-1">X Axis</Label>
        <Select
          value={config.xField || ""}
          onValueChange={(value) => handleChange("xField", value === "none" ? undefined : value)}
        >
          <SelectTrigger id="xField">
            <SelectValue placeholder="Select X axis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {columns.string.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Different mappings based on chart type */}
      {chartType === "pie" ? (
        <div>
          <Label htmlFor="yField" className="block mb-1">Value Field</Label>
          <Select
            value={config.yField || ""}
            onValueChange={(value) => handleChange("yField", value === "none" ? undefined : value)}
          >
            <SelectTrigger id="yField">
              <SelectValue placeholder="Select value field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {columns.numeric.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : chartType === "dual-axes" ? (
        // Dual Axes - Series Configuration
        <div className="space-y-4 border rounded-md p-3">
          <h3 className="text-sm font-medium mb-2">Series Configuration</h3>
          
          {/* List existing series */}
          {(config.children || []).map((child, index) => (
            <div key={index} className="pl-2 border-l-2 space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium">Series {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const children = [...(config.children || [])];
                    children.splice(index, 1);
                    onChange({ ...config, children });
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              
              <div>
                <Label htmlFor={`series-${index}-type`} className="text-xs block mb-1">Chart Type</Label>
                <Select
                  value={child.type || 'line'}
                  onValueChange={(value) => {
                    const children = [...(config.children || [])];
                    children[index] = { ...children[index], type: value };
                    onChange({ ...config, children });
                  }}
                >
                  <SelectTrigger id={`series-${index}-type`}>
                    <SelectValue placeholder="Chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="interval">Bar/Column</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`series-${index}-field`} className="text-xs block mb-1">Y Field</Label>
                <Select
                  value={child.yField || ''}
                  onValueChange={(value) => updateChildConfig(index, "yField", value)}
                >
                  <SelectTrigger id={`series-${index}-field`}>
                    <SelectValue placeholder="Select Y field" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.numeric.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`series-${index}-position`} className="text-xs block mb-1">Axis Position</Label>
                <Select
                  value={child.axis?.y?.position || (index === 0 ? 'left' : 'right')}
                  onValueChange={(value) => {
                    const children = [...(config.children || [])];
                    const axis = children[index].axis || {};
                    children[index] = {
                      ...children[index],
                      axis: {
                        ...axis,
                        y: {
                          ...(axis.y || {}),
                          position: value
                        }
                      }
                    };
                    onChange({ ...config, children });
                  }}
                >
                  <SelectTrigger id={`series-${index}-position`}>
                    <SelectValue placeholder="Axis position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          
          {/* Add series button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={addDualAxisSeries}
            disabled={(config.children || []).length >= Math.min(columns.numeric.length, 4)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Series
          </Button>
          
          {/* No series message */}
          {(!config.children || config.children.length === 0) && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Add at least one series to configure the chart
            </div>
          )}
        </div>
      ) : (
        // Standard chart types
        <>
          <div>
            <Label htmlFor="yField" className="block mb-1">Y Axis</Label>
            <Select
              value={config.yField || ""}
              onValueChange={(value) => handleChange("yField", value === "none" ? undefined : value)}
            >
              <SelectTrigger id="yField">
                <SelectValue placeholder="Select Y axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.numeric.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Series/Group field for appropriate chart types */}
          {(chartType === "bar" || chartType === "column" || chartType === "line" || chartType === "area" || chartType === "scatter") && (
            <div>
              <Label htmlFor="seriesField" className="block mb-1">Series/Group Field</Label>
              <Select
                value={config.seriesField || ""}
                onValueChange={(value) => handleChange("seriesField", value === "none" ? undefined : value)}
              >
                <SelectTrigger id="seriesField">
                  <SelectValue placeholder="Select series field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columns.all.map((column) => (  
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Size field for scatter plot */}
          {chartType === "scatter" && (
            <div>
              <Label htmlFor="sizeField" className="block mb-1">Size Field (optional)</Label>
              <Select
                value={config.sizeField || ""}
                onValueChange={(value) => handleChange("sizeField", value === "none" ? undefined : value)}
              >
                <SelectTrigger id="sizeField">
                  <SelectValue placeholder="Select size field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columns.all.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Color field for charts that support it */}
          {["bar", "column", "line", "area", "scatter", "box-plot", "histogram", "word-cloud"].includes(chartType) && (
            <div>
              <Label htmlFor="colorField" className="block mb-1">Color Field (optional)</Label>
              <Select
                value={config.colorField || ""}
                onValueChange={(value) => handleChange("colorField", value === "none" ? undefined : value)}
              >
                <SelectTrigger id="colorField">
                  <SelectValue placeholder="Select color field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columns.all.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Sorting */}
      <div>
        <Label className="block mb-1">Sorting</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={typeof config.sort === 'object' ? config.sort.by || "" : ""}
            onValueChange={(value) => {
              if (value === "none") {
                onChange({ ...config, sort: undefined });
              } else {
                onChange({ 
                  ...config, 
                  sort: { 
                    ...(typeof config.sort === 'object' ? config.sort : {}), 
                    by: value 
                  } 
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {columns.all.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={typeof config.sort === 'object' && config.sort.reverse ? "desc" : "asc"}
            onValueChange={(value) => {
              if (typeof config.sort === 'object') {
                onChange({ 
                  ...config, 
                  sort: { 
                    ...config.sort, 
                    reverse: value === "desc" 
                  } 
                });
              } else if (config.sort || typeof config.sort === 'undefined') {
                onChange({ 
                  ...config, 
                  sort: { 
                    reverse: value === "desc" 
                  } 
                });
              }
            }}
            disabled={!config.sort}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}