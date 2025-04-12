import { ChartType } from "@shared/schema";
import { getRandomColor } from "./utils";

/**
 * Utility functions for chart manipulation and configuration
 */

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  y2Axis?: string;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
  limit?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  area?: boolean;
  stacked?: boolean;
  lineType?: 'monotone' | 'linear' | 'step';
  leftAxisType?: 'bar' | 'line' | 'area';
  rightAxisType?: 'line' | 'bar' | 'area';
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showBubble?: boolean;
  chartTitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  filters?: ChartFilter[];
  // Counter widget fields
  valueField?: string;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showIcon?: boolean;
  icon?: string;
  colorCode?: boolean;
  // Stat card fields
  primaryValueField?: string;
  secondaryValueField?: string;
  compareField?: string;
  showChange?: boolean;
  colorCodeChange?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  connectNulls?: boolean;
  // Table widget fields
  headers?: string[];
  // Text widget fields
  textContent?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: string;
  backgroundColor?: string;
}

export interface ChartFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

/**
 * Get default chart configuration for a given chart type
 */
export function getDefaultChartConfig(chartType: ChartType): ChartConfig {
  const baseConfig: ChartConfig = {
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: [getRandomColor(0), getRandomColor(1), getRandomColor(2), getRandomColor(3), getRandomColor(4)],
  };

  switch (chartType) {
    case 'bar':
      return {
        ...baseConfig,
        stacked: false,
      };
    case 'column':
      return {
        ...baseConfig,
        stacked: false,
      };
    case 'line':
      return {
        ...baseConfig,
        lineType: 'monotone',
        area: false,
        connectNulls: true,
      };
    case 'pie':
      return {
        ...baseConfig,
        innerRadius: 0,
        outerRadius: 80,
        showLabel: true,
      };
    case 'scatter':
      return {
        ...baseConfig,
        showBubble: false,
      };
    case 'dual-axes':
      return {
        ...baseConfig,
        leftAxisType: 'bar',
        rightAxisType: 'line',
      };
    case 'counter':
      return {
        ...baseConfig,
        valueField: '',
        format: 'number',
        prefix: '',
        suffix: '',
        decimals: 0,
        showIcon: true,
        icon: 'trending-up',
        colorCode: true,
      };
    case 'stat-card':
      return {
        ...baseConfig,
        primaryValueField: '',
        secondaryValueField: '',
        compareField: '',
        format: 'number',
        prefix: '',
        suffix: '',
        decimals: 0,
        showIcon: true,
        showChange: true,
        colorCodeChange: true,
        trend: 'neutral',
      };
    case 'table':
      return {
        ...baseConfig,
        limit: 20,
        sortBy: '',
        sortOrder: 'asc',
        headers: [],
        filters: [],
      };
    case 'text':
      return {
        ...baseConfig,
        textContent: 'Add your text content here...',
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal',
        textColor: undefined,
        backgroundColor: undefined,
      };
    default:
      return baseConfig;
  }
}

/**
 * Apply filters to the chart data
 */
export function applyFilters(data: Record<string, any>[], filters: ChartFilter[] = []): Record<string, any>[] {
  if (!filters || filters.length === 0) return data;

  return data.filter(item => {
    return filters.every(filter => {
      const fieldValue = item[filter.field];
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue == filter.value; // Using == for type coercion
        case 'not_equals':
          return fieldValue != filter.value;
        case 'greater_than':
          return fieldValue > filter.value;
        case 'less_than':
          return fieldValue < filter.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        default:
          return true;
      }
    });
  });
}

/**
 * Apply sorting to the chart data
 */
export function applySorting(
  data: Record<string, any>[], 
  sortBy?: string, 
  sortOrder: 'asc' | 'desc' | 'none' = 'none'
): Record<string, any>[] {
  if (!sortBy || sortOrder === 'none') return data;

  return [...data].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    
    // Handle numeric comparison
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    
    // Handle string comparison
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    
    if (sortOrder === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });
}

/**
 * Apply a limit to the number of data points
 */
