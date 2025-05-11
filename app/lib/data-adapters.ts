/**
 * Data adapters for different data sources
 * These functions help parse and transform data from various sources
 * into a standard format for consumption by the dashboard widgets
 */

/**
 * Parse CSV data into an array of objects
 */
export function parseCSV(
  csvData: string,
  options: {
    delimiter?: string;
    hasHeaders?: boolean;
    quoteChar?: string;
    trimFields?: boolean;
  } = {}
): Record<string, any>[] {
  const {
    delimiter = ',',
    hasHeaders = true,
    quoteChar = '"',
    trimFields = true,
  } = options;

  // Split the CSV text into lines
  const lines = csvData.split(/\r\n|\n|\r/);
  if (lines.length === 0) return [];

  // Helper function to parse a CSV line
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === quoteChar) {
        // Toggle quote state
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(trimFields ? current.trim() : current);
        current = '';
      } else {
        // Add character to current field
        current += char;
      }
    }

    // Add the last field
    result.push(trimFields ? current.trim() : current);
    return result;
  };

  // Parse headers (or use index-based headers)
  const headers = hasHeaders
    ? parseLine(lines[0])
    : Array.from({ length: parseLine(lines[0]).length }, (_, i) => `field_${i + 1}`);

  // Parse data rows
  const data: Record<string, any>[] = [];
  const startIndex = hasHeaders ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const fields = parseLine(line);
    const row: Record<string, any> = {};

    fields.forEach((field, index) => {
      if (index < headers.length) {
        // Try to convert to appropriate type (number, boolean, etc.)
        const headerName = headers[index];
        row[headerName] = convertFieldToAppropriateType(field);
      }
    });

    data.push(row);
  }

  return data;
}

/**
 * Extract data from a REST API response
 */
export function extractRESTData(
  apiResponse: any,
  options: {
    resultPath?: string;
  } = {}
): Record<string, any>[] {
  const { resultPath } = options;

  if (!apiResponse) return [];

  // Helper function to get nested value from an object using a path string
  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return obj;
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, obj);
  };

  let dataArray: any[] = [];

  if (resultPath) {
    // Extract data from the specified path
    const extractedData = getNestedValue(apiResponse, resultPath);
    if (Array.isArray(extractedData)) {
      dataArray = extractedData;
    } else if (extractedData && typeof extractedData === 'object') {
      // If it's an object but not an array, wrap it in an array
      dataArray = [extractedData];
    }
  } else {
    // Try to intelligently locate the data array
    if (Array.isArray(apiResponse)) {
      dataArray = apiResponse;
    } else if (apiResponse && typeof apiResponse === 'object') {
      // Look for common array properties like data, results, items, etc.
      const commonArrayProps = ['data', 'results', 'items', 'records', 'values'];
      for (const prop of commonArrayProps) {
        if (Array.isArray(apiResponse[prop])) {
          dataArray = apiResponse[prop];
          break;
        }
      }

      // If still not found, look for any array property
      if (dataArray.length === 0) {
        for (const key in apiResponse) {
          if (Array.isArray(apiResponse[key]) && apiResponse[key].length > 0) {
            dataArray = apiResponse[key];
            break;
          }
        }
      }

      // If no arrays found, just wrap the object in an array
      if (dataArray.length === 0) {
        dataArray = [apiResponse];
      }
    }
  }

  return dataArray;
}

/**
 * Transform SQL query results into an array of objects
 */
export function transformSQLResults(
  sqlResults: any,
  options: {
    keyMapping?: Record<string, string>;
  } = {}
): Record<string, any>[] {
  const { keyMapping = {} } = options;

  if (!sqlResults) return [];

  // Handle different SQL result formats
  if (Array.isArray(sqlResults)) {
    // Basic array of objects format
    return sqlResults.map(row => {
      const transformedRow: Record<string, any> = {};
      for (const key in row) {
        const newKey = keyMapping[key] || key;
        transformedRow[newKey] = row[key];
      }
      return transformedRow;
    });
  } else if (sqlResults.rows && Array.isArray(sqlResults.rows)) {
    // PostgreSQL/node-postgres format with rows array
    return sqlResults.rows.map((row: any) => {
      const transformedRow: Record<string, any> = {};
      for (const key in row) {
        const newKey = keyMapping[key] || key;
        transformedRow[newKey] = row[key];
      }
      return transformedRow;
    });
  } else if (sqlResults.recordset && Array.isArray(sqlResults.recordset)) {
    // SQL Server/mssql format with recordset array
    return sqlResults.recordset.map((row: any) => {
      const transformedRow: Record<string, any> = {};
      for (const key in row) {
        const newKey = keyMapping[key] || key;
        transformedRow[newKey] = row[key];
      }
      return transformedRow;
    });
  } else if (sqlResults.length >= 0 && sqlResults.affectedRows !== undefined) {
    // MySQL format
    return []; // MySQL update/insert operations don't return rows
  }

  // Default fallback
  return [];
}

/**
 * Execute a JavaScript data adapter function
 */
export function executeJavaScriptAdapter(
  code: string,
  inputData: any
): Record<string, any>[] {
  try {
    // Create a safe function from the code string
    const func = new Function('data', `
      "use strict";
      try {
        ${code}
      } catch (error) {
        return { error: error.message };
      }
    `);

    const result = func(inputData);

    if (result && result.error) {
      console.error('JavaScript adapter error:', result.error);
      return [];
    }

    if (Array.isArray(result)) {
      return result;
    } else {
      console.error('JavaScript adapter did not return an array:', result);
      return [];
    }
  } catch (error) {
    console.error('Failed to execute JavaScript adapter:', error);
    return [];
  }
}

/**
 * Convert a field value to its appropriate type (number, boolean, etc.)
 */
function convertFieldToAppropriateType(value: string): any {
  if (value === '') return null;

  // Try to convert to number
  if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value)) {
    return Number(value);
  }

  // Try to convert to boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Try to convert to date
  const date = new Date(value);
  if (!isNaN(date.getTime()) && 
      // Check if it's actually a date string, not just a number
      (value.includes('-') || value.includes('/') || value.includes(':'))
     ) {
    return date;
  }

  // Return as string if no conversion applies
  return value;
}

/**
 * Process and transform WebSocket data
 */
export function processWebSocketData(
  data: any,
  options: {
    resultPath?: string;
  } = {}
): Record<string, any>[] {
  // WebSocket data is often JSON-like, so we can reuse the REST data extraction logic
  return extractRESTData(data, options);
}
