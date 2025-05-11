"use client";

import { useState, useCallback } from "react";
import { toast } from "@/lib/hooks/use-toast";
import { get } from "@/lib/api-client";

// Notification interface
export interface DbQaNotification {
  id: number;
  alert_id: number;
  channel: string;
  sent_at: string;
  status: string;
  content: Record<string, any>;
  error_message: string | null;
  attempts: number;
  alert_history_id: number | null;
  retry_scheduled_for: string | null;
  recipient: string | null;
  alert_triggered_at: string | null;
}

// Notification filters interface
export interface NotificationFilters {
  status?: string | null;
  channel?: string | null;
  limit?: number;
}

export function useDbQaNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get notifications for a specific alert
  const getNotifications = useCallback(async (alertId: string | number, filters: NotificationFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.channel) queryParams.append('channel', filters.channel);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/db-qa/alerts/${alertId}/notifications${queryString ? `?${queryString}` : ''}`;
      
      const result = await get<DbQaNotification[]>(url);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch notifications';
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

  return {
    getNotifications,
    isLoading,
    error,
  };
}