import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dashboard } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();
  const [isAddingDashboard, setIsAddingDashboard] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");
  const queryClient = useQueryClient();

  // Fetch dashboards
  const { data: dashboards = [] } = useQuery<Dashboard[]>({
    queryKey: ['/api/dashboards'],
  });

  const [, navigate] = useLocation();
  const { mutate: createDashboard, isPending } = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, userId: 1 }), // Default to user 1 for now
      });
      
      if (!response.ok) {
        throw new Error('Failed to create dashboard');
      }
      
      return response.json();
    },
    onSuccess: (data: Dashboard) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      navigate(`/dashboard/${data.id}`);
    },
  });
  
  const handleAddDashboard = () => {
    if (isAddingDashboard && newDashboardName.trim()) {
      createDashboard(newDashboardName);
      setNewDashboardName("");
      setIsAddingDashboard(false);
    } else {
      setIsAddingDashboard(true);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-border hidden md:block overflow-y-auto">
      <div className="p-4">
        <Button className="w-full flex items-center justify-between" onClick={handleAddDashboard}>
          <span>+ New Dashboard</span>
        </Button>
        
        {isAddingDashboard && (
          <div className="mt-2">
            <input
              type="text"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              className="w-full p-2 text-sm border border-border rounded-md"
              placeholder="Dashboard name"
              autoFocus
            />
            <div className="flex mt-2 space-x-2">
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={handleAddDashboard}
                disabled={!newDashboardName}
              >
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAddingDashboard(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-theme(spacing.20))]">
        <div className="px-2 py-2">
          <h3 className="px-3 py-2 text-sm font-medium text-muted-foreground">Dashboards</h3>
          <div className="space-y-1">
            {dashboards.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No dashboards</p>
            ) : (
              dashboards.map((dashboard) => (
                <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
                  <Button
                    variant={location === `/dashboard/${dashboard.id}` || location === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {dashboard.name}
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="px-2 py-2">
          <h3 className="px-3 py-2 text-sm font-medium text-muted-foreground">Data</h3>
          <div className="space-y-1">
            <Link href="/connections">
              <Button
                variant={location === "/connections" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Connections
              </Button>
            </Link>
            <Link href="/datasets">
              <Button
                variant={location === "/datasets" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Database className="mr-2 h-4 w-4" />
                Datasets
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="px-2 py-2">
          <h3 className="px-3 py-2 text-sm font-medium text-muted-foreground">Settings</h3>
          <div className="space-y-1">
            <Link href="/settings">
              <Button
                variant={location === "/settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
