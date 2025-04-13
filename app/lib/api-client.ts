/**
 * API client for making HTTP requests
 * This is a simpler version that just takes a URL and options without the method being separate
 */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
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
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  };
  
  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body !== "string") {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  // Parse JSON response
  if (response.headers.get("content-type")?.includes("application/json")) {
    return await response.json() as T;
  }

  // Return raw response for other content types
  return response as any;
}

/**
 * Make a GET request
 */
export function get<T = any>(url: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "GET" });
}

/**
 * Make a POST request
 */
export function post<T = any>(url: string, data: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "POST", body: data });
}

/**
 * Make a PUT request
 */
export function put<T = any>(url: string, data: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "PUT", body: data });
}

/**
 * Make a DELETE request
 */
export function del<T = any>(url: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "DELETE" });
}