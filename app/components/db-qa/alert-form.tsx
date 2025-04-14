"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api-client";
import { useDbQaAlerts, CreateDbQaAlertPayload } from "@/lib/hooks/use-db-qa-alerts";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  queryId: z.string().min(1, "Query is required"),
  severity: z.string().min(1, "Severity is required"),
  condition: z.record(z.string(), z.any()).default({}),
  notificationChannels: z.array(z.string()).min(1, "At least one notification channel is required"),
  emailRecipients: z.string().optional(),
  slackWebhook: z.string().optional(),
  customWebhook: z.string().optional(),
  enabled: z.boolean().default(true),
  throttleMinutes: z.coerce.number().int().positive().default(60),
  status: z.string().default("pending"),
});

type FormValues = z.infer<typeof formSchema>;

interface AlertFormProps {
  alertId?: string;
  isEdit?: boolean;
}

export function AlertForm({ alertId, isEdit = false }: AlertFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dbQueries, setDbQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      queryId: "",
      severity: "medium",
      condition: {
        operator: "equals",
        value: "",
        field: "row_count",
      },
      notificationChannels: ["email"],
      emailRecipients: "",
      slackWebhook: "",
      customWebhook: "",
      enabled: true,
      throttleMinutes: 60,
      status: "pending",
    },
  });

  // Fetch DB QA queries for dropdown
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const result = await get("/api/db-qa/queries");
        if (Array.isArray(result)) {
          setDbQueries(result);
        }
      } catch (error) {
        console.error("Error fetching DB QA queries:", error);
        toast({
          title: "Error",
          description: "Failed to load DB QA queries. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchQueries();
  }, []);

  // If editing, fetch alert details
  useEffect(() => {
    const fetchAlertDetails = async () => {
      if (isEdit && alertId) {
        setIsLoading(true);
        try {
          const alertData = await get(`/api/db-qa/alerts/${alertId}`);
          
          // Find the related query
          if (alertData.query_id) {
            const query = dbQueries.find((q) => q.id === alertData.query_id);
            if (query) {
              setSelectedQuery(query);
            }
          }

          // Parse JSON fields
          const condition = typeof alertData.condition === 'string' 
            ? JSON.parse(alertData.condition) 
            : alertData.condition;
          
          const notificationChannels = typeof alertData.notification_channels === 'string'
            ? JSON.parse(alertData.notification_channels)
            : alertData.notification_channels;

          // Update form values
          form.reset({
            name: alertData.name || "",
            description: alertData.description || "",
            queryId: alertData.query_id?.toString() || "",
            severity: alertData.severity || "medium",
            condition: condition || {
              operator: "equals",
              value: "",
              field: "row_count",
            },
            notificationChannels: notificationChannels || ["email"],
            emailRecipients: alertData.email_recipients || "",
            slackWebhook: alertData.slack_webhook || "",
            customWebhook: alertData.custom_webhook || "",
            enabled: alertData.enabled === true || alertData.enabled === "true",
            throttleMinutes: alertData.throttle_minutes || 60,
            status: alertData.status || "pending",
          });
        } catch (error) {
          console.error("Error fetching alert details:", error);
          toast({
            title: "Error",
            description: "Failed to load alert details. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (dbQueries.length > 0) {
      fetchAlertDetails();
    }
  }, [alertId, isEdit, form, dbQueries]);

  // Handle query selection change
  const handleQueryChange = (queryId: string) => {
    const query = dbQueries.find((q) => q.id.toString() === queryId);
    setSelectedQuery(query);
  };

  // Import useDbQaAlerts hook
  const { createAlert, updateAlert, isLoading: hookLoading, error } = useDbQaAlerts();

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Create a properly structured payload
      const payload: CreateDbQaAlertPayload = {
        name: values.name,
        description: values.description,
        queryId: values.queryId,
        severity: values.severity,
        condition: {
          field: values.condition.field || '',
          operator: values.condition.operator || '',
          value: values.condition.value || '',
        },
        notificationChannels: values.notificationChannels,
        emailRecipients: values.emailRecipients,
        slackWebhook: values.slackWebhook,
        customWebhook: values.customWebhook,
        enabled: values.enabled,
        throttleMinutes: values.throttleMinutes,
        status: values.status || 'pending',
      };

      if (isEdit && alertId) {
        // Update existing alert
        const updated = await updateAlert(alertId, payload);
        if (updated) {
          // Redirect to alerts list
          router.push("/db-qa/alerts");
          router.refresh();
        }
      } else {
        // Create new alert
        const created = await createAlert(payload);
        if (created) {
          // Redirect to alerts list
          router.push("/db-qa/alerts");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      // Error is handled by the hook, we don't need to display another toast here
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading alert details...</span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Alert" : "Create New Alert"}</CardTitle>
        <CardDescription>
          Set up automatic alerts based on DB quality check results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alert name" {...field} />
                      </FormControl>
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
                          placeholder="Enter a description for this alert"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about what this alert monitors
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
                        <FormLabel className="text-base">
                          Enable Alert
                        </FormLabel>
                        <FormDescription>
                          Alert will only be triggered when enabled
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
              </div>

              {/* Query Selection */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Database Quality Query</h3>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="queryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DB Quality Query</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleQueryChange(value);
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a query" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dbQueries.map((query) => (
                            <SelectItem
                              key={query.id}
                              value={query.id.toString()}
                            >
                              {query.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Alert will be triggered based on this query's results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedQuery && (
                  <div className="rounded-md bg-secondary/50 p-3 text-sm">
                    <p className="font-medium">Query: {selectedQuery.name}</p>
                    <p className="text-muted-foreground mt-1">
                      {selectedQuery.description || "No description available"}
                    </p>
                  </div>
                )}
              </div>

              {/* Alert Conditions */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Alert Conditions</h3>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity Level</FormLabel>
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
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Severity level determines the urgency of the alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="font-medium">Alert Condition</h4>
                  
                  <FormField
                    control={form.control}
                    name="condition.field"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="row_count">Row Count</SelectItem>
                            <SelectItem value="execution_time">Execution Time (ms)</SelectItem>
                            <SelectItem value="error">Error Status</SelectItem>
                            <SelectItem value="result">Result Value</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="is_true">Is True</SelectItem>
                            <SelectItem value="is_false">Is False</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input placeholder="Comparison value" {...field} />
                        </FormControl>
                        <FormDescription>
                          The value to compare the field against
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="throttleMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Throttle Period (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum time between repeated alert notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notification Channels */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="notificationChannels"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Notification Methods
                        </FormLabel>
                        <FormDescription>
                          Select one or more ways to receive alerts
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
                                      const currentValues = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValues, "email"])
                                        : field.onChange(
                                            currentValues.filter(
                                              (value) => value !== "email"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Email Notification
                                </FormLabel>
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
                                      const currentValues = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValues, "slack"])
                                        : field.onChange(
                                            currentValues.filter(
                                              (value) => value !== "slack"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Slack Integration
                                </FormLabel>
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
                                      const currentValues = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValues, "webhook"])
                                        : field.onChange(
                                            currentValues.filter(
                                              (value) => value !== "webhook"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Custom Webhook
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="email-settings">
                    <AccordionTrigger>Email Settings</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="emailRecipients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Recipients</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="user@example.com, another@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of email addresses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="slack-settings">
                    <AccordionTrigger>Slack Settings</AccordionTrigger>
                    <AccordionContent>
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
                              />
                            </FormControl>
                            <FormDescription>
                              Webhook URL from Slack Incoming Webhooks app
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="webhook-settings">
                    <AccordionTrigger>Custom Webhook Settings</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="customWebhook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Webhook URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://your-webhook-endpoint.com/alerts"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              URL for your custom webhook endpoint
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/db-qa/alerts")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Update Alert" : "Create Alert"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}