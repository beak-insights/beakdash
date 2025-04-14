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
import { NotificationHistory } from "@/components/db-qa/notification-history";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  ArrowLeft, 
  BellRing, 
  Calendar, 
  Check, 
  Clock, 
  Edit, 
  ExternalLink, 
  Loader2, 
  MailIcon, 
  MessageSquareText, 
  Settings, 
  Slash 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { get, del } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface AlertDetailClientProps {
  id: string;
}

// Function to toggle alert status
async function toggleAlertStatus(id: number) {
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

export function AlertDetailClient({ id }: AlertDetailClientProps) {
  const router = useRouter();
  const [alert, setAlert] = useState<any>(null);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch alert data
  useEffect(() => {
    const fetchAlertDetails = async () => {
      setIsLoading(true);
      try {
        const data = await get(`/api/db-qa/alerts/${id}`);
        setAlert(data);
        
        // Parse JSON fields if they're strings
        if (data.condition && typeof data.condition === 'string') {
          data.condition = JSON.parse(data.condition);
        }
        
        if (data.notification_channels && typeof data.notification_channels === 'string') {
          data.notification_channels = JSON.parse(data.notification_channels);
        }
      } catch (error) {
        console.error("Error fetching alert details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch alert details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertDetails();
  }, [id]);

  // Fetch alert history
  useEffect(() => {
    const fetchAlertHistory = async () => {
      if (activeTab === "history") {
        setHistoryLoading(true);
        try {
          const data = await get(`/api/db-qa/alerts/${id}/history`);
          if (Array.isArray(data)) {
            setAlertHistory(data);
          }
        } catch (error) {
          console.error("Error fetching alert history:", error);
          toast({
            title: "Error",
            description: "Failed to fetch alert history. Please try again.",
            variant: "destructive",
          });
        } finally {
          setHistoryLoading(false);
        }
      }
    };

    fetchAlertHistory();
  }, [id, activeTab]);

  // Handle toggle alert status
  const handleToggleStatus = async () => {
    if (!alert) return;
    
    setToggleLoading(true);
    try {
      await toggleAlertStatus(alert.id);
      
      // Update local state
      setAlert({ ...alert, enabled: !alert.enabled });
      
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
      setToggleLoading(false);
    }
  };

  // Handle delete alert
  const handleDeleteAlert = async () => {
    if (!alert) return;
    
    if (!confirm(`Are you sure you want to delete the alert "${alert.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await del(`/api/db-qa/alerts/${alert.id}`);
      
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
      
      // Redirect to alerts list
      router.push("/db-qa/alerts");
      router.refresh();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
      setDeleteLoading(false);
    }
  };

  // Handle severity badge styles
  const getSeverityBadgeClass = (severity: string) => {
    const variants: Record<string, string> = {
      low: "bg-blue-50 text-blue-700 border-blue-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      critical: "bg-red-50 text-red-700 border-red-200",
    };

    return cn(
      "px-2 py-1 text-xs font-medium rounded-full border inline-flex items-center",
      variants[severity] || "bg-gray-50 text-gray-700 border-gray-200"
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Operator text
  const getOperatorText = (operator: string) => {
    const operatorMap: Record<string, string> = {
      equals: "equals",
      not_equals: "does not equal",
      greater_than: "is greater than",
      less_than: "is less than",
      contains: "contains",
      is_true: "is true",
      is_false: "is false",
    };
    return operatorMap[operator] || operator;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading alert details...</span>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Alert not found</h3>
        <p className="text-muted-foreground mt-1">
          The requested alert could not be found or you don't have access.
        </p>
        <Button asChild className="mt-4">
          <Link href="/db-qa/alerts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Alerts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header area */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/db-qa/alerts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              {alert.name}
              <span className={cn(
                "ml-3",
                getSeverityBadgeClass(alert.severity)
              )}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {alert.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            className={cn(
              "flex items-center",
              alert.enabled ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
            )}
            disabled={toggleLoading}
            onClick={handleToggleStatus}
          >
            {toggleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : alert.enabled ? (
              <Slash className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {alert.enabled ? "Disable Alert" : "Enable Alert"}
          </Button>
          
          <Button asChild variant="outline">
            <Link href={`/db-qa/alerts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleDeleteAlert}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Alert Details
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Alert History
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <BellRing className="mr-2 h-4 w-4" />
            Notification History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>
                Details of how this alert is configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      alert.enabled ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  <span className="font-medium">
                    {alert.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <Separator />

              {/* Connected Query */}
              <div>
                <h3 className="text-lg font-medium mb-2">Connected Query</h3>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.query_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This alert monitors the results of this query
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/db-qa/queries/${alert.query_id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Query
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Alert Condition */}
              <div>
                <h3 className="text-lg font-medium mb-2">Alert Condition</h3>
                <div className="rounded-md border p-4">
                  <p className="text-md">
                    Alert when{" "}
                    <span className="font-medium">
                      {(alert.condition?.field || "").replace(/_/g, " ")}
                    </span>{" "}
                    <span>{getOperatorText(alert.condition?.operator || "")}</span>{" "}
                    <span className="font-medium">
                      {alert.condition?.value || ""}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Throttle period: {alert.throttle_minutes || 60} minutes between alerts
                  </p>
                </div>
              </div>

              {/* Notification Channels */}
              <div>
                <h3 className="text-lg font-medium mb-2">Notification Channels</h3>
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(alert.notification_channels) && alert.notification_channels.map((channel: string) => (
                      <span
                        key={channel}
                        className="flex items-center px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                      >
                        {channel === "email" && <MailIcon className="h-3 w-3 mr-1" />}
                        {channel === "slack" && <MessageSquareText className="h-3 w-3 mr-1" />}
                        {channel === "webhook" && <ExternalLink className="h-3 w-3 mr-1" />}
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </span>
                    ))}
                  </div>
                  
                  {alert.email_recipients && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-1">Email Recipients:</p>
                      <p className="text-sm">{alert.email_recipients}</p>
                    </div>
                  )}
                  
                  {alert.slack_webhook && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-1">Slack Integration:</p>
                      <p className="text-sm text-muted-foreground">Configured with webhook</p>
                    </div>
                  )}
                  
                  {alert.custom_webhook && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-1">Custom Webhook:</p>
                      <p className="text-sm truncate">{alert.custom_webhook}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-medium mb-2">Metadata</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="sm:col-span-1">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(alert.created_at)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">{formatDate(alert.updated_at)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-muted-foreground">Last Triggered</dt>
                    <dd className="font-medium">
                      {alert.last_triggered_at 
                        ? formatDate(alert.last_triggered_at) 
                        : "Never triggered"}
                    </dd>
                  </div>
                  {alert.space_name && (
                    <div className="sm:col-span-1">
                      <dt className="text-muted-foreground">Space</dt>
                      <dd className="font-medium">{alert.space_name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Record of when this alert has been triggered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading alert history...</span>
                </div>
              ) : alertHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <BellRing className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="text-md font-medium">No alert history found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This alert hasn't been triggered yet
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Triggered At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Notifications Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertHistory.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDate(entry.triggered_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={cn(
                                "h-2 w-2 rounded-full mr-2",
                                entry.status === "success" ? "bg-green-500" : "bg-red-500"
                              )} />
                              {entry.status === "success" ? "Succeeded" : "Failed"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {entry.details || "No details available"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {entry.notifications_sent && Array.isArray(
                                typeof entry.notifications_sent === 'string' 
                                  ? JSON.parse(entry.notifications_sent) 
                                  : entry.notifications_sent
                              ) ? (
                                (typeof entry.notifications_sent === 'string' 
                                  ? JSON.parse(entry.notifications_sent) 
                                  : entry.notifications_sent
                                ).map((channel: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
                                  >
                                    {channel}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">None</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {/* Use the NotificationHistory component here */}
          <NotificationHistory alertId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}