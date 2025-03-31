import { Link } from "wouter";
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
import { Search, Bell, Settings, LogOut, User, LayoutTemplate } from "lucide-react";
import { WebSocketStatus } from "@/components/ui/websocket-status";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-white border-b border-border flex items-center justify-between px-4 h-14 sticky top-0 z-30">
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-primary mr-2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h1 className="text-xl font-semibold">BeakDash</h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="px-3 py-1.5 text-sm rounded-md">
              Dashboards
            </Button>
          </Link>
          <Link href="/connections">
            <Button variant="ghost" className="px-3 py-1.5 text-sm rounded-md">
              Connections
            </Button>
          </Link>
          <Link href="/datasets">
            <Button variant="ghost" className="px-3 py-1.5 text-sm rounded-md">
              Datasets
            </Button>
          </Link>
          <Link href="/widgets">
            <Button variant="ghost" className="px-3 py-1.5 text-sm rounded-md">
              <LayoutTemplate className="mr-1 h-4 w-4" />
              Widgets
            </Button>
          </Link>
        </div>
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
