"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { 
  CheckIcon, 
  Filter, 
  XIcon 
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export type QueryRunStatus = "all" | "success" | "error" | "warning" | "not_run";
export type ExecutionFrequency = "all" | "manual" | "daily" | "weekly" | "monthly" | "hourly";
export type EnabledStatus = "all" | "enabled" | "disabled";

interface QueryFiltersProps {
  status: QueryRunStatus;
  frequency: ExecutionFrequency;
  enabledStatus: EnabledStatus;
  connections: { id: number; name: string }[];
  selectedConnectionId: number | string | null;
  onStatusChange: (status: QueryRunStatus) => void;
  onFrequencyChange: (frequency: ExecutionFrequency) => void;
  onEnabledStatusChange: (status: EnabledStatus) => void;
  onConnectionChange: (connectionId: string | null) => void;
  onResetFilters: () => void;
}

export function QueryFilters({
  status,
  frequency,
  enabledStatus,
  connections,
  selectedConnectionId,
  onStatusChange,
  onFrequencyChange,
  onEnabledStatusChange,
  onConnectionChange,
  onResetFilters,
}: QueryFiltersProps) {
  // Calculate if any filters are active
  const isFiltered =
    status !== "all" ||
    frequency !== "all" ||
    enabledStatus !== "all" ||
    selectedConnectionId !== null;

  // Count active filters
  const activeFilterCount = [
    status !== "all",
    frequency !== "all",
    enabledStatus !== "all",
    selectedConnectionId !== null,
  ].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal lg:hidden"
            >
              {activeFilterCount}
            </Badge>
          )}
          {activeFilterCount > 0 && (
            <div className="hidden space-x-1 lg:flex">
              {status !== "all" && (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {getStatusLabel(status)}
                </Badge>
              )}
              {frequency !== "all" && (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {getFrequencyLabel(frequency)}
                </Badge>
              )}
              {enabledStatus !== "all" && (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {enabledStatus === "enabled" ? "Enabled" : "Disabled"}
                </Badge>
              )}
              {selectedConnectionId && (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  Connection
                </Badge>
              )}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter queries..." />
          <CommandList>
            <CommandEmpty>No filters found.</CommandEmpty>
            <CommandGroup heading="Run Status">
              <CommandItem
                onSelect={() => onStatusChange("all")}
                className="flex items-center justify-between"
              >
                <span>All Statuses</span>
                {status === "all" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onStatusChange("success")}
                className="flex items-center justify-between"
              >
                <span>Success</span>
                {status === "success" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onStatusChange("warning")}
                className="flex items-center justify-between"
              >
                <span>Warning</span>
                {status === "warning" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onStatusChange("error")}
                className="flex items-center justify-between"
              >
                <span>Error</span>
                {status === "error" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onStatusChange("not_run")}
                className="flex items-center justify-between"
              >
                <span>Not Run</span>
                {status === "not_run" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Execution Frequency">
              <CommandItem
                onSelect={() => onFrequencyChange("all")}
                className="flex items-center justify-between"
              >
                <span>All Frequencies</span>
                {frequency === "all" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onFrequencyChange("manual")}
                className="flex items-center justify-between"
              >
                <span>Manual Only</span>
                {frequency === "manual" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onFrequencyChange("hourly")}
                className="flex items-center justify-between"
              >
                <span>Hourly</span>
                {frequency === "hourly" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onFrequencyChange("daily")}
                className="flex items-center justify-between"
              >
                <span>Daily</span>
                {frequency === "daily" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onFrequencyChange("weekly")}
                className="flex items-center justify-between"
              >
                <span>Weekly</span>
                {frequency === "weekly" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onFrequencyChange("monthly")}
                className="flex items-center justify-between"
              >
                <span>Monthly</span>
                {frequency === "monthly" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Status">
              <CommandItem
                onSelect={() => onEnabledStatusChange("all")}
                className="flex items-center justify-between"
              >
                <span>All</span>
                {enabledStatus === "all" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onEnabledStatusChange("enabled")}
                className="flex items-center justify-between"
              >
                <span>Enabled</span>
                {enabledStatus === "enabled" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => onEnabledStatusChange("disabled")}
                className="flex items-center justify-between"
              >
                <span>Disabled</span>
                {enabledStatus === "disabled" && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Connection">
              <CommandItem
                onSelect={() => onConnectionChange(null)}
                className="flex items-center justify-between"
              >
                <span>All Connections</span>
                {selectedConnectionId === null && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </CommandItem>
              {connections.map((connection) => (
                <CommandItem
                  key={connection.id}
                  onSelect={() => onConnectionChange(connection.id.toString())}
                  className="flex items-center justify-between"
                >
                  <span>{connection.name}</span>
                  {selectedConnectionId === connection.id.toString() && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={onResetFilters}
                className="justify-center text-center"
              >
                <XIcon className="mr-2 h-4 w-4" />
                Reset Filters
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Helper functions to get human readable labels
function getStatusLabel(status: QueryRunStatus): string {
  switch (status) {
    case "success":
      return "Success";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    case "not_run":
      return "Not Run";
    default:
      return "All";
  }
}

function getFrequencyLabel(frequency: ExecutionFrequency): string {
  switch (frequency) {
    case "manual":
      return "Manual";
    case "hourly":
      return "Hourly";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    default:
      return "All";
  }
}