import { ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

// Define the provider props
interface QueryProviderProps {
  children: ReactNode;
}

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`Query error: ${error.message}`, query);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error(`Mutation error: ${error.message}`);
    },
  }),
});

// Configure the default fetcher for all queries
export const queryFetcher = async <T,>({ queryKey }: { queryKey: string | string[] }) => {
  // Format the query key as a path
  const path = Array.isArray(queryKey) ? queryKey.join('/') : queryKey;
  return apiRequest<T>(path);
};

// Query provider component
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };