"use client";

import { useState, useCallback } from "react";
import { toast } from "@/lib/hooks/use-toast";
import { get, post, put, del } from "@/lib/api-client";

// Alert interface
export interface DbQaAlertFrontend {
  id: number;
  name: string;
  description: string | null;
  query_id: number;
  query_name?: string;
  space_id: number | null;
  space_name?: string | null;
  severity: string;
  condition: {
    field: string;
    operator: string;
    value: string | number;
  };
  notification_channels: string[];
  email_recipients?: string | null;
  slack_webhook?: string | null;
  custom_webhook?: string | null;
  enabled: boolean;
  throttle_minutes: number;
  status: string;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

// Alert creation interface
export interface CreateDbQaAlertPayload {
  name: string;
  description?: string;
  queryId: string;
  severity: string;
  condition: {
    field: string;
    operator: string;
    value: string;
  };
  notificationChannels: string[];
  emailRecipients?: string;
  slackWebhook?: string;
  customWebhook?: string;
  enabled: boolean;
  throttleMinutes: number;
  status?: string; // Added status field
}

// Alert filters interface
export interface DbQaAlertFilters {
  spaceId?: string | null;
  status?: string | null;
  severity?: string | null;
}

export function useDbQaAlerts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all alerts with optional filters - using useCallback to prevent recreation on each render
  const getAlerts = useCallback(async (filters: DbQaAlertFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.spaceId) queryParams.append('spaceId', filters.spaceId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.severity) queryParams.append('severity', filters.severity);
      
      const queryString = queryParams.toString();
      const url = `/api/db-qa/alerts${queryString ? `?${queryString}` : ''}`;
      
      const result = await get<DbQaAlertFrontend[]>(url);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch alerts';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a single alert by ID
  const getAlertById = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await get<DbQaAlertFrontend>(`/api/db-qa/alerts/${id}`);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch alert details';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new alert
  const createAlert = async (alertData: CreateDbQaAlertPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await post('/api/db-qa/alerts', alertData);
      toast({
        title: "Success",
        description: "Alert created successfully",
      });
      return result.alert;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create alert';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing alert
  const updateAlert = async (id: string | number, alertData: CreateDbQaAlertPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await put(`/api/db-qa/alerts/${id}`, alertData);
      toast({
        title: "Success",
        description: "Alert updated successfully",
      });
      return result.alert;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update alert';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an alert
  const deleteAlert = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await del(`/api/db-qa/alerts/${id}`);
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete alert';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle alert enabled status
  const toggleAlertStatus = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await post(`/api/db-qa/alerts/${id}/toggle`, {});
      toast({
        title: "Success",
        description: `Alert ${result.enabled ? 'enabled' : 'disabled'} successfully`,
      });
      return result.enabled;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to toggle alert status';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get alert history
  const getAlertHistory = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await get(`/api/db-qa/alerts/${id}/history`);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch alert history';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlertStatus,
    getAlertHistory,
    isLoading,
    error,
  };
}