'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Space } from "@/lib/db/schema";
import Image from "next/image";
import {
  BarChart3,
  Database,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  FolderPlus,
  Search,
  ShieldCheck, // Added for DB QA
  CheckSquare
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
    <Link href={href}>
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
    createSpaceMutation,
    spaces: allSpaces = []
  } = useSpaces();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [browseSpacesOpen, setBrowseSpacesOpen] = useState(false);
  
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

  // Get a list of non-member spaces (spaces user can join)
  const memberSpaceIds = Array.isArray(userSpaces) 
    ? userSpaces.map((space: any) => space.id) 
    : [];
  
  const nonMemberSpaces = Array.isArray(allSpaces) 
    ? allSpaces.filter((space: any) => !memberSpaceIds.includes(space.id))
    : [];

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
                  <DropdownMenuContent align="center" className="w-56">
                    <div className="p-2 text-center font-medium text-sm">Your Spaces</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deselectCurrentSpace()}
                      className={cn(!currentSpaceId && "bg-muted")}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      <span className="truncate">All Spaces</span>
                    </DropdownMenuItem>
                    
                    {safeUserSpaces.length > 0 ? (
                      <>
                        {safeUserSpaces.map((space: any) => (
                          <DropdownMenuItem 
                            key={space.id}
                            className={cn(space.id === currentSpaceId && "bg-muted")}
                            onClick={() => setCurrentSpaceId(space.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{space.name}</span>
                              {space.role && (
                                <span className="ml-auto text-xs text-muted-foreground">{space.role}</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : (
                      <DropdownMenuItem disabled>
                        <span className="text-xs text-muted-foreground">No spaces yet</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild onClick={() => setCreateSpaceOpen(true)}>
                      <DropdownMenuItem>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        <span>New Space</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuItem onClick={() => setBrowseSpacesOpen(true)}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Browse Spaces</span>
                    </DropdownMenuItem>
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
                    userSpaces.find((space: any) => space && space.id === currentSpaceId)?.name || "Default" : 
                    "All Spaces"
                  }
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="p-2 font-medium text-sm flex items-center justify-between">
              <span>Your Spaces</span>
              <Link href="/spaces" className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </div>
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
            
            {Array.isArray(userSpaces) && userSpaces.length > 0 ? (
              userSpaces.map((space: any) => (
                <DropdownMenuItem 
                  key={space.id} 
                  onClick={() => setCurrentSpaceId(space.id)}
                  className={cn(space.id === currentSpaceId && "bg-muted")}
                >
                  <div className="flex items-center w-full">
                    <Globe className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{space.name}</span>
                    {space.role && (
                      <span className="ml-auto text-xs text-muted-foreground">{space.role}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="opacity-50 italic text-sm">
                No spaces joined yet
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DialogTrigger asChild onClick={() => setCreateSpaceOpen(true)}>
              <DropdownMenuItem>
                <FolderPlus className="mr-2 h-4 w-4" />
                <span>New Space</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={() => setBrowseSpacesOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              <span>Browse Available Spaces</span>
            </DropdownMenuItem>
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
      
      {/* Browse Spaces Dialog */}
      <Dialog open={browseSpacesOpen} onOpenChange={setBrowseSpacesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Browse Available Spaces</DialogTitle>
            <DialogDescription>
              Discover spaces you can join and collaborate with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {nonMemberSpaces.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No spaces available</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  You have already joined all available spaces or there are no other spaces yet.
                </p>
                <Button 
                  onClick={() => {
                    setBrowseSpacesOpen(false);
                    setCreateSpaceOpen(true);
                  }}
                  className="mx-auto"
                >
                  Create a new space
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonMemberSpaces.map((space: any) => (
                  <div key={space.id} className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{space.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {space.description || "No description available"}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {space.logoUrl ? (
                          <Image src={space.logoUrl} alt={space.name} width={24} height={24} />
                        ) : (
                          <Globe className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(space.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <form action={`/api/spaces/${space.id}/join`} method="POST" className="mt-auto">
                      <Button 
                        type="submit" 
                        className="w-full"
                        variant="outline"
                      >
                        Join Space
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrowseSpacesOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarStore();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Instead of returning null, render a loading state with minimal width
  // This will prevent layout shifts and keep the sidebar structure intact
  if (!user) {
    return (
      <aside className={`${collapsed ? 'w-20' : 'w-64'} h-screen overflow-y-auto flex-shrink-0 flex flex-col border-r min-h-screen transition-all duration-300`}>
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
        style={{ transform: 'translateX(50%)', top: '16px' }}
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
          active={pathname === "/"} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/dashboard" 
          icon={Layers} 
          label="Dashboards" 
          active={isActive("/dashboard") && pathname !== "/"} 
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
        
        {!collapsed && <p className="text-xs font-medium text-muted-foreground px-4 mt-5 mb-2">DATABASE QA</p>}
        {collapsed && <div className="h-8"></div>}
        <NavItem 
          href="/db-qa/queries" 
          icon={ShieldCheck} 
          label="Quality Checks" 
          active={isActive("/db-qa/queries")} 
          collapsed={collapsed} 
        />
        <NavItem 
          href="/db-qa/alerts" 
          icon={CheckSquare} 
          label="QA Alerts" 
          active={isActive("/db-qa/alerts")} 
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
      
      <div className={`mt-auto pb-2 pt-1 px-4 border-t ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <div className="p-2 border-b">
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email || ""}</p>
              </div>
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
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
                    <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[140px]">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email || ""}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
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