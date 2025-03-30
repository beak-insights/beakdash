import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes an API request with flexible parameter handling
 */
export async function apiRequest(
  methodOrOptions: string | { method: string; url?: string; data?: unknown },
  url?: string,
  data?: unknown,
): Promise<Response> {
  let method: string;
  let requestUrl: string = '';
  let requestData: unknown;

  // Handle object notation
  if (typeof methodOrOptions === 'object') {
    method = methodOrOptions.method;
    requestUrl = methodOrOptions.url || '';
    requestData = methodOrOptions.data;
  } else {
    // Handle standard parameters
    method = methodOrOptions;
    if (url !== undefined) {
      requestUrl = url;
    }
    requestData = data;
  }
  
  // Prepare fetch options
  const options: RequestInit = {
    method,
    headers: requestData ? { "Content-Type": "application/json" } : {},
    credentials: "include",
  };
  
  if (requestData) {
    options.body = JSON.stringify(requestData);
  }
  
  const res = await fetch(requestUrl, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
