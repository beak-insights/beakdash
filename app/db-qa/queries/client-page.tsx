"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/db-qa/category-filter";
import { QueryList } from "@/components/db-qa/query-list";
import { useDbQaQueries } from "@/lib/hooks/use-db-qa-queries";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/ui/icons";

export function DbQaQueriesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Get current filter values from URL or use defaults
  const defaultCategory = searchParams.get("category") || "all";
  const defaultSpaceId = searchParams.get("spaceId") || null;
  const defaultConnectionId = searchParams.get("connectionId") || null;
  
  // State for filters
  const [category, setCategory] = useState(defaultCategory);
  const [spaceId, setSpaceId] = useState(defaultSpaceId);
  const [connectionId, setConnectionId] = useState(defaultConnectionId);
  
  // Fetch queries with current filters
  const { 
    queries, 
    isLoading, 
    error, 
    refetch, 
    deleteQuery, 
    isDeleting,
    runQuery,
    isRunning, 
  } = useDbQaQueries({
    category,
    spaceId,
    connectionId,
  });
  
  // Update URL when filters change
  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Create new URL with updated params
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };
  
  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    updateQueryParams({ category: newCategory });
  };
  
  // Handle query deletion
  const handleDeleteQuery = async (id: number) => {
    try {
      await deleteQuery(id);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle running a query
  const handleRunQuery = async (id: number) => {
    try {
      await runQuery(id);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to run query: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };
  
  // Show error state if needed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icons.warning className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-lg font-medium">Error loading queries</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {(error as Error).message || "An unknown error occurred"}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Database Quality Checks</h1>
          <p className="text-muted-foreground">
            Manage and monitor the quality of your database with custom quality checks.
          </p>
        </div>
        <Button asChild>
          <Link href="/db-qa/queries/new">
            <Icons.add className="mr-2 h-4 w-4" />
            Create New Query
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <CategoryFilter
          currentCategory={category}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      
      <QueryList
        queries={queries}
        isLoading={isLoading}
        onDelete={handleDeleteQuery}
        onRunQuery={handleRunQuery}
      />
    </div>
  );
}