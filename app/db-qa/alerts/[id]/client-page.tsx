"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api-client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, PenLine, Trash, Bell, BellOff, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface ViewAlertClientProps {
  id: string;
}

export function ViewAlertClient({ id }: ViewAlertClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch alert details
  const {
    data: alert,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/db-qa/alerts', id],
    queryFn: () => get(`/api/db-qa/alerts/${id}`),
  });

  // Fetch alert history
  const {
    data: alertHistory = [],
    isLoading: isLoadingHistory,
  } = useQuery({
    queryKey: ['/api/db-qa/alerts', id, 'history'],
    queryFn: () => get(`/api/db-qa/alerts/${id}/history`),
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: () => post(`/api/db-qa/alerts/${id}/delete`, {}),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
      
      // Redirect back to alerts list
      router.push("/db-qa/alerts");
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle alert status mutation
  const toggleAlertMutation = useMutation({
    mutationFn: () => post(`/api/db-qa/alerts/${id}/toggle`, {}),
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Alert ${alert?.enabled ? "disabled" : "enabled"} successfully`,
      });
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update alert status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading alert details...</span>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="w-full p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800 mb-2">Alert not found</h3>
        <p className="text-red-700 mb-4">The requested alert could not be found or you may not have permission to access it.</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/db-qa/alerts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Alerts
        </Button>
      </div>
    );
  }

  // Function to get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Active
        </Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Resolved
        </Badge>;
      case 'snoozed':
        return <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Snoozed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/db-qa/alerts')} 
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{alert.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2 ml-10">
            {getSeverityBadge(alert.severity)}
            {getStatusBadge(alert.status || (alert.enabled ? 'active' : 'disabled'))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={alert.enabled ? "outline" : "default"}
            onClick={() => toggleAlertMutation.mutate()}
            disabled={toggleAlertMutation.isPending}
          >
            {toggleAlertMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : alert.enabled ? (
              <BellOff className="h-4 w-4 mr-2" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            {alert.enabled ? "Disable Alert" : "Enable Alert"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/db-qa/alerts/${id}/edit`)}
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  alert &quot;{alert.name}&quot; and all associated history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAlertMutation.mutate()}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteAlertMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs for details and history */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Information</CardTitle>
              <CardDescription>
                Detailed information about this alert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alert.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Related Query</h3>
                  <p className="text-sm">
                    {alert.query?.name || `Query #${alert.query_id}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Severity</h3>
                  <div>{getSeverityBadge(alert.severity)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Status</h3>
                  <div>{alert.enabled ? <Badge variant="success">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Throttling</h3>
                  <p className="text-sm">
                    {alert.throttle_minutes ? `${alert.throttle_minutes} minutes` : "No throttling"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Created</h3>
                  <p className="text-sm">{formatDate(alert.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Last Updated</h3>
                  <p className="text-sm">{formatDate(alert.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Conditions</CardTitle>
              <CardDescription>
                When this alert will be triggered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Condition Type</h3>
                  <p className="text-sm">
                    {alert.condition?.type === 'row_count' && 'Row Count'}
                    {alert.condition?.type === 'specific_value' && 'Specific Value'}
                    {alert.condition?.type === 'error_presence' && 'Error Presence'}
                  </p>
                </div>

                {alert.condition?.type !== 'error_presence' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Operator</h3>
                      <p className="text-sm">
                        {alert.condition?.operator === 'greater_than' && 'Greater Than'}
                        {alert.condition?.operator === 'less_than' && 'Less Than'}
                        {alert.condition?.operator === 'equals' && 'Equals'}
                        {alert.condition?.operator === 'not_equals' && 'Not Equals'}
                        {alert.condition?.operator === 'contains' && 'Contains'}
                        {alert.condition?.operator === 'not_contains' && 'Does Not Contain'}
                      </p>
                    </div>

                    {alert.condition?.type === 'specific_value' && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Column</h3>
                        <p className="text-sm">{alert.condition?.column || 'Not specified'}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold mb-1">Value</h3>
                      <p className="text-sm">{alert.condition?.value || 'Not specified'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                How alerts are delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Notification Channels</h3>
                  <div className="flex flex-wrap gap-2">
                    {(alert.notification_channels || []).map((channel: string) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel === 'email' && <span>✉️ Email</span>}
                        {channel === 'slack' && <span>💬 Slack</span>}
                        {channel === 'webhook' && <span>🔗 Webhook</span>}
                      </Badge>
                    ))}
                    {(!alert.notification_channels || alert.notification_channels.length === 0) && (
                      <span className="text-sm text-muted-foreground">No notification channels configured</span>
                    )}
                  </div>
                </div>

                {alert.notification_channels?.includes('email') && alert.email_recipients && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Email Recipients</h3>
                    <p className="text-sm whitespace-pre-line">{alert.email_recipients}</p>
                  </div>
                )}

                {alert.notification_channels?.includes('slack') && alert.slack_webhook && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Slack Webhook</h3>
                    <p className="text-sm text-muted-foreground">Webhook configured</p>
                  </div>
                )}

                {alert.notification_channels?.includes('webhook') && alert.custom_webhook && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Custom Webhook</h3>
                    <p className="text-sm break-all">{alert.custom_webhook}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.push(`/db-qa/alerts/${id}/edit`)}
              >
                <PenLine className="h-4 w-4 mr-2" />
                Edit Alert
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Recent alert trigger events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading history...</span>
                </div>
              ) : alertHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alert history found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This alert hasn't been triggered yet. History will appear here when the alert conditions are met.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Notifications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertHistory.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {formatDate(event.triggered_at)}
                          </TableCell>
                          <TableCell>
                            {event.status === 'triggered' && (
                              <Badge className="bg-red-500">Triggered</Badge>
                            )}
                            {event.status === 'resolved' && (
                              <Badge className="bg-green-500">Resolved</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {event.details || "No additional details"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {event.notifications_sent ? 
                                event.notifications_sent.map((channel: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {channel}
                                  </Badge>
                                )) : 
                                <span className="text-xs text-muted-foreground">None</span>
                              }
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
      </Tabs>
    </div>
  );
}