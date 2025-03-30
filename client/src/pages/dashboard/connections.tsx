import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ConnectionDialog from "@/components/connections/connection-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Database, Trash2, Edit, FileText, Link, Globe, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ConnectionType, Connection } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Connections() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch connections
  const { data: connections = [], isLoading, isError } = useQuery({
    queryKey: ['/api/connections'],
  });

  // Delete connection mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection deleted",
        description: "The connection has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddConnection = () => {
    setEditingConnection(null);
    setIsDialogOpen(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setIsDialogOpen(true);
  };

  const handleDeleteConnection = (id: number) => {
    if (window.confirm("Are you sure you want to delete this connection?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingConnection(null);
  };

  const getConnectionIcon = (type: ConnectionType) => {
    switch (type) {
      case "csv":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "rest":
        return <Globe className="h-5 w-5 text-green-500" />;
      case "sql":
        return <Database className="h-5 w-5 text-purple-500" />;
      default:
        return <Link className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Data Connections</h2>
              <Button onClick={handleAddConnection}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Connection
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted"></CardHeader>
                    <CardContent className="h-20 bg-muted mt-4"></CardContent>
                    <CardFooter className="h-12 bg-muted mt-4"></CardFooter>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-destructive">
                    Error loading connections. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : connections.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
                  <Link className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Connections</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Add your first data connection to get started with your dashboard.
                  </p>
                  <Button onClick={handleAddConnection}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Connection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getConnectionIcon(connection.type as ConnectionType)}
                          <CardTitle>{connection.name}</CardTitle>
                        </div>
                        <Badge>{connection.type}</Badge>
                      </div>
                      <CardDescription>
                        Created on {formatDate(connection.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {connection.config ? (
                          connection.type === "csv" ? (
                            `CSV file with ${connection.config.hasHeaders ? "headers" : "no headers"}`
                          ) : connection.type === "rest" ? (
                            `REST API: ${connection.config.url || "No URL specified"}`
                          ) : connection.type === "sql" ? (
                            `SQL Database: ${connection.config.database || "Not specified"}`
                          ) : (
                            "Configuration available"
                          )
                        ) : (
                          "No configuration details"
                        )}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditConnection(connection)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteConnection(connection.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Connection Dialog */}
      {isDialogOpen && (
        <ConnectionDialog
          connection={editingConnection}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
