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
import { extractColumns } from '@/lib/utils';

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
  const columns = extractColumns(data);

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
            {columns.all.map((column) => (
              <TableHead className="p-2 font-semibold" key={column}>{column?.toString().replaceAll("_", " ").toUpperCase()}</TableHead>
            ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((row, idx) => (
              <TableRow key={idx} className="p-0">
                {columns.all.map((column) => (
                  <TableCell className="p-2" key={`${idx}-${column}`}>
                    {typeof row[column] === "object"
                      ? JSON.stringify(row[column])
                      : String(row[column] ?? "")}
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
