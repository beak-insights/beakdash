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
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
import { useSidebarStore } from "@/store/sidebar-store";

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

function NavItem({ href, icon: Icon, label, active, collapsed }: NavItemProps) {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        title={collapsed ? label : undefined}
        className={cn(
          "w-full rounded-lg px-3 py-2 text-left",
          collapsed ? "justify-center px-2" : "justify-start gap-3",
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {!collapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarStore();

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

  // Instead of returning null, render a loading state with minimal width
  // This will prevent layout shifts and keep the sidebar structure intact
  if (!user) {
    return (
      <aside className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col border-r min-h-screen transition-all duration-300`}>
        <div className={`px-6 py-5 flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
          {collapsed ? (
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">B</span>
          ) : (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">BeakDash</h2>
          )}
        </div>
        <Separator />
        <div className="flex-1 px-3 py-4">
          {/* Skeleton loading state */}
          <div className="animate-pulse space-y-3">
            <div className={`h-3 ${collapsed ? 'w-10' : 'w-24'} bg-muted rounded mx-auto`}></div>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className={`h-3 ${collapsed ? 'w-10' : 'w-24'} bg-muted rounded mt-4 mx-auto`}></div>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-8 w-full bg-muted rounded"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col border-r min-h-screen transition-all duration-300 relative`}>
      <div className={`px-6 py-5 flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
        {collapsed ? (
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">B</span>
        ) : (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">BeakDash</h2>
        )}
      </div>
      
      {/* Toggle collapse button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute -right-4 h-8 w-8 rounded-full border border-primary shadow-md z-50 hover:bg-primary hover:text-white transition-colors"
        onClick={toggleCollapsed}
        style={{ transform: 'translateX(50%)', top: '50%', marginTop: '-16px' }}
      >
        {collapsed ? 
          <ChevronRight className="h-4 w-4" /> : 
          <ChevronLeft className="h-4 w-4" />
        }
      </Button>
      
      <Separator />
      
      <div className="flex-1 px-3 py-4 space-y-1">
        {!collapsed && <p className="text-xs font-medium text-muted-foreground px-4 mb-2">MAIN</p>}
        {collapsed && <div className="h-5"></div>}
        <NavItem 
          href="/" 
          icon={LayoutDashboard} 
          label="Overview" 
          active={location === "/"} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/dashboard" 
          icon={Layers} 
          label="Dashboards" 
          active={isActive("/dashboard") && location !== "/"} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/widgets" 
          icon={PanelRight} 
          label="Widgets" 
          active={isActive("/widgets")} 
          collapsed={collapsed} 
        />
        
        {!collapsed && <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">DATA</p>}
        {collapsed && <div className="h-8"></div>}
        <NavItem 
          href="/connections" 
          icon={Database} 
          label="Connections" 
          active={isActive("/connections")} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/datasets" 
          icon={BarChart3} 
          label="Datasets" 
          active={isActive("/datasets")} 
          collapsed={collapsed} 
        />
        
        {!collapsed && <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">ACCOUNT</p>}
        {collapsed && <div className="h-8"></div>}
        <NavItem 
          href="/profile" 
          icon={User} 
          label="Profile" 
          active={isActive("/profile")} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/settings" 
          icon={Settings} 
          label="Settings" 
          active={isActive("/settings")} 
          collapsed={collapsed} 
        />
      </div>
      
      <div className={`mt-auto p-4 border-t ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                  <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <div className="p-2 border-b">
                <p className="text-sm font-medium">{user.displayName || user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email || ""}</p>
              </div>
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
        ) : (
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
        )}
      </div>
    </aside>
  );
}