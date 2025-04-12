/**
 * Utility functions for making API requests
 */

/**
 * Default fetch options for API requests
 */
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
};

/**
 * Generic API request function
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  // Check if the response is JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // Parse the response
  const data = isJson ? await response.json() : await response.text();
  
  // Handle error responses
  if (!response.ok) {
    const error = new Error(
      isJson && data.message ? data.message : 'API request failed'
    );
    
    // Attach the status code and data to the error
    Object.assign(error, {
      status: response.status,
      data,
    });
    
    throw error;
  }
  
  return data;
}

/**
 * GET request helper
 */
export function get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export function post<T = any>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function put<T = any>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export function patch<T = any>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function del<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}