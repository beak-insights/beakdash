"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/components/ui/use-toast";

// Interface for DB QA query data
export interface DbQaQueryItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  connection_name: string;
  space_name: string | null;
  enabled: boolean;
  execution_frequency: string;
  last_execution_time: string | null;
  last_status: string | null;
  execution_count: number;
  created_at: string;
}

interface QueryListProps {
  queries: DbQaQueryItem[];
  isLoading: boolean;
  onDelete: (id: number) => Promise<void>;
  onRunQuery: (id: number) => Promise<void>;
}

export function QueryList({ queries, isLoading, onDelete, onRunQuery }: QueryListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedQueryId, setSelectedQueryId] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState<Record<number, boolean>>({});
  
  // Format category from snake_case to Title Case
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get status badge color based on status
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get frequency badge
  const getFrequencyBadge = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'manual':
        return <Badge variant="outline" className="bg-slate-50">Manual</Badge>;
      case 'hourly':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Hourly</Badge>;
      case 'daily':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Daily</Badge>;
      case 'weekly':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Weekly</Badge>;
      case 'monthly':
        return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Monthly</Badge>;
      default:
        return <Badge variant="outline">{frequency}</Badge>;
    }
  };
  
  // Handler for delete confirmation
  const handleConfirmDelete = async () => {
    if (selectedQueryId === null) return;
    
    setIsDeleting(true);
    try {
      await onDelete(selectedQueryId);
      toast({
        title: "Query deleted",
        description: "The query has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting query:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedQueryId(null);
    }
  };
  
  // Handler for running a query
  const handleRunQuery = async (id: number) => {
    setIsRunning(prev => ({ ...prev, [id]: true }));
    
    try {
      await onRunQuery(id);
      toast({
        title: "Query executed",
        description: "The query has been successfully executed.",
      });
    } catch (error) {
      console.error("Error running query:", error);
      toast({
        title: "Execution failed",
        description: "Failed to execute the query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(prev => ({ ...prev, [id]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading queries...</p>
      </div>
    );
  }
  
  if (queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
        <Icons.database className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No queries found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating your first database quality check.
        </p>
        <Button asChild>
          <Link href="/db-qa/queries/new">
            Create New Query
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.map((query) => (
              <TableRow key={query.id}>
                <TableCell className="font-medium">
                  <Link 
                    href={`/db-qa/queries/${query.id}`} 
                    className="hover:underline text-blue-600"
                  >
                    {query.name}
                  </Link>
                  {query.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {query.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>{formatCategory(query.category)}</TableCell>
                <TableCell>{query.connection_name}</TableCell>
                <TableCell>{query.space_name || '-'}</TableCell>
                <TableCell>{getFrequencyBadge(query.execution_frequency)}</TableCell>
                <TableCell>
                  {query.last_execution_time 
                    ? formatDate(new Date(query.last_execution_time), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) 
                    : "Never"}
                </TableCell>
                <TableCell>
                  {getStatusBadge(query.last_status)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunQuery(query.id)}
                      disabled={isRunning[query.id]}
                    >
                      {isRunning[query.id] ? (
                        <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Icons.play className="h-4 w-4 mr-1" />
                      )}
                      Run
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQueryId(query.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this query and all its execution history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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
    </>
  );
}