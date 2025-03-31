import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, LineChart, BarChart3, PieChart, Activity, Clock, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dashboard, InsertDashboard } from "@shared/schema";
import useDashboard from "@/hooks/use-dashboard";
import { useSpaces } from "@/hooks/use-spaces";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { dashboards, isLoading, createDashboard, isPending } = useDashboard();
  const { currentSpace } = useSpaces();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Create dashboard modal state
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState<InsertDashboard>({
    name: "",
    description: "",
    userId: user?.id || 0,
    spaceId: 0,
    layout: {}
  });
  
  // Handle input changes for the dashboard creation form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle dashboard creation
  const handleCreateDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDashboard.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Dashboard name is required",
        variant: "destructive",
      });
      return;
    }
    
    // Set the current space ID
    const dashboardWithSpace = {
      ...newDashboard,
      spaceId: currentSpace?.id || 0,
      userId: user?.id || 0
    };
    
    // Create the dashboard
    createDashboard(dashboardWithSpace, {
      onSuccess: (dashboard) => {
        setIsCreateDashboardOpen(false);
        // Reset the form
        setNewDashboard({
          name: "",
          description: "",
          userId: user?.id || 0,
          spaceId: 0,
          layout: {}
        });
        // Navigate to the new dashboard
        setTimeout(() => {
          setLocation(`/dashboard/${dashboard.id}`);
        }, 500);
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col space-y-6 p-6 md:p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName || user?.username}</h1>
            <p className="text-muted-foreground mt-1">
              {currentSpace ? 
                `Viewing your activity in ${currentSpace.name} space.` : 
                "Here's a summary of your dashboards and recent activity."}
            </p>
          </div>
          <Button 
            disabled={!currentSpace} 
            title={!currentSpace ? "Select a space to create a dashboard" : "Create a new dashboard"}
            onClick={() => {
              if (currentSpace) setIsCreateDashboardOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Dashboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : dashboards?.length || 0}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <LineChart className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Updated just now</span>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Widgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : "12"}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <BarChart3 className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Across all dashboards</span>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : "3"}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <PieChart className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Connected and active</span>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : "8"}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Activity className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Suggestions applied</span>
            </CardFooter>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-6">
          <h2 className="text-xl font-semibold">Recent Dashboards</h2>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              View All Dashboards
            </Button>
          </Link>
        </div>
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-28 w-full rounded-md" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))
          ) : dashboards && dashboards.length > 0 ? (
            dashboards.slice(0, 6).map((dashboard: Dashboard) => (
              <Card key={dashboard.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{dashboard.name}</CardTitle>
                    <Badge variant={dashboard.isActive ? "default" : "outline"}>
                      {dashboard.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {dashboard.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                    <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full p-3">
                      <div className="bg-background/50 rounded"></div>
                      <div className="bg-background/50 rounded"></div>
                      <div className="bg-background/50 rounded"></div>
                      <div className="bg-background/50 rounded"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Updated {new Date((dashboard.updatedAt || dashboard.createdAt || new Date()) as Date).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/dashboard/${dashboard.id}`}>
                    <Button variant="outline" size="sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mb-4">
                <PieChart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Create your first dashboard to start visualizing your data with powerful analytics and AI insights.
              </p>
              <Button 
                disabled={!currentSpace}
                title={!currentSpace ? "Select a space to create a dashboard" : "Create a new dashboard"}
                onClick={() => {
                  if (currentSpace) setIsCreateDashboardOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </Button>
              {!currentSpace && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please select a space first to create a dashboard.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isCreateDashboardOpen} onOpenChange={setIsCreateDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>
              {currentSpace ? 
                `Creating a dashboard in ${currentSpace?.name} space` : 
                "Please select a space before creating a dashboard"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateDashboard}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter dashboard name"
                  value={newDashboard.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter dashboard description"
                  value={newDashboard.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDashboardOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !currentSpace}>
                {isPending ? "Creating..." : "Create Dashboard"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}