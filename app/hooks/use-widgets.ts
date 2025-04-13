'use client';

import { useState } from 'react';
import { get, del } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useWidgets() {
  const queryClient = useQueryClient();
  
  // Fetch widgets
  const { 
    data: widgets = [],
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/widgets'],
    queryFn: () => get('/api/widgets')
  });

  // Delete a widget
  const { mutate: deleteWidget } = useMutation({
    mutationFn: (id: number) => del(`/api/widgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets'] });
    }
  });

  return {
    widgets,
    isLoading,
    isError,
    error,
    deleteWidget
  };
}