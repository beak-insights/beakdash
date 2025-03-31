import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Database,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  PanelRight,
  Layers,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 rounded-lg px-3 py-2 text-left",
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  if (!user) {
    return null;
  }

  return (
    <aside className="w-64 flex flex-col border-r min-h-screen">
      <div className="px-6 py-5 flex items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">BeakDash</h2>
      </div>
      
      <Separator />
      
      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-4 mb-2">MAIN</p>
        <NavItem href="/" icon={LayoutDashboard} label="Overview" active={location === "/"} />
        <NavItem href="/dashboard" icon={Layers} label="Dashboards" active={isActive("/dashboard") && location !== "/"} />
        <NavItem href="/widgets" icon={PanelRight} label="Widgets" active={isActive("/widgets")} />
        
        <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">DATA</p>
        <NavItem href="/connections" icon={Database} label="Connections" active={isActive("/connections")} />
        <NavItem href="/datasets" icon={BarChart3} label="Datasets" active={isActive("/datasets")} />
        
        <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">ACCOUNT</p>
        <NavItem href="/profile" icon={User} label="Profile" active={isActive("/profile")} />
        <NavItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} />
      </div>
      
      <div className="mt-auto p-4 border-t">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                  <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[140px]">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email || ""}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <Link to="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}