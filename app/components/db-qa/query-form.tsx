'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Connection, DbQaCategory, DbQaFrequency } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface DbQaQueryFormProps {
  connections: Connection[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

// Define schema for the form
const queryFormSchema = z.object({
  name: z.string().min(3, { message: 'Check name must be at least 3 characters' }),
  description: z.string().optional(),
  category: z.enum([
    'data_completeness',
    'data_consistency',
    'data_accuracy',
    'data_integrity',
    'data_timeliness',
    'data_uniqueness',
    'data_relationship',
    'sensitive_data_exposure'
  ] as const),
  query: z.string().min(5, { message: 'SQL query is required' }),
  connectionId: z.number({ required_error: 'Connection is required' }),
  enabled: z.boolean().default(true),
  executionFrequency: z.enum([
    'manual',
    'hourly',
    'daily',
    'weekly',
    'monthly'
  ] as const).default('manual'),
  thresholds: z.string().optional(),
  expectedResult: z.string().optional(),
});

export function DbQaQueryForm({ connections, onSubmit, isSubmitting, initialData }: DbQaQueryFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<z.infer<typeof queryFormSchema>>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category: 'data_completeness',
      query: '',
      connectionId: connections[0]?.id || 0,
      enabled: true,
      executionFrequency: 'manual',
      thresholds: '',
      expectedResult: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof queryFormSchema>) => {
    // Parse numeric values
    const formattedData = {
      ...data,
      connectionId: Number(data.connectionId),
    };
    onSubmit(formattedData);
  };

  const categoryLabels: Record<DbQaCategory, string> = {
    data_completeness: 'Data Completeness',
    data_consistency: 'Data Consistency',
    data_accuracy: 'Data Accuracy',
    data_integrity: 'Data Integrity',
    data_timeliness: 'Data Timeliness',
    data_uniqueness: 'Data Uniqueness',
    data_relationship: 'Data Relationships',
    sensitive_data_exposure: 'Sensitive Data Exposure',
  };

  const frequencyLabels: Record<DbQaFrequency, string> = {
    manual: 'Manual (On Demand)',
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="query">Query Configuration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this quality check
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
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of quality check to perform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose of this check..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to provide context
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
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a connection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {connections.map((connection) => (
                        <SelectItem key={connection.id} value={connection.id.toString()}>
                          {connection.name} ({connection.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Connection to use for this check
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SQL Query</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="SELECT * FROM users WHERE ..."
                          rows={10}
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a SQL query to validate data quality
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Expected Results</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="expectedResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., 'Should return 0 rows', 'Value in column X should be > 100', etc."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what the query should return when data is valid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="executionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Schedule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(frequencyLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often this check should run
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
                        Enable or disable this check
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

            <FormField
              control={form.control}
              name="thresholds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Thresholds</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., { warning: 5, error: 10 }"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Threshold values that will trigger alerts (optional JSON format)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Check' : 'Create Check'}
          </Button>
        </div>
      </form>
    </Form>
  );
}