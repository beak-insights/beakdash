/**
 * Utility functions for making API requests
 */

// Default base URL for API requests
const API_BASE_URL = '/api';

// Type definition for request options
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  cache?: RequestCache;
};

/**
 * Make an API request with proper error handling
 * 
 * @param url The API endpoint URL (without the base URL)
 * @param options Request options including method, headers, and body
 * @returns Promise resolving to the API response data
 * @throws Error if the request fails
 */
export async function apiRequest<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  
  // Set default options
  const defaultOptions: RequestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };
  
  // Merge options
  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  // Convert body to JSON string if it's an object
  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }
  
  try {
    // Make the request
    const response = await fetch(fullUrl, fetchOptions);
    
    // Parse the response
    const data = await response.json();
    
    // Handle unsuccessful responses
    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }
    
    return data as T;
  } catch (error: any) {
    console.error(`API request error for ${fullUrl}:`, error);
    throw error;
  }
}

/**
 * Make a GET request
 */
export function get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 */
export function post<T = any>(url: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'POST', body: data });
}

/**
 * Make a PUT request
 */
export function put<T = any>(url: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body: data });
}

/**
 * Make a DELETE request
 */
export function del<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}