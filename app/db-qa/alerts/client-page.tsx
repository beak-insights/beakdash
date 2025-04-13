'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Bell, 
  AlertOctagon, 
  Search, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BellRing,
  MoreVertical,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Placeholder for actual data fetching
const mockAlerts = [
  {
    id: 1,
    name: 'Critical Null Values',
    status: 'active',
    severity: 'high',
    queryName: 'Check for null values in important columns',
    latestTrigger: '2025-04-13T08:30:00Z',
    notificationChannels: ['email', 'slack'],
  },
  {
    id: 2,
    name: 'Duplicate Customer Records',
    status: 'active',
    severity: 'medium',
    queryName: 'Detect duplicate customer records',
    latestTrigger: '2025-04-13T07:15:00Z',
    notificationChannels: ['email'],
  },
  {
    id: 3,
    name: 'Foreign Key Violations',
    status: 'resolved',
    severity: 'high',
    queryName: 'Verify foreign key integrity',
    latestTrigger: '2025-04-12T14:45:00Z',
    resolvedAt: '2025-04-12T16:30:00Z',
    notificationChannels: ['email', 'webhook'],
  },
  {
    id: 4,
    name: 'Data Inconsistency Warning',
    status: 'snoozed',
    severity: 'low',
    queryName: 'Check data consistency across tables',
    latestTrigger: '2025-04-11T23:10:00Z',
    snoozeUntil: '2025-04-15T09:00:00Z',
    notificationChannels: ['slack'],
  },
];

// Placeholder for actual notification history data
const mockNotifications = [
  {
    id: 1,
    alertId: 1,
    alertName: 'Critical Null Values',
    channel: 'email',
    sentAt: '2025-04-13T08:31:00Z',
    status: 'sent',
    recipient: 'admin@example.com',
  },
  {
    id: 2,
    alertId: 1,
    alertName: 'Critical Null Values',
    channel: 'slack',
    sentAt: '2025-04-13T08:31:00Z',
    status: 'sent',
    recipient: '#monitoring-channel',
  },
  {
    id: 3,
    alertId: 2,
    alertName: 'Duplicate Customer Records',
    channel: 'email',
    sentAt: '2025-04-13T07:16:00Z',
    status: 'sent',
    recipient: 'admin@example.com',
  },
  {
    id: 4,
    alertId: 3,
    alertName: 'Foreign Key Violations',
    channel: 'email',
    sentAt: '2025-04-12T14:46:00Z',
    status: 'sent',
    recipient: 'admin@example.com',
  },
  {
    id: 5,
    alertId: 3,
    alertName: 'Foreign Key Violations',
    channel: 'webhook',
    sentAt: '2025-04-12T14:46:00Z',
    status: 'failed',
    recipient: 'https://api.example.com/hooks/db-alerts',
    errorMessage: 'Webhook endpoint returned 404 Not Found',
  },
];

export function DbQaAlertsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('alerts');

  // These would be fetched from an API in a production app
  const alerts = mockAlerts;
  const notifications = mockNotifications;

  // Placeholder for actual filtering logic
  const filteredAlerts = alerts.filter(alert => {
    // Filter by search term
    if (searchTerm && !alert.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !alert.queryName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== 'all' && alert.status !== statusFilter) {
      return false;
    }
    
    // Filter by severity
    if (severityFilter && severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }
    
    return true;
  });

  // Function to get severity badge color
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

  // Function to get status badge styles
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
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="alerts" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search alerts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="snoozed">Snoozed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Severity</SelectLabel>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Check: {alert.queryName}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {alert.status === 'active' && (
                            <>
                              <DropdownMenuItem>Snooze Alert</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                            </>
                          )}
                          {alert.status === 'snoozed' && (
                            <DropdownMenuItem>End Snooze</DropdownMenuItem>
                          )}
                          {alert.status === 'resolved' && (
                            <DropdownMenuItem>Reactivate</DropdownMenuItem>
                          )}
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Alert</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Alert</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getStatusBadge(alert.status)}
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mb-2">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Latest trigger: {new Date(alert.latestTrigger).toLocaleString()}
                    </div>
                    {alert.status === 'resolved' && alert.resolvedAt && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                        Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                      </div>
                    )}
                    {alert.status === 'snoozed' && alert.snoozeUntil && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        Snoozed until: {new Date(alert.snoozeUntil).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-start pt-2 border-t">
                    <span className="text-xs text-muted-foreground mb-2">Notification Channels:</span>
                    <div className="flex flex-wrap gap-2">
                      {alert.notificationChannels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel === 'email' && <span>✉️ Email</span>}
                          {channel === 'slack' && <span>💬 Slack</span>}
                          {channel === 'webhook' && <span>🔗 Webhook</span>}
                        </Badge>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BellRing className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No alerts found</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter || severityFilter
                    ? "Try changing or clearing your filters"
                    : "Get started by setting up your first alert for database quality issues"}
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Alert
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.alertName}</TableCell>
                      <TableCell>
                        {notification.channel === 'email' && <span>✉️ Email</span>}
                        {notification.channel === 'slack' && <span>💬 Slack</span>}
                        {notification.channel === 'webhook' && <span>🔗 Webhook</span>}
                      </TableCell>
                      <TableCell>{notification.recipient}</TableCell>
                      <TableCell>{new Date(notification.sentAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {notification.status === 'sent' 
                          ? <Badge className="bg-green-500">Sent</Badge>
                          : <Badge className="bg-red-500">Failed</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <BellRing className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No notification history</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Notifications will appear here when alerts are triggered
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}