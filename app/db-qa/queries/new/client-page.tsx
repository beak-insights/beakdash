'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryForm } from "@/components/db-qa/query-form";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api-client";

export function NewQueryClient() {
  // Fetch connections
  const {
    data: connections = [],
    isLoading: connectionsLoading,
    error: connectionsError,
  } = useQuery({
    queryKey: ['/api/connections'],
    queryFn: () => get('/api/connections'),
  });

  // Fetch spaces
  const {
    data: spaces = [],
    isLoading: spacesLoading,
    error: spacesError,
  } = useQuery({
    queryKey: ['/api/spaces'],
    queryFn: () => get('/api/spaces'),
  });

  // Show loading state
  if (connectionsLoading || spacesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state
  if (connectionsError || spacesError) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50 text-red-800">
        <h3 className="text-lg font-medium mb-2">Error loading data</h3>
        <p className="mb-4">
          {(connectionsError as Error)?.message || 
           (spacesError as Error)?.message ||
           "Failed to load required data for the form."}
        </p>
        <p>Please try reloading the page or check your connection.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <QueryForm 
        mode="create" 
        connections={connections} 
        spaces={spaces} 
      />
    </div>
  );
}