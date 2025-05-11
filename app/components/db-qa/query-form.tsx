"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { Icons } from "@/components/ui/icons";
import { dbQaCategoryTypes, dbQaFrequencyTypes } from "@/lib/db/schema";
import { post, put } from "@/lib/api-client";

// Define form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category" }),
  query: z.string().min(1, { message: "SQL query is required" }),
  connectionId: z.coerce.number({ required_error: "Connection is required" }),
  spaceId: z.coerce.number().optional().nullable(),
  executionFrequency: z.string().default("manual"),
  enabled: z.boolean().default(true),
  thresholds: z.record(z.any()).optional(),
  expectedResult: z.record(z.any()).optional(),
  validateQuery: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface QueryFormProps {
  initialData?: any;
  connections: { id: number; name: string; type: string }[];
  spaces: { id: number; name: string }[];
  mode: "create" | "edit";
}

export function QueryForm({ initialData, connections, spaces, mode }: QueryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validateQuery, setValidateQuery] = useState(true);

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Initialize form with default values or existing data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          connectionId: initialData.connectionId || initialData.connection_id,
          spaceId: initialData.spaceId || initialData.space_id,
          validateQuery: false, // Don't validate on edit by default
        }
      : {
          name: "",
          description: "",
          category: dbQaCategoryTypes[0],
          query: "",
          connectionId: connections.length > 0 ? connections[0].id : 0,
          spaceId: spaces.length > 0 ? spaces[0].id : null,
          executionFrequency: "manual",
          enabled: true,
          thresholds: {},
          expectedResult: {},
          validateQuery: true,
        },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Include validation flag
      const submitData = {
        ...values,
        validateQuery,
      };

      let response;
      
      if (mode === "create") {
        // Create new query
        response = await post("/api/db-qa/queries", submitData);
      } else {
        // Update existing query
        response = await put(`/api/db-qa/queries/${initialData.id}`, submitData);
      }

      if (response.success) {
        toast({
          title: mode === "create" ? "Query created" : "Query updated",
          description: response.message || "Your query has been saved successfully.",
        });
        
        // Redirect back to queries list
        router.push("/db-qa/queries");
      } else {
        // Handle validation errors or other issues
        toast({
          title: "Error",
          description: response.error || "Failed to save query.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error saving query:", error);
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Query name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your quality check query
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of what this query checks"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose of this quality check
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category and Execution Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dbQaCategoryTypes.map((category) => (
                          <SelectItem key={category} value={category}>
                            {formatCategoryName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of quality check this query performs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="executionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dbQaFrequencyTypes.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency.charAt(0).toUpperCase() +
                              frequency.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often this check should be executed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Connection and Space Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="connectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={
                        field.value ? field.value.toString() : undefined
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a connection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {connections.map((connection) => (
                          <SelectItem
                            key={connection.id}
                            value={connection.id.toString()}
                          >
                            {connection.name} ({connection.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The database connection to use for this check
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : parseInt(value))
                      }
                      defaultValue={
                        field.value ? field.value.toString() : "none"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a space" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No space</SelectItem>
                        {spaces.map((space) => (
                          <SelectItem
                            key={space.id}
                            value={space.id.toString()}
                          >
                            {space.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Associate this check with a specific space (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Validation Options */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validateQuery"
                    checked={validateQuery}
                    onCheckedChange={(checked) =>
                      setValidateQuery(checked === true)
                    }
                  />
                  <label
                    htmlFor="validateQuery"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Validate query before saving
                  </label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Test the query against the selected connection to ensure it
                  runs correctly
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* SQL Query */}
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel>SQL Query</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="SELECT * FROM table_name WHERE condition;"
                      className="min-h-[300px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a SQL query that validates your data quality. For
                    example, to check for null values in a column: 
                    <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      SELECT COUNT(*) as total_records, <br/>
                      SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) as null_emails <br/>
                      FROM users;
                    </code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Enabled switch */}
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enable Check</FormLabel>
                <FormDescription>
                  When enabled, this check will run on its scheduled frequency
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

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/db-qa/queries")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>{mode === "create" ? "Create" : "Update"} Query</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}