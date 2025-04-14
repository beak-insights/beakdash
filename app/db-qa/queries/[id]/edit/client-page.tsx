'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryForm } from "@/components/db-qa/query-form";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface EditQueryClientProps {
  id: string;
}

export function EditQueryClient({ id }: EditQueryClientProps) {
  const router = useRouter();
  
  // Fetch the query to edit
  const {
    data: query,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['/api/db-qa/queries', id],
    queryFn: () => get(`/api/db-qa/queries/${id}`),
  });

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
  if (queryLoading || connectionsLoading || spacesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error if query not found or doesn't exist
  if (queryError || !query) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50 text-red-800">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Query not found</h3>
        </div>
        <p className="mb-4">
          The requested database quality check could not be found or you may not have permission to access it.
        </p>
        <Button 
          onClick={() => router.push('/db-qa/queries')}
          variant="outline"
        >
          Return to Queries
        </Button>
      </div>
    );
  }

  // Show error state for other data
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
        mode="edit"
        initialData={query}
        connections={connections} 
        spaces={spaces} 
      />
    </div>
  );
}