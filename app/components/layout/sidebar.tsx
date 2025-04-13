import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Space } from "@/lib/db/schema";
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
  ChevronRight,
  Globe,
  Users,
  Clock,
  Plus,
  FolderPlus
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useSpaces } from "@/lib/hooks/use-spaces";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

// Form schema for creating a new space
const createSpaceSchema = z.object({
  name: z.string().min(1, { message: "Space name is required" }).max(50),
  description: z.string().max(500).optional(),
});

type CreateSpaceForm = z.infer<typeof createSpaceSchema>;

// Create a component for space selection in sidebar
function SpaceSelector({ collapsed }: { collapsed: boolean }) {
  const { 
    userSpaces, 
    isLoadingUserSpaces, 
    currentSpaceId, 
    setCurrentSpaceId, 
    deselectCurrentSpace,
    createSpaceMutation 
  } = useSpaces();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  
  const form = useForm<CreateSpaceForm>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: CreateSpaceForm) {
    createSpaceMutation.mutate({
      name: data.name,
      description: data.description || "",
      logoUrl: null,
      settings: {},
      isPrivate: false,
    });
    setCreateSpaceOpen(false);
    form.reset();
  }

  if (isLoadingUserSpaces) {
    return (
      <div className="space-y-2 mt-2 mb-4">
        {!collapsed && <p className="text-xs font-medium text-muted-foreground px-4 mb-2">SPACES</p>}
        <div className="px-3">
          <Skeleton className="h-9 w-full rounded" />
        </div>
      </div>
    );
  }

  // If collapsed, show just the current space with a tooltip
  if (collapsed) {
    const safeUserSpaces = Array.isArray(userSpaces) ? userSpaces : [];
    const currentSpace = safeUserSpaces.find((space: Space) => space.id === currentSpaceId);
    
    return (
      <div className="space-y-1 mt-2 mb-4">
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9 rounded-full"
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <div className="p-2 text-center font-medium text-sm">Spaces</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deselectCurrentSpace()}
                      className={cn(!currentSpaceId && "bg-muted")}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      <span className="truncate">All Spaces</span>
                    </DropdownMenuItem>
                    {safeUserSpaces.map((space: Space) => (
                      <DropdownMenuItem 
                        key={space.id}
                        className={cn(space.id === currentSpaceId && "bg-muted")}
                        onClick={() => setCurrentSpaceId(space.id)}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        <span className="truncate">{space.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild onClick={() => setCreateSpaceOpen(true)}>
                      <DropdownMenuItem>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        <span>New Space</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">Current Space:</p>
                <p>{currentSpace && 'name' in currentSpace ? currentSpace.name : "All Spaces"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // If expanded, show the space selection dropdown
  return (
    <div className="space-y-1 my-3">
      <p className="text-xs font-medium text-muted-foreground px-4 mb-2">SPACES</p>
      <div className="px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {Array.isArray(userSpaces) && userSpaces.length > 0 && currentSpaceId ? 
                    userSpaces.find((space: Space) => space && space.id === currentSpaceId && 'name' in space)?.name || "Default" : 
                    "All Spaces"
                  }
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem 
              className="font-medium"
              disabled
            >
              Select Space
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => deselectCurrentSpace()}
              className={cn(!currentSpaceId && "bg-muted")}
            >
              <div className="flex items-center w-full">
                <Globe className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">All Spaces</span>
              </div>
            </DropdownMenuItem>
            
            {Array.isArray(userSpaces) && userSpaces.length > 0 ? userSpaces
              .filter((space: Space) => space && 'id' in space && 'name' in space)
              .map((space: Space) => (
                <DropdownMenuItem 
                  key={space.id} 
                  onClick={() => setCurrentSpaceId(space.id)}
                  className={cn(space.id === currentSpaceId && "bg-muted")}
                >
                  <div className="flex items-center w-full">
                    <Globe className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{space.name}</span>
                  </div>
                </DropdownMenuItem>
              )) : null}
            <DropdownMenuSeparator />
            <DialogTrigger asChild onClick={() => setCreateSpaceOpen(true)}>
              <DropdownMenuItem>
                <FolderPlus className="mr-2 h-4 w-4" />
                <span>New Space</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Space Dialog */}
      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new space</DialogTitle>
            <DialogDescription>
              Spaces help you organize dashboards and share them with your team.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Space" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your space a descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A space for marketing dashboards..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help others understand the purpose of this space.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateSpaceOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createSpaceMutation.isPending}
                >
                  {createSpaceMutation.isPending ? "Creating..." : "Create Space"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
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
        <div className={`px-6 h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
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
      <div className={`px-6 h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
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
        className="absolute -right-0 h-6 w-6 rounded-full border border-primary shadow-md z-50 hover:bg-primary hover:text-white transition-colors"
        onClick={toggleCollapsed}
        style={{ transform: 'translateX(50%)', top: '21px' }}
      >
        {collapsed ? 
          <ChevronRight className="h-3 w-3" /> : 
          <ChevronLeft className="h-3 w-3" />
        }
      </Button>
      
      <Separator />
      
      <div className="flex-1 px-3 py-4 space-y-1">
        <Dialog>
          <SpaceSelector collapsed={collapsed} />
        </Dialog>
        
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