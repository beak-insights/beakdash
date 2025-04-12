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
  const defaultOptions: RequestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };

  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body !== 'string') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If parsing JSON fails, use the default error message
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  // Check if response is empty or JSON
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return {} as T;
  }

  return response.json();
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