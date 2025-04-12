import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Bell, Settings, LogOut, User, LayoutTemplate, Plus } from "lucide-react";
import { WebSocketStatus } from "@/components/ui/websocket-status";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { collapsed } = useSidebarStore();
  const [location] = useLocation();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-border flex items-center justify-between px-4 h-14 sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        {/* Only show the BeakDash logo if the sidebar is collapsed */}
        {collapsed && (
          <div className="flex items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-primary"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        )}

        {/* Breadcrumb or page title can go here */}
        <h1 className="text-xl font-semibold">
          {isActive("/dashboard") ? "Dashboards" : 
           isActive("/widgets") ? "Widgets" : 
           isActive("/connections") ? "Connections" : 
           isActive("/datasets") ? "Datasets" : 
           isActive("/profile") ? "Profile" : 
           isActive("/settings") ? "Settings" : "Overview"}
        </h1>
        
        {/* Path-specific action buttons */}
        {isActive("/dashboard") && (
          <Button size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-1" />
            New Dashboard
          </Button>
        )}
        {isActive("/widgets") && (
          <Button size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-1" />
            New Widget
          </Button>
        )}
        {isActive("/connections") && (
          <Button size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-1" />
            New Connection
          </Button>
        )}
        {isActive("/datasets") && (
          <Button size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-1" />
            New Dataset
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="mr-2">
          <WebSocketStatus />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || user.username} />
                  <AvatarFallback>
                    {user.displayName?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user.displayName || user.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
