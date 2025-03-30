import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Dashboard } from "@shared/schema";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0]);
        if (!res.ok) return { id: 1, username: "demo", displayName: "Demo User" } as User;
        return res.json();
      } catch (error) {
        // For demo, return a mock user
        return { id: 1, username: "demo", displayName: "Demo User" } as User;
      }
    },
  });

  // Fetch user dashboards
  const { data: dashboards = [] } = useQuery<Dashboard[]>({
    queryKey: ['/api/dashboards'],
    enabled: !!user,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User>) => {
      return apiRequest('PUT', `/api/users/${user?.id}`, updatedUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedUser = {
      displayName: formData.get('displayName') as string,
      // Add other user fields as needed
    };
    
    if (user) {
      updateProfileMutation.mutate(updatedUser);
    }
  };

  const [appearance, setAppearance] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultDashboardId, setDefaultDashboardId] = useState<string>("");

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted">
          <div className="container mx-auto py-6 px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure your general dashboard settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultDashboard">Default Dashboard</Label>
                      <Select 
                        value={defaultDashboardId} 
                        onValueChange={setDefaultDashboardId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a default dashboard" />
                        </SelectTrigger>
                        <SelectContent>
                          {dashboards.map((dashboard) => (
                            <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                              {dashboard.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="UTC">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                          <SelectItem value="CST">Central Time (CST)</SelectItem>
                          <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                          <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select defaultValue="MM/DD/YYYY">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          name="username" 
                          defaultValue={user?.username} 
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          name="displayName" 
                          defaultValue={user?.displayName || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          defaultValue="user@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          name="currentPassword" 
                          type="password"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          name="newPassword" 
                          type="password"
                          placeholder="Enter a new password"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Appearance Settings */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how BeakDash looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={appearance === "light" ? "default" : "outline"}
                          onClick={() => setAppearance("light")}
                          className="justify-start"
                        >
                          Light
                        </Button>
                        <Button
                          type="button"
                          variant={appearance === "dark" ? "default" : "outline"}
                          onClick={() => setAppearance("dark")}
                          className="justify-start"
                        >
                          Dark
                        </Button>
                        <Button
                          type="button"
                          variant={appearance === "system" ? "default" : "outline"}
                          onClick={() => setAppearance("system")}
                          className="justify-start"
                        >
                          System
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density">Interface Density</Label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue placeholder="Select interface density" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Enable Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for important events
                        </p>
                      </div>
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Types</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dashboard Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Notify when dashboards are modified
                          </p>
                        </div>
                        <Switch defaultChecked={true} disabled={!notificationsEnabled} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Notify when data meets specific thresholds
                          </p>
                        </div>
                        <Switch defaultChecked={true} disabled={!notificationsEnabled} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Messages</p>
                          <p className="text-sm text-muted-foreground">
                            Important system and maintenance notifications
                          </p>
                        </div>
                        <Switch defaultChecked={true} disabled={!notificationsEnabled} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