export function applyLimit(data: Record<string, any>[], limit?: number): Record<string, any>[] {
  if (!limit || limit <= 0) return data;
  return data.slice(0, limit);
}

/**
 * Process chart data with all transformations (filters, sorting, limit)
 */
export function processChartData(
  data: Record<string, any>[], 
  config: ChartConfig
): Record<string, any>[] {
  let processedData = [...data];
  
  // Apply filters
  if (config.filters && config.filters.length > 0) {
    processedData = applyFilters(processedData, config.filters);
  }
  
  // Apply sorting
  if (config.sortBy && config.sortOrder && config.sortOrder !== 'none') {
    processedData = applySorting(processedData, config.sortBy, config.sortOrder);
  }
  
  // Apply limit
  if (config.limit && config.limit > 0) {
    processedData = applyLimit(processedData, config.limit);
  }
  
  return processedData;
}

/**
 * Get suggested chart type based on data structure
 */
export function suggestChartType(data: Record<string, any>[]): ChartType {
  if (!data || data.length === 0) return 'bar';
  
  const sampleRow = data[0];
  const fields = Object.keys(sampleRow);
  
  // Count the number of numeric and categorical fields
  let numericCount = 0;
  let categoricalCount = 0;
  
  fields.forEach(field => {
    if (typeof sampleRow[field] === 'number') {
      numericCount++;
    } else {
      categoricalCount++;
    }
  });

  // If there's only a single row with a single numeric value, suggest counter widget
  if (data.length === 1 && numericCount === 1 && categoricalCount <= 1) {
    return 'counter';
  }
  
  // If there are only a few rows (1-3) with a primary metric and possibly a comparison value, suggest stat card
  if (data.length <= 3 && numericCount >= 1 && numericCount <= 3) {
    // Check if there might be a time field for comparison
    const timeFields = fields.filter(field => {
      const lowerField = field.toLowerCase();
      return lowerField.includes('date') || 
             lowerField.includes('time') || 
             lowerField.includes('year') || 
             lowerField.includes('month') || 
             lowerField.includes('day');
    });
    
    if (timeFields.length > 0 || (numericCount === 2 && categoricalCount <= 1)) {
      return 'stat-card';
    }
  }
  
  // If data has many columns or complex structure, suggest table view
  if (fields.length >= 6 || (numericCount >= 4 && categoricalCount >= 2)) {
    return 'table';
  }
  
  // If there are multiple numeric fields and at least one categorical
  if (numericCount >= 2 && categoricalCount >= 1) {
    return 'dual-axes';
  }
  
  // If there's just one categorical field and one numeric field
  if (categoricalCount === 1 && numericCount === 1) {
    return 'bar';
  }
  
  // If there are multiple categories and one numeric field
  if (categoricalCount > 1 && numericCount === 1) {
    return 'column';
  }
  
  // If there's time-series data (fields contain year, month, date, etc.)
  const timeFields = fields.filter(field => {
    const lowerField = field.toLowerCase();
    return lowerField.includes('date') || 
           lowerField.includes('time') || 
           lowerField.includes('year') || 
           lowerField.includes('month') || 
           lowerField.includes('day');
  });
  
  if (timeFields.length > 0 && numericCount > 0) {
    return 'line';
  }
  
  // For data with two numeric dimensions, suggest scatter plot
  if (numericCount >= 2 && numericCount <= 3) {
    return 'scatter';
  }
  
  // For data with one categorical and one numeric field, suggest pie chart
  // if categorical field has few distinct values
  if (categoricalCount === 1 && numericCount === 1) {
    const categoricalField = fields.find(field => typeof sampleRow[field] !== 'number')!;
    const distinctValues = new Set(data.map(item => item[categoricalField])).size;
    
    if (distinctValues <= 8) {
      return 'pie';
    }
  }
  
  // Default to bar chart
  return 'bar';
}

/**
 * Suggest axis mappings based on data structure
 */
