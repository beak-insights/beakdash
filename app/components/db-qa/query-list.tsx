"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icons } from "@/components/ui/icons";

// Define query item structure for type safety
export interface DbQaQueryItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  query: string;
  enabled: boolean;
  connection_id: number;
  connection_name?: string;
  space_id: number | null;
  space_name?: string | null;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_metrics: Record<string, any> | null;
  success_count: number;
  warning_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

interface QueryListProps {
  queries: DbQaQueryItem[];
  onDelete: (id: number) => void;
  onRunQuery: (id: number) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  isRunning?: boolean;
}

export function QueryList({
  queries,
  onDelete,
  onRunQuery,
  isLoading = false,
  isDeleting = false,
  isRunning = false,
}: QueryListProps) {
  const router = useRouter();

  // Format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Format category display name
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get status badge variant based on last run status
  const getStatusBadge = (status: string | null) => {
    if (!status) return { variant: "outline" as const, label: "Not Run" };
    
    switch (status.toLowerCase()) {
      case "success":
        return { variant: "default" as const, label: "Success" };
      case "warning":
        return { variant: "secondary" as const, label: "Warning" };
      case "error":
        return { variant: "destructive" as const, label: "Error" };
      default:
        return { variant: "outline" as const, label: status };
    }
  };

  // If no queries, show empty state
  if (queries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Quality Checks Found</CardTitle>
          <CardDescription>
            Create your first database quality check to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Icons.database className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No database quality checks have been created yet.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/db-qa/queries/new")}
            >
              Create Check
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {queries.map((query) => {
        const status = getStatusBadge(query.last_run_status);
        
        return (
          <Card key={query.id} className="relative">
            {!query.enabled && (
              <div className="absolute right-2 top-2">
                <Badge variant="outline" className="bg-muted">
                  Disabled
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2" variant="outline">
                    {formatCategoryName(query.category)}
                  </Badge>
                  <CardTitle className="line-clamp-1">{query.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {query.description || "No description"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Connection</p>
                    <p className="font-medium">{query.connection_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Space</p>
                    <p className="font-medium">{query.space_name || "Global"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Run</p>
                    <p className="font-medium">{formatDate(query.last_run_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
                
                {query.last_run_metrics && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Last Run Metrics
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-sm font-medium">{query.success_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Warnings</p>
                        <p className="text-sm font-medium">{query.warning_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Errors</p>
                        <p className="text-sm font-medium">{query.error_count}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/db-qa/queries/${query.id}`}>
                    Edit
                  </Link>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Query</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{query.name}"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(query.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <Button
                size="sm"
                onClick={() => onRunQuery(query.id)}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Icons.play className="mr-2 h-4 w-4" />
                    Run
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}