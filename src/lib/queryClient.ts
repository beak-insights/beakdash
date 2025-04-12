import { QueryClient } from "@tanstack/react-query";

/**
 * Shared Query Client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: 1,
    },
  },
});

/**
 * Make an API request with proper error handling
 * 
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url The API endpoint URL 
 * @param body Optional request body for POST/PUT requests
 * @returns Promise resolving to the API response
 * @throws Error if the request fails
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  body?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    // Try to get error details from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      // If we can't parse the error as JSON, use the status text
      if (e instanceof SyntaxError) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }

  return response;
}