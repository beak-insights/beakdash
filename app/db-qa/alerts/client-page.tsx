"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertCircle, 
  Check, 
  ChevronDown, 
  Edit, 
  Eye, 
  Loader2, 
  MoreHorizontal, 
  Plus, 
  Trash 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { get, del } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// Alert interface
interface Alert {
  id: number;
  name: string;
  description: string | null;
  query_id: number;
  query_name: string;
  space_id: number | null;
  space_name: string | null;
  severity: string;
  condition: any;
  notification_channels: string[];
  enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FilterDropdownProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Filter dropdown component
function FilterDropdown({ options, value, onChange, placeholder }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? options.find(opt => opt.value === value)?.label || placeholder : placeholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={() => onChange("")}>
          All
        </DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Severity badge component
function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    low: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={cn(
      "px-2 py-1 text-xs font-medium rounded-full border",
      variants[severity] || "bg-gray-50 text-gray-700 border-gray-200"
    )}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

// Toggle alert status
async function toggleAlertStatus(id: number, currentEnabled: boolean) {
  try {
    const result = await fetch(`/api/db-qa/alerts/${id}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!result.ok) {
      throw new Error('Failed to toggle alert status');
    }
    
    return await result.json();
  } catch (error) {
    console.error('Error toggling alert status:', error);
    throw error;
  }
}

export function AlertsClient() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        // Build query parameters for filtering
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append('status', statusFilter);
        if (severityFilter) queryParams.append('severity', severityFilter);
        
        const queryString = queryParams.toString();
        const url = `/api/db-qa/alerts${queryString ? `?${queryString}` : ''}`;
        
        const data = await get(url);
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch alerts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [statusFilter, severityFilter]);

  // Handle toggle alert status
  const handleToggleStatus = async (alert: Alert) => {
    setToggleLoading(alert.id);
    try {
      await toggleAlertStatus(alert.id, alert.enabled);
      
      // Update local state
      setAlerts(alerts.map(a => 
        a.id === alert.id 
          ? { ...a, enabled: !a.enabled } 
          : a
      ));
      
      toast({
        title: "Success",
        description: `Alert ${alert.enabled ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling alert status:", error);
      toast({
        title: "Error",
        description: "Failed to update alert status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  // Handle delete alert
  const handleDeleteAlert = async (alert: Alert) => {
    if (!confirm(`Are you sure you want to delete the alert "${alert.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(alert.id);
    try {
      await del(`/api/db-qa/alerts/${alert.id}`);
      
      // Update local state
      setAlerts(alerts.filter(a => a.id !== alert.id));
      
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and actions bar */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
        <div className="flex flex-1 flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="w-full sm:w-60">
            <FilterDropdown
              options={[
                { label: "Enabled", value: "true" },
                { label: "Disabled", value: "false" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
            />
          </div>
          <div className="w-full sm:w-60">
            <FilterDropdown
              options={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
              ]}
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="Filter by Severity"
            />
          </div>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/db-qa/alerts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>DB Quality Alerts</CardTitle>
          <CardDescription>
            Alerts will notify you when DB quality check conditions are met
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No alerts found</h3>
              <p className="text-muted-foreground mt-1">
                {statusFilter || severityFilter
                  ? "No alerts match your current filters."
                  : "Get started by creating your first DB quality alert."}
              </p>
              {!alerts.length && !statusFilter && !severityFilter && (
                <Button asChild className="mt-4">
                  <Link href="/db-qa/alerts/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Alert
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Name</TableHead>
                    <TableHead className="w-1/4">Connected Query</TableHead>
                    <TableHead className="w-1/6">Severity</TableHead>
                    <TableHead className="w-1/6">Status</TableHead>
                    <TableHead className="w-1/6">Last Triggered</TableHead>
                    <TableHead className="w-1/12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{alert.name}</span>
                          {alert.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                              {alert.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-xs inline-block">{alert.query_name}</span>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={alert.severity} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {toggleLoading === alert.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full mr-2",
                                alert.enabled ? "bg-green-500" : "bg-gray-300"
                              )}
                            />
                          )}
                          <span>{alert.enabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.last_triggered_at ? (
                          new Date(alert.last_triggered_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              {deleteLoading === alert.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/db-qa/alerts/${alert.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/db-qa/alerts/${alert.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Alert
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(alert)}>
                              {alert.enabled ? (
                                <>
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAlert(alert)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}