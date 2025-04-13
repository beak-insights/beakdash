'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { DbQaQuery, DbQaCategory, DbQaFrequency, DbQaExecutionResult } from '@/lib/db/schema';
import { useSpaces } from './use-spaces';

interface UseDbQaQueriesProps {
  enabled?: boolean;
}

interface CreateDbQaQueryData {
  name: string;
  description?: string;
  category: DbQaCategory;
  query: string;
  connectionId: number;
  spaceId?: number | null;
  expectedResult?: any;
  thresholds?: any;
  enabled?: boolean;
  executionFrequency?: DbQaFrequency;
}

interface UpdateDbQaQueryData extends Partial<CreateDbQaQueryData> {
  id: number;
}

export function useDbQaQueries({ enabled = true }: UseDbQaQueriesProps = {}) {
  const queryClient = useQueryClient();
  const { currentSpaceId } = useSpaces();
  const { toast } = useToast();
  
  // Get all DB QA queries
  const {
    data: dbQaQueries,
    isLoading: isLoadingQueries,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: ['dbQaQueries', currentSpaceId],
    queryFn: async () => {
      const spaceParam = currentSpaceId ? `?spaceId=${currentSpaceId}` : '';
      const response = await fetch(`/api/db-qa/queries${spaceParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch DB QA queries');
      }
      return response.json();
    },
    enabled,
  });

  // Create a new DB QA query
  const createDbQaQueryMutation = useMutation({
    mutationFn: async (newQuery: CreateDbQaQueryData) => {
      const response = await fetch('/api/db-qa/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuery),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create DB QA query');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaQueries'] });
      toast({
        title: 'Success',
        description: 'Database quality check created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create database quality check',
        variant: 'destructive',
      });
    },
  });

  // Update an existing DB QA query
  const updateDbQaQueryMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateDbQaQueryData) => {
      const response = await fetch(`/api/db-qa/queries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update DB QA query');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaQueries'] });
      toast({
        title: 'Success',
        description: 'Database quality check updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update database quality check',
        variant: 'destructive',
      });
    },
  });

  // Delete a DB QA query
  const deleteDbQaQueryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/db-qa/queries/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete DB QA query');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbQaQueries'] });
      toast({
        title: 'Success',
        description: 'Database quality check deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete database quality check',
        variant: 'destructive',
      });
    },
  });

  // Run a DB QA query manually
  const runDbQaQueryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/db-qa/queries/${id}/run`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to run DB QA query');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dbQaQueries'] });
      queryClient.invalidateQueries({ queryKey: ['dbQaExecutionResults'] });
      toast({
        title: 'Success',
        description: 'Database quality check executed successfully',
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to run database quality check',
        variant: 'destructive',
      });
    },
  });

  // Get execution results for a specific query
  const getQueryExecutionResults = async (queryId: number) => {
    const response = await fetch(`/api/db-qa/queries/${queryId}/results`);
    if (!response.ok) {
      throw new Error('Failed to fetch execution results');
    }
    return response.json();
  };

  return {
    dbQaQueries,
    isLoadingQueries,
    refetchQueries,
    createDbQaQueryMutation,
    updateDbQaQueryMutation,
    deleteDbQaQueryMutation,
    runDbQaQueryMutation,
    getQueryExecutionResults,
  };
}