import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import DatasetDialog from "@/components/datasets/dataset-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Trash2, Edit, PlusCircle, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dataset } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Datasets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch datasets
  const { data: datasets = [], isLoading, isError } = useQuery({
    queryKey: ['/api/datasets'],
  });

  // Fetch connections for reference
  const { data: connections = [] } = useQuery({
    queryKey: ['/api/connections'],
  });

  // Delete dataset mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/datasets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      toast({
        title: "Dataset deleted",
        description: "The dataset has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete dataset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mock data preview - this would come from the actual dataset in a real app
  const getSampleData = () => {
    return [
      { month: "Jan", region: "North", sales: 120, revenue: 12450, profit: 4320 },
      { month: "Jan", region: "South", sales: 95, revenue: 9820, profit: 3150 },
      { month: "Feb", region: "North", sales: 145, revenue: 15230, profit: 5450 },
      { month: "Feb", region: "South", sales: 110, revenue: 11500, profit: 3900 },
      { month: "Mar", region: "North", sales: 170, revenue: 17800, profit: 6200 },
    ];
  };

  const handleAddDataset = () => {
    setEditingDataset(null);
    setIsDialogOpen(true);
  };

  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setIsDialogOpen(true);
  };

  const handlePreviewDataset = (dataset: Dataset) => {
    // In a real app, this would fetch the actual data
    setPreviewData(getSampleData());
    toast({
      title: "Data Preview",
      description: "Sample data loaded for preview.",
    });
  };

  const handleDeleteDataset = (id: number) => {
    if (window.confirm("Are you sure you want to delete this dataset?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDataset(null);
  };

  const getConnectionName = (connectionId: number) => {
    const connection = connections.find(c => c.id === connectionId);
    return connection ? connection.name : "Unknown";
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Datasets</h2>
              <Button onClick={handleAddDataset}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Dataset
              </Button>
            </div>

            {isLoading ? (
              <Card className="animate-pulse">
                <CardHeader className="h-16 bg-muted"></CardHeader>
                <CardContent className="h-64 bg-muted mt-4"></CardContent>
              </Card>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-destructive">
                    Error loading datasets. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : datasets.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Datasets</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Create your first dataset to start visualizing data.
                  </p>
                  <Button onClick={handleAddDataset}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Dataset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Datasets</CardTitle>
                    <CardDescription>
                      Manage your datasets for use in dashboard widgets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Connection</TableHead>
                          <TableHead>Refresh</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {datasets.map((dataset) => (
                          <TableRow key={dataset.id}>
                            <TableCell className="font-medium">{dataset.name}</TableCell>
                            <TableCell>{getConnectionName(dataset.connectionId)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {dataset.refreshInterval || "Manual"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(dataset.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePreviewDataset(dataset)}
                                >
                                  <Database className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditDataset(dataset)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteDataset(dataset.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {previewData && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Data Preview</CardTitle>
                        <CardDescription>
                          Sample data from the selected dataset
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewData(null)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-auto max-h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(previewData[0]).map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.map((row, i) => (
                              <TableRow key={i}>
                                {Object.values(row).map((value, j) => (
                                  <TableCell key={j}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dataset Dialog */}
      {isDialogOpen && (
        <DatasetDialog
          dataset={editingDataset}
          connections={connections}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
