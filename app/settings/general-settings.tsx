'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function GeneralSettings() {
  const [settings, setSettings] = useState({
    timeZone: 'UTC',
    language: 'en',
    autoRefresh: true,
    refreshInterval: 5
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
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={settings.timeZone}
            onChange={(e) => handleChange('timeZone', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time (EST/EDT)</option>
            <option value="CST">Central Time (CST/CDT)</option>
            <option value="MST">Mountain Time (MST/MDT)</option>
            <option value="PST">Pacific Time (PST/PDT)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dashboard Settings</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto-refresh Dashboards</Label>
            <Switch
              id="auto-refresh"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => handleChange('autoRefresh', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically refresh dashboard data
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="refresh-interval">Refresh Interval (minutes)</Label>
          <Input
            id="refresh-interval"
            type="number"
            min="1"
            max="60"
            value={settings.refreshInterval}
            onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
            disabled={!settings.autoRefresh}
          />
        </div>
      </div>
    </div>
  );
} 