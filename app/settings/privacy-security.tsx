'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function PrivacySecuritySettings() {
  const [settings, setSettings] = useState({
    dataSharing: false,
    analytics: false,
    emailNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleChange = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });

      if (!response.ok) throw new Error('Failed to update settings');

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data & Privacy</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Data Sharing</Label>
            <p className="text-sm text-muted-foreground">
              Allow us to collect anonymous usage data to improve our services
            </p>
          </div>
          <Switch
            checked={settings.dataSharing}
            onCheckedChange={(checked) => handleChange('dataSharing', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Enable analytics tracking for your account
            </p>
          </div>
          <Switch
            checked={settings.analytics}
            onCheckedChange={(checked) => handleChange('analytics', checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about your account
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={settings.twoFactorAuth}
            onCheckedChange={(checked) => handleChange('twoFactorAuth', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label>Session Timeout</Label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleChange('sessionTimeout', 15)}
              className={`px-3 py-1 rounded-md text-sm ${
                settings.sessionTimeout === 15
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              15 minutes
            </button>
            <button
              onClick={() => handleChange('sessionTimeout', 30)}
              className={`px-3 py-1 rounded-md text-sm ${
                settings.sessionTimeout === 30
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              30 minutes
            </button>
            <button
              onClick={() => handleChange('sessionTimeout', 60)}
              className={`px-3 py-1 rounded-md text-sm ${
                settings.sessionTimeout === 60
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              1 hour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 