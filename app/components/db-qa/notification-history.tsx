"use client";

import { useState } from "react";
import { useDbQaNotificationsQuery } from "@/lib/hooks/use-db-qa-notifications-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle, CheckCircle, Clock, Send, XCircle, RotateCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { NotificationFilters } from "@/lib/hooks/use-db-qa-notifications";

interface NotificationHistoryProps {
  alertId: string | number;
}

export function NotificationHistory({ alertId }: NotificationHistoryProps) {
  const [filters, setFilters] = useState<NotificationFilters>({
    limit: 50,
  });

  // Fetch notification history data
  const { data: notifications, isLoading, error, refetch } = useDbQaNotificationsQuery(alertId, filters);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
      case "delivered":
      case "success":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
      case "pending":
      case "processing":
      case "queued":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
      case "retry":
      case "retrying":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><RotateCw className="mr-1 h-3 w-3" /> {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "email":
        return <Send className="h-4 w-4" />;
      case "slack":
        return <span className="flex items-center justify-center w-4 h-4">#</span>;
      case "webhook":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{format(date, "MMM d, yyyy")}</span>
          <span>{format(date, "h:mm a")}</span>
          <span className="text-xs text-muted-foreground">({formatDistanceToNow(date, { addSuffix: true })})</span>
        </div>
      );
    } catch (e) {
      return "Invalid date";
    }
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value === "all" ? null : value }));
  };

  const handleChannelFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, channel: value === "all" ? null : value }));
  };

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>
            History of alert notifications sent through various channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/15 p-4 text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <h3 className="text-sm font-medium">Error loading notification history</h3>
            <p className="text-sm mt-1 text-muted-foreground">{String(error)}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>
            History of alert notifications sent through various channels
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Select 
              onValueChange={handleStatusFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              onValueChange={handleChannelFilterChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Next Retry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      {notification.sent_at ? formatDate(notification.sent_at) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(notification.channel)}
                        <span className="capitalize">{notification.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.recipient || "N/A"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(notification.status)}
                      {notification.error_message && (
                        <div className="mt-1 text-xs text-red-500 max-w-[200px] truncate" title={notification.error_message}>
                          {notification.error_message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {notification.attempts || 1}
                    </TableCell>
                    <TableCell>
                      {notification.retry_scheduled_for ? (
                        formatDate(notification.retry_scheduled_for)
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center">
            <h3 className="text-sm font-medium mb-2">No notification history found</h3>
            <p className="text-sm text-muted-foreground">
              This alert hasn't sent any notifications yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}