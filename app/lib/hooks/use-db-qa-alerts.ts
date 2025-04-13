'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { DbQaAlert } from '@/lib/db/schema';
import { useSpaces } from './use-spaces';

interface UseDbQaAlertsProps {
  enabled?: boolean;
}

interface CreateDbQaAlertData {
  name: string;
  queryId: number;
  condition: any;
  notificationChannels: string[];
}

interface UpdateDbQaAlertData extends Partial<CreateDbQaAlertData> {
  id: number;
  status?: 'active' | 'resolved' | 'snoozed';
}

export function useDbQaAlerts({ enabled = true }: UseDbQaAlertsProps = {}) {
  const queryClient = useQueryClient();
  const { currentSpaceId } = useSpaces();
  
  // Get all DB QA alerts
  const {
    data: dbQaAlerts,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['dbQaAlerts', currentSpaceId],
    queryFn: async () => {
      const spaceParam = currentSpaceId ? `?spaceId=${currentSpaceId}` : '';
      const response = await fetch(`/api/db-qa/alerts${spaceParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch DB QA alerts');
      }
      return response.json();
    },
    enabled,
  });

  // Get all DB QA alert notifications
  const {
    data: dbQaAlertNotifications,
    isLoading: isLoadingAlertNotifications,
    refetch: refetchAlertNotifications,
  } = useQuery({
    queryKey: ['dbQaAlertNotifications'],
    queryFn: async () => {
      const response = await fetch('/api/db-qa/alert-notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch DB QA alert notifications');
      }
      return response.json();
    },
    enabled,
  });

  // Create a new DB QA alert
  const createDbQaAlertMutation = useMutation({
    mutationFn: async (newAlert: CreateDbQaAlertData) => {
      const response = await fetch('/api/db-qa/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlert),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create DB QA alert');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaAlerts'] });
      toast({
        title: 'Success',
        description: 'Database quality alert created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create database quality alert',
        variant: 'destructive',
      });
    },
  });

  // Update an existing DB QA alert
  const updateDbQaAlertMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateDbQaAlertData) => {
      const response = await fetch(`/api/db-qa/alerts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update DB QA alert');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaAlerts'] });
      toast({
        title: 'Success',
        description: 'Database quality alert updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update database quality alert',
        variant: 'destructive',
      });
    },
  });

  // Delete a DB QA alert
  const deleteDbQaAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/db-qa/alerts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete DB QA alert');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaAlerts'] });
      toast({
        title: 'Success',
        description: 'Database quality alert deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete database quality alert',
        variant: 'destructive',
      });
    },
  });

  // Update alert status (resolve, snooze, reactivate)
  const updateAlertStatusMutation = useMutation({
    mutationFn: async ({ id, status, ...data }: UpdateDbQaAlertData) => {
      const response = await fetch(`/api/db-qa/alerts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, ...data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update alert status');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dbQaAlerts'] });
      
      const statusMessages = {
        'active': 'Alert activated successfully',
        'resolved': 'Alert resolved successfully',
        'snoozed': 'Alert snoozed successfully',
      };
      
      toast({
        title: 'Status Updated',
        description: statusMessages[variables.status as keyof typeof statusMessages] || 'Alert status updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update alert status',
        variant: 'destructive',
      });
    },
  });

  return {
    dbQaAlerts,
    isLoadingAlerts,
    refetchAlerts,
    dbQaAlertNotifications,
    isLoadingAlertNotifications,
    refetchAlertNotifications,
    createDbQaAlertMutation,
    updateDbQaAlertMutation,
    deleteDbQaAlertMutation,
    updateAlertStatusMutation,
  };
}