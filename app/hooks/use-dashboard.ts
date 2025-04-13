'use client';

import { useState } from 'react';
import { get, post, put, del } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDashboard() {
  const queryClient = useQueryClient();
  
  // Fetch all dashboards
  const { 
    data: dashboards = [],
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/dashboards'],
    queryFn: () => get('/api/dashboards')
  });

  // Fetch a single dashboard by ID
  const getDashboard = (id: number | string) => {
    return useQuery({
      queryKey: ['/api/dashboards', id],
      queryFn: () => get(`/api/dashboards/${id}`),
      enabled: !!id
    });
  };

  // Create a new dashboard
  const { mutate: createDashboard } = useMutation({
    mutationFn: (data: any) => post('/api/dashboards', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    }
  });

  // Update a dashboard
  const { mutate: updateDashboard } = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => put(`/api/dashboards/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', variables.id] });
    }
  });

  // Delete a dashboard
  const { mutate: deleteDashboard } = useMutation({
    mutationFn: (id: number) => del(`/api/dashboards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    }
  });

  return {
    dashboards,
    isLoading,
    isError,
    error,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard
  };
}