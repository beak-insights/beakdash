import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Save } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  displayName: z.string().min(1, { message: "Display name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  language: z.string().optional(),
  theme: z.string().optional(),
  timeZone: z.string().optional(),
});

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const timeZones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

type ProfileFormValues = z.infer<typeof profileSchema>;

type NotificationSetting = {
  id: string;
  name: string;
  description: string;
  checked: boolean;
};

export default function ProfilePage() {
  const { user, updateProfileMutation, updateSettingsMutation } = useAuth();
  const { toast } = useToast();
  // Initialize with default values
  const userSettings = user?.settings as Record<string, any> || {};
  const notificationsSettings = userSettings.notifications || {};
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: "dashboard_updates",
      name: "Dashboard Updates",
      description: "Get notified when your dashboards are updated",
      checked: notificationsSettings.dashboard_updates ?? true,
    },
    {
      id: "data_alerts",
      name: "Data Alerts",
      description: "Get notified about important data changes",
      checked: notificationsSettings.data_alerts ?? true,
    },
    {
      id: "system_notifications",
      name: "System Notifications",
      description: "Receive system and maintenance notifications",
      checked: notificationsSettings.system_notifications ?? true,
    },
    {
      id: "ai_suggestions",
      name: "AI Suggestions",
      description: "Get suggestions from the AI assistant",
      checked: notificationsSettings.ai_suggestions ?? true,
    },
  ]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
      language: user?.language || "en",
      theme: user?.theme || "light",
      timeZone: user?.timeZone || "UTC",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    
    updateProfileMutation.mutate({
      id: user.id,
      data,
    });
  };

  const onNotificationSettingChange = (id: string, checked: boolean) => {
    const updatedSettings = notificationSettings.map((setting) =>
      setting.id === id ? { ...setting, checked } : setting
    );
    
    setNotificationSettings(updatedSettings);
    
    // Save notification settings to backend
    if (!user) return;
    
    const settingsObj = updatedSettings.reduce((acc, setting) => {
      return {
        ...acc,
        [setting.id]: setting.checked,
      };
    }, {});
    
    updateSettingsMutation.mutate({
      id: user.id,
      settings: {
        notifications: settingsObj,
      },
    });
  };

  const saveAllNotificationSettings = () => {
    if (!user) return;
    
    const settingsObj = notificationSettings.reduce((acc, setting) => {
      return {
        ...acc,
        [setting.id]: setting.checked,
      };
    }, {});
    
    updateSettingsMutation.mutate({
      id: user.id,
      settings: {
        notifications: settingsObj,
      },
    });
    
    toast({
      title: "Settings saved",
      description: "Your notification settings have been updated",
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Please log in to view your profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">User Profile & Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile picture</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || user.username} />
                      <AvatarFallback className="text-3xl">
                        {(user.displayName || user.username)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="mt-2">
                      Change Picture
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormDescription>
                                Used for notifications and account recovery
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languages.map((language) => (
                                    <SelectItem key={language.value} value={language.value}>
                                      {language.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {themes.map((theme) => (
                                    <SelectItem key={theme.value} value={theme.value}>
                                      {theme.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="timeZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Zone</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a time zone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timeZones.map((timeZone) => (
                                    <SelectItem key={timeZone.value} value={timeZone.value}>
                                      {timeZone.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{setting.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                    </div>
                    <Switch
                      checked={setting.checked}
                      onCheckedChange={(checked) => onNotificationSettingChange(setting.id, checked)}
                    />
                  </div>
                ))}
                
                <Button
                  className="mt-6"
                  onClick={saveAllNotificationSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>Customize your dashboard experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dashboard Layout</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred dashboard layout</p>
                    </div>
                    <Select defaultValue="grid">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="wide">Wide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Default Chart Type</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Set your preferred chart type</p>
                    </div>
                    <Select defaultValue="bar">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="pie">Pie</SelectItem>
                        <SelectItem value="scatter">Scatter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Refresh Interval</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">How often should data be refreshed</p>
                    </div>
                    <Select defaultValue="30000">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Manual</SelectItem>
                        <SelectItem value="30000">30 seconds</SelectItem>
                        <SelectItem value="60000">1 minute</SelectItem>
                        <SelectItem value="300000">5 minutes</SelectItem>
                        <SelectItem value="3600000">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="mt-6">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}