export function suggestAxisMappings(
  data: Record<string, any>[], 
  chartType: ChartType
): Pick<ChartConfig, 'xAxis' | 'yAxis' | 'y2Axis' | 'groupBy'> {
  if (!data || data.length === 0) {
    return {};
  }
  
  const sampleRow = data[0];
  const fields = Object.keys(sampleRow);
  
  // Find numeric and categorical fields
  const numericFields = fields.filter(field => typeof sampleRow[field] === 'number');
  const categoricalFields = fields.filter(field => typeof sampleRow[field] !== 'number');
  
  // Find potential time fields
  const timeFields = fields.filter(field => {
    const lowerField = field.toLowerCase();
    return lowerField.includes('date') || 
           lowerField.includes('time') || 
           lowerField.includes('year') || 
           lowerField.includes('month') || 
           lowerField.includes('day') ||
           lowerField.includes('quarter');
  });
  
  switch (chartType) {
    case 'bar':
    case 'column': {
      let xAxis = categoricalFields[0] || fields[0];
      let yAxis = numericFields[0] || fields[1] || fields[0];
      
      // If there are time fields, prefer them for x-axis
      if (timeFields.length > 0) {
        xAxis = timeFields[0];
      }
      
      // If there are multiple categorical fields, suggest groupBy
      let groupBy = undefined;
      if (categoricalFields.length > 1) {
        groupBy = categoricalFields.find(field => field !== xAxis);
      }
      
      return { xAxis, yAxis, groupBy };
    }
    
    case 'line': {
      // For line charts, prefer time fields for x-axis
      let xAxis = timeFields[0] || categoricalFields[0] || fields[0];
      let yAxis = numericFields[0] || fields[1] || fields[0];
      
      // If there are multiple numeric fields, suggest groupBy
      let groupBy = undefined;
      if (numericFields.length > 1 && categoricalFields.length > 0) {
        groupBy = categoricalFields[0];
      }
      
      return { xAxis, yAxis, groupBy };
    }
    
    case 'pie': {
      // For pie charts, categorical field for name, numeric for value
      const xAxis = categoricalFields[0] || fields[0];
      const yAxis = numericFields[0] || fields[1] || fields[0];
      return { xAxis, yAxis };
    }
    
    case 'scatter': {
      // For scatter plots, numeric fields for both axes
      const xAxis = numericFields[0] || fields[0];
      const yAxis = numericFields[1] || numericFields[0] || fields[1] || fields[0];
      
      // Use a categorical field for groupBy if available
      let groupBy = undefined;
      if (categoricalFields.length > 0) {
        groupBy = categoricalFields[0];
      }
      
      return { xAxis, yAxis, groupBy };
    }
    
    case 'dual-axes': {
      // For dual axes, we need two numeric fields and one categorical/time field
      const xAxis = timeFields[0] || categoricalFields[0] || fields[0];
      const yAxis = numericFields[0] || fields[1] || fields[0];
      const y2Axis = numericFields[1] || numericFields[0] || fields[2] || fields[1];
      
      return { xAxis, yAxis, y2Axis };
    }
    
    case 'counter': {
      // For counter widgets, use the first numeric field as the value field
      const valueField = numericFields[0] || fields[0];
      return { valueField } as any;
    }
    
    case 'stat-card': {
      // For stat cards, use the first numeric field as primary and second as secondary
      const primaryValueField = numericFields[0] || fields[0];
      const secondaryValueField = numericFields[1] || numericFields[0] || fields[1] || fields[0];
      // Use a time field as the compare field if available (for trend comparison)
      const compareField = timeFields[0] || categoricalFields[0];
      
      return { primaryValueField, secondaryValueField, compareField } as any;
    }

    case 'table': {
      // For tables, suggest all fields as headers and first field as sortBy
      return { 
        headers: fields,
        sortBy: fields[0],
        sortOrder: 'asc',
        limit: 20
      } as any;
    }
    
    case 'text': {
      // Text widget doesn't need axis mappings from data
      return {
        textContent: 'Add your text content here...',
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal'
      } as any;
    }
    
    default:
      return {
        xAxis: fields[0],
        yAxis: fields[1] || fields[0],
      };
  }
}
