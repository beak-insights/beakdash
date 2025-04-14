"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export type QueryRunStatus = "all" | "success" | "error" | "warning" | "not_run";
export type ExecutionFrequency = "all" | "manual" | "daily" | "weekly" | "monthly" | "hourly";
export type EnabledStatus = "all" | "enabled" | "disabled";

interface StatusFilterProps {
  currentStatus: QueryRunStatus;
  onStatusChange: (status: QueryRunStatus) => void;
}

export function StatusFilter({ currentStatus, onStatusChange }: StatusFilterProps) {
  return (
    <Select value={currentStatus} onValueChange={(value) => onStatusChange(value as QueryRunStatus)}>
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="success">Success</SelectItem>
        <SelectItem value="warning">Warning</SelectItem>
        <SelectItem value="error">Error</SelectItem>
        <SelectItem value="not_run">Not Run</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface FrequencyFilterProps {
  currentFrequency: ExecutionFrequency;
  onFrequencyChange: (frequency: ExecutionFrequency) => void;
}

export function FrequencyFilter({ currentFrequency, onFrequencyChange }: FrequencyFilterProps) {
  return (
    <Select value={currentFrequency} onValueChange={(value) => onFrequencyChange(value as ExecutionFrequency)}>
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Filter by frequency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Frequencies</SelectItem>
        <SelectItem value="manual">Manual</SelectItem>
        <SelectItem value="hourly">Hourly</SelectItem>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface EnabledFilterProps {
  currentStatus: EnabledStatus;
  onStatusChange: (status: EnabledStatus) => void;
}

export function EnabledFilter({ currentStatus, onStatusChange }: EnabledFilterProps) {
  return (
    <Select value={currentStatus} onValueChange={(value) => onStatusChange(value as EnabledStatus)}>
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Queries</SelectItem>
        <SelectItem value="enabled">Enabled Only</SelectItem>
        <SelectItem value="disabled">Disabled Only</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface ConnectionFilterProps {
  connections: { id: number; name: string }[];
  selectedConnectionId: number | string | null;
  onConnectionChange: (connectionId: string | null) => void;
}

export function ConnectionFilter({ 
  connections, 
  selectedConnectionId, 
  onConnectionChange 
}: ConnectionFilterProps) {
  return (
    <Select 
      value={selectedConnectionId ? selectedConnectionId.toString() : "all"} 
      onValueChange={(value) => onConnectionChange(value === "all" ? null : value)}
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Filter by connection" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Connections</SelectItem>
        {connections.map((connection) => (
          <SelectItem key={connection.id} value={connection.id.toString()}>
            {connection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ResetFilterButtonProps {
  onReset: () => void;
  show: boolean;
}

export function ResetFilterButton({ onReset, show }: ResetFilterButtonProps) {
  if (!show) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={onReset}
    >
      <XIcon className="h-4 w-4 mr-1" />
      Reset Filters
    </Button>
  );
}