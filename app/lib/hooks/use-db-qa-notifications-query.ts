"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api-client";
import { DbQaNotification, NotificationFilters } from "./use-db-qa-notifications";

export function useDbQaNotificationsQuery(
  alertId: string | number | null | undefined,
  filters: NotificationFilters = {},
  enabled = true
) {
  return useQuery({
    queryKey: ["db-qa-notifications", alertId, filters],
    queryFn: async () => {
      if (!alertId) return [];
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.channel) queryParams.append('channel', filters.channel);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/db-qa/alerts/${alertId}/notifications${queryString ? `?${queryString}` : ''}`;
      
      return await get<DbQaNotification[]>(url);
    },
    enabled: Boolean(alertId) && enabled,
  });
}