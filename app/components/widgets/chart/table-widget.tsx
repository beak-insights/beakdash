import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterConfig {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: string | number | boolean;
}

interface TableConfig {
  headers?: string[];
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "none";
  filters?: FilterConfig[];
}

interface TableWidgetProps {
  data: Record<string, any>[];
  config?: TableConfig;
  className?: string;
}

function TableWidget({ data, config = {}, className }: TableWidgetProps) {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  // Get column headers from the first row if not provided in config
  const headers = config.headers || Object.keys(data[0]);

  // Apply limit if specified
  const limitedData = config.limit ? data.slice(0, config.limit) : data;

  // Apply sorting if specified
  const sortedData = [...limitedData];
  if (config.sortBy && typeof config.sortBy === 'string' && sortedData.length > 0) {
    sortedData.sort((a, b) => {
      const sortField = config.sortBy as string;
      
      if (config.sortOrder === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else if (config.sortOrder === "desc") {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
      return 0; // No sorting
    });
  }

  // Apply filters if specified
  const filteredData = config.filters && Array.isArray(config.filters) && config.filters.length > 0 
    ? sortedData.filter(item => {
        return config.filters!.every(filter => {
          if (!filter || !filter.field) return true;
          const value = item[filter.field];
          
          switch (filter.operator) {
            case "equals":
              return value === filter.value;
            case "not_equals":
              return value !== filter.value;
            case "greater_than":
              return value > filter.value;
            case "less_than":
              return value < filter.value;
            case "contains":
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            default:
              return true;
          }
        });
      }) 
    : sortedData;

  return (
    <div className={cn("w-full h-full overflow-hidden", className)}>
      <ScrollArea className="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex} className="whitespace-nowrap">
                    {row[header] !== undefined ? String(row[header]) : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

export default TableWidget;