import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Database,
  Home,
  LogOut,
  Settings,
  Share2,
  User,
  PanelRight,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
            <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.displayName || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email || ""}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-4 mb-2">MAIN</p>
        <NavItem href="/" icon={Home} label="Dashboard" active={isActive("/")} />
        <NavItem href="/dashboards" icon={Layers} label="My Dashboards" active={isActive("/dashboards")} />
        <NavItem href="/widgets" icon={PanelRight} label="Widgets" active={isActive("/widgets")} />
        
        <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">DATA</p>
        <NavItem href="/connections" icon={Database} label="Connections" active={isActive("/connections")} />
        <NavItem href="/datasets" icon={BarChart3} label="Datasets" active={isActive("/datasets")} />
        <NavItem href="/share" icon={Share2} label="Shared" active={isActive("/share")} />
        
        <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">ACCOUNT</p>
        <NavItem href="/profile" icon={User} label="Profile" active={isActive("/profile")} />
        <NavItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} />
      </div>
      
      <div className="px-3 py-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}