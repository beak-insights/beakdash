'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckIcon, InfoIcon, Loader2 } from 'lucide-react';
import { Column, Line, Area, Pie } from '@ant-design/charts';
import { getRandomColor } from '@/lib/utils';

// Define the form schema
const widgetFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Widget name must be at least 2 characters.',
  }),
  type: z.enum(['chart', 'text']),
  description: z.string().optional(),
  config: z.any(), // We'll validate this differently based on the widget type
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

interface WidgetFormProps {
  dashboardId: number;
  widget?: any; // The widget to edit (optional for new widgets)
  backUrl: string;
  isEditMode?: boolean;
}

export function WidgetForm({ dashboardId, widget, backUrl, isEditMode = false }: WidgetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set default chart type
  const defaultChartType = widget?.type === 'chart' ? (widget?.config?.chartType || 'bar') : 'bar';
  const [chartType, setChartType] = useState<string>(defaultChartType);
  
  // Set default values for the form
  const defaultValues: WidgetFormValues = {
    name: widget?.name || '',
    type: widget?.type || 'chart',
    description: widget?.description || '',
    config: widget?.config || {},
  };

  // Generate sample data for previews
  const [sampleData, setSampleData] = useState([
    { name: 'Jan', value: 400, category: 'A' },
    { name: 'Feb', value: 300, category: 'A' },
    { name: 'Mar', value: 600, category: 'A' },
    { name: 'Apr', value: 800, category: 'A' },
    { name: 'May', value: 500, category: 'A' },
    { name: 'Jan', value: 300, category: 'B' },
    { name: 'Feb', value: 400, category: 'B' },
    { name: 'Mar', value: 200, category: 'B' },
    { name: 'Apr', value: 300, category: 'B' },
    { name: 'May', value: 600, category: 'B' }
  ]);

  // Initialize the form
  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues,
  });

  // Update the chart type when the widget type changes
  const watchType = form.watch('type');
  
  // Generate chart colors
  const [chartColors, setChartColors] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate random colors
    const colors = Array.from({ length: 10 }, (_, i) => getRandomColor(i));
    setChartColors(colors);
  }, []);

  // Handle form submission
  const onSubmit = async (values: WidgetFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // For chart widgets, make sure we save the chart type
      if (values.type === 'chart') {
        values.config = { 
          ...values.config, 
          chartType,
          colors: chartColors,
        };
      }

      let response;
      
      if (isEditMode && widget) {
        // Update existing widget
        response = await fetch(`/api/widgets/${widget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...values,
            dashboardId, // Include the dashboard ID for linking
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update widget');
        }
        
        setSuccess('Widget updated successfully');
      } else {
        // Create new widget
        response = await fetch(`/api/dashboards/${dashboardId}/widgets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...values,
            dashboardId,
            position: {
              x: 0,
              y: 0,
              w: 6,
              h: 4
            }
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create widget');
        }
        
        setSuccess('Widget created successfully');
      }
      
      // Redirect back to the dashboard after a short delay
      setTimeout(() => {
        router.push(backUrl);
        router.refresh(); // Refresh the dashboard to show the updated widget
      }, 1500);
    } catch (err) {
      console.error('Error saving widget:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render chart preview based on type
  const renderChartPreview = () => {
    const commonProps = {
      data: sampleData,
      xField: 'name',
      yField: 'value',
      seriesField: 'category',
      color: chartColors,
      autoFit: true,
      appendPadding: [10, 10, 10, 10],
      legend: {
        visible: form.watch('config.showLegend') !== false,
        position: 'top-right',
      },
      xAxis: {
        title: { text: form.watch('config.xAxisLabel') || '' },
        grid: { line: { style: { stroke: form.watch('config.showGrid') ? '#d9d9d9' : 'transparent' } } },
      },
      yAxis: {
        title: { text: form.watch('config.yAxisLabel') || '' },
        grid: { line: { style: { stroke: form.watch('config.showGrid') ? '#d9d9d9' : 'transparent' } } },
      },
      tooltip: {
        showContent: form.watch('config.showTooltip') !== false,
      },
    };

    switch (chartType) {
      case 'bar':
        return (
          <div className="h-40 mt-4">
            <Column 
              {...commonProps} 
              stack={form.watch('config.isStacked')}
              columnStyle={{ radius: [4, 4, 0, 0] }}
            />
          </div>
        );
      
      case 'line':
        return (
          <div className="h-40 mt-4">
            <Line 
              {...commonProps}
              point={{ size: 5, shape: 'circle', style: { fillOpacity: 0.8 } }}
            />
          </div>
        );
      
      case 'area':
        return (
          <div className="h-40 mt-4">
            <Area 
              {...commonProps}
              stack={form.watch('config.isStacked')}
            />
          </div>
        );
      
      case 'pie':
        return (
          <div className="h-40 mt-4">
            <Pie
              data={sampleData.slice(0, 5)}
              angleField="value"
              colorField="name"
              radius={0.8}
              innerRadius={form.watch('config.innerRadius') || 0}
              label={{
                type: 'outer',
                content: form.watch('config.showLabel') !== false ? '{name}: {percentage}' : '',
              }}
              color={chartColors}
              autoFit={true}
              appendPadding={[10, 10, 10, 10]}
              legend={{
                visible: form.watch('config.showLegend') !== false,
                position: 'top-right',
              }}
              tooltip={{
                showContent: form.watch('config.showTooltip') !== false,
              }}
            />
          </div>
        );
      
      default:
        return <div className="text-muted-foreground text-center p-4">Select a chart type</div>;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          {isEditMode ? `Edit Widget: ${widget?.name}` : 'Create New Widget'}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Modify this widget with your changes' 
            : 'Configure your widget to add to the dashboard'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Base Widget Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter widget name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your widget.
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
                        placeholder="Enter a brief description" 
                        className="resize-none h-20" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional details about this widget.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget Type</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="chart" />
                          </FormControl>
                          <FormLabel className="font-normal mt-0">
                            Chart
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="text" />
                          </FormControl>
                          <FormLabel className="font-normal mt-0">
                            Text
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Select the type of widget you want to create.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Chart Widget Options */}
            {watchType === 'chart' && (
              <div className="space-y-4">
                <div className="text-lg font-medium">Chart Configuration</div>
                
                <FormItem>
                  <FormLabel>Chart Type</FormLabel>
                  <Select 
                    value={chartType} 
                    onValueChange={setChartType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of chart to display.
                  </FormDescription>
                </FormItem>

                {/* Chart Preview */}
                <div className="border rounded-md p-2">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  {renderChartPreview()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="config.xAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X-Axis Field</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., category, date" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Data field for X-axis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.yAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y-Axis Field</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., value, count" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Data field for Y-axis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.groupBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group By Field (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., region, category" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Field to group data by.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.xAxisLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X-Axis Label (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Month, Category" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Label for X-axis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.yAxisLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y-Axis Label (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Revenue, Count" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Label for Y-axis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.chartTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chart Title (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Monthly Revenue" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Title for the chart.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="config.showLegend"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Legend</FormLabel>
                          <FormDescription>
                            Display chart legend
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === undefined ? true : !!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.showGrid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Grid</FormLabel>
                          <FormDescription>
                            Display grid lines
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === undefined ? false : !!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.showTooltip"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Tooltip</FormLabel>
                          <FormDescription>
                            Display data tooltips
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === undefined ? true : !!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Chart Type Specific Options */}
                {chartType === 'pie' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="config.innerRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inner Radius (0-1)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              {...field} 
                              value={field.value !== undefined ? field.value : 0}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Inner radius for donut chart (0 = pie chart).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {(chartType === 'line' || chartType === 'area') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="config.connectNulls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Connect Null Values</FormLabel>
                            <FormDescription>
                              Connect across null data points
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === undefined ? false : !!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {(chartType === 'bar' || chartType === 'area') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="config.isStacked"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Stacked Chart</FormLabel>
                            <FormDescription>
                              Stack series on top of each other
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === undefined ? false : !!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Text Widget Options */}
            {watchType === 'text' && (
              <div className="space-y-4">
                <div className="text-lg font-medium">Text Content</div>
                
                <FormField
                  control={form.control}
                  name="config.textContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter text content..." 
                          className="min-h-[200px] resize-none" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the text content to display in this widget.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="config.textAlign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Alignment</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'left'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="justify">Justify</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How text should be aligned.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'md'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>
                            <SelectItem value="md">Medium</SelectItem>
                            <SelectItem value="lg">Large</SelectItem>
                            <SelectItem value="xl">Extra Large</SelectItem>
                            <SelectItem value="2xl">2X Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Size of the text.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckIcon className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={backUrl}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Widget' : 'Create Widget'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}