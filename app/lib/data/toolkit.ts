import { groupBy as esGroupBy, sumBy, meanBy, maxBy, minBy, countBy } from 'es-toolkit';

// Type definitions
type AggregationMethod = 'sum' | 'avg' | 'average' | 'max' | 'min' | 'median' | 'count' | 'first' | 'last';
type RecordType = Record<string, any>;

// Generic aggregation function using ES-Toolkit
function aggregate<T extends RecordType>(
  data: T[], 
  field: keyof T, 
  method: AggregationMethod = 'sum'
): number {
  const getFieldValue = (item: T) => Number(item[field]);
  
  switch (method.toLowerCase()) {
    case 'sum':
      return sumBy(data, getFieldValue);
    case 'avg':
    case 'average':
      return meanBy(data, getFieldValue);
    case 'max':
      return maxBy(data, getFieldValue)![field] as number;
    case 'min':
      return minBy(data, getFieldValue)![field] as number;
    case 'median':
      const values = data.map(getFieldValue).sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      return values.length % 2 === 0 
        ? (values[mid - 1] + values[mid]) / 2 
        : values[mid];
    case 'count':
      return data.length;
    case 'first':
      return data[0] ? getFieldValue(data[0]) : 0;
    case 'last':
      return data[data.length - 1] ? getFieldValue(data[data.length - 1]) : 0;
    default:
      return sumBy(data, getFieldValue); // Default to sum
  }
}

// Single-level groupBy function with explicit value field
function groupByField<T extends RecordType>(
  data: T[], 
  key: keyof T, 
  valueField: keyof T,
  aggregator: AggregationMethod = 'sum'
): T[] {
  const grouped = esGroupBy(data, (item) => String(item[key]));
  
  return Object.entries(grouped).map(([groupKey, items]) => {
    const result = { [key]: groupKey } as T;
    
    // Apply aggregation to the specified value field
    result[valueField] = aggregate(items, valueField, aggregator) as any;
    
    // TODO: ?? get assocuiated fields (excluding the aggregated field)

    // RETURN THE RESULT
    return result;
  });
}

// Multi-level groupBy function using ES-Toolkit
function groupByFields<T extends RecordType>(
  data: T[], 
  keys: Array<keyof T>, 
  aggregator: AggregationMethod = 'sum'
): T[] {
  if (keys.length === 0) return data;
  
  // Create composite key for grouping
  const grouped = esGroupBy(data, (item) => 
    keys.map(key => String(item[key])).join('|')
  );
  
  return Object.entries(grouped).map(([groupKey, items]) => {
    const result = {} as T;
    
    // Add grouping keys back to result
    keys.forEach((key, index) => {
      result[key] = groupKey.split('|')[index] as any;
    });
    
    // Find numeric fields to aggregate
    const numericFields = Object.keys(items[0]).filter(k => 
      !keys.includes(k as keyof T) && typeof items[0][k] === 'number'
    );
    
    // Apply aggregation to each numeric field
    numericFields.forEach(field => {
      result[field as keyof T] = aggregate(items, field as keyof T, aggregator) as any;
    });
    
    // TODO: ?? get assocuiated fields (excluding the aggregated field)
    
    // RETURN THE RESULT
    return result;
  });
}

// Advanced groupBy with custom aggregation per field using ES-Toolkit
function groupByCustom<T extends RecordType>(
  data: T[], 
  keys: keyof T | Array<keyof T>, 
  aggregations: Partial<Record<keyof T, AggregationMethod>>
): T[] {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  
  // Create composite key for grouping
  const grouped = esGroupBy(data, (item) => 
    keyArray.map(key => String(item[key])).join('|')
  );
  
  return Object.entries(grouped).map(([groupKey, items]) => {
    const result = {} as T;
    
    // Add grouping keys back to result
    keyArray.forEach((key, index) => {
      result[key] = groupKey.split('|')[index] as any;
    });
    
    // Apply custom aggregations
    Object.entries(aggregations).forEach(([field, method]) => {
      if (method && items[0].hasOwnProperty(field)) {
        result[field as keyof T] = aggregate(items, field as keyof T, method) as any;
      }
    });
    
    // TODO: ?? get assocuiated fields (excluding the aggregated field)
    
    // RETURN THE RESULT
    return result;
  });
}

// Performance-optimized versions using ES-Toolkit's built-in functions
const optimizedFunctions = {
  // Sum by category
  sumByCategory: <T extends RecordType>(data: T[], categoryKey: keyof T, valueKey: keyof T) => {
    const grouped = esGroupBy(data, (item) => String(item[categoryKey]));
    return Object.entries(grouped).map(([category, items]) => ({
      [categoryKey]: category,
      [valueKey]: sumBy(items, (item) => Number(item[valueKey]))
    }));
  },
  
  // Average by category
  avgByCategory: <T extends RecordType>(data: T[], categoryKey: keyof T, valueKey: keyof T) => {
    const grouped = esGroupBy(data, (item) => String(item[categoryKey]));
    return Object.entries(grouped).map(([category, items]) => ({
      [categoryKey]: category,
      [valueKey]: meanBy(items, (item) => Number(item[valueKey]))
    }));
  },
  
  // Max by category
  maxByCategory: <T extends RecordType>(data: T[], categoryKey: keyof T, valueKey: keyof T) => {
    const grouped = esGroupBy(data, (item) => String(item[categoryKey]));
    return Object.entries(grouped).map(([category, items]) => ({
      [categoryKey]: category,
      [valueKey]: maxBy(items, (item) => Number(item[valueKey]))![valueKey]
    }));
  }
};

// Example usage
/*
interface SalesData {
  category: string;
  product: string;
  sales: number;
  quarter: string;
  year?: number;
}

const salesData: SalesData[] = [
  { category: 'Electronics', product: 'Phone', sales: 1000, quarter: 'Q1' },
  { category: 'Electronics', product: 'Laptop', sales: 1500, quarter: 'Q1' },
  { category: 'Electronics', product: 'Phone', sales: 1200, quarter: 'Q2' },
  { category: 'Clothing', product: 'Shirt', sales: 200, quarter: 'Q1' },
  { category: 'Clothing', product: 'Pants', sales: 300, quarter: 'Q1' }
];

// Examples
const groupedByCategory = groupByField(salesData, 'category', 'sales', 'sum');
const groupedMultiple = groupByFields(salesData, ['category', 'quarter']);
const customGrouped = groupByCustom(salesData, 'category', {
  sales: 'sum',
  product: 'count'
});
*/
// Export all functions
export { 
  groupByField,
  groupByFields, 
  groupByCustom, 
  aggregate,
  optimizedFunctions,
  type AggregationMethod,
  type RecordType
};