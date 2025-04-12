import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSpaces } from "@/hooks/use-spaces";
import { User, Dashboard, Space } from "@schema";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    spaces, 
    userSpaces, 
    currentSpaceId,  
    updateDefaultSpace 
  } = useSpaces();

  // Fetch user dashboards
  const { data: dashboards = [] } = useQuery<Dashboard[]>({
    queryKey: ['/api/dashboards'],
    enabled: !!user,
  });

  const [appearance, setAppearance] = useState(user?.theme || "light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultDashboardId, setDefaultDashboardId] = useState<string>("");
  const [defaultSpaceId, setDefaultSpaceId] = useState<string>(
    currentSpaceId ? currentSpaceId.toString() : "null"
  );
  
  // Fetch user settings to get default space on mount
  useEffect(() => {
    if (user?.id) {
      // Get current preference from user settings
      fetch(`/api/user/settings/${user.id}`)
        .then(res => res.json())
        .then(settings => {
          if (settings && settings.defaultSpaceId !== undefined) {
            setDefaultSpaceId(settings.defaultSpaceId === null ? "null" : settings.defaultSpaceId.toString());
          }
        })
        .catch(err => console.error("Error loading user settings:", err));
    }
  }, [user]);
  
  const handleSaveAppearance = () => {
    toast({
      title: "Appearance updated",
      description: "Your appearance settings have been saved",
    });
  };
  
  const handleSaveGeneral = () => {
    // Update default space preference
    if (user?.id) {
      updateDefaultSpace(defaultSpaceId === "null" ? null : Number(defaultSpaceId));
    }
    
    toast({
      title: "Settings updated",
      description: "Your general settings have been saved",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification settings have been saved",
    });
  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Application Settings</h2>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="general">General</TabsTrigger>
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
                  <Label htmlFor="defaultSpace">Default Space</Label>
                  <Select 
                    value={defaultSpaceId} 
                    onValueChange={setDefaultSpaceId}
                  >
                    <SelectTrigger id="defaultSpace">
                      <SelectValue placeholder="Select a default space" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">All Spaces</SelectItem>
                      {userSpaces && userSpaces.length > 0 && userSpaces.map((space) => (
                        <SelectItem key={space.id} value={space.id.toString()}>
                          {space.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This space will be automatically selected when you log in
                  </p>
                </div>
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
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
              </CardFooter>
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
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSaveAppearance}>Save Changes</Button>
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
                  <h4 className="font-medium">Application Notifications</h4>
                  
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
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
