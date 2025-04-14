"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "@/lib/api-client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Define the alert form schema
const alertFormSchema = z.object({
  name: z.string().min(1, "Alert name is required"),
  description: z.string().optional(),
  queryId: z.string().min(1, "Related query is required"),
  severity: z.enum(["high", "medium", "low"]),
  condition: z.object({
    type: z.enum(["row_count", "specific_value", "error_presence"]),
    operator: z.enum(["greater_than", "less_than", "equals", "not_equals", "contains", "not_contains"]).optional(),
    value: z.string().optional(),
    column: z.string().optional(),
  }),
  notificationChannels: z.array(z.enum(["email", "slack", "webhook"])).min(1, "At least one notification channel is required"),
  emailRecipients: z.string().optional(),
  slackWebhook: z.string().optional(),
  customWebhook: z.string().optional(),
  enabled: z.boolean().default(true),
  throttleMinutes: z.number().int().min(0).default(60),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

interface AlertFormProps {
  alertId?: string | number;
  isEdit?: boolean;
}

export function AlertForm({ alertId, isEdit = false }: AlertFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch queries for the dropdown
  const { 
    data: queries = [],
    isLoading: isLoadingQueries,
  } = useQuery({
    queryKey: ['/api/db-qa/queries'],
    queryFn: () => get('/api/db-qa/queries'),
  });

  // If in edit mode, fetch the alert details
  const {
    data: alertData,
    isLoading: isLoadingAlert,
  } = useQuery({
    queryKey: ['/api/db-qa/alerts', alertId],
    queryFn: () => get(`/api/db-qa/alerts/${alertId}`),
    enabled: isEdit && !!alertId,
  });

  // Create form with default values
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: "",
      description: "",
      queryId: "",
      severity: "medium",
      condition: {
        type: "row_count",
        operator: "greater_than",
        value: "0",
      },
      notificationChannels: ["email"],
      emailRecipients: "",
      slackWebhook: "",
      customWebhook: "",
      enabled: true,
      throttleMinutes: 60,
    },
  });

  // Update form with alert data when editing
  useEffect(() => {
    if (isEdit && alertData) {
      // Transform alertData to match form format
      form.reset({
        name: alertData.name || "",
        description: alertData.description || "",
        queryId: alertData.query_id?.toString() || "",
        severity: alertData.severity || "medium",
        condition: alertData.condition || {
          type: "row_count",
          operator: "greater_than",
          value: "0",
        },
        notificationChannels: alertData.notification_channels || ["email"],
        emailRecipients: alertData.email_recipients || "",
        slackWebhook: alertData.slack_webhook || "",
        customWebhook: alertData.custom_webhook || "",
        enabled: alertData.enabled !== undefined ? alertData.enabled : true,
        throttleMinutes: alertData.throttle_minutes || 60,
      });
    }
  }, [isEdit, alertData, form]);

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (data: AlertFormValues) => {
      return post("/api/db-qa/alerts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert created successfully",
      });
      
      // Invalidate and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts'] });
      router.push("/db-qa/alerts");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: (data: AlertFormValues) => {
      return put(`/api/db-qa/alerts/${alertId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert updated successfully",
      });
      
      // Invalidate and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/db-qa/alerts', alertId] });
      router.push("/db-qa/alerts");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AlertFormValues) => {
    if (isEdit) {
      updateAlertMutation.mutate(values);
    } else {
      createAlertMutation.mutate(values);
    }
  };

  const isPending = createAlertMutation.isPending || updateAlertMutation.isPending;
  const isLoading = isLoadingQueries || (isEdit && isLoadingAlert);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Details</CardTitle>
                <CardDescription>
                  Basic information about this alert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alert name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive name for the alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a detailed description" 
                          className="min-h-[100px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional context or notes about this alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="queryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Query</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a query" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {queries.map((query: any) => (
                            <SelectItem key={query.id} value={query.id.toString()}>
                              {query.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The query this alert will monitor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The priority level of this alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enabled</FormLabel>
                        <FormDescription>
                          Turn this alert on or off
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/db-qa/alerts")}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("conditions")}
                >
                  Next: Conditions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Conditions Tab */}
          <TabsContent value="conditions" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Conditions</CardTitle>
                <CardDescription>
                  Define when this alert should be triggered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition.type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Condition Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="row_count" id="row_count" />
                            <Label htmlFor="row_count">Row Count</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific_value" id="specific_value" />
                            <Label htmlFor="specific_value">Specific Value</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="error_presence" id="error_presence" />
                            <Label htmlFor="error_presence">Error Presence</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        What type of condition should trigger this alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("condition.type") !== "error_presence" && (
                  <FormField
                    control={form.control}
                    name="condition.operator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch("condition.type") === "row_count" ? (
                              <>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="not_contains">Does Not Contain</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How the value should be compared
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("condition.type") === "specific_value" && (
                  <FormField
                    control={form.control}
                    name="condition.column"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter column name" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          The column to check in the query results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("condition.type") !== "error_presence" && (
                  <FormField
                    control={form.control}
                    name="condition.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={form.watch("condition.type") === "row_count" ? "Enter number" : "Enter value"} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("condition.type") === "row_count" 
                            ? "The number of rows to compare against" 
                            : "The value to check for in the column"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="throttleMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Throttling (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter minutes" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum time between repeated alerts (0 for no throttling)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("notifications")}
                >
                  Next: Notifications
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="notificationChannels"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Notification Channels</FormLabel>
                        <FormDescription>
                          Select at least one notification method
                        </FormDescription>
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="notificationChannels"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="email"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("email")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "email"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "email"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    Email
                                  </FormLabel>
                                  <FormDescription>
                                    Send notifications via email
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="notificationChannels"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="slack"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("slack")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "slack"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "slack"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    Slack
                                  </FormLabel>
                                  <FormDescription>
                                    Send notifications to a Slack channel
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="notificationChannels"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="webhook"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("webhook")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "webhook"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "webhook"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    Webhook
                                  </FormLabel>
                                  <FormDescription>
                                    Send notifications to a custom webhook endpoint
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                {form.watch("notificationChannels").includes("email") && (
                  <FormField
                    control={form.control}
                    name="emailRecipients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Recipients</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter email addresses (one per line)" 
                            className="min-h-[100px]" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          List the email addresses that should receive alerts (one per line)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("notificationChannels").includes("slack") && (
                  <FormField
                    control={form.control}
                    name="slackWebhook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slack Webhook URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://hooks.slack.com/services/..." 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          The incoming webhook URL for your Slack channel
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("notificationChannels").includes("webhook") && (
                  <FormField
                    control={form.control}
                    name="customWebhook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Webhook URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://api.example.com/webhooks/..." 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          The URL that will receive webhook notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab("conditions")}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Update Alert" : "Create Alert"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}