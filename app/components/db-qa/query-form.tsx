'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Connection, DbQaCategory, dbQaCategoryTypes, dbQaFrequencyTypes } from "@/lib/db/schema";
import { useSpaces } from "@/lib/hooks/use-spaces";
import { useDbQaQueries } from "@/lib/hooks/use-db-qa-queries";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Info, HelpCircle } from "lucide-react";

// Define the form schema
const queryFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(dbQaCategoryTypes),
  query: z.string().min(1, { message: "Query is required" }),
  connectionId: z.number({ required_error: "Connection is required" }),
  spaceId: z.number().nullable().optional(),
  executionFrequency: z.enum(dbQaFrequencyTypes),
  expectedResult: z.any().optional(),
  thresholds: z.any().optional(),
  enabled: z.boolean().default(true),
});

type QueryFormValues = z.infer<typeof queryFormSchema>;

interface QueryFormProps {
  initialData?: any;
  connections?: Connection[];
  onSuccess?: (data: any) => void;
}

export function DbQaQueryForm({
  initialData,
  connections = [],
  onSuccess,
}: QueryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSpaceId } = useSpaces();
  const { createDbQaQueryMutation, updateDbQaQueryMutation } = useDbQaQueries();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Initialize the form with defaultValues
  const form = useForm<QueryFormValues>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      connectionId: initialData.connectionId,
      spaceId: initialData.spaceId || null,
    } : {
      name: "",
      description: "",
      category: "data_completeness" as DbQaCategory,
      query: "",
      connectionId: connections[0]?.id || 0,
      spaceId: currentSpaceId || null,
      executionFrequency: "manual",
      expectedResult: {},
      thresholds: {},
      enabled: true,
    },
  });
  
  // Update the form's space ID when the currentSpaceId changes (if creating a new query)
  useEffect(() => {
    if (!initialData && currentSpaceId !== undefined) {
      form.setValue("spaceId", currentSpaceId);
    }
  }, [currentSpaceId, form, initialData]);
  
  async function onSubmit(values: QueryFormValues) {
    try {
      if (initialData) {
        // Update existing query
        const result = await updateDbQaQueryMutation.mutateAsync({
          id: initialData.id,
          ...values,
        });
        
        toast({
          title: "Success",
          description: "Quality check updated successfully",
        });
        
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push("/db-qa/queries");
        }
      } else {
        // Create new query
        const result = await createDbQaQueryMutation.mutateAsync(values);
        
        toast({
          title: "Success",
          description: "Quality check created successfully",
        });
        
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push("/db-qa/queries");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }
  
  // Helper function to get tooltip content for categories
  const getCategoryHelp = (category: DbQaCategory) => {
    const helpText: Record<DbQaCategory, string> = {
      data_completeness: "Checks for missing data, null values, or empty fields",
      data_consistency: "Verifies that data is consistent across different tables or systems",
      data_accuracy: "Confirms data values are accurate and within expected ranges",
      data_integrity: "Checks for referential integrity and data corruption",
      data_timeliness: "Ensures data is up-to-date and processed within acceptable timeframes",
      data_uniqueness: "Checks for duplicate records or values where uniqueness is required",
      data_relationship: "Validates relationships between related data entities",
      sensitive_data_exposure: "Identifies potential exposure of sensitive or personal information",
    };
    
    return helpText[category] || "No description available";
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="query">Query Details</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Define your database quality check details
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Check for duplicate customer records" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your quality check
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
                          placeholder="This check identifies customers with the same email but different accounts..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional context or details about this quality check
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Category</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                                <HelpCircle className="h-3 w-3" />
                                <span className="sr-only">Category information</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-md">
                              <p>Select a category that best describes what this quality check verifies</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as DbQaCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {dbQaCategoryTypes.map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{category.replace(/_/g, " ")}</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="max-w-xs">
                                        <p>{getCategoryHelp(category as DbQaCategory)}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Categorize your quality check for better organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="connectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Connection</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a connection" />
                          </SelectTrigger>
                          <SelectContent>
                            {connections.length > 0 ? (
                              connections.map((connection) => (
                                <SelectItem key={connection.id} value={connection.id.toString()}>
                                  {connection.name} ({connection.type})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                No connections available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        The database connection to use for this quality check
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab("query")}>
                  Next Step
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="query" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Details</CardTitle>
                <CardDescription>
                  Define the SQL query to execute for your quality check
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Query</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SELECT COUNT(*) FROM users WHERE email IS NULL"
                          className="font-mono min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The SQL query to execute for this quality check. Use queries that return quality metrics,
                        such as counts of invalid data, duplicate records, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  Previous Step
                </Button>
                <Button type="button" onClick={() => setActiveTab("settings")}>
                  Next Step
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure execution schedule and alerting thresholds
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="executionFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Frequency</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {dbQaFrequencyTypes.map((frequency) => (
                              <SelectItem key={frequency} value={frequency}>
                                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        How often should this quality check be executed
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
                        <FormLabel className="text-base">Enable Quality Check</FormLabel>
                        <FormDescription>
                          Toggle this check on or off
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="ml-auto flex items-center space-x-2">
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(true)}
                            className="px-3"
                          >
                            Enabled
                          </Button>
                          <Button
                            type="button"
                            variant={!field.value ? "default" : "outline"}
                            onClick={() => field.onChange(false)}
                            className="px-3"
                          >
                            Disabled
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("query")}>
                  Previous Step
                </Button>
                <Button
                  type="submit"
                  disabled={createDbQaQueryMutation.isPending || updateDbQaQueryMutation.isPending}
                >
                  {initialData ? "Update Quality Check" : "Create Quality Check"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}