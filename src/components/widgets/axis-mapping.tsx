import { ChartType } from "@schema";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select";

interface AxisMappingProps {
  chartType: ChartType;
  columns: string[];
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function AxisMapping({ 
  chartType, 
  columns, 
  config, 
  onChange 
}: AxisMappingProps) {
  
  if (!columns || columns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No columns available for mapping. Please ensure your dataset contains data.
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common for most chart types */}
      {chartType !== "pie" && (
        <div>
          <Label htmlFor="xAxis" className="block mb-1">X Axis</Label>
          <Select
            value={config.xAxis || (columns.length > 0 ? columns[0] : '')}
            onValueChange={(value) => handleChange("xAxis", value === "none" ? "" : value)}
          >
            <SelectTrigger id="xAxis">
              <SelectValue placeholder="Select X axis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Different for each chart type */}
      {chartType === "pie" ? (
        <>
          <div>
            <Label htmlFor="nameField" className="block mb-1">Name Field</Label>
            <Select
              value={config.xAxis || (columns.length > 0 ? columns[0] : '')}
              onValueChange={(value) => handleChange("xAxis", value === "none" ? "" : value)}
            >
              <SelectTrigger id="nameField">
                <SelectValue placeholder="Select name field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="valueField" className="block mb-1">Value Field</Label>
            <Select
              value={config.yAxis || (columns.length > 1 ? columns[1] : columns[0])}
              onValueChange={(value) => handleChange("yAxis", value === "none" ? "" : value)}
            >
              <SelectTrigger id="valueField">
                <SelectValue placeholder="Select value field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : chartType === "dual-axes" ? (
        <>
          <div>
            <Label htmlFor="yAxis" className="block mb-1">Left Y Axis</Label>
            <Select
              value={config.yAxis || (columns.length > 1 ? columns[1] : columns[0])}
              onValueChange={(value) => handleChange("yAxis", value === "none" ? "" : value)}
            >
              <SelectTrigger id="yAxis">
                <SelectValue placeholder="Select left Y axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="y2Axis" className="block mb-1">Right Y Axis</Label>
            <Select
              value={config.y2Axis || (columns.length > 2 ? columns[2] : columns[0])}
              onValueChange={(value) => handleChange("y2Axis", value === "none" ? "" : value)}
            >
              <SelectTrigger id="y2Axis">
                <SelectValue placeholder="Select right Y axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="yAxis" className="block mb-1">Y Axis</Label>
            <Select
              value={config.yAxis || (columns.length > 1 ? columns[1] : columns[0])}
              onValueChange={(value) => handleChange("yAxis", value === "none" ? "" : value)}
            >
              <SelectTrigger id="yAxis">
                <SelectValue placeholder="Select Y axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Group By option for bar, column, line, and scatter charts */}
          {(chartType === "bar" || chartType === "column" || chartType === "line" || chartType === "scatter") && (
            <div>
              <Label htmlFor="groupBy" className="block mb-1">Group By</Label>
              <Select
                value={config.groupBy || "none"}
                onValueChange={(value) => handleChange("groupBy", value === "none" ? "" : value)}
              >
                <SelectTrigger id="groupBy">
                  <SelectValue placeholder="Select group by field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columns.map((column) => (
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

      {/* Sorting options for all charts */}
      <div>
        <Label htmlFor="sortBy" className="block mb-1">Sort Order</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={config.sortBy || "default"}
            onValueChange={(value) => handleChange("sortBy", value === "default" ? "" : value)}
          >
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={config.sortOrder || "none"}
            onValueChange={(value) => handleChange("sortOrder", value)}
          >
            <SelectTrigger id="sortOrder">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data limit option */}
      <div>
        <Label htmlFor="limit" className="block mb-1">Limit Results</Label>
        <Select
          value={config.limit?.toString() || "nolimit"}
          onValueChange={(value) => handleChange("limit", value === "nolimit" ? undefined : parseInt(value))}
        >
          <SelectTrigger id="limit">
            <SelectValue placeholder="Limit number of data points" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nolimit">No limit</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced filtering would go here */}
      {/* 
      <div>
        <Label className="block mb-1">Filters</Label>
        <Button variant="outline" size="sm" className="w-full mt-1">
          <Plus className="h-4 w-4 mr-1" /> Add Filter
        </Button>
      </div>
      */}
    </div>
  );
}
