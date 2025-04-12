import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  DefaultOptions,
} from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

const defaultQueryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
};

const queryClient = new QueryClient({
  defaultOptions: defaultQueryConfig,
});

export const fetcher = async (url: string) => {
  return get(url);
};

export const mutationFetcher = {
  post: async (url: string, data: any) => {
    return post(url, data);
  },
  put: async (url: string, data: any) => {
    return put(url, data);
  },
  delete: async (url: string) => {
    return del(url);
  },
};

export const queryKeys = {
  users: 'users',
  user: (id: number) => ['users', id],
  dashboards: 'dashboards',
  dashboard: (id: number) => ['dashboards', id],
  spaces: 'spaces',
  space: (id: number) => ['spaces', id],
  connections: 'connections',
  connection: (id: number) => ['connections', id],
  datasets: 'datasets',
  dataset: (id: number) => ['datasets', id],
  widgets: 'widgets',
  widget: (id: number) => ['widgets', id],
  dashboardWidgets: (dashboardId: number) => ['dashboards', dashboardId, 'widgets'],
};

/**
 * React Query Provider with pre-configured client
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}